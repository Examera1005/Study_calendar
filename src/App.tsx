import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useMutation,
	useQuery,
} from "convex/react";
import { useEffect, useReducer } from "react";
import { api } from "../convex/_generated/api";
import { LandingPage } from "./components/auth/LandingPage";
import { FloatingTimerWidget } from "./components/layout/FloatingTimerWidget";
import { MobileHeader } from "./components/layout/MobileHeader";
import { Sidebar } from "./components/layout/Sidebar";
import type { TimerCorner } from "./components/settings/TimerWidgetSettingsCard";
import { SaveTimerModal } from "./components/study/SaveTimerModal";
import { useLanguage } from "./hooks/useLanguage";
import { usePomodoro } from "./hooks/usePomodoro";
import { useStopwatch } from "./hooks/useStopwatch";
import { AnalyticsView } from "./pages/AnalyticsView";
import { CalendarView } from "./pages/CalendarView";
import { DailyLogView } from "./pages/DailyLogView";
import { Dashboard } from "./pages/Dashboard";
import { ExamsView } from "./pages/ExamsView";
import { FriendsView } from "./pages/FriendsView";
import { PomodoroView } from "./pages/PomodoroView";
import { SettingsView } from "./pages/SettingsView";
import { SubjectsView } from "./pages/SubjectsView";
import { TasksView } from "./pages/TasksView";
import {
	applyThemeCustomizations,
	getCustomizationsRawJson,
	saveCustomizationsRawJson,
} from "./utils/colorUtils";
import { formatLocalDate } from "./utils/dateUtils";

export type View =
	| "dashboard"
	| "calendar"
	| "exams"
	| "tasks"
	| "log"
	| "subjects"
	| "settings"
	| "friends"
	| "analytics"
	| "pomodoro";

type SaveModalState = { open: boolean; minutes: number; openId: number };
type SaveModalAction = { type: "open"; minutes: number } | { type: "close" };

function saveModalReducer(
	state: SaveModalState,
	action: SaveModalAction,
): SaveModalState {
	switch (action.type) {
		case "open":
			return { open: true, minutes: action.minutes, openId: state.openId + 1 };
		case "close":
			return { open: false, minutes: 0, openId: state.openId };
	}
}

type UiState = {
	view: View;
	sidebarOpen: boolean;
	sidebarCollapsed: boolean;
	selectedDate: string;
};

type UiAction =
	| { type: "setView"; view: View }
	| { type: "setSidebarOpen"; open: boolean }
	| { type: "setSidebarCollapsed"; collapsed: boolean }
	| { type: "setSelectedDate"; date: string };

function uiReducer(state: UiState, action: UiAction): UiState {
	switch (action.type) {
		case "setView": {
			localStorage.setItem("currentView", action.view);
			return { ...state, view: action.view };
		}
		case "setSidebarOpen":
			return { ...state, sidebarOpen: action.open };
		case "setSidebarCollapsed": {
			localStorage.setItem("sidebarCollapsed", String(action.collapsed));
			return { ...state, sidebarCollapsed: action.collapsed };
		}
		case "setSelectedDate":
			return { ...state, selectedDate: action.date };
	}
}

type TimerPrefsState = { corner: TimerCorner; scale: number };
type TimerPrefsAction =
	| { type: "setCorner"; corner: TimerCorner }
	| { type: "setScale"; scale: number };

function timerPrefsReducer(
	state: TimerPrefsState,
	action: TimerPrefsAction,
): TimerPrefsState {
	switch (action.type) {
		case "setCorner": {
			localStorage.setItem("timerCorner", action.corner);
			return { ...state, corner: action.corner };
		}
		case "setScale": {
			localStorage.setItem("timerScale", String(action.scale));
			return { ...state, scale: action.scale };
		}
	}
}

export default function App() {
	const { t } = useLanguage();
	const [ui, dispatchUi] = useReducer(uiReducer, undefined, () => ({
		view: (localStorage.getItem("currentView") as View) || "dashboard",
		sidebarOpen: false,
		sidebarCollapsed: localStorage.getItem("sidebarCollapsed") === "true",
		selectedDate: formatLocalDate(),
	}));

	const { view, sidebarOpen, sidebarCollapsed, selectedDate } = ui;
	const setView = (v: View) => dispatchUi({ type: "setView", view: v });
	const setSidebarOpen = (open: boolean) =>
		dispatchUi({ type: "setSidebarOpen", open });
	const setSidebarCollapsed = (collapsed: boolean) =>
		dispatchUi({ type: "setSidebarCollapsed", collapsed });
	const setSelectedDate = (date: string) =>
		dispatchUi({ type: "setSelectedDate", date });

	const [timerPrefs, dispatchTimerPrefs] = useReducer(
		timerPrefsReducer,
		undefined,
		() => ({
			corner:
				(localStorage.getItem("timerCorner") as TimerCorner) || "bottom-right",
			scale: (() => {
				const s = localStorage.getItem("timerScale");
				return s ? parseFloat(s) : 1;
			})(),
		}),
	);

	const { corner: timerCorner, scale: timerScale } = timerPrefs;
	const handleTimerCornerChange = (corner: TimerCorner) =>
		dispatchTimerPrefs({ type: "setCorner", corner });
	const handleTimerScaleChange = (scale: number) =>
		dispatchTimerPrefs({ type: "setScale", scale });

	const [saveModal, dispatchSaveModal] = useReducer(saveModalReducer, {
		open: false,
		minutes: 0,
		openId: 0,
	});

	const subjects = useQuery(api.subjects.list);
	const _createLog = useMutation(api.dailyLogs.create);
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	const userSettings = useQuery((api as any).userSettings?.get);
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	const updateSettings = useMutation((api as any).userSettings?.update);

	const stopwatch = useStopwatch();
	const pomodoro = usePomodoro();

	const theme: "light" | "dark" = (() => {
		if (userSettings?.theme) return userSettings.theme as "light" | "dark";
		const saved =
			typeof window !== "undefined" ? localStorage.getItem("theme") : null;
		if (saved === "light" || saved === "dark") return saved;
		if (typeof window !== "undefined") {
			return window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
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
					<div className="loading-spinner">
						<div className="spinner" />
					</div>
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
						aria-label={t.sidebar.collapse}
						style={{ border: "none", padding: 0 }}
					/>
				)}
				<div
					className={`app-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
				>
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
						{view === "settings" && (
							<SettingsView
								theme={theme}
								setTheme={handleSetTheme}
								timerCorner={timerCorner}
								timerScale={timerScale}
								onTimerCornerChange={handleTimerCornerChange}
								onTimerScaleChange={handleTimerScaleChange}
							/>
						)}
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
						corner={timerCorner}
						scale={timerScale}
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
