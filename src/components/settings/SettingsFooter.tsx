interface SettingsFooterProps {
  onShowLegal: (type: "privacy" | "terms") => void;
}

export function SettingsFooter({ onShowLegal }: SettingsFooterProps) {
  return (
    <div className="settings-legal-footer">
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <button
          type="button"
          className="legal-link-btn"
          onClick={() => onShowLegal("privacy")}
          id="privacy-link"
        >
          Privacy Policy
        </button>
        <button
          type="button"
          className="legal-link-btn"
          onClick={() => onShowLegal("terms")}
          id="terms-link"
        >
          Terms of Service
        </button>
      </div>
      <span suppressHydrationWarning style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
        © {new Date().getFullYear()} Study Calendar. All rights reserved.
      </span>
    </div>
  );
}
