import { useState } from "react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { useLanguage } from "../../hooks/useLanguage";
import { Modal } from "../ui/Modal";

type TaskType = "daily" | "general";

type SaveArgs = {
	id: Id<"tasks">;
	title: string;
	description?: string;
	priority: "low" | "medium" | "high";
	subjectId?: Id<"subjects">;
	date?: string;
	taskType: TaskType;
};

type Props = {
	task: Doc<"tasks">;
	subjects: Doc<"subjects">[] | undefined;
	selectedDate: string;
	onSave: (args: SaveArgs) => void;
	onClose: () => void;
};

export function EditTaskModal({
	task,
	subjects,
	selectedDate,
	onSave,
	onClose,
}: Props) {
	const { t } = useLanguage();
	const [editType, setEditType] = useState<TaskType>(
		(task.taskType as TaskType) || "daily",
	);

	return (
		<Modal title={t.tasks.editTask} onClose={onClose}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					onSave({
						id: task._id,
						title: fd.get("title") as string,
						description: (fd.get("description") as string) || undefined,
						priority:
							(fd.get("priority") as "low" | "medium" | "high") ?? "medium",
						subjectId: fd.get("subjectId")
							? (fd.get("subjectId") as Id<"subjects">)
							: undefined,
						date:
							editType === "general" ? undefined : (fd.get("date") as string),
						taskType: editType,
					});
				}}
			>
				<div className="form-group">
					<span className="form-label">{t.tasks.typeLabel}</span>
					<div className="task-tabs" style={{ marginBottom: 0 }}>
						<button
							type="button"
							className={`task-tab ${editType === "daily" ? "active" : ""}`}
							onClick={() => setEditType("daily")}
						>
							📅 {t.tasks.dailyTab}
						</button>
						<button
							type="button"
							className={`task-tab ${editType === "general" ? "active" : ""}`}
							onClick={() => setEditType("general")}
						>
							📋 {t.tasks.generalTab}
						</button>
					</div>
				</div>
				<div className="form-group">
					<label htmlFor="edit-task-title">{t.common.title}</label>
					<input
						id="edit-task-title"
						name="title"
						defaultValue={task.title}
						required
						placeholder={t.tasks.taskTitlePlaceholder}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="edit-task-description">
						{t.tasks.descriptionLabel}
					</label>
					<textarea
						id="edit-task-description"
						name="description"
						defaultValue={task.description}
						placeholder={t.tasks.taskNotesPlaceholder}
					/>
				</div>
				{editType === "daily" && (
					<div className="form-group">
						<label htmlFor="edit-task-date">{t.common.date}</label>
						<input
							id="edit-task-date"
							name="date"
							type="date"
							defaultValue={task.date || selectedDate}
							required
						/>
					</div>
				)}
				<div className="form-group">
					<label htmlFor="edit-task-priority">{t.tasks.priorityLabel}</label>
					<select
						id="edit-task-priority"
						name="priority"
						defaultValue={task.priority}
					>
						<option value="low">{t.tasks.priorityLow}</option>
						<option value="medium">{t.tasks.priorityMedium}</option>
						<option value="high">{t.tasks.priorityHigh}</option>
					</select>
				</div>
				{subjects && subjects.length > 0 && (
					<div className="form-group">
						<label htmlFor="edit-task-subject">{t.tasks.subjectLabel}</label>
						<select
							id="edit-task-subject"
							name="subjectId"
							defaultValue={task.subjectId || ""}
						>
							<option value="">{t.common.none}</option>
							{subjects.map((s) => (
								<option key={s._id} value={s._id}>
									{s.icon ? `${s.icon} ` : ""}
									{s.name}
								</option>
							))}
						</select>
					</div>
				)}
				<div className="modal-actions">
					<button type="button" className="btn btn-secondary" onClick={onClose}>
						{t.common.cancel}
					</button>
					<button type="submit" className="btn btn-primary">
						{t.common.saveChanges}
					</button>
				</div>
			</form>
		</Modal>
	);
}
