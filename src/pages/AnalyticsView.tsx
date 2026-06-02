import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";
import { calculateStreak, getAchievements } from "../utils/statsUtils";
import { formatDuration } from "../utils/dateUtils";

export function AnalyticsView() {
  const allLogs = useQuery(api.dailyLogs.list);
  const subjects = useQuery(api.subjects.list);
  const allTasks = useQuery(api.tasks.listAll);

  const [timeRange, setTimeRange] = useState<7 | 30>(7);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; label: string } | null>(null);

  // 1. Calculate General KPI Stats
  const stats = useMemo(() => {
    if (!allLogs || !allTasks) return { totalHours: 0, totalSessions: 0, completedTasks: 0, streak: 0 };
    
    const studySessions = allLogs.filter((l) => l.duration && l.duration > 0);
    const totalMinutes = studySessions.reduce((acc, l) => acc + (l.duration || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    
    const completedTasks = allTasks.filter((t) => t.completed).length;
    const streak = calculateStreak(allLogs);

    return {
      totalHours,
      totalSessions: studySessions.length,
      completedTasks,
      streak,
    };
  }, [allLogs, allTasks]);

  // 2. Achievements
  const achievementsList = useMemo(() => {
    return getAchievements(allLogs || [], stats.completedTasks, stats.streak);
  }, [allLogs, stats.completedTasks, stats.streak]);

  // 3. Subject Distribution (Donut Chart Data)
  const subjectDistribution = useMemo(() => {
    if (!allLogs || !subjects) return [];

    const durationMap: Record<string, number> = {};
    let totalMinutes = 0;

    allLogs.forEach((log) => {
      if (log.duration && log.duration > 0) {
        const subId = log.subjectId || "uncategorized";
        durationMap[subId] = (durationMap[subId] || 0) + log.duration;
        totalMinutes += log.duration;
      }
    });

    if (totalMinutes === 0) return [];

    const data = subjects.map((s) => {
      const mins = durationMap[s._id] || 0;
      return {
        id: s._id as string,
        name: s.name,
        color: s.color,
        icon: s.icon || "📚",
        minutes: mins,
        percentage: Math.round((mins / totalMinutes) * 100),
      };
    });

    if (durationMap["uncategorized"]) {
      data.push({
        id: "uncategorized",
        name: "Sans Matière",
        color: "var(--text-muted)",
        icon: "📝",
        minutes: durationMap["uncategorized"],
        percentage: Math.round((durationMap["uncategorized"] / totalMinutes) * 100),
      });
    }

    return data.filter((d) => d.minutes > 0).sort((a, b) => b.minutes - a.minutes);
  }, [allLogs, subjects]);

  // 4. Progression Chart Data (Linear Progression Chart)
  const progressionData = useMemo(() => {
    if (!allLogs) return [];

    const formatLocalDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const days = Array.from({ length: timeRange }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (timeRange - 1 - i));
      return formatLocalDate(d);
    });

    return days.map((dateStr) => {
      const dayLogs = allLogs.filter((l) => l.date === dateStr);
      const minutes = dayLogs.reduce((acc, l) => acc + (l.duration || 0), 0);
      
      // Get short date label (e.g. "30 Mai")
      const parts = dateStr.split("-");
      const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
      const dayLabel = `${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]}`;

      return {
        date: dateStr,
        label: dayLabel,
        minutes,
      };
    });
  }, [allLogs, timeRange]);

  // Donut chart path calculator helper
  const donutPaths = useMemo(() => {
    let accumulatedPercent = 0;
    const radius = 60;
    const cx = 80;
    const cy = 80;
    const strokeWidth = 16;
    const circumference = 2 * Math.PI * radius;

    return subjectDistribution.map((item, idx) => {
      const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
      accumulatedPercent += item.percentage;

      return {
        ...item,
        cx,
        cy,
        r: radius,
        strokeWidth,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [subjectDistribution]);

  // Linear progression chart elements calculator
  const progressionChartElements = useMemo(() => {
    if (progressionData.length === 0) return null;

    const width = 500;
    const height = 180;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxMinutes = Math.max(...progressionData.map((d) => d.minutes), 60);

    const totalMinutes = progressionData.reduce((acc, d) => acc + d.minutes, 0);
    const averageMinutes = totalMinutes / progressionData.length;
    const averageY = paddingTop + (1 - averageMinutes / maxMinutes) * chartHeight;

    // Median calculation (only days where study happened, i.e., minutes > 0)
    const workingDays = progressionData.filter((d) => d.minutes > 0);
    const sortedMinutes = workingDays.map((d) => d.minutes).sort((a, b) => a - b);
    let medianMinutes = 0;
    if (sortedMinutes.length > 0) {
      const mid = Math.floor(sortedMinutes.length / 2);
      if (sortedMinutes.length % 2 !== 0) {
        medianMinutes = sortedMinutes[mid];
      } else {
        medianMinutes = (sortedMinutes[mid - 1] + sortedMinutes[mid]) / 2;
      }
    }
    const medianY = paddingTop + (1 - medianMinutes / maxMinutes) * chartHeight;

    const points = progressionData.map((d, i) => {
      const x = paddingLeft + (i / (progressionData.length - 1)) * chartWidth;
      const y = paddingTop + (1 - d.minutes / maxMinutes) * chartHeight;
      return { x, y, value: d.minutes, label: d.label };
    });

    const pathData = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    const areaData = points.length > 0
      ? `${pathData} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
      : "";

    return {
      width,
      height,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      points,
      pathData,
      areaData,
      maxMinutes,
      averageMinutes,
      averageY,
      medianMinutes,
      medianY,
    };
  }, [progressionData]);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Statistiques & Badges</h1>
        </div>
        <div style={{ display: "flex", gap: 8, background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 4 }}>
          <button
            type="button"
            className={`btn btn-sm ${timeRange === 7 ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setTimeRange(7)}
            style={{ padding: "6px 12px" }}
          >
            7 Jours
          </button>
          <button
            type="button"
            className={`btn btn-sm ${timeRange === 30 ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setTimeRange(30)}
            style={{ padding: "6px 12px" }}
          >
            30 Jours
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 6 }}>⏱️</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)" }}>{stats.totalHours}h</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Temps Total</div>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 6 }}>🔥</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)" }}>{stats.streak} Jours</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Série d'Études</div>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 6 }}>📝</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)" }}>{stats.totalSessions}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Sessions Loggées</div>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 6 }}>⚡</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)" }}>{stats.completedTasks}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Tâches Complétées</div>
        </div>
      </div>

      {/* Graphs Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 24 }}>
        {/* Progression Line Chart */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📈 Progression du Temps d'Étude</h3>
          {progressionChartElements && progressionData.length > 0 ? (
            <div style={{ position: "relative", width: "100%" }}>
              <svg viewBox={`0 0 ${progressionChartElements.width} ${progressionChartElements.height}`} width="100%">
                <defs>
                  <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--text-muted)" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="var(--text-muted)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y Axis grid and ticks */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = progressionChartElements.paddingTop + (1 - pct) * (progressionChartElements.height - progressionChartElements.paddingTop - progressionChartElements.paddingBottom);
                  const val = Math.round(pct * progressionChartElements.maxMinutes);
                  return (
                    <g key={idx}>
                      <line
                        x1={progressionChartElements.paddingLeft}
                        y1={y}
                        x2={progressionChartElements.width - progressionChartElements.paddingRight}
                        y2={y}
                        stroke="var(--border-subtle)"
                        strokeDasharray="4,4"
                      />
                      <text x={progressionChartElements.paddingLeft - 8} y={y + 3} textAnchor="end" fontSize="0.65rem" fill="var(--text-muted)" fontWeight="500">
                        {formatDuration(val, { formatUnderHourAsMins: true })}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area under the path */}
                {progressionChartElements.areaData && (
                  <path d={progressionChartElements.areaData} fill="url(#area-grad)" />
                )}

                {/* Average Line */}
                <line
                  x1={progressionChartElements.paddingLeft}
                  y1={progressionChartElements.averageY}
                  x2={progressionChartElements.width - progressionChartElements.paddingRight}
                  y2={progressionChartElements.averageY}
                  stroke="var(--warning)"
                  strokeWidth="1.5"
                  strokeDasharray="5,5"
                />
                <text
                  x={progressionChartElements.width - progressionChartElements.paddingRight - 6}
                  y={progressionChartElements.averageY - 6}
                  textAnchor="end"
                  fontSize="0.65rem"
                  fill="var(--warning)"
                  fontWeight="600"
                >
                  Moyenne: {formatDuration(Math.round(progressionChartElements.averageMinutes), { formatUnderHourAsMins: true })}
                </text>

                {/* Median Line (only for working days, left-aligned) */}
                {progressionChartElements.medianMinutes > 0 && (
                  <g>
                    <line
                      x1={progressionChartElements.paddingLeft}
                      y1={progressionChartElements.medianY}
                      x2={progressionChartElements.width - progressionChartElements.paddingRight}
                      y2={progressionChartElements.medianY}
                      stroke="var(--accent-primary)"
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                    />
                    <text
                      x={progressionChartElements.paddingLeft + 6}
                      y={progressionChartElements.medianY - 6}
                      textAnchor="start"
                      fontSize="0.65rem"
                      fill="var(--accent-primary)"
                      fontWeight="600"
                    >
                      Médiane (actifs): {formatDuration(Math.round(progressionChartElements.medianMinutes), { formatUnderHourAsMins: true })}
                    </text>
                  </g>
                )}

                {/* Dynamic Curve Segments (Green if endpoint >= average, else Red) */}
                {progressionChartElements.points.map((p, idx) => {
                  if (idx === 0) return null;
                  const prev = progressionChartElements.points[idx - 1];
                  const isAbove = p.value >= progressionChartElements.averageMinutes;
                  const strokeColor = isAbove ? "var(--success)" : "var(--danger)";
                  return (
                    <path
                      key={idx}
                      d={`M ${prev.x} ${prev.y} L ${p.x} ${p.y}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}

                {/* Interactive Points circles */}
                {progressionChartElements.points.map((p, idx) => {
                  const isAbove = p.value >= progressionChartElements.averageMinutes;
                  const strokeColor = isAbove ? "var(--success)" : "var(--danger)";
                  return (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="var(--bg-surface)"
                      stroke={strokeColor}
                      strokeWidth="2.5"
                      style={{ cursor: "pointer", transition: "r 100ms ease" }}
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}

                {/* X Axis ticks */}
                {progressionChartElements.points.map((p, idx) => {
                  // Label spacing condition based on selection
                  const shouldShowLabel = timeRange === 7 || idx % 5 === 0 || idx === progressionData.length - 1;
                  if (!shouldShowLabel) return null;
                  return (
                    <text
                      key={idx}
                      x={p.x}
                      y={progressionChartElements.height - 8}
                      textAnchor="middle"
                      fontSize="0.65rem"
                      fill="var(--text-muted)"
                      fontWeight="500"
                    >
                      {p.label}
                    </text>
                  );
                })}
              </svg>

              {/* Live Tooltip on hover */}
              {hoveredPoint && (
                <div style={{
                  position: "absolute",
                  left: `${(hoveredPoint.x / 500) * 100}%`,
                  top: `${(hoveredPoint.y / 180) * 100 - 24}%`,
                  transform: "translate(-50%, -100%)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-sm)",
                  padding: "4px 8px",
                  fontSize: "0.72rem",
                  color: "var(--text-primary)",
                  boxShadow: "var(--shadow-md)",
                  pointerEvents: "none",
                  zIndex: 10,
                  whiteSpace: "nowrap",
                }}>
                  <strong>{hoveredPoint.label}</strong> : {formatDuration(hoveredPoint.value)}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
              Aucune donnée d'étude enregistrée.
            </div>
          )}
        </div>

        {/* Donut Share Distribution Chart */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📊 Répartition par Matière</h3>
          {subjectDistribution.length > 0 ? (
            <div className="analytics-donut-layout">
              <div style={{ position: "relative", width: 130, height: 130 }}>
                <svg viewBox="0 0 160 160" width="100%" height="100%">
                  {donutPaths.map((slice, idx) => (
                    <circle
                      key={slice.id}
                      cx={slice.cx}
                      cy={slice.cy}
                      r={slice.r}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={hoveredSlice === idx ? slice.strokeWidth + 2 : slice.strokeWidth}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      style={{
                        transform: "rotate(-90deg)",
                        transformOrigin: "80px 80px",
                        cursor: "pointer",
                        transition: "stroke-width 150ms ease",
                      }}
                      onMouseEnter={() => setHoveredSlice(idx)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  ))}
                  {/* Central Text */}
                  <text x="80" y="83" textAnchor="middle" fill="var(--text-primary)" fontSize="0.75rem" fontWeight="700">
                    {hoveredSlice !== null ? `${subjectDistribution[hoveredSlice].percentage}%` : "Total"}
                  </text>
                  <text x="80" y="96" textAnchor="middle" fill="var(--text-muted)" fontSize="0.55rem" fontWeight="600">
                    {hoveredSlice !== null ? subjectDistribution[hoveredSlice].name : "Matières"}
                  </text>
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {subjectDistribution.map((item, idx) => (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredSlice(idx)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: "0.82rem",
                      padding: "4px 8px",
                      background: hoveredSlice === idx ? "var(--bg-primary)" : "transparent",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      transition: "background var(--transition-fast)",
                    }}
                  >
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: item.color }} />
                    <span style={{ fontSize: "0.9rem" }}>{item.icon}</span>
                    <span style={{ flex: 1, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.name}
                    </span>
                    <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
              Veuillez lier des matières à vos sessions d'études.
            </div>
          )}
        </div>
      </div>

      {/* Badges Achievements Section */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>🏆 Badges & Trophées</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20 }}>
          Gagnez des badges en complétant vos tâches et en restant régulier dans vos études.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {achievementsList.map((badge) => {
            const progressPercent = Math.min(100, Math.round((badge.current / badge.target) * 100));
            return (
              <div
                key={badge.id}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: 16,
                  background: badge.unlocked ? "var(--bg-glass)" : "rgba(120, 120, 120, 0.05)",
                  border: badge.unlocked ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                  boxShadow: badge.unlocked ? "0 0 10px rgba(59, 130, 246, 0.15)" : "none",
                  borderRadius: "var(--radius-lg)",
                  alignItems: "center",
                  opacity: badge.unlocked ? 1 : 0.65,
                  transition: "all var(--transition-normal)",
                }}
              >
                <div
                  style={{
                    fontSize: "2.4rem",
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: badge.unlocked ? "var(--accent-light)" : "var(--bg-elevated)",
                    border: badge.unlocked ? "2px solid var(--accent-primary)" : "1px solid var(--border-medium)",
                    boxShadow: badge.unlocked ? "0 0 8px rgba(59, 130, 246, 0.2)" : "none",
                    filter: badge.unlocked ? "none" : "grayscale(80%)",
                  }}
                >
                  {badge.unlocked ? badge.icon : "🔒"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: badge.unlocked ? "var(--text-primary)" : "var(--text-secondary)",
                    marginBottom: 4,
                  }}>
                    {badge.title} {badge.unlocked && "✅"}
                  </h4>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 8, lineHeight: 1.3 }}>
                    {badge.description}
                  </p>
                  
                  {/* Progress Bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "var(--bg-primary)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${progressPercent}%`,
                        background: badge.unlocked ? "var(--accent-primary)" : "var(--text-muted)",
                        borderRadius: 3,
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", minWidth: 40, textAlign: "right" }}>
                      {badge.unlocked
                        ? `${badge.target}/${badge.target}`
                        : `${Math.round(badge.current)}/${badge.target}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
