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
  const scaleId = "timer-widget-scale";

  return (
    <div className="card">
      <h3 style={{ marginBottom: 12 }}>⏱️ Study Session Widget</h3>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20 }}>
        Personnalise la position et la taille du bouton "Study Session" flottant.
      </p>

      {/* Corner selector — uses a fieldset/legend instead of a floating <label> so each
          button inside the group is properly associated with its own text content. */}
      <fieldset style={{ border: "none", padding: 0, margin: "0 0 20px", minInlineSize: 0 }}>
        <legend style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>
          Position à l'écran
        </legend>
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
      </fieldset>

      {/* Visual mini-preview */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>
          Aperçu
        </span>
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

      {/* Scale slider — label wraps both the text and the input so they're associated */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <label htmlFor={scaleId} style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
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
          id={scaleId}
          type="range"
          min="0.6"
          max="1.5"
          step="0.05"
          value={scale}
          onChange={(e) => onScaleChange(parseFloat(e.target.value))}
          aria-label="Taille du widget"
          className="color-picker-slider"
          style={{
            width: "100%",
            height: 6,
            borderRadius: 3,
            appearance: "none",
            WebkitAppearance: "none",
            background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${((scale - 0.6) / 0.9) * 100}%, var(--border-medium) ${((scale - 0.6) / 0.9) * 100}%, var(--border-medium) 100%)`,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
          <span>60%</span>
          <span>100%</span>
          <span>150%</span>
        </div>
      </div>
    </div>
  );
}
