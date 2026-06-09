import { useLanguage } from "../../hooks/useLanguage";

export type TimerCorner = "bottom-right" | "bottom-left" | "top-right" | "top-left";

const CORNERS: TimerCorner[] = ["bottom-right", "bottom-left", "top-right", "top-left"];

type Props = {
  corner: TimerCorner;
  scale: number;
  onCornerChange: (c: TimerCorner) => void;
  onScaleChange: (s: number) => void;
};

export function TimerWidgetSettingsCard({ corner, scale, onCornerChange, onScaleChange }: Props) {
  const { t } = useLanguage();
  const scaleId = "timer-widget-scale";

  const getCornerLabel = (c: TimerCorner) => {
    switch (c) {
      case "bottom-right": return `↘ ${t.settings.cornerBottomRight}`;
      case "bottom-left": return `↙ ${t.settings.cornerBottomLeft}`;
      case "top-right": return `↗ ${t.settings.cornerTopRight}`;
      case "top-left": return `↖ ${t.settings.cornerTopLeft}`;
      default: return "";
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 12 }}>{t.settings.widgetTitle}</h3>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20 }}>
        {t.settings.widgetDesc}
      </p>

      {/* Corner selector — uses a fieldset/legend instead of a floating <label> so each
          button inside the group is properly associated with its own text content. */}
      <fieldset style={{ border: "none", padding: 0, margin: "0 0 20px", minInlineSize: 0 }}>
        <legend style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>
          {t.settings.widgetPosition}
        </legend>
        <div className="timer-corner-grid">
          {CORNERS.map((c) => (
            <button
              key={c}
              type="button"
              className={`timer-corner-btn ${corner === c ? "active" : ""}`}
              onClick={() => onCornerChange(c)}
            >
              {getCornerLabel(c)}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Visual mini-preview */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>
          {t.settings.widgetPreview}
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
            {t.settings.widgetScale}
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
          min="0.5"
          max="1.5"
          step="0.05"
          value={scale}
          onChange={(e) => onScaleChange(parseFloat(e.target.value))}
          aria-label={t.settings.widgetScale}
          className="color-picker-slider"
          style={{
            width: "100%",
            height: 6,
            borderRadius: 3,
            appearance: "none",
            WebkitAppearance: "none",
            background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${(scale - 0.5) * 100}%, var(--border-medium) ${(scale - 0.5) * 100}%, var(--border-medium) 100%)`,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
          <span>50%</span>
          <span>100%</span>
          <span>150%</span>
        </div>
      </div>
    </div>
  );
}
