import { useLanguage } from "../../hooks/useLanguage";

interface SettingsFooterProps {
  onShowLegal: (type: "privacy" | "terms") => void;
}

export function SettingsFooter({ onShowLegal }: SettingsFooterProps) {
  const { t, language } = useLanguage();

  return (
    <div className="settings-legal-footer">
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <button
          type="button"
          className="legal-link-btn"
          onClick={() => onShowLegal("privacy")}
          id="privacy-link"
        >
          {t.settings.privacyBtn}
        </button>
        <button
          type="button"
          className="legal-link-btn"
          onClick={() => onShowLegal("terms")}
          id="terms-link"
        >
          {t.settings.termsBtn}
        </button>
      </div>
      <span suppressHydrationWarning style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
        {t.settings.copyright(new Date().getFullYear())}
      </span>
    </div>
  );
}
