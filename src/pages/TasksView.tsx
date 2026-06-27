import { useMutation, useQuery } from "convex/react";
import { addDays, format, subDays } from "date-fns";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { AddTaskModal } from "../components/tasks/AddTaskModal";
import { EditTaskModal } from "../components/tasks/EditTaskModal";
import { TaskList } from "../components/tasks/TaskList";
import { TaskTabs } from "../components/tasks/TaskTabs";
import { useLanguage } from "../hooks/useLanguage";
import { formatLocalDate } from "../utils/dateUtils";

type TaskTab = "daily" | "general" | "done";

export function TasksView({
	selectedDate,
	setSelectedDate,
}: {
	selectedDate: string;
	setSelectedDate: (d: string) => void;
}) {
	// biome-ignore lint/correctness/noUnusedVariables: Dynamic Convex API / third-party type
	const { t, language, dateLocale } = useLanguage();
	const dailyTasks = useQuery(api.tasks.getByDate, { date: selectedDate });
	const generalTasks = useQuery(api.tasks.listGeneral);
	const subjects = useQuery(api.subjects.list, {});
	const updateTask = useMutation(api.tasks.update);
	const [showAdd, setShowAdd] = useState(false);
	const [editingTask, setEditingTask] = useState<Doc<"tasks"> | null>(null);
	const [activeTab, setActiveTab] = useState<TaskTab>("daily");

	const navDate = (dir: number) => {
		const d =
			dir > 0
				? addDays(new Date(selectedDate), 1)
				: subDays(new Date(selectedDate), 1);
		setSelectedDate(format(d, "yyyy-MM-dd"));
	};

	const _dailyIncomplete = dailyTasks?.filter((t) => !t.completed) ?? [];
	const dailyCompleted = dailyTasks?.filter((t) => t.completed) ?? [];
	const generalIncomplete = generalTasks?.filter((t) => !t.completed) ?? [];
	const generalCompleted = generalTasks?.filter((t) => t.completed) ?? [];
	const totalCompleted = dailyCompleted.length + generalCompleted.length;

	const completed =
		activeTab === "daily"
			? dailyCompleted.length
			: activeTab === "general"
				? generalCompleted.length
				: totalCompleted;

	const total =
		activeTab === "daily"
			? (dailyTasks?.length ?? 0)
			: activeTab === "general"
				? (generalTasks?.length ?? 0)
				: (dailyTasks?.length ?? 0) + (generalTasks?.length ?? 0);

	return (
		<div>
			<div className="page-header">
				<div>
					<h1>{t.tasks.title}</h1>
					<div className="date-display">
						{t.tasks.completedCount(completed, total)}
					</div>
				</div>
				<button
					type="button"
					className="btn btn-primary"
					onClick={() => setShowAdd(true)}
					id="add-task-btn"
				>
					+ {t.tasks.addTask}
				</button>
			</div>

			<TaskTabs
				activeTab={activeTab}
				onChange={setActiveTab}
				generalIncompleteCount={generalIncomplete.length}
				doneCount={totalCompleted}
			/>

			{(activeTab === "daily" || activeTab === "done") && (
				<div className="tasks-date-nav">
					<button
						type="button"
						className="btn-icon"
						aria-label={t.tasks.prevDay}
						onClick={() => navDate(-1)}
					>
						◀
					</button>
					<h2 style={{ fontSize: "1.1rem" }}>
						{format(
							new Date(`${selectedDate}T00:00:00`),
							t.common.dateFormatLong,
							{ locale: dateLocale },
						)}
					</h2>
					<button
						type="button"
						className="btn-icon"
						aria-label={t.tasks.nextDay}
						onClick={() => navDate(1)}
					>
						▶
					</button>
					<button
						type="button"
						className="btn btn-secondary btn-sm"
						onClick={() => setSelectedDate(formatLocalDate())}
					>
						{t.common.today}
					</button>
				</div>
			)}

			{activeTab === "general" && (
				<div style={{ marginBottom: 20 }}>
					<p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
						{t.tasks.generalTasksDesc}
					</p>
				</div>
			)}

			{activeTab === "done" && (
				<div style={{ marginBottom: 20 }}>
					<p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
						{t.tasks.completedTasksDesc}
					</p>
				</div>
			)}

			{total > 0 && (
				<div
					style={{
						height: 4,
						borderRadius: 2,
						background: "var(--bg-elevated)",
						marginBottom: 20,
						overflow: "hidden",
					}}
				>
					<div
						style={{
							height: "100%",
							width: "100%",
							transform: `scaleX(${total > 0 ? completed / total : 0})`,
							transformOrigin: "left",
							background:
								activeTab === "general" || activeTab === "done"
									? "var(--success)"
									: "var(--accent-primary)",
							borderRadius: 2,
							transition: "transform 300ms ease",
						}}
					/>
				</div>
			)}

			<div className="card">
				<TaskList
					activeTab={activeTab}
					dailyTasks={dailyTasks}
					generalTasks={generalTasks}
					dailyCompleted={dailyCompleted}
					generalCompleted={generalCompleted}
					subjects={subjects}
					onEdit={setEditingTask}
				/>
			</div>

			{showAdd && (
				<AddTaskModal
					selectedDate={selectedDate}
					defaultType={activeTab === "done" ? "daily" : activeTab}
					subjects={subjects}
					onClose={() => setShowAdd(false)}
					onCreated={() => setShowAdd(false)}
				/>
			)}

			{editingTask && (
				<EditTaskModal
					task={editingTask}
					subjects={subjects}
					selectedDate={selectedDate}
					onSave={(args: {
						id: Id<"tasks">;
						title: string;
						description?: string;
						priority: "low" | "medium" | "high";
						subjectId?: Id<"subjects">;
						date?: string;
						taskType: "daily" | "general";
					}) => {
						void updateTask(args);
						setEditingTask(null);
					}}
					onClose={() => setEditingTask(null)}
				/>
			)}
		</div>
	);
}
