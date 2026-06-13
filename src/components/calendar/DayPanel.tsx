import { useMutation } from "convex/react";
import { format } from "date-fns";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { useLanguage } from "../../hooks/useLanguage";
import { formatDuration } from "../../utils/dateUtils";
import { SubjectBadge } from "../ui/SubjectBadge";

type Subject = Doc<"subjects">;
type Task = Doc<"tasks">;
type Event = Doc<"events">;
type Log = Doc<"dailyLogs">;

type Props = {
	selectedDate: string;
	exams: Doc<"exams">[] | undefined;
	tasks: Task[] | undefined;
	events: Event[] | undefined;
	logs: Log[] | undefined;
	subjects: Subject[] | undefined;
	onOpenAddTask: () => void;
	onOpenAddEvent: () => void;
	onOpenAddLog: () => void;
	onEditTask: (task: Task) => void;
	onEditLog: (log: Log) => void;
};

function getSubject(
	subjects: Subject[] | undefined,
	id: string | undefined,
): Subject | undefined {
	if (!id) return undefined;
	return subjects?.find((s) => s._id === id);
}

export function DayPanel({
	selectedDate,
	exams,
	tasks,
	events,
	logs,
	subjects,
	onOpenAddTask,
	onOpenAddEvent,
	onOpenAddLog,
	onEditTask,
	onEditLog,
}: Props) {
	// biome-ignore lint/correctness/noUnusedVariables: Dynamic Convex API / third-party type
	const { t, language, dateLocale } = useLanguage();
	const toggleTask = useMutation(api.tasks.toggleComplete);
	const removeTask = useMutation(api.tasks.remove);
	const removeEvent = useMutation(api.events.remove);
	const removeLog = useMutation(api.dailyLogs.remove);
	const dayExams = exams?.filter((e) => e.date === selectedDate) ?? [];

	return (
		<div className="day-panel">
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexWrap: "wrap",
					gap: 12,
				}}
			>
				<h2>
					{format(
						new Date(`${selectedDate}T00:00:00`),
						t.common.dateFormatLong,
						{ locale: dateLocale },
					)}
				</h2>
				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					<button
						type="button"
						className="btn btn-secondary btn-sm"
						onClick={onOpenAddTask}
					>
						{t.calendar.addTaskBtn}
					</button>
					<button
						type="button"
						className="btn btn-secondary btn-sm"
						onClick={onOpenAddEvent}
					>
						{t.calendar.addEventBtn}
					</button>
					<button
						type="button"
						className="btn btn-secondary btn-sm"
						onClick={onOpenAddLog}
					>
						{t.calendar.addLogBtn}
					</button>
				</div>
			</div>

			{dayExams.length > 0 && (
				<div className="panel-section">
					<h4>🎯 {t.exams.title}</h4>
					{dayExams.map((exam) => {
						const subj = getSubject(subjects, exam.subjectId);
						return (
							<div
								key={exam._id}
								className="exam-card"
								style={{
									marginBottom: 8,
									borderLeftColor: subj?.color ?? "var(--accent-primary)",
								}}
							>
								<div className="exam-title">{exam.title}</div>
								<div className="exam-meta">
									{subj && (
										<SubjectBadge
											name={subj.name}
											color={subj.color}
											icon={subj.icon}
										/>
									)}
									<span className="coeff-badge">×{exam.coefficient}</span>
								</div>
							</div>
						);
					})}
				</div>
			)}

			<div className="panel-section">
				<h4>✅ {t.tasks.title}</h4>
				{!tasks || tasks.length === 0 ? (
					<p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
						{t.calendar.noTasks}
					</p>
				) : (
					tasks.map((task) => (
						<div
							key={task._id}
							className={`task-item ${task.completed ? "completed" : ""}`}
						>
							<button
								type="button"
								className={`task-checkbox ${task.completed ? "checked" : ""}`}
								onClick={() => void toggleTask({ id: task._id })}
							>
								{task.completed ? "✓" : ""}
							</button>
							<div className={`priority-dot ${task.priority}`} />
							<div style={{ flex: 1 }}>
								<div className="task-title">{task.title}</div>
								{task.description && (
									<div className="task-desc">{task.description}</div>
								)}
							</div>
							<div className="item-actions" style={{ display: "flex", gap: 4 }}>
								<button
									type="button"
									className="btn-icon"
									style={{ width: 28, height: 28 }}
									aria-label={`${t.common.edit} ${task.title}`}
									onClick={() => onEditTask(task)}
								>
									✏️
								</button>
								<button
									type="button"
									className="btn-icon"
									style={{ width: 28, height: 28 }}
									aria-label={`${t.common.delete} ${task.title}`}
									onClick={() => void removeTask({ id: task._id })}
								>
									🗑
								</button>
							</div>
						</div>
					))
				)}
			</div>

			<div className="panel-section">
				<h4>📅 {t.calendar.events}</h4>
				{!events || events.length === 0 ? (
					<p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
						{t.calendar.noEvents}
					</p>
				) : (
					events.map((ev) => (
						<div
							key={ev._id}
							className="event-card"
							style={{
								borderLeftColor: ev.color ?? "var(--accent-blue)",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<div>
								{ev.startTime && (
									<div className="event-time">
										{ev.startTime}
										{ev.endTime ? ` – ${ev.endTime}` : ""}
									</div>
								)}
								<div className="event-title">{ev.title}</div>
							</div>
							<div className="item-actions">
								<button
									type="button"
									className="btn-icon"
									style={{ width: 28, height: 28 }}
									aria-label={`${t.common.delete} ${ev.title}`}
									onClick={() => void removeEvent({ id: ev._id })}
								>
									🗑
								</button>
							</div>
						</div>
					))
				)}
			</div>

			<div className="panel-section">
				<h4>📝 {t.dailyLog.title}</h4>
				{!logs || logs.length === 0 ? (
					<p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
						{t.calendar.noLogs}
					</p>
				) : (
					logs.map((log) => {
						const subj = getSubject(subjects, log.subjectId);
						return (
							<div
								key={log._id}
								className="log-card"
								style={{ display: "flex", alignItems: "center", gap: 12 }}
							>
								{subj && (
									<SubjectBadge
										name={subj.name}
										color={subj.color}
										icon={subj.icon}
									/>
								)}
								<div style={{ flex: 1 }}>
									<div className="log-content">{log.content}</div>
									{log.duration != null && (
										<div className="log-meta">
											⏱️{" "}
											{formatDuration(log.duration, {
												formatUnderHourAsMins: true,
											})}
										</div>
									)}
								</div>
								<div
									className="item-actions"
									style={{ display: "flex", gap: 4 }}
								>
									<button
										type="button"
										className="btn-icon"
										style={{ width: 28, height: 28 }}
										aria-label={t.calendar.editLog}
										onClick={() => onEditLog(log)}
									>
										✏️
									</button>
									<button
										type="button"
										className="btn-icon"
										style={{ width: 28, height: 28 }}
										aria-label={t.calendar.confirmDeleteLog}
										onClick={() => void removeLog({ id: log._id })}
									>
										🗑
									</button>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
