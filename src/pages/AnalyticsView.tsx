import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";
import { calculateStreak, getAchievements } from "../utils/statsUtils";
import type { Doc } from "../../convex/_generated/dataModel";
import { KpiCards, TimeRangeToggle } from "../components/analytics/KpiCards";
import { ProgressionChart } from "../components/analytics/ProgressionChart";
import { SubjectDistribution } from "../components/analytics/SubjectDistribution";
import { BadgeCard } from "../components/analytics/BadgeCard";

type Log = Doc<"dailyLogs">;
type Task = Doc<"tasks">;
type Subject = Doc<"subjects">;

export function AnalyticsView() {
  const allLogs = useQuery(api.dailyLogs.list) as Log[] | undefined;
  const subjects = useQuery(api.subjects.list) as Subject[] | undefined;
  const allTasks = useQuery(api.tasks.listAll) as Task[] | undefined;

  const [timeRange, setTimeRange] = useState<7 | 30>(7);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const selectedSubject = useMemo(() => {
    if (!selectedSubjectId || !subjects) return null;
    return subjects.find((s) => (s._id as string) === selectedSubjectId) ?? null;
  }, [selectedSubjectId, subjects]);

  const chartTitle = selectedSubject
    ? `📈 Progression — ${selectedSubject.icon || "📚"} ${selectedSubject.name}`
    : "📈 Progression du Temps d'Étude";

  const stats = useMemo(() => {
    if (!allLogs || !allTasks) return { totalHours: 0, totalSessions: 0, completedTasks: 0, streak: 0 };
    const studySessions = allLogs.filter((l) => l.duration && l.duration > 0);
    const totalMinutes = studySessions.reduce((acc, l) => acc + (l.duration || 0), 0);
    return {
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      totalSessions: studySessions.length,
      completedTasks: allTasks.filter((t) => t.completed).length,
      streak: calculateStreak(allLogs),
    };
  }, [allLogs, allTasks]);

  const achievementsList = useMemo(
    () => getAchievements(allLogs || [], stats.completedTasks, stats.streak),
    [allLogs, stats.completedTasks, stats.streak],
  );

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Statistiques & Badges</h1>
        </div>
        <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
      </div>

      <KpiCards stats={stats} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>{chartTitle}</h3>
            {selectedSubjectId && (
              <button
                type="button"
                onClick={() => setSelectedSubjectId(null)}
                className="analytics-reset-btn"
              >
                ✕ Voir tout
              </button>
            )}
          </div>
          <ProgressionChart allLogs={allLogs || []} timeRange={timeRange} selectedSubjectId={selectedSubjectId} />
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📊 Répartition par Matière</h3>
          <SubjectDistribution
            allLogs={allLogs}
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={setSelectedSubjectId}
          />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>🏆 Badges & Trophées</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20 }}>
          Gagnez des badges en complétant vos tâches et en restant régulier dans vos études.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {achievementsList.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </div>
    </div>
  );
}

