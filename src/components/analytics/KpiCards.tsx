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
    { 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "22px", height: "22px", color: "var(--accent-primary)" }}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ), 
      value: `${stats.totalHours}h`, 
      label: "Temps Total",
      bg: "var(--accent-light)"
    },
    { 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "22px", height: "22px", color: "var(--warning)" }}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      ), 
      value: `${stats.streak} ${stats.streak > 1 ? "Jours" : "Jour"}`, 
      label: "Série d'Études",
      bg: "rgba(245, 158, 11, 0.08)"
    },
    { 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "22px", height: "22px", color: "var(--success)" }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ), 
      value: stats.totalSessions, 
      label: "Sessions Loggées",
      bg: "rgba(16, 185, 129, 0.08)"
    },
    { 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "22px", height: "22px", color: "var(--accent-primary)" }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ), 
      value: stats.completedTasks, 
      label: "Tâches Complétées",
      bg: "var(--accent-light)"
    },
  ];
  return (
    <div className="kpi-grid">
      {cards.map((c) => (
        <div key={c.label} className="card kpi-card">
          <div className="kpi-icon-wrapper" style={{ background: c.bg }}>
            {c.icon}
          </div>
          <div className="kpi-value">{c.value}</div>
          <div className="kpi-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
