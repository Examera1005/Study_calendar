import { useAuthActions } from "@convex-dev/auth/react";
import type { View } from "../../App";
import { useState } from "react";
import { Modal } from "../ui/Modal";

const NAV_ITEMS: { id: View; icon: string; label: string }[] = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "calendar", icon: "📅", label: "Calendar" },
  { id: "exams", icon: "🎯", label: "Exams" },
  { id: "tasks", icon: "✅", label: "Tasks" },
  { id: "log", icon: "📝", label: "Daily Log" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export function Sidebar({
  view,
  setView,
  theme,
  toggleTheme,
}: {
  view: View;
  setView: (v: View) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  const { signOut } = useAuthActions();
  const [showLegal, setShowLegal] = useState<"privacy" | "terms" | null>(null);

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <h2>📚 Study Calendar</h2>
        <span>Stay organized, ace your exams</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${view === item.id ? "active" : ""}`}
            onClick={() => setView(item.id)}
            id={`nav-${item.id}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          id="theme-toggle"
          title="Toggle color theme"
        >
          {theme === "light" ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2"/>
                <path d="M12 20v2"/>
                <path d="m4.93 4.93 1.41 1.41"/>
                <path d="m17.66 17.66 1.41 1.41"/>
                <path d="M2 12h2"/>
                <path d="M20 12h2"/>
                <path d="m6.34 17.66-1.41 1.41"/>
                <path d="m19.07 4.93-1.41 1.41"/>
              </svg>
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
              <span>Dark Mode</span>
            </>
          )}
        </button>

        <button
          className="btn btn-secondary btn-full btn-sm"
          onClick={() => void signOut()}
          id="sign-out-btn"
        >
          Sign Out
        </button>

        <div style={{
          marginTop: 10,
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 4
        }}>
          <div>© {new Date().getFullYear()} Study Calendar</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            <button 
              style={{ background: "none", border: "none", color: "inherit", font: "inherit", cursor: "pointer", textDecoration: "underline", padding: 0 }}
              onClick={() => setShowLegal("privacy")}
              id="privacy-link"
            >
              Privacy
            </button>
            <span>•</span>
            <button 
              style={{ background: "none", border: "none", color: "inherit", font: "inherit", cursor: "pointer", textDecoration: "underline", padding: 0 }}
              onClick={() => setShowLegal("terms")}
              id="terms-link"
            >
              Terms
            </button>
          </div>
        </div>
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
    </aside>
  );
}
