import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { SubjectBadge } from "../ui/SubjectBadge";
import { useLanguage } from "../../hooks/useLanguage";

type Task = Doc<"tasks">;
type Subject = Doc<"subjects">;

type Props = {
  task: Task;
  subjects: Subject[] | undefined;
  onEdit: (task: Task) => void;
};

function TaskRow({ task, subjects, onEdit }: Props) {
  const { t } = useLanguage();
  const toggleTask = useMutation(api.tasks.toggleComplete);
  const removeTask = useMutation(api.tasks.remove);
  const subj = task.subjectId ? subjects?.find((s) => s._id === task.subjectId) : null;

  return (
    <div className={`task-item ${task.completed ? "completed" : ""}`}>
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
        {task.description && <div className="task-desc">{task.description}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
      <div className="item-actions" style={{ display: "flex", gap: 4 }}>
        <button
          type="button"
          className="btn-icon"
          style={{ width: 28, height: 28 }}
          aria-label={`${t.common.edit} ${task.title}`}
          onClick={() => onEdit(task)}
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
  );
}

type ListProps = {
  activeTab: "daily" | "general" | "done";
  dailyTasks: Task[] | undefined;
  generalTasks: Task[] | undefined;
  dailyCompleted: Task[];
  generalCompleted: Task[];
  subjects: Subject[] | undefined;
  onEdit: (task: Task) => void;
};

export function TaskList({
  activeTab,
  dailyTasks,
  generalTasks,
  dailyCompleted,
  generalCompleted,
  subjects,
  onEdit,
}: ListProps) {
  const { t } = useLanguage();

  if (activeTab === "done") {
    if (dailyCompleted.length === 0 && generalCompleted.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <p>{t.tasks.noCompletedTasksYet}</p>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {dailyCompleted.length > 0 && (
          <div className="task-group">
            <div className="task-group-title">{t.tasks.dailyTasksCompletedGroup}</div>
            {dailyCompleted.map((task) => (
              <TaskRow key={task._id} task={task} subjects={subjects} onEdit={onEdit} />
            ))}
          </div>
        )}
        {generalCompleted.length > 0 && (
          <div className="task-group">
            <div className="task-group-title">{t.tasks.generalTasksCompletedGroup}</div>
            {generalCompleted.map((task) => (
              <TaskRow key={task._id} task={task} subjects={subjects} onEdit={onEdit} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const list = activeTab === "daily" ? dailyTasks : generalTasks;
  if (!list || list.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">{activeTab === "daily" ? "✅" : "📋"}</div>
        <p>{activeTab === "daily" ? t.tasks.noTasksForDay : t.tasks.noGeneralTasksYet}</p>
      </div>
    );
  }
  const visible: Task[] = [];
  for (const t of list) {
    if (!t.completed) visible.push(t);
  }
  return (
    <div className="task-group">
      {visible.map((task) => (
        <TaskRow key={task._id} task={task} subjects={subjects} onEdit={onEdit} />
      ))}
    </div>
  );
}
