import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { useLanguage } from "../../hooks/useLanguage";
import { Modal } from "../ui/Modal";

type TaskType = "daily" | "general";

type Props = {
	selectedDate: string;
	defaultType: TaskType;
	subjects: Doc<"subjects">[] | undefined;
	onClose: () => void;
	onCreated?: () => void;
};

export function AddTaskModal({
	selectedDate,
	defaultType,
	subjects,
	onClose,
	onCreated,
}: Props) {
	const { t } = useLanguage();
	const [taskType, setTaskType] = useState<TaskType>(defaultType);
	const createTask = useMutation(api.tasks.create);

	return (
		<Modal title={t.tasks.addTask} onClose={onClose}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					const finalType = (fd.get("taskType") as TaskType) || taskType;
					void createTask({
						date: finalType === "general" ? undefined : selectedDate,
						title: fd.get("title") as string,
						description: (fd.get("description") as string) || undefined,
						priority:
							(fd.get("priority") as "low" | "medium" | "high") ?? "medium",
						subjectId: fd.get("subjectId")
							? (fd.get("subjectId") as Id<"subjects">)
							: undefined,
						taskType: finalType,
					});
					onCreated?.();
					onClose();
				}}
			>
				<div className="form-group">
					<span className="form-label">{t.tasks.typeLabel}</span>
					<div className="task-tabs" style={{ marginBottom: 0 }}>
						<button
							type="button"
							className={`task-tab ${taskType === "daily" ? "active" : ""}`}
							onClick={() => setTaskType("daily")}
						>
							📅 {t.tasks.dailyTab}
						</button>
						<button
							type="button"
							className={`task-tab ${taskType === "general" ? "active" : ""}`}
							onClick={() => setTaskType("general")}
						>
							📋 {t.tasks.generalTab}
						</button>
					</div>
					<input type="hidden" name="taskType" value={taskType} />
				</div>
				<div className="form-group">
					<label htmlFor="add-task-title">{t.common.title}</label>
					<input
						id="add-task-title"
						name="title"
						required
						placeholder={t.tasks.taskTitlePlaceholder}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="add-task-description">
						{t.tasks.descriptionLabel}
					</label>
					<textarea
						id="add-task-description"
						name="description"
						placeholder={t.tasks.taskNotesPlaceholder}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="add-task-priority">{t.tasks.priorityLabel}</label>
					<select id="add-task-priority" name="priority" defaultValue="medium">
						<option value="low">{t.tasks.priorityLow}</option>
						<option value="medium">{t.tasks.priorityMedium}</option>
						<option value="high">{t.tasks.priorityHigh}</option>
					</select>
				</div>
				{subjects && subjects.length > 0 && (
					<div className="form-group">
						<label htmlFor="add-task-subject">
							{t.tasks.subjectLabelOptional}
						</label>
						<select id="add-task-subject" name="subjectId" defaultValue="">
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
						{t.tasks.addTask}
					</button>
				</div>
			</form>
		</Modal>
	);
}
