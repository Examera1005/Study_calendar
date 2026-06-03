import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format, addDays, subDays } from "date-fns";
import { useState } from "react";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { formatLocalDate } from "../utils/dateUtils";
import { TaskList } from "../components/tasks/TaskList";
import { TaskTabs } from "../components/tasks/TaskTabs";
import { AddTaskModal } from "../components/tasks/AddTaskModal";
import { EditTaskModal } from "../components/tasks/EditTaskModal";

type TaskTab = "daily" | "general" | "done";

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
  const updateTask = useMutation(api.tasks.update);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<Doc<"tasks"> | null>(null);
  const [activeTab, setActiveTab] = useState<TaskTab>("daily");

  const navDate = (dir: number) => {
    const d = dir > 0
      ? addDays(new Date(selectedDate), 1)
      : subDays(new Date(selectedDate), 1);
    setSelectedDate(format(d, "yyyy-MM-dd"));
  };

  const dailyIncomplete = dailyTasks?.filter((t) => !t.completed) ?? [];
  const dailyCompleted = dailyTasks?.filter((t) => t.completed) ?? [];
  const generalIncomplete = generalTasks?.filter((t) => !t.completed) ?? [];
  const generalCompleted = generalTasks?.filter((t) => t.completed) ?? [];
  const totalCompleted = dailyCompleted.length + generalCompleted.length;

  const completed = activeTab === "daily"
    ? dailyCompleted.length
    : activeTab === "general"
    ? generalCompleted.length
    : totalCompleted;

  const total = activeTab === "daily"
    ? (dailyTasks?.length ?? 0)
    : activeTab === "general"
    ? (generalTasks?.length ?? 0)
    : (dailyTasks?.length ?? 0) + (generalTasks?.length ?? 0);

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
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAdd(true)}
          id="add-task-btn"
        >
          + Add Task
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
          <button type="button" className="btn-icon" aria-label="Previous day" onClick={() => navDate(-1)}>
            ◀
          </button>
          <h2 style={{ fontSize: "1.1rem" }}>
            {format(new Date(selectedDate + "T00:00:00"), "EEEE, MMMM d, yyyy")}
          </h2>
          <button type="button" className="btn-icon" aria-label="Next day" onClick={() => navDate(1)}>
            ▶
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(formatLocalDate())}>
            Today
          </button>
        </div>
      )}

      {activeTab === "general" && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            These tasks aren't tied to any specific day: your ongoing to-do list.
          </p>
        </div>
      )}

      {activeTab === "done" && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Your completed tasks for the selected day and ongoing general backlog.
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
              background: activeTab === "general" || activeTab === "done" ? "var(--success)" : "var(--accent-primary)",
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
          onSave={(args: { id: Id<"tasks">; title: string; description?: string; priority: "low" | "medium" | "high"; subjectId?: Id<"subjects">; date?: string; taskType: "daily" | "general" }) => {
            void updateTask(args);
            setEditingTask(null);
          }}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
