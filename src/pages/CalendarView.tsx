import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
} from "date-fns";
import { useReducer, useState } from "react";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { formatLocalDate } from "../utils/dateUtils";
import { CalendarGrid, type DayData } from "../components/calendar/CalendarGrid";
import { DayPanel } from "../components/calendar/DayPanel";
import {
  AddTaskModal,
  AddEventModal,
  AddLogModal,
  EditTaskModal,
  EditLogModal,
} from "../components/calendar/CalendarModals";

type Task = Doc<"tasks">;
type Log = Doc<"dailyLogs">;

type DialogState =
  | { type: "none" }
  | { type: "addTask" }
  | { type: "addEvent" }
  | { type: "addLog" }
  | { type: "editTask"; task: Task }
  | { type: "editLog"; log: Log };

type DialogAction =
  | { type: "openAddTask" }
  | { type: "openAddEvent" }
  | { type: "openAddLog" }
  | { type: "openEditTask"; task: Task }
  | { type: "openEditLog"; log: Log }
  | { type: "close" };

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case "openAddTask":
      return { type: "addTask" };
    case "openAddEvent":
      return { type: "addEvent" };
    case "openAddLog":
      return { type: "addLog" };
    case "openEditTask":
      return { type: "editTask", task: action.task };
    case "openEditLog":
      return { type: "editLog", log: action.log };
    case "close":
      return { type: "none" };
  }
}

export function CalendarView({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dialog, dispatchDialog] = useReducer(dialogReducer, { type: "none" });
  const subjects = useQuery(api.subjects.list);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const startStr = format(calStart, "yyyy-MM-dd");
  const endStr = format(calEnd, "yyyy-MM-dd");

  const exams = useQuery(api.exams.list);
  const events = useQuery(api.events.getByDateRange, { startDate: startStr, endDate: endStr });
  const rangeLogs = useQuery(api.dailyLogs.getByDateRange, { startDate: startStr, endDate: endStr });
  const tasks = useQuery(api.tasks.getByDate, { date: selectedDate });
  const dayLogs = useQuery(api.dailyLogs.getByDate, { date: selectedDate });
  const dayEvents = useQuery(api.events.getByDate, { date: selectedDate });

  const getSubject = (id: string | undefined) => subjects?.find((s) => s._id === id);

  const dayData: Record<string, DayData> = {};
  exams?.forEach((e) => {
    if (!dayData[e.date]) dayData[e.date] = { dots: [], items: [] };
    const subj = getSubject(e.subjectId);
    const color = subj?.color ?? "var(--accent-primary)";
    dayData[e.date].dots.push({ color, type: "exam" });
    dayData[e.date].items.push({ id: e._id, title: e.title, color, icon: subj?.icon ?? "🎯", type: "exam" });
  });
  events?.forEach((e) => {
    if (!dayData[e.date]) dayData[e.date] = { dots: [], items: [] };
    const color = e.color ?? "var(--accent-primary)";
    dayData[e.date].dots.push({ color, type: "event" });
    dayData[e.date].items.push({ id: e._id, title: e.title, color, icon: "📅", type: "event" });
  });
  rangeLogs?.forEach((log) => {
    if (!dayData[log.date]) dayData[log.date] = { dots: [], items: [], totalStudyMinutes: 0 };
    const subj = log.subjectId ? getSubject(log.subjectId) : null;
    const color = subj?.color ?? "var(--text-muted)";
    const icon = subj?.icon ?? "⏱️";
    dayData[log.date].totalStudyMinutes = (dayData[log.date].totalStudyMinutes || 0) + (log.duration ?? 0);
    dayData[log.date].dots.push({ color, type: "log" });
    dayData[log.date].items.push({
      id: log._id,
      title: `${subj ? `${subj.name}: ` : ""}${log.content} (${log.duration ? `${log.duration}m` : "no time"})`,
      color,
      icon,
      type: "log",
    });
  });

  const days: Date[] = [];
  let d = calStart;
  while (d <= calEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(formatLocalDate());
  };

  return (
    <div>
      <div className="page-header">
        <h1>Calendar</h1>
      </div>

      <div className="calendar-header">
        <h2>{format(currentMonth, "MMMM yyyy")}</h2>
        <div className="calendar-nav">
          <button type="button" className="btn-icon" aria-label="Previous month" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            ◀
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleGoToToday}
          >
            Today
          </button>
          <button type="button" className="btn-icon" aria-label="Next month" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            ▶
          </button>
        </div>
      </div>

      <CalendarGrid
        days={days}
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        dayData={dayData}
        onSelectDate={setSelectedDate}
      />

      <DayPanel
        selectedDate={selectedDate}
        exams={exams}
        tasks={tasks}
        events={dayEvents}
        logs={dayLogs}
        subjects={subjects}
        onOpenAddTask={() => dispatchDialog({ type: "openAddTask" })}
        onOpenAddEvent={() => dispatchDialog({ type: "openAddEvent" })}
        onOpenAddLog={() => dispatchDialog({ type: "openAddLog" })}
        onEditTask={(task) => dispatchDialog({ type: "openEditTask", task })}
        onEditLog={(log) => dispatchDialog({ type: "openEditLog", log })}
      />

      {dialog.type === "addTask" && (
        <AddTaskModal
          date={selectedDate}
          subjects={subjects}
          onClose={() => dispatchDialog({ type: "close" })}
        />
      )}
      {dialog.type === "addEvent" && (
        <AddEventModal
          date={selectedDate}
          onClose={() => dispatchDialog({ type: "close" })}
        />
      )}
      {dialog.type === "addLog" && (
        <AddLogModal
          date={selectedDate}
          subjects={subjects}
          onClose={() => dispatchDialog({ type: "close" })}
        />
      )}
      {dialog.type === "editTask" && (
        <EditTaskModal
          task={dialog.task}
          subjects={subjects}
          onClose={() => dispatchDialog({ type: "close" })}
        />
      )}
      {dialog.type === "editLog" && (
        <EditLogModal
          log={dialog.log}
          subjects={subjects}
          onClose={() => dispatchDialog({ type: "close" })}
        />
      )}
    </div>
  );
}
