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
import { SubjectsView } from "./pages/SubjectsView";
import { FriendsView } from "./pages/FriendsView";
import { api } from "../convex/_generated/api";
import { Modal } from "./components/ui/Modal";
import type { Id } from "../convex/_generated/dataModel";
import { applyThemeCustomizations } from "./utils/colorUtils";
import { AnalyticsView } from "./pages/AnalyticsView";
import { playAlertSound } from "./utils/statsUtils";
import { PomodoroView } from "./pages/PomodoroView";

export type View = "dashboard" | "calendar" | "exams" | "tasks" | "log" | "subjects" | "settings" | "friends" | "analytics" | "pomodoro";

export default function App() {
  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem("currentView");
    return (saved as View) || "dashboard";
  });

  const subjects = useQuery(api.subjects.list);
  const createLog = useMutation(api.dailyLogs.create);

  // ==================== STOPWATCH STATES ====================
  const [stopwatchActive, setStopwatchActive] = useState(false);
  const [stopwatchStartTime, setStopwatchStartTime] = useState<number | null>(null);
  const [stopwatchElapsed, setStopwatchElapsed] = useState(0);

  // Restore stopwatch on mount
  useEffect(() => {
    const active = localStorage.getItem("studyTimerActive") === "true";
    const start = localStorage.getItem("studyTimerStart");
    if (active && start) {
      setStopwatchActive(true);
      const startMs = Number(start);
      setStopwatchStartTime(startMs);
      setStopwatchElapsed(Math.floor((Date.now() - startMs) / 1000));
    }
  }, []);

  // Tick stopwatch
  useEffect(() => {
    let interval: any = null;
    if (stopwatchActive && stopwatchStartTime !== null) {
      interval = setInterval(() => {
        const secs = Math.floor((Date.now() - stopwatchStartTime) / 1000);
        setStopwatchElapsed(secs);
      }, 1000);
    } else {
      setStopwatchElapsed(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stopwatchActive, stopwatchStartTime]);

  const startStopwatch = () => {
    const now = Date.now();
    localStorage.setItem("studyTimerActive", "true");
    localStorage.setItem("studyTimerStart", String(now));
    setStopwatchStartTime(now);
    setStopwatchActive(true);
    setStopwatchElapsed(0);
  };

  const stopStopwatch = () => {
    const mins = Math.max(1, Math.round(stopwatchElapsed / 60));
    setSessionMinutes(mins);
    setShowSaveTimerModal(true);
    
    // Reset state
    localStorage.removeItem("studyTimerActive");
    localStorage.removeItem("studyTimerStart");
    setStopwatchActive(false);
    setStopwatchStartTime(null);
  };

  // Pomodoro Timer States
  const [pomodoroStatus, setPomodoroStatus] = useState<"idle" | "running" | "paused">(() => {
    return (localStorage.getItem("pomodoroStatus") as any) || "idle";
  });
  const [pomodoroMode, setPomodoroMode] = useState<"work" | "break">(() => {
    return (localStorage.getItem("pomodoroMode") as any) || "work";
  });
  const [workDuration, setWorkDuration] = useState<number>(() => {
    const saved = localStorage.getItem("pomodoroWorkDuration");
    return saved ? Number(saved) : 25;
  });
  const [breakDuration, setBreakDuration] = useState<number>(() => {
    const saved = localStorage.getItem("pomodoroBreakDuration");
    return saved ? Number(saved) : 5;
  });
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const saved = localStorage.getItem("pomodoroTimeLeft");
    if (saved) return Number(saved);
    const mode = localStorage.getItem("pomodoroMode") || "work";
    const work = localStorage.getItem("pomodoroWorkDuration") ? Number(localStorage.getItem("pomodoroWorkDuration")) : 25;
    const brk = localStorage.getItem("pomodoroBreakDuration") ? Number(localStorage.getItem("pomodoroBreakDuration")) : 5;
    return mode === "work" ? work * 60 : brk * 60;
  });
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const saved = localStorage.getItem("pomodoroElapsedSeconds");
    return saved ? Number(saved) : 0;
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
    applyThemeCustomizations(theme);
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
            timerActive={stopwatchActive}
            elapsedSeconds={stopwatchElapsed}
            startTimer={startStopwatch}
            stopTimer={stopStopwatch}
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
            {view === "settings" && <SettingsView theme={theme} setTheme={setTheme} />}
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
