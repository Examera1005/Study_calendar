import { Authenticated, Unauthenticated, AuthLoading, useQuery, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { SignIn } from "./components/auth/SignIn";
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { CalendarView } from "./pages/CalendarView";
import { ExamsView } from "./pages/ExamsView";
import { TasksView } from "./pages/TasksView";
import { DailyLogView } from "./pages/DailyLogView";
import { SettingsView } from "./pages/SettingsView";
import { api } from "../convex/_generated/api";
import { Modal } from "./components/ui/Modal";
import type { Id } from "../convex/_generated/dataModel";

export type View = "dashboard" | "calendar" | "exams" | "tasks" | "log" | "settings";

export default function App() {
  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem("currentView");
    return (saved as View) || "dashboard";
  });

  const subjects = useQuery(api.subjects.list);
  const createLog = useMutation(api.dailyLogs.create);

  const [timerActive, setTimerActive] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSaveTimerModal, setShowSaveTimerModal] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);

  // Restore timer on mount
  useEffect(() => {
    const active = localStorage.getItem("studyTimerActive") === "true";
    const start = localStorage.getItem("studyTimerStart");
    if (active && start) {
      setTimerActive(true);
      const startMs = Number(start);
      setTimerStartTime(startMs);
      setElapsedSeconds(Math.floor((Date.now() - startMs) / 1000));
    }
  }, []);

  // Tick timer
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerStartTime !== null) {
      interval = setInterval(() => {
        const secs = Math.floor((Date.now() - timerStartTime) / 1000);
        setElapsedSeconds(secs);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerStartTime]);

  const startTimer = () => {
    const now = Date.now();
    localStorage.setItem("studyTimerActive", "true");
    localStorage.setItem("studyTimerStart", String(now));
    setTimerStartTime(now);
    setTimerActive(true);
    setElapsedSeconds(0);
  };

  const stopTimer = () => {
    const mins = Math.max(1, Math.round(elapsedSeconds / 60));
    setSessionMinutes(mins);
    setShowSaveTimerModal(true);
    
    // Reset state
    localStorage.removeItem("studyTimerActive");
    localStorage.removeItem("studyTimerStart");
    setTimerActive(false);
    setTimerStartTime(null);
  };

  useEffect(() => {
    localStorage.setItem("currentView", view);
  }, [view]);
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
          <Sidebar
            view={view}
            setView={setView}
            theme={theme}
            toggleTheme={toggleTheme}
            timerActive={timerActive}
            elapsedSeconds={elapsedSeconds}
            startTimer={startTimer}
            stopTimer={stopTimer}
          />
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
      {showSaveTimerModal && (
        <Modal title="Log Study Session" onClose={() => setShowSaveTimerModal(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void createLog({
                date: new Date().toISOString().split("T")[0],
                content: fd.get("content") as string,
                duration: sessionMinutes,
                subjectId: fd.get("subjectId") ? (fd.get("subjectId") as Id<"subjects">) : undefined,
              });
              setShowSaveTimerModal(false);
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 4 }}>Elapsed Study Time</div>
              <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--accent-primary)", fontFamily: "monospace" }}>
                {sessionMinutes} min
              </div>
            </div>
            <div className="form-group">
              <label>What did you study?</label>
              <textarea name="content" required placeholder="Summarize your study session progress..." rows={3} />
            </div>
            {subjects && subjects.length > 0 && (
              <div className="form-group">
                <label>Subject</label>
                <select name="subjectId" defaultValue="">
                  <option value="">None</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowSaveTimerModal(false)}>
                Discard
              </button>
              <button type="submit" className="btn btn-primary">
                Save Log
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
