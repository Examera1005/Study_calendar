import { useEffect } from "react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close modal"
        style={{
          position: "absolute",
          inset: 0,
          background: "transparent",
          border: "none",
          cursor: "default",
          width: "100%",
          height: "100%",
        }}
      />
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ position: "relative", zIndex: 1 }}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="btn-icon" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
