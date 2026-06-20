import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { View } from "../../App";
import { useLanguage } from "../../hooks/useLanguage";
import { clearPrivateKey } from "../../utils/crypto";

const CURRENT_YEAR = new Date().getFullYear();

const DashboardIcon = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ width: "16px", height: "16px" }}
	>
		<rect x="3" y="3" width="7" height="9" rx="1" />
		<rect x="14" y="3" width="7" height="5" rx="1" />
		<rect x="14" y="12" width="7" height="9" rx="1" />
		<rect x="3" y="16" width="7" height="5" rx="1" />
	</svg>
);

const CalendarIcon = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ width: "16px", height: "16px" }}
	>
		<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
		<line x1="16" y1="2" x2="16" y2="6" />
		<line x1="8" y1="2" x2="8" y2="6" />
		<line x1="3" y1="10" x2="21" y2="10" />
	</svg>
);

const StatsIcon = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ width: "16px", height: "16px" }}
	>
		<line x1="18" y1="20" x2="18" y2="10" />
		<line x1="12" y1="20" x2="12" y2="4" />
		<line x1="6" y1="20" x2="6" y2="14" />
	</svg>
);

const PomodoroIcon = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ width: "16px", height: "16px" }}
	>
		<circle cx="12" cy="12" r="10" />
		<polyline points="12 6 12 12 16 14" />
	</svg>
);

const ExamsIcon = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ width: "16px", height: "16px" }}
	>
		<circle cx="12" cy="12" r="10" />
		<circle cx="12" cy="12" r="6" />
		<circle cx="12" cy="12" r="2" />
	</svg>
);

const TasksIcon = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ width: "16px", height: "16px" }}
	>
		<polyline points="9 11 12 14 22 4" />
		<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
	</svg>
);

const LogIcon = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ width: "16px", height: "16px" }}
	>
		<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
		<polyline points="14 2 14 8 20 8" />
		<line x1="16" y1="13" x2="8" y2="13" />
		<line x1="16" y1="17" x2="8" y2="17" />
		<polyline points="10 9 9 9 8 9" />
	</svg>
);

const FriendsIcon = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ width: "16px", height: "16px" }}
	>
		<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
		<circle cx="9" cy="7" r="4" />
		<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
		<path d="M16 3.13a4 4 0 0 1 0 7.75" />
	</svg>
);

const SubjectsIcon = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ width: "16px", height: "16px" }}
	>
		<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
		<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" />
	</svg>
);

const SettingsIcon = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ width: "16px", height: "16px" }}
	>
		<circle cx="12" cy="12" r="3" />
		<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
	</svg>
);

