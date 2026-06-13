import { format } from "date-fns";
import type { View } from "../../App";
import { useLanguage } from "../../hooks/useLanguage";
import { formatDuration } from "../../utils/dateUtils";
import { SubjectBadge } from "../ui/SubjectBadge";

// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
const daysUntil = (dateStr: string, t: any) => {
	const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
	if (d < 0) return t.exams.passed;
	if (d === 0) return t.exams.today;
	if (d === 1) return t.exams.tomorrow;
	return t.exams.daysCount(d);
};

const countdownClass = (dateStr: string) => {
	const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
	if (d <= 2) return "urgent";
	if (d <= 7) return "soon";
	return "comfortable";
};

interface DashboardCardGridProps {
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	upcomingExams: any[] | undefined;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	todayTasks: any[] | undefined;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	generalTasks: any[] | undefined;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	todayEvents: any[] | undefined;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	todayLogs: any[] | undefined;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	subjectBreakdown: any[];
	activeDate: string;
	today: string;
	setView: (v: View) => void;
	setSelectedDate: (d: string) => void;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	getSubject: (id: string) => any;
	generalIncomplete: number;
}

export function DashboardCardGrid({
	upcomingExams,
	todayTasks,
	generalTasks,
	todayEvents,
	todayLogs,
	subjectBreakdown,
	activeDate,
	today,
	setView,
	setSelectedDate,
	getSubject,
	generalIncomplete,
}: DashboardCardGridProps) {
	// biome-ignore lint/correctness/noUnusedVariables: Dynamic Convex API / third-party type
	const { t, language, dateLocale } = useLanguage();

	return (
		<div className="card-grid">
			{/* Upcoming Exams */}
			<div className="card">
				<div className="card-header">
					<h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
						{/** biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{
								width: "16px",
								height: "16px",
								color: "var(--accent-primary)",
							}}
						>
							<circle cx="12" cy="12" r="10" />
							<circle cx="12" cy="12" r="6" />
							<circle cx="12" cy="12" r="2" />
						</svg>
						{t.dashboard.upcomingExams}
					</h3>
					<button
						type="button"
						className="btn btn-ghost btn-sm"
						onClick={() => setView("exams")}
					>
						{t.analytics.viewAllBtn}
					</button>
				</div>
				{!upcomingExams || upcomingExams.length === 0 ? (
					<div className="empty-state">
						<div className="empty-icon">🎉</div>
						<p>{t.dashboard.noExams}</p>
					</div>
				) : (
					upcomingExams.map((exam) => {
						const subj = getSubject(exam.subjectId);
						return (
							<div
								key={exam._id}
								className="exam-card"
								style={{ borderLeftColor: subj?.color ?? "#3b82f6" }}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-start",
									}}
								>
									<div>
										<div className="exam-title">{exam.title}</div>
										<div className="exam-meta">
											{subj && (
												<SubjectBadge
													name={subj.name}
													color={subj.color}
													icon={subj.icon}
												/>
											)}
											<span>
												{format(new Date(exam.date), "MMM d", {
													locale: dateLocale,
												})}
											</span>
											<span className="coeff-badge">×{exam.coefficient}</span>
										</div>
									</div>
									<span className={`countdown ${countdownClass(exam.date)}`}>
										{daysUntil(exam.date, t)}
									</span>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Today's Tasks */}
			<div className="card">
				<div className="card-header">
					<h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
						{/** biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{ width: "16px", height: "16px", color: "var(--success)" }}
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
						{activeDate === today
							? t.dashboard.todaysTasks
							: t.dashboard.tasksOfDay}
					</h3>
					<button
						type="button"
						className="btn btn-ghost btn-sm"
						onClick={() => {
							setSelectedDate(activeDate);
							setView("tasks");
						}}
					>
						{t.analytics.viewAllBtn}
					</button>
				</div>
				{!todayTasks || todayTasks.length === 0 ? (
					<div className="empty-state">
						<div className="empty-icon">📋</div>
						<p>
							{activeDate === today
								? t.dashboard.noTasksToday
								: t.tasks.noTasksForDay}
						</p>
					</div>
				) : (
					todayTasks.slice(0, 5).map((task) => (
						<div
							key={task._id}
							className={`task-item ${task.completed ? "completed" : ""}`}
						>
							<div className={`priority-dot ${task.priority}`} />
							<div>
								<div className="task-title">{task.title}</div>
							</div>
						</div>
					))
				)}
			</div>

			{/* General Tasks */}
			<div className="card">
				<div className="card-header">
					<h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
						{/** biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{
								width: "16px",
								height: "16px",
								color: "var(--text-secondary)",
							}}
						>
							<rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
							<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
						</svg>
						{t.dashboard.generalTasks}
					</h3>
					<button
						type="button"
						className="btn btn-ghost btn-sm"
						onClick={() => setView("tasks")}
					>
						{t.analytics.viewAllBtn}
					</button>
				</div>
				{!generalTasks || generalTasks.length === 0 ? (
					<div className="empty-state">
						<div className="empty-icon">📋</div>
						<p>{t.dashboard.noGeneralTasks}</p>
					</div>
				) : (
					generalTasks
						.filter((t) => !t.completed)
						.slice(0, 5)
						.map((task) => (
							<div key={task._id} className="task-item">
								<div className={`priority-dot ${task.priority}`} />
								<div>
									<div className="task-title">{task.title}</div>
								</div>
							</div>
						))
				)}
				{generalIncomplete > 0 && (
					<div
						style={{
							fontSize: "0.78rem",
							color: "var(--text-muted)",
							marginTop: 8,
						}}
					>
						{generalIncomplete} {t.common.remaining}
					</div>
				)}
			</div>

			{/* Today's Events */}
			<div className="card">
				<div className="card-header">
					<h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
						{/** biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{
								width: "16px",
								height: "16px",
								color: "var(--accent-primary)",
							}}
						>
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
							<line x1="16" y1="2" x2="16" y2="6" />
							<line x1="8" y1="2" x2="8" y2="6" />
							<line x1="3" y1="10" x2="21" y2="10" />
						</svg>
						{activeDate === today
							? t.dashboard.todaysEvents
							: t.dashboard.eventsForSelectedDay}
					</h3>
				</div>
				{!todayEvents || todayEvents.length === 0 ? (
					<div className="empty-state">
						<div className="empty-icon">🗓️</div>
						<p>
							{activeDate === today
								? t.dashboard.noEventsScheduled
								: t.calendar.noEventsForDay}
						</p>
					</div>
				) : (
					todayEvents.map((ev) => (
						<div
							key={ev._id}
							className="event-card"
							style={{ borderLeftColor: ev.color ?? "var(--accent-primary)" }}
						>
							{ev.startTime && (
								<div className="event-time">
									{ev.startTime}
									{ev.endTime ? ` – ${ev.endTime}` : ""}
								</div>
							)}
							<div className="event-title">{ev.title}</div>
						</div>
					))
				)}
			</div>

			{/* Today's Study Log */}
			<div className="card">
				<div className="card-header">
					<h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
						{/** biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{
								width: "16px",
								height: "16px",
								color: "var(--text-secondary)",
							}}
						>
							<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
						</svg>
						{activeDate === today
							? t.sidebar.dailyLog
							: t.dashboard.studyLogForSelectedDay}
					</h3>
					<button
						type="button"
						className="btn btn-ghost btn-sm"
						onClick={() => {
							setSelectedDate(activeDate);
							setView("log");
						}}
					>
						{t.dailyLog.addLog}
					</button>
				</div>
				{!todayLogs || todayLogs.length === 0 ? (
					<div className="empty-state">
						<div className="empty-icon">✏️</div>
						<p>
							{activeDate === today
								? t.dashboard.noStudyEntriesYetToday
								: t.dailyLog.noLogsYet}
						</p>
					</div>
				) : (
					todayLogs.slice(0, 4).map((log) => {
						const subj = log.subjectId ? getSubject(log.subjectId) : null;
						return (
							<div key={log._id} className="log-entry">
								<div className="log-content">{log.content}</div>
								<div className="log-meta">
									{subj && (
										<SubjectBadge
											name={subj.name}
											color={subj.color}
											icon={subj.icon}
										/>
									)}
									{log.duration && (
										<span className="duration-badge">
											⏱ {log.duration}
											{t.common.minutesUnit}
										</span>
									)}
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Study Time by Subject */}
			<div className="card">
				<div className="card-header">
					<h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
						{/** biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{
								width: "16px",
								height: "16px",
								color: "var(--accent-primary)",
							}}
						>
							<line x1="18" y1="20" x2="18" y2="10" />
							<line x1="12" y1="20" x2="12" y2="4" />
							<line x1="6" y1="20" x2="6" y2="14" />
						</svg>
						{t.analytics.subjectDistributionTitle}
					</h3>
				</div>
				{subjectBreakdown.length === 0 ? (
					<div className="empty-state">
						<div className="empty-icon">📊</div>
						<p>{t.analytics.noStudyData}</p>
					</div>
				) : (
					<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
						{subjectBreakdown.map((item) => (
							<div key={item.name} className="subject-time-row">
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: 6,
										fontSize: "0.82rem",
									}}
								>
									<div
										style={{ display: "flex", alignItems: "center", gap: 6 }}
									>
										<span>{item.icon}</span>
										<span
											style={{ fontWeight: 600, color: "var(--text-primary)" }}
										>
											{item.name}
										</span>
									</div>
									<span
										style={{ color: "var(--text-secondary)", fontWeight: 500 }}
									>
										{formatDuration(item.minutes, {
											formatUnderHourAsMins: true,
										})}
									</span>
								</div>
								<div
									style={{
										height: 6,
										background: "var(--bg-secondary)",
										borderRadius: 3,
										overflow: "hidden",
										display: "flex",
									}}
								>
									<div
										style={{
											height: "100%",
											width: `${item.percentage}%`,
											background: item.color,
											borderRadius: 3,
										}}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
