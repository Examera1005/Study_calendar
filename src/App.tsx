import { Authenticated, Unauthenticated, AuthLoading, useQuery, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { SignIn } from "./components/auth/SignIn";
import { LandingPage } from "./components/auth/LandingPage";
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { CalendarView } from "./pages/CalendarView";
import { ExamsView } from "./pages/ExamsView";
import { TasksView } from "./pages/TasksView";
import { DailyLogView } from "./pages/DailyLogView";
import { formatLocalDate } from "./utils/dateUtils";
import { SettingsView } from "./pages/SettingsView";
import { SubjectsView } from "./pages/SubjectsView";
import { FriendsView } from "./pages/FriendsView";
import { api } from "../convex/_generated/api";
import { Modal } from "./components/ui/Modal";
import type { Id } from "../convex/_generated/dataModel";
import { 
  applyThemeCustomizations,
  getCustomizationsRawJson,
  saveCustomizationsRawJson
} from "./utils/colorUtils";
import { AnalyticsView } from "./pages/AnalyticsView";
import { playAlertSound } from "./utils/statsUtils";
import { PomodoroView } from "./pages/PomodoroView";

export type View = "dashboard" | "calendar" | "exams" | "tasks" | "log" | "subjects" | "settings" | "friends" | "analytics" | "pomodoro";

let initialPomodoroCached = false;
let initialPomodoroStatus = "idle";
let initialPomodoroMode = "work";
let initialWorkDuration = 25;
let initialBreakDuration = 5;
let initialTimeLeft = 1500;
let initialElapsedSeconds = 0;

function ensurePomodoroCached() {
  if (initialPomodoroCached) return;
  initialPomodoroCached = true;
  if (typeof window === "undefined") return;

  initialPomodoroStatus = localStorage.getItem("pomodoroStatus") as any || "idle";
  initialPomodoroMode = localStorage.getItem("pomodoroMode") as any || "work";
  const savedWork = localStorage.getItem("pomodoroWorkDuration");
  initialWorkDuration = savedWork ? Number(savedWork) : 25;
  const savedBreak = localStorage.getItem("pomodoroBreakDuration");
  initialBreakDuration = savedBreak ? Number(savedBreak) : 5;
  const savedTimeLeft = localStorage.getItem("pomodoroTimeLeft");
  initialTimeLeft = savedTimeLeft 
    ? Number(savedTimeLeft) 
    : (initialPomodoroMode === "work" ? initialWorkDuration * 60 : initialBreakDuration * 60);
  const savedElapsed = localStorage.getItem("pomodoroElapsedSeconds");
  initialElapsedSeconds = savedElapsed ? Number(savedElapsed) : 0;
}

export default function App() {
  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem("currentView");
    return (saved as View) || "dashboard";
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const subjects = useQuery(api.subjects.list);
  const createLog = useMutation(api.dailyLogs.create);

  // ==================== STOPWATCH STATES ====================
  const [stopwatchStatus, setStopwatchStatus] = useState<"idle" | "running" | "paused">("idle");
  const [stopwatchStartTime, setStopwatchStartTime] = useState<number | null>(null);
  const [stopwatchAccumulated, setStopwatchAccumulated] = useState(0);
  const [stopwatchElapsed, setStopwatchElapsed] = useState(0);

  // Restore stopwatch on mount
  useEffect(() => {
    const status = (localStorage.getItem("studyTimerStatus") as any) || "idle";
    const start = localStorage.getItem("studyTimerStart");
    const accum = localStorage.getItem("studyTimerAccumulated");
    
    if (status === "running" && start) {
      setStopwatchStatus("running");
      const startMs = Number(start);
      setStopwatchStartTime(startMs);
      const accumulatedSecs = accum ? Number(accum) : 0;
      setStopwatchAccumulated(accumulatedSecs);
      setStopwatchElapsed(accumulatedSecs + Math.floor((Date.now() - startMs) / 1000));
    } else if (status === "paused") {
      setStopwatchStatus("paused");
      const accumulatedSecs = accum ? Number(accum) : 0;
      setStopwatchAccumulated(accumulatedSecs);
      setStopwatchElapsed(accumulatedSecs);
    }
  }, []);

  // Tick stopwatch
  useEffect(() => {
    let interval: any = null;
    if (stopwatchStatus === "running" && stopwatchStartTime !== null) {
      interval = setInterval(() => {
        const secs = stopwatchAccumulated + Math.floor((Date.now() - stopwatchStartTime) / 1000);
        setStopwatchElapsed(secs);
      }, 1000);
    } else if (stopwatchStatus === "paused") {
      setStopwatchElapsed(stopwatchAccumulated);
    } else {
      setStopwatchElapsed(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stopwatchStatus, stopwatchStartTime, stopwatchAccumulated]);

  const startStopwatch = () => {
    const now = Date.now();
    localStorage.setItem("studyTimerStatus", "running");
    localStorage.setItem("studyTimerStart", String(now));
    localStorage.setItem("studyTimerAccumulated", "0");
    setStopwatchStatus("running");
    setStopwatchStartTime(now);
    setStopwatchAccumulated(0);
    setStopwatchElapsed(0);
  };

  const pauseStopwatch = () => {
    if (stopwatchStatus !== "running" || stopwatchStartTime === null) return;
    const currentElapsed = stopwatchAccumulated + Math.floor((Date.now() - stopwatchStartTime) / 1000);
    localStorage.setItem("studyTimerStatus", "paused");
    localStorage.removeItem("studyTimerStart");
    localStorage.setItem("studyTimerAccumulated", String(currentElapsed));
    
    setStopwatchStatus("paused");
    setStopwatchStartTime(null);
    setStopwatchAccumulated(currentElapsed);
    setStopwatchElapsed(currentElapsed);
  };

  const resumeStopwatch = () => {
    if (stopwatchStatus !== "paused") return;
    const now = Date.now();
    localStorage.setItem("studyTimerStatus", "running");
    localStorage.setItem("studyTimerStart", String(now));
    localStorage.setItem("studyTimerAccumulated", String(stopwatchAccumulated));
    
    setStopwatchStatus("running");
    setStopwatchStartTime(now);
  };

  const stopStopwatch = () => {
    let totalSecs = stopwatchAccumulated;
    if (stopwatchStatus === "running" && stopwatchStartTime !== null) {
      totalSecs += Math.floor((Date.now() - stopwatchStartTime) / 1000);
    }
    const mins = Math.max(1, Math.round(totalSecs / 60));
    setSessionMinutes(mins);
    setShowSaveTimerModal(true);
    
    // Reset state
    localStorage.removeItem("studyTimerStatus");
    localStorage.removeItem("studyTimerStart");
    localStorage.removeItem("studyTimerAccumulated");
    setStopwatchStatus("idle");
    setStopwatchStartTime(null);
    setStopwatchAccumulated(0);
    setStopwatchElapsed(0);
  };

  // Pomodoro Timer States
  const [pomodoroStatus, setPomodoroStatus] = useState<"idle" | "running" | "paused">(() => {
    ensurePomodoroCached();
    return initialPomodoroStatus as any;
  });
  const [pomodoroMode, setPomodoroMode] = useState<"work" | "break">(() => {
    ensurePomodoroCached();
    return initialPomodoroMode as any;
  });
  const [workDuration, setWorkDuration] = useState<number>(() => {
    ensurePomodoroCached();
    return initialWorkDuration;
  });
  const [breakDuration, setBreakDuration] = useState<number>(() => {
    ensurePomodoroCached();
    return initialBreakDuration;
  });
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    ensurePomodoroCached();
    return initialTimeLeft;
  });
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    ensurePomodoroCached();
    return initialElapsedSeconds;
  });
  const [showSaveTimerModal, setShowSaveTimerModal] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("pomodoroStatus", pomodoroStatus);
    localStorage.setItem("pomodoroMode", pomodoroMode);
    localStorage.setItem("pomodoroWorkDuration", String(workDuration));
    localStorage.setItem("pomodoroBreakDuration", String(breakDuration));
    localStorage.setItem("pomodoroTimeLeft", String(timeLeft));
    localStorage.setItem("pomodoroElapsedSeconds", String(elapsedSeconds));
  }, [pomodoroStatus, pomodoroMode, workDuration, breakDuration, timeLeft, elapsedSeconds]);

  // Update time left if durations change while idle
  useEffect(() => {
    if (pomodoroStatus === "idle") {
      setTimeLeft(pomodoroMode === "work" ? workDuration * 60 : breakDuration * 60);
    }
  }, [workDuration, breakDuration, pomodoroMode, pomodoroStatus]);

  // Handle Pomodoro Timer Ticking
  useEffect(() => {
    let timerInterval: any = null;

    if (pomodoroStatus === "running") {
      timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            // Trigger timer complete asynchronously to prevent infinite state update loops
            setTimeout(() => handleTimerComplete(), 0);
            return 0;
          }
          return prev - 1;
        });

        if (pomodoroMode === "work") {
          setElapsedSeconds((prev) => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [pomodoroStatus, pomodoroMode]);

  const handleTimerComplete = () => {
    if (pomodoroMode === "work") {
      playAlertSound("success");
      setSessionMinutes(workDuration);
      setShowSaveTimerModal(true);
      
      if (breakDuration === 0) {
        setPomodoroMode("work");
        setPomodoroStatus("idle");
        setTimeLeft(workDuration * 60);
        setElapsedSeconds(0);
      } else {
        setPomodoroMode("break");
        setPomodoroStatus("paused");
        setTimeLeft(breakDuration * 60);
        setElapsedSeconds(0);
      }
    } else {
      playAlertSound("break");
      setPomodoroMode("work");
      setPomodoroStatus("paused");
      setTimeLeft(workDuration * 60);
      setElapsedSeconds(0);
    }
  };

  const startPomodoro = () => {
    if (pomodoroStatus === "idle") {
      setTimeLeft(pomodoroMode === "work" ? workDuration * 60 : breakDuration * 60);
      setElapsedSeconds(0);
    }
    setPomodoroStatus("running");
  };

  const pausePomodoro = () => {
    setPomodoroStatus("paused");
  };

  const resetPomodoro = () => {
    setPomodoroStatus("idle");
    setPomodoroMode("work");
    setTimeLeft(workDuration * 60);
    setElapsedSeconds(0);
  };

  const stopAndLogWork = () => {
    if (pomodoroMode === "work" && elapsedSeconds >= 10) {
      const mins = Math.max(1, Math.round(elapsedSeconds / 60));
      setSessionMinutes(mins);
      setShowSaveTimerModal(true);
    }
    resetPomodoro();
  };


  useEffect(() => {
    localStorage.setItem("currentView", view);
  }, [view]);
  const [selectedDate, setSelectedDate] = useState<string>(
    formatLocalDate(),
  );
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const userSettings = useQuery((api as any).userSettings?.get);
  const updateSettings = useMutation((api as any).userSettings?.update);

  useEffect(() => {
    if (userSettings) {
      if (userSettings.theme && userSettings.theme !== theme) {
        setTheme(userSettings.theme as "light" | "dark");
      }
      if (userSettings.customizations) {
        const localCustomizationsJson = getCustomizationsRawJson();
        if (localCustomizationsJson !== userSettings.customizations) {
          saveCustomizationsRawJson(userSettings.customizations);
          applyThemeCustomizations((userSettings.theme as "light" | "dark") || theme);
        }
      }
    }
  }, [userSettings]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    applyThemeCustomizations(theme);
  }, [theme]);

  const handleSetTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    if (updateSettings) {
      void updateSettings({ theme: newTheme });
    }
  };

  const toggleTheme = () => {
    handleSetTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <>
      <AuthLoading>
        <div className="auth-page">
          <div className="loading-spinner"><div className="spinner" /></div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>

      <Authenticated>
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSidebarOpen(false);
              }
            }}
            role="button"
            tabIndex={-1}
          />
        )}
        <div className={`app-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
          <div className="mobile-header">
            <button type="button" className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <span className="mobile-header-title">
              {view === "dashboard" && "🏠 Dashboard"}
              {view === "calendar" && "📅 Calendar"}
              {view === "analytics" && "📊 Stats & Badges"}
              {view === "pomodoro" && "🍅 Pomodoro"}
              {view === "exams" && "🎯 Exams"}
              {view === "tasks" && "✅ Tasks"}
              {view === "log" && "📝 Daily Log"}
              {view === "friends" && "👥 Friends"}
              {view === "subjects" && "📚 Subjects"}
              {view === "settings" && "⚙️ Settings"}
            </span>
            {stopwatchStatus !== "idle" && (
              <div
                className="mobile-active-timer"
                onClick={() => setView("dashboard")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setView("dashboard");
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {stopwatchStatus === "running" ? (
                  <>
                    <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--danger)" }} />
                    <span>LIVE</span>
                  </>
                ) : (
                  <>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--warning)" }} />
                    <span>PAUSED</span>
                  </>
                )}
              </div>
            )}
          </div>
          <Sidebar
            view={view}
            setView={setView}
            theme={theme}
            toggleTheme={toggleTheme}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
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
            {view === "subjects" && <SubjectsView />}
            {view === "settings" && <SettingsView theme={theme} setTheme={handleSetTheme} />}
            {view === "friends" && <FriendsView />}
            {view === "analytics" && <AnalyticsView />}
            {view === "pomodoro" && (
              <PomodoroView
                pomodoroStatus={pomodoroStatus}
                pomodoroMode={pomodoroMode}
                timeLeft={timeLeft}
                workDuration={workDuration}
                breakDuration={breakDuration}
                setWorkDuration={setWorkDuration}
                setBreakDuration={setBreakDuration}
                startPomodoro={startPomodoro}
                pausePomodoro={pausePomodoro}
                resetPomodoro={resetPomodoro}
                stopAndLogWork={stopAndLogWork}
              />
            )}
          </main>

          {/* Floating Study Session Widget */}
          <div className="floating-timer-widget">
            {stopwatchStatus !== "idle" ? (
              <div className="floating-timer-active">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  {stopwatchStatus === "running" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--danger)" }} />
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--danger)" }}>STUDYING LIVE</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--warning)" }} />
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--warning)" }}>PAUSED</span>
                    </div>
                  )}
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace", color: "var(--text-primary)" }}>
                    {[
                      Math.floor(stopwatchElapsed / 3600) > 0 ? String(Math.floor(stopwatchElapsed / 3600)).padStart(2, "0") : null,
                      String(Math.floor((stopwatchElapsed % 3600) / 60)).padStart(2, "0"),
                      String(stopwatchElapsed % 60).padStart(2, "0")
                    ].filter(Boolean).join(":")}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {stopwatchStatus === "running" ? (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={pauseStopwatch} style={{ flex: 1 }}>⏸️ Pause</button>
                  ) : (
                    <button type="button" className="btn btn-primary btn-sm" onClick={resumeStopwatch} style={{ flex: 1 }}>▶️ Resume</button>
                  )}
                  <button type="button" className="btn btn-danger btn-sm" onClick={stopStopwatch} style={{ flex: 1 }}>⏹ Stop</button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary floating-timer-start-btn"
                onClick={startStopwatch}
                style={{ display: "flex", alignItems: "center", gap: 8, boxShadow: "var(--shadow-md)" }}
              >
                ⏱️ Start Session
              </button>
            )}
          </div>
        </div>
      </Authenticated>
      {showSaveTimerModal && (
        <Modal title="Log Study Session" onClose={() => setShowSaveTimerModal(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const duration = Number(fd.get("duration")) || sessionMinutes;
              void createLog({
                date: formatLocalDate(),
                content: fd.get("content") as string,
                duration: duration,
                subjectId: fd.get("subjectId") ? (fd.get("subjectId") as Id<"subjects">) : undefined,
              });
              setShowSaveTimerModal(false);
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8 }}>Adjust Study Time (minutes)</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <input
                  type="number"
                  name="duration"
                  min="1"
                  value={sessionMinutes}
                  onChange={(e) => setSessionMinutes(Math.max(1, Number(e.target.value)))}
                  style={{
                    width: "110px",
                    textAlign: "center",
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "var(--accent-primary)",
                    fontFamily: "monospace",
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    padding: "4px 8px"
                  }}
                  required
                />
                <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-secondary)" }}>min</span>
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
