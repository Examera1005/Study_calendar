import { useAuthActions } from "@convex-dev/auth/react";
import type { View } from "../../App";


const NAV_ITEMS: { id: View; icon: string; label: string }[] = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "calendar", icon: "📅", label: "Calendar" },
  { id: "analytics", icon: "📊", label: "Stats & Badges" },
  { id: "pomodoro", icon: "🍅", label: "Pomodoro" },
  { id: "exams", icon: "🎯", label: "Exams" },
  { id: "tasks", icon: "✅", label: "Tasks" },
  { id: "log", icon: "📝", label: "Daily Log" },
  { id: "friends", icon: "👥", label: "Friends" },
  { id: "subjects", icon: "📚", label: "Subjects" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export function Sidebar({
  view,
  setView,
  theme,
  toggleTheme,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
}: {
  view: View;
  setView: (v: View) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (c: boolean) => void;
}) {
  const { signOut } = useAuthActions();



  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} id="sidebar">
      <div className="sidebar-brand" style={{ position: "relative" }}>
        <h2 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <img src="/logo.png" alt="Logo" style={{ width: "28px", height: "28px", borderRadius: "6px" }} />
          <span className="brand-text">Study Calendar</span>
        </h2>
        <span className="brand-subtitle">Stay organized, ace your exams</span>

        {/* Collapse Button (Desktop Only) */}
        <button
          type="button"
          className="sidebar-collapse-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform var(--transition-normal)", transform: sidebarCollapsed ? "rotate(180deg)" : "none" }}>
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>



      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${view === item.id ? "active" : ""}`}
            onClick={() => {
              setView(item.id);
              setSidebarOpen(false);
            }}
            id={`nav-${item.id}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
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
              <span className="footer-label">Light Mode</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
              <span className="footer-label">Dark Mode</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-full btn-sm"
          onClick={() => {
            localStorage.removeItem("e2ee_private_key");
            void signOut();
          }}
          id="sign-out-btn"
          title="Sign Out"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <span className="sign-out-icon">🚪</span>
          <span className="footer-label">Sign Out</span>
        </button>

        <div className="sidebar-footer-info" style={{
          marginTop: 10,
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          gap: 6
        }}>
          <span>© {new Date().getFullYear()} Study Calendar</span>
        </div>
      </div>
    </aside>
  );
}
