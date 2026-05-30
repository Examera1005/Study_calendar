import { useAuthActions } from "@convex-dev/auth/react";
import type { View } from "../../App";

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
      </div>
    </aside>
  );
}
