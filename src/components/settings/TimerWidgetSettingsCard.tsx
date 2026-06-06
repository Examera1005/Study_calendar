export type TimerCorner = "bottom-right" | "bottom-left" | "top-right" | "top-left";

const CORNER_LABELS: Record<TimerCorner, string> = {
  "bottom-right": "↘ Bas-Droite",
  "bottom-left": "↙ Bas-Gauche",
  "top-right": "↗ Haut-Droite",
  "top-left": "↖ Haut-Gauche",
};

const CORNERS: TimerCorner[] = ["bottom-right", "bottom-left", "top-right", "top-left"];

type Props = {
  corner: TimerCorner;
  scale: number;
  onCornerChange: (c: TimerCorner) => void;
  onScaleChange: (s: number) => void;
};

export function TimerWidgetSettingsCard({ corner, scale, onCornerChange, onScaleChange }: Props) {
  return (
    <div className="card">
      <h3 style={{ marginBottom: 12 }}>⏱️ Study Session Widget</h3>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20 }}>
        Personnalise la position et la taille du bouton "Study Session" flottant.
      </p>

      {/* Corner selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>
          Position à l'écran
        </label>
        <div className="timer-corner-grid">
          {CORNERS.map((c) => (
            <button
              key={c}
              type="button"
              className={`timer-corner-btn ${corner === c ? "active" : ""}`}
              onClick={() => onCornerChange(c)}
            >
              {CORNER_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Visual mini-preview */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>
          Aperçu
        </label>
        <div className="timer-preview-box">
          <div
            className="timer-preview-dot"
            style={{
              ...(corner.includes("top") ? { top: 6 } : { bottom: 6 }),
              ...(corner.includes("right") ? { right: 6 } : { left: 6 }),
              transform: `scale(${scale})`,
            }}
          />
        </div>
      </div>

      {/* Scale slider */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            Taille du widget
          </label>
          <span style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "var(--accent-primary)",
            background: "var(--accent-light)",
            padding: "2px 10px",
            borderRadius: "var(--radius-sm)",
          }}>
            {Math.round(scale * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.6"
          max="1.5"
          step="0.05"
          value={scale}
          onChange={(e) => onScaleChange(parseFloat(e.target.value))}
          className="color-picker-slider"
          style={{
            width: "100%",
            height: 6,
            borderRadius: 3,
            outline: "none",
            appearance: "none",
            WebkitAppearance: "none",
            background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${((scale - 0.6) / 0.9) * 100}%, var(--border-medium) ${((scale - 0.6) / 0.9) * 100}%, var(--border-medium) 100%)`,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>
          <span>60%</span>
          <span>100%</span>
          <span>150%</span>
        </div>
      </div>
    </div>
  );
}
