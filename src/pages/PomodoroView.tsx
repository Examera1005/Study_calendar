import { useMemo } from "react";

interface PomodoroViewProps {
  pomodoroStatus: "idle" | "running" | "paused";
  pomodoroMode: "work" | "break";
  timeLeft: number;
  workDuration: number;
  breakDuration: number;
  setWorkDuration: (w: number) => void;
  setBreakDuration: (b: number) => void;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  stopAndLogWork: () => void;
}

// Format seconds to MM:SS
const formatSeconds = (totalSecs: number) => {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export function PomodoroView({
  pomodoroStatus,
  pomodoroMode,
  timeLeft,
  workDuration,
  breakDuration,
  setWorkDuration,
  setBreakDuration,
  startPomodoro,
  pausePomodoro,
  resetPomodoro,
  stopAndLogWork,
}: PomodoroViewProps) {


  // Calculate circular progress percentage
  const progressPercent = useMemo(() => {
    const totalSecs = pomodoroMode === "work" ? workDuration * 60 : breakDuration * 60;
    if (totalSecs === 0) return 0;
    return timeLeft / totalSecs;
  }, [timeLeft, pomodoroMode, workDuration, breakDuration]);

  // SVG Circular ring calculations
  const radius = 90;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressPercent * circumference;

  // Preset Configurations
  const presets = [
    { label: "Classique (25m / 5m)", work: 25, break: 5 },
    { label: "Productif (50m / 10m)", work: 50, break: 10 },
    { label: "Sprint (15m / 3m)", work: 15, break: 3 },
    { label: "Continu (30m / 0m)", work: 30, break: 0 },
  ];

  const handlePresetSelect = (w: number, b: number) => {
    if (pomodoroStatus !== "idle") {
      if (!confirm("Voulez-vous réinitialiser le minuteur actuel pour appliquer ce raccourci ?")) {
        return;
      }
    }
    setWorkDuration(w);
    setBreakDuration(b);
    resetPomodoro();
  };

  const currentThemeColor = pomodoroMode === "work" ? "var(--accent-primary)" : "var(--success)";

  return (
    <div style={{
      maxWidth: 600,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 32,
      padding: "20px 0"
    }}>
      <div style={{ textAlign: "center" }}>
        <h1>Minuteur Pomodoro</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
          Restez concentré et gérez vos temps d'étude et de pause de manière optimale.
        </p>
      </div>

      {/* Main Glassmorphic Timer Card */}
      <div 
        className="card pomodoro-main-card" 
        style={{
          boxShadow: pomodoroStatus === "running" ? `0 0 20px rgba(${pomodoroMode === "work" ? "59, 130, 246" : "16, 185, 129"}, 0.15)` : "var(--shadow-lg)",
          borderColor: pomodoroStatus === "running" ? currentThemeColor : "var(--border-subtle)",
        }}
      >
        {/* SVG Circular Ring Clock */}
        <div style={{ position: "relative", width: 220, height: 220 }}>
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="var(--bg-primary)"
              strokeWidth={strokeWidth}
            />
            {/* Countdown animated circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke={currentThemeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "100px 100px",
                transition: "stroke-dashoffset 300ms linear, stroke var(--transition-normal)",
              }}
            />
          </svg>

          {/* Clock Text Centered */}
          <div className="pomodoro-centered-overlay">
            <span 
              className="pomodoro-mode-badge"
              style={{
                color: currentThemeColor,
                background: pomodoroStatus !== "idle" ? "var(--bg-primary)" : "transparent",
              }}
            >
              {pomodoroStatus === "idle" ? "Prêt" : (pomodoroMode === "work" ? "💻 Étude" : "☕ Pause")}
            </span>
            <span style={{
              fontSize: "2.8rem",
              fontWeight: 800,
              fontFamily: "monospace",
              color: "var(--text-primary)",
              lineHeight: 1.2,
              margin: "4px 0"
            }}>
              {formatSeconds(timeLeft)}
            </span>
            <span style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              fontWeight: 500
            }}>
              Objectif: {pomodoroMode === "work" ? workDuration : breakDuration} min
            </span>
          </div>
        </div>

        {/* Controls Row */}
        <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 300 }}>
          {pomodoroStatus === "running" ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={pausePomodoro}
              style={{ flex: 1, padding: "12px", fontSize: "0.95rem" }}
            >
              ⏸️ Pause
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={startPomodoro}
              style={{
                flex: 1,
                padding: "12px",
                fontSize: "0.95rem",
                backgroundColor: currentThemeColor,
                borderColor: currentThemeColor
              }}
            >
              ▶️ Commencer
            </button>
          )}

          {pomodoroStatus !== "idle" && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={stopAndLogWork}
              style={{ flex: 1, padding: "12px", fontSize: "0.95rem" }}
            >
              ⏹️ Arrêter
            </button>
          )}
        </div>
      </div>

      {/* Interval Setup Config */}
      <div className="card" style={{ width: "100%" }}>
        <h3 style={{ marginBottom: 16 }}>⚙️ Réglages des Durées</h3>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 24 }}>
          {/* Work duration range */}
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600 }}>
              <span style={{ color: "var(--text-secondary)" }}>💻 Temps d'Étude (Travail)</span>
              <span style={{ color: "var(--accent-primary)" }}>{workDuration} minutes</span>
            </div>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={workDuration}
              disabled={pomodoroStatus !== "idle"}
              onChange={(e) => setWorkDuration(Number(e.target.value))}
              aria-label="Work duration in minutes"
              style={{
                width: "100%",
                height: 6,
                background: "var(--bg-primary)",
                borderRadius: 3,
                outline: "none",
                cursor: pomodoroStatus === "idle" ? "pointer" : "not-allowed",
                opacity: pomodoroStatus === "idle" ? 1 : 0.5
              }}
            />
          </div>

          {/* Break duration range */}
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600 }}>
              <span style={{ color: "var(--text-secondary)" }}>☕ Temps de Pause</span>
              <span style={{ color: "var(--success)" }}>
                {breakDuration === 0 ? "Aucune (Continu)" : `${breakDuration} minutes`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={breakDuration <= 5 ? 1 : 5}
              value={breakDuration}
              disabled={pomodoroStatus !== "idle"}
              onChange={(e) => setBreakDuration(Number(e.target.value))}
              aria-label="Break duration in minutes"
              style={{
                width: "100%",
                height: 6,
                background: "var(--bg-primary)",
                borderRadius: 3,
                outline: "none",
                cursor: pomodoroStatus === "idle" ? "pointer" : "not-allowed",
                opacity: pomodoroStatus === "idle" ? 1 : 0.5
              }}
            />
          </div>
        </div>

        {/* Quick presets grid */}
        <div>
          <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>
            Raccourcis de Configuration
          </h4>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 10
          }}>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary"
                onClick={() => handlePresetSelect(preset.work, preset.break)}
                style={{
                  padding: "10px",
                  fontSize: "0.82rem",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 500
                }}
              >
                <span>{preset.label.split(" (")[0]}</span>
                <span style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>
                  {preset.work}m / {preset.break === 0 ? "None" : `${preset.break}m`}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
