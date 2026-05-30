import { useQuery, useMutation } from "convex/react";
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
  isSameMonth,
  isToday,
} from "date-fns";
import { useState } from "react";
import { Modal } from "../components/ui/Modal";
import { SubjectBadge } from "../components/ui/SubjectBadge";
import type { Id } from "../../convex/_generated/dataModel";

export function CalendarView({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const subjects = useQuery(api.subjects.list);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const startStr = format(calStart, "yyyy-MM-dd");
  const endStr = format(calEnd, "yyyy-MM-dd");

  const exams = useQuery(api.exams.list);
  const events = useQuery(api.events.getByDateRange, {
    startDate: startStr,
    endDate: endStr,
  });
  const rangeLogs = useQuery(api.dailyLogs.getByDateRange, {
    startDate: startStr,
    endDate: endStr,
  });
  const tasks = useQuery(api.tasks.getByDate, { date: selectedDate });
  const dayLogs = useQuery(api.dailyLogs.getByDate, { date: selectedDate });
  const dayEvents = useQuery(api.events.getByDate, { date: selectedDate });

  const toggleTask = useMutation(api.tasks.toggleComplete);

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  const createTask = useMutation(api.tasks.create);
  const createEvent = useMutation(api.events.create);
  const createLog = useMutation(api.dailyLogs.create);
  const removeTask = useMutation(api.tasks.remove);
  const removeEvent = useMutation(api.events.remove);
  const removeLog = useMutation(api.dailyLogs.remove);
  const updateTask = useMutation(api.tasks.update);
  const updateLog = useMutation(api.dailyLogs.update);
  
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [editingLog, setEditingLog] = useState<any | null>(null);

  const getSubject = (id: string) => subjects?.find((s) => s._id === id);

  // Build day data
  const dayData: Record<
    string,
    {
      dots: { color: string; type: "exam" | "event" | "log" }[];
      items: { title: string; color: string; icon?: string; type: "exam" | "event" | "log" }[];
      totalStudyMinutes?: number;
    }
  > = {};

  exams?.forEach((e) => {
    if (!dayData[e.date]) dayData[e.date] = { dots: [], items: [] };
    const subj = getSubject(e.subjectId);
    const color = subj?.color ?? "var(--accent-primary)";
    dayData[e.date].dots.push({ color, type: "exam" });
    dayData[e.date].items.push({
      title: e.title,
      color,
      icon: subj?.icon ?? "🎯",
      type: "exam",
    });
  });

  events?.forEach((e) => {
    if (!dayData[e.date]) dayData[e.date] = { dots: [], items: [] };
    const color = e.color ?? "var(--accent-primary)";
    dayData[e.date].dots.push({ color, type: "event" });
    dayData[e.date].items.push({
      title: e.title,
      color,
      icon: "📅",
      type: "event",
    });
  });

  rangeLogs?.forEach((log) => {
    if (!dayData[log.date]) {
      dayData[log.date] = { dots: [], items: [], totalStudyMinutes: 0 };
    }
    const subj = log.subjectId ? getSubject(log.subjectId) : null;
    const color = subj?.color ?? "var(--text-muted)";
    const icon = subj?.icon ?? "⏱️";

    dayData[log.date].totalStudyMinutes = (dayData[log.date].totalStudyMinutes || 0) + (log.duration ?? 0);

    dayData[log.date].dots.push({ color, type: "log" });
    dayData[log.date].items.push({
      title: `${subj ? `${subj.name}: ` : ""}${log.content} (${log.duration ? `${log.duration}m` : "no time"})`,
      color,
      icon,
      type: "log",
    });
  });

  // Generate calendar days
  const days: Date[] = [];
  let d = calStart;
  while (d <= calEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const dayExams = exams?.filter((e) => e.date === selectedDate) ?? [];

  return (
    <div>
      <div className="page-header">
        <h1>Calendar</h1>
      </div>

      <div className="calendar-header">
        <h2>{format(currentMonth, "MMMM yyyy")}</h2>
        <div className="calendar-nav">
          <button className="btn-icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            ◀
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setCurrentMonth(new Date());
              setSelectedDate(new Date().toISOString().split("T")[0]);
            }}
          >
            Today
          </button>
          <button className="btn-icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            ▶
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {dayNames.map((dn) => (
          <div key={dn} className="calendar-day-header">{dn}</div>
        ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const data = dayData[dateStr];
          const isSelected = dateStr === selectedDate;
          return (
            <div
              key={dateStr}
              className={`calendar-day${!isSameMonth(day, currentMonth) ? " other-month" : ""}${isToday(day) ? " today" : ""}${isSelected ? " selected" : ""}`}
              onClick={() => setSelectedDate(dateStr)}
            >
              <div className="day-header">
                <div className="day-number">
                  {isToday(day) ? (
                    <span>{format(day, "d")}</span>
                  ) : (
                    format(day, "d")
                  )}
                </div>
                {data?.totalStudyMinutes && data.totalStudyMinutes > 0 && (
                  <div className="day-study-badge" title="Total study duration today">
                    ⏱️ {data.totalStudyMinutes >= 60 
                      ? `${Math.floor(data.totalStudyMinutes / 60)}h${data.totalStudyMinutes % 60 > 0 ? ` ${data.totalStudyMinutes % 60}m` : ""}`
                      : `${data.totalStudyMinutes}m`}
                  </div>
                )}
              </div>
              {data && (
                <>
                  <div className="day-dots">
                    {data.dots.map((dot, i) => (
                      <div key={`dot-${i}`} className="day-dot" style={{ background: dot.color, opacity: dot.type === "event" ? 0.75 : 1 }} />
                    ))}
                  </div>

                  <div className="calendar-day-items">
                    {data.items.slice(0, 2).map((item, i) => (
                      <div
                        key={`item-${i}`}
                        className={`calendar-day-item ${item.type}`}
                        style={{
                          background: item.color + "15",
                          color: item.color,
                          borderLeft: `2px solid ${item.color}`,
                        }}
                        title={`${item.icon} ${item.title}`}
                      >
                        <span className="item-icon">{item.icon}</span>
                        <span className="item-text">{item.title}</span>
                      </div>
                    ))}
                    {data.items.length > 2 && (
                      <div className="calendar-day-item-more">
                        +{data.items.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Day Detail Panel */}
      <div className="day-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>{format(new Date(selectedDate + "T00:00:00"), "EEEE, MMMM d, yyyy")}</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowTaskModal(true)}>
              + Task
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowEventModal(true)}>
              + Event
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowLogModal(true)}>
              + Log
            </button>
          </div>
        </div>

        {/* Exams for this day */}
        {dayExams.length > 0 && (
          <div className="panel-section">
            <h4>🎯 Exams</h4>
            {dayExams.map((exam) => {
              const subj = getSubject(exam.subjectId);
              return (
                <div key={exam._id} className="exam-card" style={{ marginBottom: 8, borderLeftColor: subj?.color ?? "var(--accent-primary)" }}>
                  <div className="exam-title">{exam.title}</div>
                  <div className="exam-meta">
                    {subj && <SubjectBadge name={subj.name} color={subj.color} icon={subj.icon} />}
                    <span className="coeff-badge">×{exam.coefficient}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tasks */}
        <div className="panel-section">
          <h4>✅ Tasks</h4>
          {!tasks || tasks.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No tasks</p>
          ) : (
            tasks.map((task) => (
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
                </div>
                <div className="item-actions" style={{ display: "flex", gap: 4 }}>
                  <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => setEditingTask(task)}>✏️</button>
                  <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => void removeTask({ id: task._id })}>🗑</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Events */}
        <div className="panel-section">
          <h4>📅 Events</h4>
          {!dayEvents || dayEvents.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No events</p>
          ) : (
            dayEvents.map((ev) => (
              <div key={ev._id} className="event-card" style={{ borderLeftColor: ev.color ?? "var(--accent-blue)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  {ev.startTime && <div className="event-time">{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ""}</div>}
                  <div className="event-title">{ev.title}</div>
                </div>
                <div className="item-actions">
                  <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => void removeEvent({ id: ev._id })}>🗑</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Study Logs */}
        <div className="panel-section">
          <h4>📝 Study Log</h4>
          {!dayLogs || dayLogs.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No entries</p>
          ) : (
            dayLogs.map((log) => {
              const subj = log.subjectId ? getSubject(log.subjectId) : null;
              return (
                <div key={log._id} className="log-entry" style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div className="log-content">{log.content}</div>
                    <div className="log-meta">
                      {subj && <SubjectBadge name={subj.name} color={subj.color} icon={subj.icon} />}
                      {log.duration && <span className="duration-badge">⏱ {log.duration}min</span>}
                    </div>
                  </div>
                  <div className="item-actions" style={{ display: "flex", gap: 4 }}>
                    <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => setEditingLog(log)}>✏️</button>
                    <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => void removeLog({ id: log._id })}>🗑</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <Modal title="Add Task" onClose={() => setShowTaskModal(false)}>
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
              setShowTaskModal(false);
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
              <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Task</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <Modal title="Add Event" onClose={() => setShowEventModal(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void createEvent({
                date: selectedDate,
                title: fd.get("title") as string,
                startTime: (fd.get("startTime") as string) || undefined,
                endTime: (fd.get("endTime") as string) || undefined,
                description: (fd.get("description") as string) || undefined,
              });
              setShowEventModal(false);
            }}
          >
            <div className="form-group">
              <label>Title</label>
              <input name="title" required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label>Start Time</label>
                <input name="startTime" type="time" />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input name="endTime" type="time" />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowEventModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Event</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Log Modal */}
      {showLogModal && (
        <Modal title="Add Study Log" onClose={() => setShowLogModal(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void createLog({
                date: selectedDate,
                content: fd.get("content") as string,
                duration: fd.get("duration") ? Number(fd.get("duration")) : undefined,
                subjectId: fd.get("subjectId") ? (fd.get("subjectId") as Id<"subjects">) : undefined,
              });
              setShowLogModal(false);
            }}
          >
            <div className="form-group">
              <label>What did you study?</label>
              <textarea name="content" required />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input name="duration" type="number" min="1" />
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
              <button type="button" className="btn btn-secondary" onClick={() => setShowLogModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Entry</button>
            </div>
          </form>
        </Modal>
      )}

      {editingTask && (
        <Modal title="Edit Task" onClose={() => setEditingTask(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void updateTask({
                id: editingTask._id,
                title: fd.get("title") as string,
                description: (fd.get("description") as string) || undefined,
                priority: (fd.get("priority") as "low" | "medium" | "high") ?? "medium",
                subjectId: fd.get("subjectId") ? (fd.get("subjectId") as Id<"subjects">) : undefined,
                date: fd.get("date") as string,
              });
              setEditingTask(null);
            }}
          >
            <div className="form-group">
              <label>Title</label>
              <input name="title" defaultValue={editingTask.title} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" defaultValue={editingTask.description} />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input name="date" type="date" defaultValue={editingTask.date} required />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" defaultValue={editingTask.priority}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            {subjects && subjects.length > 0 && (
              <div className="form-group">
                <label>Subject</label>
                <select name="subjectId" defaultValue={editingTask.subjectId || ""}>
                  <option value="">None</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditingTask(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {editingLog && (
        <Modal title="Edit Study Log" onClose={() => setEditingLog(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void updateLog({
                id: editingLog._id,
                content: fd.get("content") as string,
                duration: fd.get("duration") ? Number(fd.get("duration")) : undefined,
                subjectId: fd.get("subjectId") ? (fd.get("subjectId") as Id<"subjects">) : undefined,
              });
              setEditingLog(null);
            }}
          >
            <div className="form-group">
              <label>What did you study?</label>
              <textarea name="content" defaultValue={editingLog.content} required />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input name="duration" type="number" min="1" defaultValue={editingLog.duration} />
            </div>
            {subjects && subjects.length > 0 && (
              <div className="form-group">
                <label>Subject</label>
                <select name="subjectId" defaultValue={editingLog.subjectId || ""}>
                  <option value="">None</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditingLog(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
