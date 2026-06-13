import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { useLanguage } from "../../hooks/useLanguage";
import { Modal } from "../ui/Modal";

function SubjectOptions({
	subjects,
	name,
	defaultValue,
}: {
	subjects: Doc<"subjects">[] | undefined;
	name: string;
	defaultValue?: string;
}) {
	const { t } = useLanguage();
	if (!subjects || subjects.length === 0) return null;
	return (
		<div className="form-group">
			<label htmlFor={`${name}-subject`}>{t.tasks.subjectLabelOptional}</label>
			<select
				id={`${name}-subject`}
				name="subjectId"
				defaultValue={defaultValue ?? ""}
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
	);
}

type CreateTaskArgs = {
	date: string;
	title: string;
	description?: string;
	priority: "low" | "medium" | "high";
	subjectId?: Id<"subjects">;
	taskType: "daily";
};

export function AddTaskModal({
	date,
	subjects,
	onClose,
	onCreated,
}: {
	date: string;
	subjects: Doc<"subjects">[] | undefined;
	onClose: () => void;
	onCreated?: () => void;
}) {
	const { t } = useLanguage();
	const createTask = useMutation(api.tasks.create);
	return (
		<Modal title={t.tasks.addTask} onClose={onClose}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					const args: CreateTaskArgs = {
						date,
						title: fd.get("title") as string,
						description: (fd.get("description") as string) || undefined,
						priority:
							(fd.get("priority") as "low" | "medium" | "high") ?? "medium",
						subjectId: fd.get("subjectId")
							? (fd.get("subjectId") as Id<"subjects">)
							: undefined,
						taskType: "daily",
					};
					void createTask(args);
					onCreated?.();
					onClose();
				}}
			>
				<div className="form-group">
					<label htmlFor="cal-add-task-title">{t.common.title}</label>
					<input
						id="cal-add-task-title"
						name="title"
						required
						placeholder={t.tasks.taskTitlePlaceholder}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="cal-add-task-desc">{t.tasks.descriptionLabel}</label>
					<textarea
						id="cal-add-task-desc"
						name="description"
						placeholder={t.tasks.taskNotesPlaceholder}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="cal-add-task-priority">{t.tasks.priorityLabel}</label>
					<select
						id="cal-add-task-priority"
						name="priority"
						defaultValue="medium"
					>
						<option value="low">{t.tasks.priorityLow}</option>
						<option value="medium">{t.tasks.priorityMedium}</option>
						<option value="high">{t.tasks.priorityHigh}</option>
					</select>
				</div>
				<SubjectOptions subjects={subjects} name="cal-add-task" />
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

export function AddEventModal({
	date,
	onClose,
	onCreated,
}: {
	date: string;
	onClose: () => void;
	onCreated?: () => void;
}) {
	const { t } = useLanguage();
	const createEvent = useMutation(api.events.create);
	return (
		<Modal title={t.calendar.addEvent} onClose={onClose}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					void createEvent({
						date,
						title: fd.get("title") as string,
						startTime: (fd.get("startTime") as string) || undefined,
						endTime: (fd.get("endTime") as string) || undefined,
						description: (fd.get("description") as string) || undefined,
					});
					onCreated?.();
					onClose();
				}}
			>
				<div className="form-group">
					<label htmlFor="cal-add-event-title">{t.common.title}</label>
					<input
						id="cal-add-event-title"
						name="title"
						required
						placeholder={t.calendar.eventTitle}
					/>
				</div>
				<div
					style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
				>
					<div className="form-group">
						<label htmlFor="cal-add-event-start">
							{t.calendar.startTimeLabel}
						</label>
						<input id="cal-add-event-start" name="startTime" type="time" />
					</div>
					<div className="form-group">
						<label htmlFor="cal-add-event-end">{t.calendar.endTimeLabel}</label>
						<input id="cal-add-event-end" name="endTime" type="time" />
					</div>
				</div>
				<div className="form-group">
					<label htmlFor="cal-add-event-desc">{t.tasks.descriptionLabel}</label>
					<textarea
						id="cal-add-event-desc"
						name="description"
						placeholder={t.tasks.taskNotesPlaceholder}
					/>
				</div>
				<div className="modal-actions">
					<button type="button" className="btn btn-secondary" onClick={onClose}>
						{t.common.cancel}
					</button>
					<button type="submit" className="btn btn-primary">
						{t.calendar.addEvent}
					</button>
				</div>
			</form>
		</Modal>
	);
}

