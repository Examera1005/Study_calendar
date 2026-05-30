import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format, addDays, subDays } from "date-fns";
import { useState } from "react";
import { Modal } from "../components/ui/Modal";
import { SubjectBadge } from "../components/ui/SubjectBadge";
import type { Id } from "../../convex/_generated/dataModel";

export function TasksView({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
}) {
  const tasks = useQuery(api.tasks.getByDate, { date: selectedDate });
  const subjects = useQuery(api.subjects.list);
  const toggleTask = useMutation(api.tasks.toggleComplete);
  const createTask = useMutation(api.tasks.create);
  const removeTask = useMutation(api.tasks.remove);
  const [showAdd, setShowAdd] = useState(false);

  const getSubject = (id: string) => subjects?.find((s) => s._id === id);

  const navDate = (dir: number) => {
    const d = dir > 0 ? addDays(new Date(selectedDate), 1) : subDays(new Date(selectedDate), 1);
    setSelectedDate(format(d, "yyyy-MM-dd"));
  };

  const completed = tasks?.filter((t) => t.completed).length ?? 0;
  const total = tasks?.length ?? 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <div className="date-display">
            {completed}/{total} completed
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)} id="add-task-btn">
          + Add Task
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button className="btn-icon" onClick={() => navDate(-1)}>◀</button>
        <h2 style={{ fontSize: "1.1rem" }}>
          {format(new Date(selectedDate + "T00:00:00"), "EEEE, MMMM d, yyyy")}
        </h2>
        <button className="btn-icon" onClick={() => navDate(1)}>▶</button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
        >
          Today
        </button>
      </div>

      {total > 0 && (
        <div style={{
          height: 4, borderRadius: 2, background: "var(--bg-elevated)", marginBottom: 20, overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${total > 0 ? (completed / total) * 100 : 0}%`,
            background: "var(--accent-primary)",
            borderRadius: 2,
            transition: "width 300ms ease",
          }} />
        </div>
      )}

      <div className="card">
        {!tasks || tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p>No tasks for this day</p>
          </div>
        ) : (
          tasks.map((task) => {
            const subj = task.subjectId ? getSubject(task.subjectId) : null;
            return (
              <div key={task._id} className={`task-item ${task.completed ? "completed" : ""}`}>
                <button
                  className={`task-checkbox ${task.completed ? "checked" : ""}`}
                  onClick={() => void toggleTask({ id: task._id })}
                >
                  {task.completed ? "✓" : ""}
                </button>
                <div className={`priority-dot ${task.priority}`} />
                <div style={{ flex: 1 }}>
                  <div className="task-title">{task.title}</div>
                  {task.description && <div className="task-desc">{task.description}</div>}
                  {subj && (
                    <SubjectBadge
                      name={subj.name}
                      color={subj.color}
                      icon={subj.icon}
                      style={{ marginTop: 4, display: "inline-flex" }}
                    />
                  )}
                </div>
                <div className="item-actions">
                  <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => void removeTask({ id: task._id })}>🗑</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAdd && (
        <Modal title="Add Task" onClose={() => setShowAdd(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void createTask({
                date: selectedDate,
                title: fd.get("title") as string,
                description: (fd.get("description") as string) || undefined,
                priority: (fd.get("priority") as "low" | "medium" | "high") ?? "medium",
                subjectId: fd.get("subjectId") ? (fd.get("subjectId") as Id<"subjects">) : undefined,
              });
              setShowAdd(false);
            }}
          >
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
                    <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Task</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
