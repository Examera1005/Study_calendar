import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format } from "date-fns";
import type { View } from "../App";
import { SubjectBadge } from "../components/ui/SubjectBadge";
import { useState, useMemo, useEffect } from "react";
import { calculateStreak } from "../utils/statsUtils";
import { formatLocalDate, formatDuration } from "../utils/dateUtils";


export function Dashboard({
  setView,
  selectedDate,
  setSelectedDate,
}: {
  setView: (v: View) => void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
}) {
  const today = formatLocalDate();
  const activeDate = selectedDate || today;
  const yesterday = (() => {
    const d = new Date(activeDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    return formatLocalDate(d);
  })();

  const upcomingExams = useQuery(api.exams.upcoming, { limit: 5 });
  const todayTasks = useQuery(api.tasks.getByDate, { date: activeDate });
  const generalTasks = useQuery(api.tasks.listGeneral);
  const todayLogs = useQuery(api.dailyLogs.getByDate, { date: activeDate });
  const yesterdayLogs = useQuery(api.dailyLogs.getByDate, { date: yesterday });
  const todayEvents = useQuery(api.events.getByDate, { date: activeDate });
  const subjects = useQuery(api.subjects.list);
  const allLogs = useQuery(api.dailyLogs.list);
  const streak = calculateStreak(allLogs || []);

  const getSubject = (id: string) => subjects?.find((s) => s._id === id);

  const comparisonData = useMemo(() => {
    if (!allLogs) return { totalChangePct: 0, subjectChanges: {} as Record<string, number>, prevTotal: 0, currentTotal: 0 };



    // Current 7 days: today to 6 days ago
    const currentWeekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return formatLocalDate(d);
    });

    // Previous 7 days: 7 days ago to 13 days ago
    const prevWeekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return formatLocalDate(d);
    });

    let currentTotal = 0;
    let prevTotal = 0;

    const currentSubjectTotals: Record<string, number> = {};
    const prevSubjectTotals: Record<string, number> = {};

    allLogs.forEach((log) => {
      const dur = log.duration ?? 0;
      if (dur <= 0) return;

      const subId = log.subjectId || "uncategorized";

      if (currentWeekDates.includes(log.date)) {
        currentTotal += dur;
        currentSubjectTotals[subId] = (currentSubjectTotals[subId] || 0) + dur;
      } else if (prevWeekDates.includes(log.date)) {
        prevTotal += dur;
        prevSubjectTotals[subId] = (prevSubjectTotals[subId] || 0) + dur;
      }
    });

    // Calculate overall percentage change
    let totalChangePct = 0;
    if (prevTotal > 0) {
      totalChangePct = Math.round(((currentTotal - prevTotal) / prevTotal) * 100);
    } else if (currentTotal > 0) {
      totalChangePct = 100;
    }

    // Calculate subject-specific percentage changes
    const subjectChanges: Record<string, number> = {};
    const allSubjectIds = new Set([...Object.keys(currentSubjectTotals), ...Object.keys(prevSubjectTotals)]);
    allSubjectIds.forEach((subId) => {
      const currSub = currentSubjectTotals[subId] || 0;
      const prevSub = prevSubjectTotals[subId] || 0;

      if (prevSub > 0) {
        subjectChanges[subId] = Math.round(((currSub - prevSub) / prevSub) * 100);
      } else if (currSub > 0) {
        subjectChanges[subId] = 100;
      } else {
        subjectChanges[subId] = 0;
      }
    });

    return {
      currentTotal,
      prevTotal,
      totalChangePct,
      subjectChanges,
      currentSubjectTotals,
    };
  }, [allLogs]);

  const renderPercentageBadge = (pct: number) => {
    if (pct > 0) {
      return (
        <span style={{ color: "var(--success)", fontWeight: 600, fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: 2 }}>
          ▲ +{pct}%
        </span>
      );
    } else if (pct < 0) {
      return (
        <span style={{ color: "var(--danger)", fontWeight: 600, fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: 2 }}>
          ▼ {pct}%
        </span>
      );
    } else {
      return (
        <span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: 2 }}>
          0%
        </span>
      );
    }
  };

  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const [clickedDayIndex, setClickedDayIndex] = useState<number | null>(null);

  useEffect(() => {
    const todayStr = formatLocalDate();
    if (selectedDate === todayStr) {
      setClickedDayIndex(null);
    } else {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return format(d, "yyyy-MM-dd");
      });
      const index = days.indexOf(selectedDate);
      if (index !== -1) {
        setClickedDayIndex(index);
      } else {
        setClickedDayIndex(null);
      }
    }
  }, [selectedDate]);

  const chartData = (() => {
    if (!allLogs) return [];
    
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return format(d, "yyyy-MM-dd");
    });
    
    return days.map((dateStr) => {
      const logs = allLogs.filter((l) => l.date === dateStr);
      const subjectMap: Record<string, number> = {};
      let total = 0;
      
      logs.forEach((l) => {
        const subId = l.subjectId || "uncategorized";
        const dur = l.duration ?? 0;
        subjectMap[subId] = (subjectMap[subId] || 0) + dur;
        total += dur;
      });
      
      return {
        date: dateStr,
        label: format(new Date(dateStr + "T00:00:00"), "EEE"),
        subjects: subjectMap,
        total,
      };
    });
  })();

  const maxTime = Math.max(...chartData.map((d) => d.total), 60);

  const weeklyTotals = (() => {
    if (!chartData) return {};
    const totals: Record<string, number> = {};
    chartData.forEach((day) => {
      Object.entries(day.subjects).forEach(([subId, mins]) => {
        totals[subId] = (totals[subId] || 0) + mins;
      });
    });
    return totals;
  })();

  const subjectBreakdown = (() => {
    if (!allLogs) return [];
    
    const timeMap: Record<string, number> = {};
    let totalLoggedTime = 0;
    
    allLogs.forEach((log) => {
      const subId = log.subjectId || "uncategorized";
      const duration = log.duration ?? 0;
      timeMap[subId] = (timeMap[subId] || 0) + duration;
      totalLoggedTime += duration;
    });
    
    const breakdown = (subjects || []).map((subj) => {
      const minutes = timeMap[subj._id] || 0;
      return {
        name: subj.name,
        icon: subj.icon,
        color: subj.color,
        minutes,
        percentage: totalLoggedTime > 0 ? (minutes / totalLoggedTime) * 100 : 0,
      };
    });
    
    if (timeMap["uncategorized"]) {
      breakdown.push({
        name: "Uncategorized",
        icon: "📝",
        color: "var(--text-muted)",
        minutes: timeMap["uncategorized"],
        percentage: totalLoggedTime > 0 ? (timeMap["uncategorized"] / totalLoggedTime) * 100 : 0,
      });
    }
    
    return breakdown
      .filter((item) => item.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes);
  })();

  const daysUntil = (dateStr: string) => {
    const d = Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / 86400000,
    );
    if (d === 0) return "Today";
    if (d === 1) return "Tomorrow";
    return `${d} days`;
  };

  const countdownClass = (dateStr: string) => {
    const d = Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / 86400000,
    );
    if (d <= 2) return "urgent";
    if (d <= 7) return "soon";
    return "comfortable";
  };

  const completedTasks = todayTasks?.filter((t) => t.completed).length ?? 0;
  const totalTasks = todayTasks?.length ?? 0;
  const generalIncomplete = generalTasks?.filter((t) => !t.completed).length ?? 0;
  const totalMinutes = todayLogs?.reduce((a, l) => a + (l.duration ?? 0), 0) ?? 0;
  const yesterdayMinutes = yesterdayLogs?.reduce((a, l) => a + (l.duration ?? 0), 0) ?? 0;
  const todayChangePct = (() => {
    if (yesterdayMinutes > 0) {
      return Math.round(((totalMinutes - yesterdayMinutes) / yesterdayMinutes) * 100);
    } else if (totalMinutes > 0) {
      return 100;
    }
    return 0;
  })();

  const displayDayIndex = hoveredDayIndex !== null ? hoveredDayIndex : clickedDayIndex;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="date-display" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", minHeight: "32px" }}>
            <span>
              {format(new Date(activeDate + "T00:00:00"), "EEEE, MMMM d, yyyy")}
            </span>
            {activeDate !== today && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedDate(today)}
                style={{
                  padding: "4px 8px",
                  fontSize: "0.75rem",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-glass)",
                  color: "var(--text-primary)",
                  cursor: "pointer"
                }}
              >
                Retour à Aujourd'hui
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{upcomingExams?.length ?? 0}</div>
          <div className="stat-label">Upcoming Exams</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {completedTasks}/{totalTasks}
          </div>
          <div className="stat-label">{activeDate === today ? "Today's Tasks" : "Tasks of the Day"}</div>
        </div>
        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setView("analytics")}>
          <div className="stat-value" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            🔥 {streak} {streak > 1 ? "Jours" : "Jour"}
          </div>
          <div className="stat-label">Série d'Études</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              {formatDuration(totalMinutes, { showZero: "0h" })}
            </span>
            {yesterdayLogs !== undefined && renderPercentageBadge(todayChangePct)}
          </div>
          <div className="stat-label" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{activeDate === today ? "Study Time Today" : "Study Time for Day"}</span>
            {yesterdayLogs !== undefined && (
              <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                {activeDate === today ? "VS  Yesterday" : "VS  Previous Day"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Study Activity Chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3>📈 Weekly Study Activity</h3>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Last 7 Days</span>
        </div>
        
        {chartData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📈</div>
            <p>No study logs recorded for the past week</p>
          </div>
        ) : (
          <div className="chart-container-layout" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, alignItems: "center" }}>
            {/* Left: SVG Chart */}
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <svg viewBox="0 0 500 200" width="100%" height="100%">
                {/* Y Axis grid lines and labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                  const yVal = 20 + (1 - pct) * 150;
                  const value = Math.round(pct * maxTime);
                  return (
                    <g key={pct}>
                      <line x1="50" y1={yVal} x2="480" y2={yVal} stroke="var(--border-subtle)" strokeDasharray="3,3" />
                      <text x="42" y={yVal + 3} textAnchor="end" fontSize="0.65rem" fill="var(--text-muted)" fontWeight="500">
                        {formatDuration(value, { formatUnderHourAsMins: true })}
                      </text>
                    </g>
                  );
                })}

                {/* Bars */}
                {chartData.map((dayData, i) => {
                  const barWidth = 20;
                  const chartWidth = 430;
                  const numDays = 7;
                  const xPos = 50 + i * (chartWidth / numDays) + (chartWidth / numDays - barWidth) / 2;

                  // Render stacked segments
                  let currentY = 170; // chart baseline (paddingTop: 20 + chartHeight: 150 = 170)
                  const sortedKeys = Object.keys(dayData.subjects).sort();
                  const isHovered = hoveredDayIndex === i;
                  const isSelected = clickedDayIndex === i;

                  return (
                    <g key={dayData.date}>
                      {/* Stacked rects */}
                      {sortedKeys.map((subId) => {
                        const duration = dayData.subjects[subId];
                        if (duration <= 0) return null;
                        const segHeight = (duration / maxTime) * 150;
                        const subj = subId !== "uncategorized" ? getSubject(subId) : null;
                        const color = subj?.color ?? "var(--text-muted)";
                        const rectY = currentY - segHeight;
                        currentY = rectY;

                        return (
                          <rect
                            key={subId}
                            x={xPos}
                            y={rectY}
                            width={barWidth}
                            height={segHeight}
                            fill={color}
                            opacity={hoveredDayIndex !== null && !isHovered ? 0.35 : 1}
                            style={{ transition: "opacity var(--transition-fast)" }}
                          />
                        );
                      })}

                      {/* X axis weekday label */}
                      <text
                        x={xPos + barWidth / 2}
                        y="188"
                        textAnchor="middle"
                        fontSize="0.7rem"
                        fontWeight={isHovered || isSelected ? "700" : "500"}
                        fill={isHovered || isSelected ? "var(--accent-primary)" : "var(--text-secondary)"}
                        style={{ transition: "fill var(--transition-fast)" }}
                      >
                        {dayData.label}
                      </text>

                      {/* Highlight column background on hover/selection */}
                      {(isHovered || isSelected) && (
                        <rect
                          x={xPos - 6}
                          y="18"
                          width={barWidth + 12}
                          height="154"
                          fill="var(--accent-primary)"
                          opacity={isSelected ? "0.1" : "0.05"}
                          stroke={isSelected ? "var(--accent-primary)" : "none"}
                          strokeWidth={isSelected ? "1.5" : "0"}
                          rx="4"
                          pointerEvents="none"
                        />
                      )}

                      {/* Hover detector overlay */}
                      <rect
                        x={50 + i * (chartWidth / numDays)}
                        y="20"
                        width={chartWidth / numDays}
                        height="150"
                        fill="transparent"
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setHoveredDayIndex(i)}
                        onMouseLeave={() => setHoveredDayIndex(null)}
                        onClick={() => {
                          if (clickedDayIndex === i) {
                            setSelectedDate(today);
                          } else {
                            setSelectedDate(dayData.date);
                          }
                        }}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Right: Dynamic Tooltip / Legend */}
            <div style={{
              background: "var(--bg-secondary)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              height: "275px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}>
              {displayDayIndex !== null ? (
                // Day Breakdown Detail
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
                    {format(new Date(chartData[displayDayIndex].date + "T00:00:00"), "EEEE, MMM d")}
                  </h4>
                  {chartData[displayDayIndex].total === 0 ? (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No study time logged on this day.</p>
                  ) : (
                    <div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
                        Total: {formatDuration(chartData[displayDayIndex].total, { formatUnderHourAsMins: true })}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {Object.entries(chartData[displayDayIndex].subjects).map(([subId, mins]) => {
                          if (mins <= 0) return null;
                          const subj = subId !== "uncategorized" ? getSubject(subId) : null;
                          return (
                            <div key={subId} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: subj?.color ?? "var(--text-muted)" }} />
                                <span style={{ color: "var(--text-secondary)" }}>{subj?.name ?? "Uncategorized"}</span>
                              </div>
                              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{mins}m</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Weekly Legend / Summary
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                      Weekly Study Summary
                    </h4>
                    {allLogs !== undefined && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {renderPercentageBadge(comparisonData.totalChangePct)}
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>vs last week</span>
                      </div>
                    )}
                  </div>
                  {Object.keys(weeklyTotals).length === 0 ? (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Hover over a bar to inspect daily study details.</p>
                  ) : (
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 10 }}>
                        Hover over columns to view specific days.
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {Object.entries(weeklyTotals)
                          .sort((a, b) => b[1] - a[1])
                          .map(([subId, mins]) => {
                            if (mins <= 0) return null;
                            const subj = subId !== "uncategorized" ? getSubject(subId) : null;
                            const pctChange = comparisonData.subjectChanges[subId] ?? 0;
                            return (
                              <div key={subId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: subj?.color ?? "var(--text-muted)" }} />
                                  <span style={{ color: "var(--text-secondary)" }}>{subj?.name ?? "Uncategorized"}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  {allLogs !== undefined && renderPercentageBadge(pctChange)}
                                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                    {formatDuration(mins, { formatUnderHourAsMins: true })}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card-grid">
        {/* Upcoming Exams */}
        <div className="card">
          <div className="card-header">
            <h3>🎯 Upcoming Exams</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setView("exams")}>
              View all
            </button>
          </div>
          {!upcomingExams || upcomingExams.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <p>No upcoming exams</p>
            </div>
          ) : (
            upcomingExams.map((exam) => {
              const subj = getSubject(exam.subjectId);
              return (
                <div
                  key={exam._id}
                  className="exam-card"
                  style={{ borderLeftColor: subj?.color ?? "#3b82f6" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div className="exam-title">{exam.title}</div>
                      <div className="exam-meta">
                        {subj && (
                          <SubjectBadge
                            name={subj.name}
                            color={subj.color}
                            icon={subj.icon}
                          />
                        )}
                        <span>{format(new Date(exam.date), "MMM d")}</span>
                        <span className="coeff-badge">×{exam.coefficient}</span>
                      </div>
                    </div>
                    <span className={`countdown ${countdownClass(exam.date)}`}>
                      {daysUntil(exam.date)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Today's Tasks */}
        <div className="card">
          <div className="card-header">
            <h3>✅ {activeDate === today ? "Today's Tasks" : "Tasks of the Day"}</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSelectedDate(activeDate);
                setView("tasks");
              }}
            >
              View all
            </button>
          </div>
          {!todayTasks || todayTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>{activeDate === today ? "No tasks for today" : "No tasks for this day"}</p>
            </div>
          ) : (
            todayTasks.slice(0, 5).map((task) => (
              <div
                key={task._id}
                className={`task-item ${task.completed ? "completed" : ""}`}
              >
                <div className={`priority-dot ${task.priority}`} />
                <div>
                  <div className="task-title">{task.title}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* General Tasks */}
        <div className="card">
          <div className="card-header">
            <h3>📋 General Tasks</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setView("tasks")}
            >
              View all
            </button>
          </div>
          {!generalTasks || generalTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No general tasks</p>
            </div>
          ) : (
            generalTasks.filter((t) => !t.completed).slice(0, 5).map((task) => (
              <div
                key={task._id}
                className="task-item"
              >
                <div className={`priority-dot ${task.priority}`} />
                <div>
                  <div className="task-title">{task.title}</div>
                </div>
              </div>
            ))
          )}
          {generalIncomplete > 0 && (
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 8 }}>
              {generalIncomplete} remaining
            </div>
          )}
        </div>

        {/* Today's Events */}
        <div className="card">
          <div className="card-header">
            <h3>📅 {activeDate === today ? "Today's Events" : "Events for Selected Day"}</h3>
          </div>
          {!todayEvents || todayEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🗓️</div>
              <p>{activeDate === today ? "No events scheduled" : "No events scheduled for this day"}</p>
            </div>
          ) : (
            todayEvents.map((ev) => (
              <div
                key={ev._id}
                className="event-card"
                style={{ borderLeftColor: ev.color ?? "var(--accent-primary)" }}
              >
                {ev.startTime && (
                  <div className="event-time">
                    {ev.startTime}
                    {ev.endTime ? ` – ${ev.endTime}` : ""}
                  </div>
                )}
                <div className="event-title">{ev.title}</div>
              </div>
            ))
          )}
        </div>

        {/* Today's Study Log */}
        <div className="card">
          <div className="card-header">
            <h3>📝 {activeDate === today ? "Study Log" : "Study Log for Selected Day"}</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSelectedDate(activeDate);
                setView("log");
              }}
            >
              Add entry
            </button>
          </div>
          {!todayLogs || todayLogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✏️</div>
              <p>{activeDate === today ? "No study entries yet today" : "No study entries for this day"}</p>
            </div>
          ) : (
            todayLogs.slice(0, 4).map((log) => {
              const subj = log.subjectId ? getSubject(log.subjectId) : null;
              return (
                <div key={log._id} className="log-entry">
                  <div className="log-content">{log.content}</div>
                  <div className="log-meta">
                    {subj && (
                      <SubjectBadge
                        name={subj.name}
                        color={subj.color}
                        icon={subj.icon}
                      />
                    )}
                    {log.duration && (
                      <span className="duration-badge">⏱ {log.duration}min</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Study Time by Subject */}
        <div className="card">
          <div className="card-header">
            <h3>📊 Study Time by Subject</h3>
          </div>
          {subjectBreakdown.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>No study logs recorded yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {subjectBreakdown.map((item) => (
                <div key={item.name} className="subject-time-row">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: "0.82rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{item.icon}</span>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.name}</span>
                    </div>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                      {formatDuration(item.minutes, { formatUnderHourAsMins: true })}
                    </span>
                  </div>
                  <div style={{ height: 6, background: "var(--bg-secondary)", borderRadius: 3, overflow: "hidden", display: "flex" }}>
                    <div style={{ height: "100%", width: `${item.percentage}%`, background: item.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