export function AddLogModal({
	date,
	subjects,
	onClose,
	onCreated,
}: {
	date: string;
	subjects: Doc<"subjects">[] | undefined;
	onClose: () => void;
	onCreated?: () => void;
}) {
	const { t } = useLanguage();
	const createLog = useMutation(api.dailyLogs.create);
	return (
		<Modal title={t.calendar.addLog} onClose={onClose}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					void createLog({
						date,
						content: fd.get("content") as string,
						duration: fd.get("duration")
							? Number(fd.get("duration"))
							: undefined,
						subjectId: fd.get("subjectId")
							? (fd.get("subjectId") as Id<"subjects">)
							: undefined,
					});
					onCreated?.();
					onClose();
				}}
			>
				<div className="form-group">
					<label htmlFor="cal-add-log-content">
						{t.dailyLog.whatDidYouStudy}
					</label>
					<textarea
						id="cal-add-log-content"
						name="content"
						required
						placeholder={t.dailyLog.summaryPlaceholder}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="cal-add-log-duration">
						{t.dailyLog.durationMinutes}
					</label>
					<input
						id="cal-add-log-duration"
						name="duration"
						type="number"
						min="1"
					/>
				</div>
				<SubjectOptions subjects={subjects} name="cal-add-log" />
				<div className="modal-actions">
					<button type="button" className="btn btn-secondary" onClick={onClose}>
						{t.common.cancel}
					</button>
					<button type="submit" className="btn btn-primary">
						{t.common.add}
					</button>
				</div>
			</form>
		</Modal>
	);
}

type UpdateTaskArgs = {
	id: Id<"tasks">;
	title: string;
	description?: string;
	priority: "low" | "medium" | "high";
	subjectId?: Id<"subjects">;
	date?: string;
};

export function EditTaskModal({
	task,
	subjects,
	onClose,
	onSaved,
}: {
	task: Doc<"tasks">;
	subjects: Doc<"subjects">[] | undefined;
	onClose: () => void;
	onSaved?: () => void;
}) {
	const { t } = useLanguage();
	const updateTask = useMutation(api.tasks.update);
	return (
		<Modal title={t.tasks.editTask} onClose={onClose}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					const args: UpdateTaskArgs = {
						id: task._id,
						title: fd.get("title") as string,
						description: (fd.get("description") as string) || undefined,
						priority:
							(fd.get("priority") as "low" | "medium" | "high") ?? "medium",
						subjectId: fd.get("subjectId")
							? (fd.get("subjectId") as Id<"subjects">)
							: undefined,
						date: fd.get("date") as string,
					};
					void updateTask(args);
					onSaved?.();
					onClose();
				}}
			>
				<div className="form-group">
					<label htmlFor="cal-edit-task-title">{t.common.title}</label>
					<input
						id="cal-edit-task-title"
						name="title"
						defaultValue={task.title}
						required
						placeholder={t.tasks.taskTitlePlaceholder}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="cal-edit-task-desc">{t.tasks.descriptionLabel}</label>
					<textarea
						id="cal-edit-task-desc"
						name="description"
						defaultValue={task.description}
						placeholder={t.tasks.taskNotesPlaceholder}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="cal-edit-task-date">{t.common.date}</label>
					<input
						id="cal-edit-task-date"
						name="date"
						type="date"
						defaultValue={task.date}
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="cal-edit-task-priority">
						{t.tasks.priorityLabel}
					</label>
					<select
						id="cal-edit-task-priority"
						name="priority"
						defaultValue={task.priority}
					>
						<option value="low">{t.tasks.priorityLow}</option>
						<option value="medium">{t.tasks.priorityMedium}</option>
						<option value="high">{t.tasks.priorityHigh}</option>
					</select>
				</div>
				<SubjectOptions
					subjects={subjects}
					name="cal-edit-task"
					defaultValue={task.subjectId || ""}
				/>
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

export function EditLogModal({
	log,
	subjects,
	onClose,
	onSaved,
}: {
	log: Doc<"dailyLogs">;
	subjects: Doc<"subjects">[] | undefined;
	onClose: () => void;
	onSaved?: () => void;
}) {
	const { t } = useLanguage();
	const updateLog = useMutation(api.dailyLogs.update);
	return (
		<Modal title={t.calendar.editLog} onClose={onClose}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					void updateLog({
						id: log._id,
						content: fd.get("content") as string,
						duration: fd.get("duration")
							? Number(fd.get("duration"))
							: undefined,
						subjectId: fd.get("subjectId")
							? (fd.get("subjectId") as Id<"subjects">)
							: undefined,
					});
					onSaved?.();
					onClose();
				}}
			>
				<div className="form-group">
					<label htmlFor="cal-edit-log-content">
						{t.dailyLog.whatDidYouStudy}
					</label>
					<textarea
						id="cal-edit-log-content"
						name="content"
						defaultValue={log.content}
						required
						placeholder={t.dailyLog.summaryPlaceholder}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="cal-edit-log-duration">
						{t.dailyLog.durationMinutes}
					</label>
					<input
						id="cal-edit-log-duration"
						name="duration"
						type="number"
						min="1"
						defaultValue={log.duration}
					/>
				</div>
				<SubjectOptions
					subjects={subjects}
					name="cal-edit-log"
					defaultValue={log.subjectId || ""}
				/>
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