const NAV_ITEMS: { id: View; icon: React.ComponentType; label: string }[] = [
	{ id: "dashboard", icon: DashboardIcon, label: "Dashboard" },
	{ id: "calendar", icon: CalendarIcon, label: "Calendar" },
	{ id: "analytics", icon: StatsIcon, label: "Stats & Badges" },
	{ id: "pomodoro", icon: PomodoroIcon, label: "Pomodoro" },
	{ id: "exams", icon: ExamsIcon, label: "Exams" },
	{ id: "tasks", icon: TasksIcon, label: "Tasks" },
	{ id: "log", icon: LogIcon, label: "Daily Log" },
	{ id: "friends", icon: FriendsIcon, label: "Friends" },
	{ id: "subjects", icon: SubjectsIcon, label: "Subjects" },
	{ id: "settings", icon: SettingsIcon, label: "Settings" },
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
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	const friendships = useQuery((api as any).friends.getFriendships);
	const unreadFriendsCount =
		// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
		friendships?.accepted?.filter((f: any) => f.unreadCount > 0).length || 0;
	const { t } = useLanguage();

	const getLabel = (id: View) => {
		if (id === "analytics") return t.sidebar.stats;
		if (id === "log") return t.sidebar.dailyLog;
		return t.sidebar[id as keyof typeof t.sidebar] as string;
	};

	return (
		<aside className={`sidebar ${sidebarOpen ? "open" : ""}`} id="sidebar">
			<div className="sidebar-brand" style={{ position: "relative" }}>
				<h2
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "8px",
					}}
				>
					<img
						src="/logo.png"
						alt="Logo"
						style={{ width: "28px", height: "28px", borderRadius: "6px" }}
					/>
					<span className="brand-text">Study Calendar</span>
				</h2>
				<span className="brand-subtitle">{t.sidebar.subtitle}</span>

				{/* Collapse Button (Desktop Only) */}
				<button
					type="button"
					className="sidebar-collapse-toggle"
					onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
					aria-label={sidebarCollapsed ? t.sidebar.expand : t.sidebar.collapse}
					title={sidebarCollapsed ? t.sidebar.expand : t.sidebar.collapse}
				>
					{/** biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type */}
					<svg
						viewBox="0 0 24 24"
						width="14"
						height="14"
						stroke="currentColor"
						strokeWidth="2.5"
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
						style={{
							transition: "transform var(--transition-normal)",
							transform: sidebarCollapsed ? "rotate(180deg)" : "none",
						}}
					>
						<polyline points="15 18 9 12 15 6"></polyline>
					</svg>
				</button>
			</div>

			<nav className="sidebar-nav">
				{NAV_ITEMS.map((item) => {
					const Icon = item.icon;
					return (
						<button
							key={item.id}
							type="button"
							className={`nav-item ${view === item.id ? "active" : ""}`}
							onClick={() => {
								setView(item.id);
								setSidebarOpen(false);
							}}
							id={`nav-${item.id}`}
							style={{ position: "relative" }}
						>
							<span
								className="nav-icon"
								style={{
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Icon />
							</span>
							<span className="nav-label">{getLabel(item.id)}</span>
							{item.id === "friends" && unreadFriendsCount > 0 && (
								<span className="sidebar-unread-badge">
									{unreadFriendsCount}
								</span>
							)}
						</button>
					);
				})}
			</nav>

			<div className="sidebar-footer">
				<button
					type="button"
					className="theme-toggle-btn"
					onClick={toggleTheme}
					id="theme-toggle"
					title="Toggle color theme"
					style={{ width: "100%" }}
				>
					{theme === "light" ? (
						<>
							{/** biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type */}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<circle cx="12" cy="12" r="4" />
								<path d="M12 2v2" />
								<path d="M12 20v2" />
								<path d="m4.93 4.93 1.41 1.41" />
								<path d="m17.66 17.66 1.41 1.41" />
								<path d="M2 12h2" />
								<path d="M20 12h2" />
								<path d="m6.34 17.66-1.41 1.41" />
								<path d="m19.07 4.93-1.41 1.41" />
							</svg>
							{!sidebarCollapsed && (
								<span className="footer-label">{t.sidebar.lightMode}</span>
							)}
						</>
					) : (
						<>
							{/** biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type */}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
							</svg>
							{!sidebarCollapsed && (
								<span className="footer-label">{t.sidebar.darkMode}</span>
							)}
						</>
					)}
				</button>

				<button
					type="button"
					className="btn btn-secondary btn-full btn-sm"
					onClick={() => {
						void clearPrivateKey().finally(() => signOut());
					}}
					id="sign-out-btn"
					title={t.sidebar.signOut}
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: 6,
						width: "100%",
						marginTop: 8,
					}}
				>
					<span
						className="sign-out-icon"
						style={{ display: "inline-flex", alignItems: "center" }}
					>
						{/** biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{ width: "16px", height: "16px" }}
						>
							<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
						</svg>
					</span>
					{!sidebarCollapsed && (
						<span className="footer-label">{t.sidebar.signOut}</span>
					)}
				</button>

				{!sidebarCollapsed && (
					<div
						className="sidebar-footer-info"
						style={{
							marginTop: 10,
							fontSize: "0.75rem",
							color: "var(--text-muted)",
							textAlign: "center",
							display: "flex",
							justifyContent: "center",
							gap: 6,
						}}
					>
						<span suppressHydrationWarning>
							© {CURRENT_YEAR} {t.sidebar.copyright}
						</span>
					</div>
				)}
			</div>
		</aside>
	);
}
