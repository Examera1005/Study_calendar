import { useState, useMemo } from "react";
import { format } from "date-fns";
import { formatDuration } from "../../utils/dateUtils";
import { useLanguage } from "../../hooks/useLanguage";

export const PercentageBadge = ({ pct }: { pct: number }) => {
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
        • 0%
      </span>
    );
  }
};

interface WeeklyActivityChartProps {
  allLogs: any[] | undefined;
  subjects: any[] | undefined;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  today: string;
  getSubject: (id: string) => any;
  comparisonData: {
    totalChangePct: number;
    subjectChanges: Record<string, number>;
  };
}

export function WeeklyActivityChart({
  allLogs,
  subjects,
  selectedDate,
  setSelectedDate,
  today,
  getSubject,
  comparisonData,
}: WeeklyActivityChartProps) {
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const { t, language, dateLocale } = useLanguage();

  const clickedDayIndex = useMemo(() => {
    if (selectedDate === today) {
      return null;
    }
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return format(d, "yyyy-MM-dd");
    });
    const index = days.indexOf(selectedDate);
    return index !== -1 ? index : null;
  }, [selectedDate, today]);

  const chartData = useMemo(() => {
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
        label: format(new Date(dateStr + "T00:00:00"), "EEE", { locale: dateLocale }),
        subjects: subjectMap,
        total,
      };
    });
  }, [allLogs, dateLocale]);

  const maxTime = useMemo(() => {
    return Math.max(...chartData.map((d) => d.total), 60);
  }, [chartData]);

  const weeklyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    chartData.forEach((day) => {
      Object.entries(day.subjects).forEach(([subId, mins]) => {
        totals[subId] = (totals[subId] || 0) + mins;
      });
    });
    return totals;
  }, [chartData]);

  const displayDayIndex = hoveredDayIndex !== null ? hoveredDayIndex : clickedDayIndex;

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <h3>📈 {t.dashboard.weeklyActivity}</h3>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t.analytics.timeRangeDays(7)}</span>
      </div>
      
      {chartData.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <p>{t.dashboard.noActivityThisWeek}</p>
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

                let currentY = 170;
                const sortedKeys = Object.keys(dayData.subjects).sort();
                const isHovered = hoveredDayIndex === i;
                const isSelected = clickedDayIndex === i;

                return (
                  <g key={dayData.date}>
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
          <div className="dashboard-legend-card">
            {displayDayIndex !== null ? (
              <div>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
                  {format(new Date(chartData[displayDayIndex].date + "T00:00:00"), t.common.dateFormatMedium, { locale: dateLocale })}
                </h4>
                {chartData[displayDayIndex].total === 0 ? (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t.calendar.noLogsForDay}</p>
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
                              <span style={{ color: "var(--text-secondary)" }}>{subj?.name ?? t.common.uncategorized}</span>
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
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                    {t.dashboard.weeklyStudySummary}
                  </h4>
                  {allLogs !== undefined && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <PercentageBadge pct={comparisonData.totalChangePct} />
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.dashboard.vsLastWeek}</span>
                    </div>
                  )}
                </div>
                {Object.keys(weeklyTotals).length === 0 ? (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t.dashboard.hoverBarDesc}</p>
                ) : (
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 10 }}>
                      {t.dashboard.hoverColumnsDesc}
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
                                <span style={{ color: "var(--text-secondary)" }}>{subj?.name ?? t.common.uncategorized}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {allLogs !== undefined && <PercentageBadge pct={pctChange} />}
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
  );
}
