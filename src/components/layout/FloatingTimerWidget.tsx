type Props = {
  status: "idle" | "running" | "paused";
  elapsedSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
};

function formatElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${minutes}:${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

export function FloatingTimerWidget({ status, elapsedSeconds, onStart, onPause, onResume, onStop }: Props) {
  if (status === "idle") {
    return (
      <div className="floating-timer-widget">
        <button
          type="button"
          className="btn btn-primary floating-timer-start-btn"
          onClick={onStart}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <span className="timer-emoji">⏱️</span> Start Session
        </button>
      </div>
    );
  }

  return (
    <div className="floating-timer-widget">
      <div className="floating-timer-active">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          {status === "running" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--danger)" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--danger)" }}>STUDYING LIVE</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--warning)" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--warning)" }}>PAUSED</span>
            </div>
          )}
          <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace", color: "var(--text-primary)" }}>
            {formatElapsed(elapsedSeconds)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {status === "running" ? (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onPause} style={{ flex: 1 }}>⏸️ Pause</button>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={onResume} style={{ flex: 1 }}>▶️ Resume</button>
          )}
          <button type="button" className="btn btn-danger btn-sm" onClick={onStop} style={{ flex: 1 }}>⏹ Stop</button>
        </div>
      </div>
    </div>
  );
}
