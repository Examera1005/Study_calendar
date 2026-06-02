import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Modal } from "../ui/Modal";

export function SignIn() {
  const { signIn } = useAuthActions();
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
          ? "Invalid email or password."
          : "Could not create account. Try a different email.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>📚 Study Calendar</h1>
        <p className="subtitle">
          {step === "signIn"
            ? "Welcome back — sign in to continue"
            : "Create your account to get started"}
        </p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="auth-email">Email</label>
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
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
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
            {loading ? "Please wait…" : step === "signIn" ? "Sign In" : "Create Account"}
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
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>

      <div style={{
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 16,
        fontSize: "0.8rem",
        color: "var(--text-muted)",
        flexWrap: "wrap",
        padding: "0 16px"
      }}>
        <span>© {new Date().getFullYear()} Study Calendar</span>
        <span>•</span>
        <button 
          type="button"
          style={{ background: "none", border: "none", color: "var(--accent-primary)", font: "inherit", cursor: "pointer", textDecoration: "underline", padding: 0 }}
          onClick={() => setShowLegal("privacy")}
        >
          Privacy Policy
        </button>
        <span>•</span>
        <button 
          type="button"
          style={{ background: "none", border: "none", color: "var(--accent-primary)", font: "inherit", cursor: "pointer", textDecoration: "underline", padding: 0 }}
          onClick={() => setShowLegal("terms")}
        >
          Terms of Service
        </button>
      </div>

      {showLegal === "privacy" && (
        <Modal title="Privacy Policy" onClose={() => setShowLegal(null)}>
          <div style={{ fontSize: "0.85rem", lineHeight: "1.5", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 12 }}>
            <p><strong>Effective Date: May 30, 2026</strong></p>
            <p>Your privacy is important to us. This Privacy Policy details how we handle information in the Study Calendar application.</p>
            
            <h4 style={{ color: "var(--text-primary)" }}>1. Data We Collect</h4>
            <p>We collect and store your email address (for authentication purposes), and study logs, task lists, calendar events, and academic exams you record.</p>

            <h4 style={{ color: "var(--text-primary)" }}>2. How We Use Data</h4>
            <p>Your data is processed strictly to display dashboards, track deadlines, aggregate study statistics, and provide core planning utilities.</p>

            <h4 style={{ color: "var(--text-primary)" }}>3. Security & Database</h4>
            <p>All data is hosted securely within Convex databases. We use secure modern cryptographical methods to ensure user account and token integrity.</p>

            <h4 style={{ color: "var(--text-primary)" }}>4. Deletion Rights</h4>
            <p>You can request to purge all associated entries, logs, and account records by contacting our support team or deleting them inside settings.</p>
          </div>
        </Modal>
      )}

      {showLegal === "terms" && (
        <Modal title="Terms of Service" onClose={() => setShowLegal(null)}>
          <div style={{ fontSize: "0.85rem", lineHeight: "1.5", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 12 }}>
            <p><strong>Effective Date: May 30, 2026</strong></p>
            <p>Welcome to Study Calendar. By signing up, you agree to these Terms of Service.</p>

            <h4 style={{ color: "var(--text-primary)" }}>1. User License</h4>
            <p>We grant you a non-commercial, personal, revocable license to plan academic schedules and record study activity.</p>

            <h4 style={{ color: "var(--text-primary)" }}>2. Disclaimer of Warranties</h4>
            <p>Study Calendar is provided "as is" and "as available". We do not guarantee that the tool will prevent exam failures or maintain 100% database uptime.</p>

            <h4 style={{ color: "var(--text-primary)" }}>3. Account Termination</h4>
            <p>We reserve the right to suspend or block access to accounts that violate normal usage patterns or threaten application database stability.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
