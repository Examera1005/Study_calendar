import { useState } from "react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
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

export function EditTaskModal({ task, subjects, selectedDate, onSave, onClose }: Props) {
  const [editType, setEditType] = useState<TaskType>((task.taskType as TaskType) || "daily");

  return (
    <Modal title="Edit Task" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onSave({
            id: task._id,
            title: fd.get("title") as string,
            description: (fd.get("description") as string) || undefined,
            priority: (fd.get("priority") as "low" | "medium" | "high") ?? "medium",
            subjectId: fd.get("subjectId") ? (fd.get("subjectId") as Id<"subjects">) : undefined,
            date: editType === "general" ? undefined : (fd.get("date") as string),
            taskType: editType,
          });
        }}
      >
        <div className="form-group">
          <span className="form-label">Type</span>
          <div className="task-tabs" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className={`task-tab ${editType === "daily" ? "active" : ""}`}
              onClick={() => setEditType("daily")}
            >
              📅 Daily
            </button>
            <button
              type="button"
              className={`task-tab ${editType === "general" ? "active" : ""}`}
              onClick={() => setEditType("general")}
            >
              📋 General
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="edit-task-title">Title</label>
          <input id="edit-task-title" name="title" defaultValue={task.title} required />
        </div>
        <div className="form-group">
          <label htmlFor="edit-task-description">Description</label>
          <textarea id="edit-task-description" name="description" defaultValue={task.description} />
        </div>
        {editType === "daily" && (
          <div className="form-group">
            <label htmlFor="edit-task-date">Date</label>
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
          <label htmlFor="edit-task-priority">Priority</label>
          <select id="edit-task-priority" name="priority" defaultValue={task.priority}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        {subjects && subjects.length > 0 && (
          <div className="form-group">
            <label htmlFor="edit-task-subject">Subject</label>
            <select
              id="edit-task-subject"
              name="subjectId"
              defaultValue={task.subjectId || ""}
            >
              <option value="">None</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.icon ? `${s.icon} ` : ""}{s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
