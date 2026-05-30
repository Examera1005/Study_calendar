import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useEffect, useState } from "react";
import { SignIn } from "./components/auth/SignIn";
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { CalendarView } from "./pages/CalendarView";
import { ExamsView } from "./pages/ExamsView";
import { TasksView } from "./pages/TasksView";
import { DailyLogView } from "./pages/DailyLogView";
import { SettingsView } from "./pages/SettingsView";

export type View = "dashboard" | "calendar" | "exams" | "tasks" | "log" | "settings";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <>
      <AuthLoading>
        <div className="auth-page">
          <div className="loading-spinner"><div className="spinner" /></div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <SignIn />
      </Unauthenticated>

      <Authenticated>
        <div className="app-layout">
          <Sidebar view={view} setView={setView} theme={theme} toggleTheme={toggleTheme} />
          <main className="main-content">
            {view === "dashboard" && (
              <Dashboard
                setView={setView}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            )}
            {view === "calendar" && (
              <CalendarView
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            )}
            {view === "exams" && <ExamsView />}
            {view === "tasks" && (
              <TasksView
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            )}
            {view === "log" && (
              <DailyLogView
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            )}
            {view === "settings" && <SettingsView />}
          </main>
        </div>
      </Authenticated>
    </>
  );
}
