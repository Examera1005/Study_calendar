const COLORS = [
  "#7c3aed", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316",
  "#6366f1", "#84cc16",
];

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="color-picker-grid">
      {COLORS.map((c) => (
        <div
          key={c}
          className={`color-swatch ${value === c ? "selected" : ""}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
}
