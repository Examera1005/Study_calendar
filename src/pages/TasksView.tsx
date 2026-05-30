import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format, addDays, subDays } from "date-fns";
import { useState } from "react";
import { Modal } from "../components/ui/Modal";
import { SubjectBadge } from "../components/ui/SubjectBadge";
import type { Id, Doc } from "../../convex/_generated/dataModel";

type TaskTab = "daily" | "general";

/* ── Edit Modal (separate component so we can use useState for editType) ── */
function EditTaskModal({
  task,
  subjects,
  selectedDate,
  onSave,
  onClose,
}: {
  task: Doc<"tasks">;
  subjects: Doc<"subjects">[] | undefined;
  selectedDate: string;
  onSave: (args: {
    id: Id<"tasks">;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    subjectId?: Id<"subjects">;
    date?: string;
    taskType: "daily" | "general";
  }) => void;
  onClose: () => void;
}) {
  const [editType, setEditType] = useState<TaskTab>(
    (task.taskType as TaskTab) || "daily",
  );

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
            priority:
              (fd.get("priority") as "low" | "medium" | "high") ?? "medium",
            subjectId: fd.get("subjectId")
              ? (fd.get("subjectId") as Id<"subjects">)
              : undefined,
            date:
              editType === "general"
                ? undefined
                : (fd.get("date") as string),
            taskType: editType,
          });
        }}
      >
        <div className="form-group">
          <label>Type</label>
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
          <label>Title</label>
          <input name="title" defaultValue={task.title} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" defaultValue={task.description} />
        </div>
        {editType === "daily" && (
          <div className="form-group">
            <label>Date</label>
            <input
              name="date"
              type="date"
              defaultValue={task.date || selectedDate}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label>Priority</label>
          <select name="priority" defaultValue={task.priority}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        {subjects && subjects.length > 0 && (
          <div className="form-group">
            <label>Subject</label>
            <select
              name="subjectId"
              defaultValue={task.subjectId || ""}
            >
              <option value="">None</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
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

/* ── Main Tasks View ── */
export function TasksView({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
}) {
  const dailyTasks = useQuery(api.tasks.getByDate, { date: selectedDate });
  const generalTasks = useQuery(api.tasks.listGeneral);
  const subjects = useQuery(api.subjects.list);
  const toggleTask = useMutation(api.tasks.toggleComplete);
  const createTask = useMutation(api.tasks.create);
  const removeTask = useMutation(api.tasks.remove);
  const updateTask = useMutation(api.tasks.update);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<Doc<"tasks"> | null>(null);
  const [activeTab, setActiveTab] = useState<TaskTab>("daily");

  const getSubject = (id: string) => subjects?.find((s) => s._id === id);

  const navDate = (dir: number) => {
    const d =
      dir > 0
        ? addDays(new Date(selectedDate), 1)
        : subDays(new Date(selectedDate), 1);
    setSelectedDate(format(d, "yyyy-MM-dd"));
  };

  const tasks = activeTab === "daily" ? dailyTasks : generalTasks;
  const completed = tasks?.filter((t) => t.completed).length ?? 0;
  const total = tasks?.length ?? 0;

  const generalIncomplete =
    generalTasks?.filter((t) => !t.completed).length ?? 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <div className="date-display">
            {completed}/{total} completed
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAdd(true)}
          id="add-task-btn"
        >
          + Add Task
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="task-tabs" style={{ marginBottom: 20 }}>
        <button
          className={`task-tab ${activeTab === "daily" ? "active" : ""}`}
          onClick={() => setActiveTab("daily")}
          id="task-tab-daily"
        >
          <span className="task-tab-icon">📅</span>
          Daily
        </button>
        <button
          className={`task-tab ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
          id="task-tab-general"
        >
          <span className="task-tab-icon">📋</span>
          General
          {generalIncomplete > 0 && (
            <span className="task-tab-badge">{generalIncomplete}</span>
          )}
        </button>
      </div>

      {/* Date navigation — only for daily tab */}
      {activeTab === "daily" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <button className="btn-icon" onClick={() => navDate(-1)}>
            ◀
          </button>
          <h2 style={{ fontSize: "1.1rem" }}>
            {format(
              new Date(selectedDate + "T00:00:00"),
              "EEEE, MMMM d, yyyy",
            )}
          </h2>
          <button className="btn-icon" onClick={() => navDate(1)}>
            ▶
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              setSelectedDate(new Date().toISOString().split("T")[0])
            }
          >
            Today
          </button>
        </div>
      )}

      {/* General tasks header */}
      {activeTab === "general" && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            These tasks aren't tied to any specific day — your ongoing to-do
            list.
          </p>
        </div>
      )}

      {/* Progress bar */}
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
              width: `${total > 0 ? (completed / total) * 100 : 0}%`,
              background:
                activeTab === "general"
                  ? "var(--success)"
                  : "var(--accent-primary)",
              borderRadius: 2,
              transition: "width 300ms ease",
            }}
          />
        </div>
      )}

      <div className="card">
        {!tasks || tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {activeTab === "daily" ? "✅" : "📋"}
            </div>
            <p>
              {activeTab === "daily"
                ? "No tasks for this day"
                : "No general tasks yet"}
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const subj = task.subjectId
              ? getSubject(task.subjectId)
              : null;
            return (
              <div
                key={task._id}
                className={`task-item ${task.completed ? "completed" : ""}`}
              >
                <button
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    {subj && (
                      <SubjectBadge
                        name={subj.name}
                        color={subj.color}
                        icon={subj.icon}
                        style={{ display: "inline-flex" }}
                      />
                    )}
                  </div>
                </div>
                <div
                  className="item-actions"
                  style={{ display: "flex", gap: 4 }}
                >
                  <button
                    className="btn-icon"
                    style={{ width: 28, height: 28 }}
                    onClick={() => setEditingTask(task)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon"
                    style={{ width: 28, height: 28 }}
                    onClick={() => void removeTask({ id: task._id })}
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAdd && (
        <Modal
          title={`Add ${activeTab === "general" ? "General" : "Daily"} Task`}
          onClose={() => setShowAdd(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const taskType =
                (fd.get("taskType") as "daily" | "general") || activeTab;
              void createTask({
                date: taskType === "general" ? undefined : selectedDate,
                title: fd.get("title") as string,
                description:
                  (fd.get("description") as string) || undefined,
                priority:
                  (fd.get("priority") as "low" | "medium" | "high") ??
                  "medium",
                subjectId: fd.get("subjectId")
                  ? (fd.get("subjectId") as Id<"subjects">)
                  : undefined,
                taskType,
              });
              setShowAdd(false);
            }}
          >
            <div className="form-group">
              <label>Type</label>
              <div className="task-tabs" style={{ marginBottom: 0 }}>
                <button
                  type="button"
                  className={`task-tab ${activeTab === "daily" ? "active" : ""}`}
                  onClick={() => setActiveTab("daily")}
                >
                  📅 Daily
                </button>
                <button
                  type="button"
                  className={`task-tab ${activeTab === "general" ? "active" : ""}`}
                  onClick={() => setActiveTab("general")}
                >
                  📋 General
                </button>
              </div>
              <input type="hidden" name="taskType" value={activeTab} />
            </div>
            <div className="form-group">
              <label>Title</label>
              <input name="title" required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" defaultValue="medium">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            {subjects && subjects.length > 0 && (
              <div className="form-group">
                <label>Subject (optional)</label>
                <select name="subjectId" defaultValue="">
                  <option value="">None</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Task
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          subjects={subjects ?? undefined}
          selectedDate={selectedDate}
          onSave={(args) => {
            void updateTask(args);
            setEditingTask(null);
          }}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
