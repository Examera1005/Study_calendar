type Tab = 7 | 30;

type Props = {
  value: Tab;
  onChange: (tab: Tab) => void;
};

export function TimeRangeToggle({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 8, background: "var(--bg-glass)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 4 }}>
      <button
        type="button"
        className={`btn btn-sm ${value === 7 ? "btn-primary" : "btn-secondary"}`}
        onClick={() => onChange(7)}
        style={{ padding: "6px 12px" }}
      >
        7 Jours
      </button>
      <button
        type="button"
        className={`btn btn-sm ${value === 30 ? "btn-primary" : "btn-secondary"}`}
        onClick={() => onChange(30)}
        style={{ padding: "6px 12px" }}
      >
        30 Jours
      </button>
    </div>
  );
}

type Stats = {
  totalHours: number;
  totalSessions: number;
  completedTasks: number;
  streak: number;
};

export function KpiCards({ stats }: { stats: Stats }) {
  const cards = [
    { icon: "⏱️", value: `${stats.totalHours}h`, label: "Temps Total" },
    { icon: "🔥", value: `${stats.streak} Jours`, label: "Série d'Études" },
    { icon: "📝", value: stats.totalSessions, label: "Sessions Loggées" },
    { icon: "⚡", value: stats.completedTasks, label: "Tâches Complétées" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
      {cards.map((c) => (
        <div key={c.label} className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 6 }}>{c.icon}</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)" }}>{c.value}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}
