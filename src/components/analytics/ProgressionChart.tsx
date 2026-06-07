import { useMemo, useState } from "react";
import type { Doc } from "../../../convex/_generated/dataModel";
import { formatDuration } from "../../utils/dateUtils";

type Log = Doc<"dailyLogs">;

type Point = { x: number; y: number; value: number; label: string };

type ChartElements = {
  width: number;
  height: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  points: Point[];
  pathData: string;
  areaData: string;
  maxMinutes: number;
  averageMinutes: number;
  averageY: number;
  medianMinutes: number;
  medianY: number;
};

const WIDTH = 500;
const HEIGHT = 180;
const PAD_LEFT = 45;
const PAD_RIGHT = 15;
const PAD_TOP = 15;
const PAD_BOTTOM = 25;

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shortLabel(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parseInt(parts[2])} ${MONTH_LABELS[parseInt(parts[1]) - 1]}`;
}

function buildChartData(allLogs: Log[], timeRange: number): { dateStr: string; label: string; minutes: number }[] {
  const days: string[] = [];
  for (let i = 0; i < timeRange; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (timeRange - 1 - i));
    days.push(formatLocalDate(d));
  }
  return days.map((dateStr) => {
    const dayLogs = allLogs.filter((l) => l.date === dateStr);
    const minutes = dayLogs.reduce((acc, l) => acc + (l.duration || 0), 0);
    return { dateStr, label: shortLabel(dateStr), minutes };
  });
}

function buildChartElements(progressionData: { label: string; minutes: number }[]): ChartElements | null {
  if (progressionData.length === 0) return null;
  const chartWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const chartHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const maxMinutes = Math.max(...progressionData.map((d) => d.minutes), 60);
  const totalMinutes = progressionData.reduce((acc, d) => acc + d.minutes, 0);
  const averageMinutes = totalMinutes / progressionData.length;
  const averageY = PAD_TOP + (1 - averageMinutes / maxMinutes) * chartHeight;

  const workingDays = progressionData.filter((d) => d.minutes > 0);
  const sortedMinutes = workingDays.map((d) => d.minutes).sort((a, b) => a - b);
  let medianMinutes = 0;
  if (sortedMinutes.length > 0) {
    const mid = Math.floor(sortedMinutes.length / 2);
    medianMinutes = sortedMinutes.length % 2 !== 0
      ? sortedMinutes[mid]
      : (sortedMinutes[mid - 1] + sortedMinutes[mid]) / 2;
  }
  const medianY = PAD_TOP + (1 - medianMinutes / maxMinutes) * chartHeight;

  const points: Point[] = progressionData.map((d, i) => {
    const x = PAD_LEFT + (i / (progressionData.length - 1)) * chartWidth;
    const y = PAD_TOP + (1 - d.minutes / maxMinutes) * chartHeight;
    return { x, y, value: d.minutes, label: d.label };
  });

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaData = points.length > 0
    ? `${pathData} L ${points[points.length - 1].x} ${HEIGHT - PAD_BOTTOM} L ${points[0].x} ${HEIGHT - PAD_BOTTOM} Z`
    : "";

  return {
    width: WIDTH, height: HEIGHT,
    paddingLeft: PAD_LEFT, paddingRight: PAD_RIGHT, paddingTop: PAD_TOP, paddingBottom: PAD_BOTTOM,
    points, pathData, areaData,
    maxMinutes, averageMinutes, averageY, medianMinutes, medianY,
  };
}

export function ProgressionChart({ allLogs, timeRange, selectedSubjectId }: { allLogs: Log[]; timeRange: number; selectedSubjectId?: string | null }) {
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const filteredLogs = useMemo(() => {
    if (!selectedSubjectId) return allLogs;
    return allLogs.filter((l) => l.subjectId === selectedSubjectId);
  }, [allLogs, selectedSubjectId]);
  const progressionData = useMemo(() => buildChartData(filteredLogs, timeRange), [filteredLogs, timeRange]);
  const elements = useMemo(() => buildChartElements(progressionData), [progressionData]);

  if (!elements || progressionData.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
        Aucune donnée d'étude enregistrée.
      </div>
    );
  }

  const chartWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const chartHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%">
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--text-muted)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--text-muted)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = PAD_TOP + (1 - pct) * chartHeight;
          const val = Math.round(pct * elements.maxMinutes);
          return (
            <g key={idx}>
              <line
                x1={PAD_LEFT} y1={y}
                x2={WIDTH - PAD_RIGHT} y2={y}
                stroke="var(--border-subtle)" strokeDasharray="4,4"
              />
              <text x={PAD_LEFT - 8} y={y + 3} textAnchor="end" fontSize="0.65rem" fill="var(--text-muted)" fontWeight="500">
                {formatDuration(val, { formatUnderHourAsMins: true })}
              </text>
            </g>
          );
        })}

        {elements.areaData && <path d={elements.areaData} fill="url(#area-grad)" />}

        <line
          x1={PAD_LEFT} y1={elements.averageY}
          x2={WIDTH - PAD_RIGHT} y2={elements.averageY}
          stroke="var(--warning)" strokeWidth="1.5" strokeDasharray="4,4"
        />
        <text
          x={WIDTH - PAD_RIGHT - 6} y={elements.averageY - 6}
          textAnchor="end" fontSize="0.65rem" fill="var(--warning)" fontWeight="600"
        >
          Moyenne: {formatDuration(Math.round(elements.averageMinutes), { formatUnderHourAsMins: true })}
        </text>

        {elements.medianMinutes > 0 && (
          <g>
            <line
              x1={PAD_LEFT} y1={elements.medianY}
              x2={WIDTH - PAD_RIGHT} y2={elements.medianY}
              stroke="var(--accent-primary)" strokeWidth="1.5" strokeDasharray="4,4"
            />
            <text
              x={PAD_LEFT + 6} y={elements.medianY - 6}
              textAnchor="start" fontSize="0.65rem" fill="var(--accent-primary)" fontWeight="600"
            >
              Médiane (actifs): {formatDuration(Math.round(elements.medianMinutes), { formatUnderHourAsMins: true })}
            </text>
          </g>
        )}

        {elements.points.map((p, idx) => {
          if (idx === 0) return null;
          const prev = elements.points[idx - 1];
          const isAbove = p.value >= elements.averageMinutes;
          const strokeColor = isAbove ? "var(--success)" : "var(--danger)";
          return (
            <path
              key={idx}
              d={`M ${prev.x} ${prev.y} L ${p.x} ${p.y}`}
              fill="none" stroke={strokeColor} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            />
          );
        })}

        {elements.points.map((p, idx) => {
          const prev = idx === 0 ? p : elements.points[idx - 1];
          const isAbove = p.value >= elements.averageMinutes;
          const strokeColor = isAbove ? "var(--success)" : "var(--danger)";
          const shouldShowLabel = timeRange === 7 || idx % 5 === 0 || idx === elements.points.length - 1;
          return (
            <g key={idx}>
              <circle
                cx={p.x} cy={p.y} r="4"
                fill="var(--bg-surface)" stroke={strokeColor} strokeWidth="2.5"
                style={{ cursor: "pointer", transition: "r 100ms ease" }}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {shouldShowLabel && (
                <text
                  x={p.x} y={HEIGHT - 8} textAnchor="middle"
                  fontSize="0.65rem" fill="var(--text-muted)" fontWeight="500"
                >
                  {p.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hoveredPoint && (
        <div
          className="chart-tooltip"
          style={{
            left: `${(hoveredPoint.x / WIDTH) * 100}%`,
            top: `${(hoveredPoint.y / HEIGHT) * 100 - 24}%`,
          }}
        >
          <strong>{hoveredPoint.label}</strong> : {formatDuration(hoveredPoint.value)}
        </div>
      )}
    </div>
  );
}
