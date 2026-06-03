import { Authenticated, Unauthenticated, AuthLoading, useQuery, useMutation } from "convex/react";
import { useEffect, useReducer, useState } from "react";
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
import {
  applyThemeCustomizations,
  getCustomizationsRawJson,
  saveCustomizationsRawJson
} from "./utils/colorUtils";
import { AnalyticsView } from "./pages/AnalyticsView";
import { PomodoroView } from "./pages/PomodoroView";
import { useStopwatch } from "./hooks/useStopwatch";
import { usePomodoro } from "./hooks/usePomodoro";
import { MobileHeader } from "./components/layout/MobileHeader";
import { FloatingTimerWidget } from "./components/layout/FloatingTimerWidget";
import { SaveTimerModal } from "./components/study/SaveTimerModal";

export type View = "dashboard" | "calendar" | "exams" | "tasks" | "log" | "subjects" | "settings" | "friends" | "analytics" | "pomodoro";

type SaveModalState = { open: boolean; minutes: number; openId: number };
type SaveModalAction = { type: "open"; minutes: number } | { type: "close" };

function saveModalReducer(state: SaveModalState, action: SaveModalAction): SaveModalState {
  switch (action.type) {
    case "open":
      return { open: true, minutes: action.minutes, openId: state.openId + 1 };
    case "close":
      return { open: false, minutes: 0, openId: state.openId };
  }
}

export default function App() {
  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem("currentView");
    return (saved as View) || "dashboard";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => formatLocalDate());
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });
  const [saveModal, dispatchSaveModal] = useReducer(saveModalReducer, { open: false, minutes: 0, openId: 0 });

  const subjects = useQuery(api.subjects.list);
  const createLog = useMutation(api.dailyLogs.create);
  const userSettings = useQuery((api as any).userSettings?.get);
  const updateSettings = useMutation((api as any).userSettings?.update);

  const stopwatch = useStopwatch();
  const pomodoro = usePomodoro();

  useEffect(() => {
    localStorage.setItem("currentView", view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const theme: "light" | "dark" = (() => {
    if (userSettings?.theme) return userSettings.theme as "light" | "dark";
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved === "light" || saved === "dark") return saved;
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  })();

  useEffect(() => {
    if (userSettings?.customizations) {
      const localCustomizationsJson = getCustomizationsRawJson();
      if (localCustomizationsJson !== userSettings.customizations) {
        saveCustomizationsRawJson(userSettings.customizations);
      }
    }
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    applyThemeCustomizations(theme);
  }, [theme, userSettings?.customizations]);

  const handleSetTheme = (newTheme: "light" | "dark") => {
    localStorage.setItem("theme", newTheme);
    if (updateSettings) {
      void updateSettings({ theme: newTheme });
    }
  };

  const toggleTheme = () => {
    handleSetTheme(theme === "light" ? "dark" : "light");
  };

  const handleStopwatchStop = () => {
    const mins = stopwatch.stop();
    dispatchSaveModal({ type: "open", minutes: mins });
  };

  const handlePomodoroStopAndLog = () => {
    if (pomodoro.mode === "work" && pomodoro.elapsedSeconds >= 10) {
      const mins = Math.max(1, Math.round(pomodoro.elapsedSeconds / 60));
      dispatchSaveModal({ type: "open", minutes: mins });
    }
    pomodoro.reset();
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
          <button
            type="button"
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            style={{ border: "none", padding: 0 }}
          />
        )}
        <div className={`app-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
          <MobileHeader
            view={view}
            onOpenMenu={() => setSidebarOpen(true)}
            onJumpToDashboard={() => setView("dashboard")}
            stopwatchActive={stopwatch.status !== "idle"}
            stopwatchRunning={stopwatch.status === "running"}
          />
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
                pomodoroStatus={pomodoro.status}
                pomodoroMode={pomodoro.mode}
                timeLeft={pomodoro.displayTimeLeft}
                workDuration={pomodoro.workDuration}
                breakDuration={pomodoro.breakDuration}
                setWorkDuration={pomodoro.setWorkDuration}
                setBreakDuration={pomodoro.setBreakDuration}
                startPomodoro={pomodoro.start}
                pausePomodoro={pomodoro.pause}
                resetPomodoro={pomodoro.reset}
                stopAndLogWork={handlePomodoroStopAndLog}
              />
            )}
          </main>

          <FloatingTimerWidget
            status={stopwatch.status}
            elapsedSeconds={stopwatch.elapsed}
            onStart={stopwatch.start}
            onPause={stopwatch.pause}
            onResume={stopwatch.resume}
            onStop={handleStopwatchStop}
          />
        </div>
      </Authenticated>

      {saveModal.open && (
        <SaveTimerModal
          key={saveModal.openId}
          defaultMinutes={saveModal.minutes}
          subjects={subjects}
          onClose={() => dispatchSaveModal({ type: "close" })}
        />
      )}
    </>
  );
}
