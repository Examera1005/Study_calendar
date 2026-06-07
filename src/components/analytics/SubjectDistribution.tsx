import { useMemo, useState } from "react";
import type { Doc } from "../../../convex/_generated/dataModel";

type Log = Doc<"dailyLogs">;
type Subject = Doc<"subjects">;

type DistributionItem = {
  id: string;
  name: string;
  color: string;
  icon: string;
  minutes: number;
  percentage: number;
};

function buildDistribution(allLogs: Log[] | undefined, subjects: Subject[] | undefined): DistributionItem[] {
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
  const data: DistributionItem[] = subjects.map((s) => {
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
}

export function SubjectDistribution({
  allLogs,
  subjects,
  selectedSubjectId,
  onSelectSubject,
}: {
  allLogs: Log[] | undefined;
  subjects: Subject[] | undefined;
  selectedSubjectId: string | null;
  onSelectSubject: (subjectId: string | null) => void;
}) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const distribution = useMemo(() => buildDistribution(allLogs, subjects), [allLogs, subjects]);

  const paths = useMemo(() => {
    let accumulatedPercent = 0;
    const radius = 60;
    const cx = 80;
    const cy = 80;
    const strokeWidth = 16;
    const circumference = 2 * Math.PI * radius;
    return distribution.map((item) => {
      const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
      accumulatedPercent += item.percentage;
      return { ...item, cx, cy, r: radius, strokeWidth, strokeDasharray, strokeDashoffset };
    });
  }, [distribution]);

  const handleClick = (item: DistributionItem) => {
    if (selectedSubjectId === item.id) {
      onSelectSubject(null);
    } else {
      onSelectSubject(item.id);
    }
  };

  if (distribution.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
        Veuillez lier des matières à vos sessions d'études.
      </div>
    );
  }

  return (
    <div className="analytics-donut-layout">
      <div style={{ position: "relative", width: 130, height: 130 }}>
        <svg viewBox="0 0 160 160" width="100%" height="100%">
          {paths.map((slice, idx) => {
            const isSelected = selectedSubjectId === slice.id;
            const isActive = hoveredSlice === idx || isSelected;
            return (
              <circle
                key={slice.id}
                cx={slice.cx} cy={slice.cy} r={slice.r}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isActive ? slice.strokeWidth + 3 : slice.strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                className="donut-slice"
                style={{ cursor: "pointer", opacity: selectedSubjectId && !isSelected ? 0.35 : 1 }}
                onMouseEnter={() => setHoveredSlice(idx)}
                onMouseLeave={() => setHoveredSlice(null)}
                onClick={() => handleClick(distribution[idx])}
              />
            );
          })}
          <text x="80" y="83" textAnchor="middle" fill="var(--text-primary)" fontSize="0.75rem" fontWeight="700">
            {hoveredSlice !== null ? `${distribution[hoveredSlice].percentage}%` : selectedSubjectId ? `${distribution.find(d => d.id === selectedSubjectId)?.percentage ?? 0}%` : "Total"}
          </text>
          <text x="80" y="96" textAnchor="middle" fill="var(--text-muted)" fontSize="0.55rem" fontWeight="600">
            {hoveredSlice !== null ? distribution[hoveredSlice].name : selectedSubjectId ? distribution.find(d => d.id === selectedSubjectId)?.name ?? "" : "Matières"}
          </text>
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {distribution.map((item, idx) => {
          const isSelected = selectedSubjectId === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onMouseEnter={() => setHoveredSlice(idx)}
              onMouseLeave={() => setHoveredSlice(null)}
              onClick={() => handleClick(item)}
              className={`subject-distribution-row ${isSelected ? "subject-distribution-row--active" : ""}`}
              style={{
                background: isSelected ? "var(--bg-primary)" : hoveredSlice === idx ? "var(--bg-primary)" : "transparent",
                opacity: selectedSubjectId && !isSelected ? 0.5 : 1,
                transition: "background 0.2s ease, opacity 0.2s ease",
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: item.color }} />
              <span style={{ fontSize: "0.9rem" }}>{item.icon}</span>
              <span style={{ flex: 1, fontWeight: isSelected ? 600 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.name}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>{item.percentage}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
