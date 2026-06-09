import { useAuthActions } from "@convex-dev/auth/react";
import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { useLanguage } from "../../hooks/useLanguage";

export function SignIn() {
  const { signIn } = useAuthActions();
  const { t } = useLanguage();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLegal, setShowLegal] = useState<"privacy" | "terms" | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err: unknown) {
      setError(
        step === "signIn"
          ? t.auth.invalidCredentialsError
          : t.auth.signUpError
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>📚 {t.auth.copyright}</h1>
        <p className="subtitle">
          {step === "signIn"
            ? t.auth.welcomeBackSubtitle
            : t.auth.createAccountSubtitle}
        </p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="auth-email">{t.auth.emailLabel}</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">{t.auth.passwordLabel}</label>
            <input
              id="auth-password"
              name="password"
              type="password"
              placeholder={t.auth.passwordPlaceholder}
              autoComplete={step === "signUp" ? "new-password" : "current-password"}
              required
              minLength={8}
            />
          </div>

          <input name="flow" type="hidden" value={step} />

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            id="auth-submit"
          >
            {loading ? t.auth.pleaseWait : step === "signIn" ? t.auth.signInBtn : t.auth.signUpBtn}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setStep(step === "signIn" ? "signUp" : "signIn");
              setError("");
            }}
            id="auth-toggle"
          >
            {step === "signIn"
              ? t.auth.toggleSignUpPrompt
              : t.auth.toggleSignInPrompt}
          </button>
        </div>

        <div className="auth-footer">
          <span suppressHydrationWarning>© {new Date().getFullYear()} {t.auth.copyright}</span>
          <span>•</span>
          <button 
            type="button"
            className="auth-footer-btn"
            onClick={() => setShowLegal("privacy")}
          >
            {t.settings.privacyBtn}
          </button>
          <span>•</span>
          <button 
            type="button"
            className="auth-footer-btn"
            onClick={() => setShowLegal("terms")}
          >
            {t.settings.termsBtn}
          </button>
        </div>
      </div>

      {showLegal === "privacy" && (
        <Modal title={t.settings.privacyPolicyTitle} onClose={() => setShowLegal(null)}>
          <div style={{ fontSize: "0.85rem", lineHeight: "1.5", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 12 }}>
            <LegalText paragraphs={t.settings.privacyPolicyText} />
          </div>
        </Modal>
      )}

      {showLegal === "terms" && (
        <Modal title={t.settings.termsOfServiceTitle} onClose={() => setShowLegal(null)}>
          <div style={{ fontSize: "0.85rem", lineHeight: "1.5", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 12 }}>
            <LegalText paragraphs={t.settings.termsOfServiceText} />
          </div>
        </Modal>
      )}
    </div>
  );
}

function LegalText({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((paragraph, index) => {
        if (index === 0) {
          return <p key={paragraph}><strong>{paragraph}</strong></p>;
        }
        const match = paragraph.match(/^(\d+\.\s*[^:]+)(?::)?(.*)$/);
        if (match) {
          return (
            <React.Fragment key={paragraph}>
              <h4 style={{ color: "var(--text-primary)", marginTop: 10 }}>{match[1]}</h4>
              {match[2] && <p>{match[2].trim()}</p>}
            </React.Fragment>
          );
        }
        return <p key={paragraph}>{paragraph}</p>;
      })}
    </>
  );
}
