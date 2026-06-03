import { format } from "date-fns";
import type { View } from "../../App";
import { SubjectBadge } from "../ui/SubjectBadge";
import { formatDuration } from "../../utils/dateUtils";

const daysUntil = (dateStr: string) => {
  const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  return `${d} days`;
};

const countdownClass = (dateStr: string) => {
  const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (d <= 2) return "urgent";
  if (d <= 7) return "soon";
  return "comfortable";
};

interface DashboardCardGridProps {
  upcomingExams: any[] | undefined;
  todayTasks: any[] | undefined;
  generalTasks: any[] | undefined;
  todayEvents: any[] | undefined;
  todayLogs: any[] | undefined;
  subjectBreakdown: any[];
  activeDate: string;
  today: string;
  setView: (v: View) => void;
  setSelectedDate: (d: string) => void;
  getSubject: (id: string) => any;
  generalIncomplete: number;
}

export function DashboardCardGrid({
  upcomingExams,
  todayTasks,
  generalTasks,
  todayEvents,
  todayLogs,
  subjectBreakdown,
  activeDate,
  today,
  setView,
  setSelectedDate,
  getSubject,
  generalIncomplete,
}: DashboardCardGridProps) {
  return (
    <div className="card-grid">
      {/* Upcoming Exams */}
      <div className="card">
        <div className="card-header">
          <h3>🎯 Upcoming Exams</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setView("exams")}>
            View all
          </button>
        </div>
        {!upcomingExams || upcomingExams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <p>No upcoming exams</p>
          </div>
        ) : (
          upcomingExams.map((exam) => {
            const subj = getSubject(exam.subjectId);
            return (
              <div
                key={exam._id}
                className="exam-card"
                style={{ borderLeftColor: subj?.color ?? "#3b82f6" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="exam-title">{exam.title}</div>
                    <div className="exam-meta">
                      {subj && (
                        <SubjectBadge
                          name={subj.name}
                          color={subj.color}
                          icon={subj.icon}
                        />
                      )}
                      <span>{format(new Date(exam.date), "MMM d")}</span>
                      <span className="coeff-badge">×{exam.coefficient}</span>
                    </div>
                  </div>
                  <span className={`countdown ${countdownClass(exam.date)}`}>
                    {daysUntil(exam.date)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Today's Tasks */}
      <div className="card">
        <div className="card-header">
          <h3>✅ {activeDate === today ? "Today's Tasks" : "Tasks of the Day"}</h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setSelectedDate(activeDate);
              setView("tasks");
            }}
          >
            View all
          </button>
        </div>
        {!todayTasks || todayTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>{activeDate === today ? "No tasks for today" : "No tasks for this day"}</p>
          </div>
        ) : (
          todayTasks.slice(0, 5).map((task) => (
            <div
              key={task._id}
              className={`task-item ${task.completed ? "completed" : ""}`}
            >
              <div className={`priority-dot ${task.priority}`} />
              <div>
                <div className="task-title">{task.title}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* General Tasks */}
      <div className="card">
        <div className="card-header">
          <h3>📋 General Tasks</h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setView("tasks")}
          >
            View all
          </button>
        </div>
        {!generalTasks || generalTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No general tasks</p>
          </div>
        ) : (
          generalTasks.filter((t) => !t.completed).slice(0, 5).map((task) => (
            <div
              key={task._id}
              className="task-item"
            >
              <div className={`priority-dot ${task.priority}`} />
              <div>
                <div className="task-title">{task.title}</div>
              </div>
            </div>
          ))
        )}
        {generalIncomplete > 0 && (
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 8 }}>
            {generalIncomplete} remaining
          </div>
        )}
      </div>

      {/* Today's Events */}
      <div className="card">
        <div className="card-header">
          <h3>📅 {activeDate === today ? "Today's Events" : "Events for Selected Day"}</h3>
        </div>
        {!todayEvents || todayEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗓️</div>
            <p>{activeDate === today ? "No events scheduled" : "No events scheduled for this day"}</p>
          </div>
        ) : (
          todayEvents.map((ev) => (
            <div
              key={ev._id}
              className="event-card"
              style={{ borderLeftColor: ev.color ?? "var(--accent-primary)" }}
            >
              {ev.startTime && (
                <div className="event-time">
                  {ev.startTime}
                  {ev.endTime ? ` – ${ev.endTime}` : ""}
                </div>
              )}
              <div className="event-title">{ev.title}</div>
            </div>
          ))
        )}
      </div>

      {/* Today's Study Log */}
      <div className="card">
        <div className="card-header">
          <h3>📝 {activeDate === today ? "Study Log" : "Study Log for Selected Day"}</h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setSelectedDate(activeDate);
              setView("log");
            }}
          >
            Add entry
          </button>
        </div>
        {!todayLogs || todayLogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✏️</div>
            <p>{activeDate === today ? "No study entries yet today" : "No study entries for this day"}</p>
          </div>
        ) : (
          todayLogs.slice(0, 4).map((log) => {
            const subj = log.subjectId ? getSubject(log.subjectId) : null;
            return (
              <div key={log._id} className="log-entry">
                <div className="log-content">{log.content}</div>
                <div className="log-meta">
                  {subj && (
                    <SubjectBadge
                      name={subj.name}
                      color={subj.color}
                      icon={subj.icon}
                    />
                  )}
                  {log.duration && (
                    <span className="duration-badge">⏱ {log.duration}min</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Study Time by Subject */}
      <div className="card">
        <div className="card-header">
          <h3>📊 Study Time by Subject</h3>
        </div>
        {subjectBreakdown.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>No study logs recorded yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {subjectBreakdown.map((item) => (
              <div key={item.name} className="subject-time-row">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{item.icon}</span>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.name}</span>
                  </div>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                    {formatDuration(item.minutes, { formatUnderHourAsMins: true })}
                  </span>
                </div>
                <div style={{ height: 6, background: "var(--bg-secondary)", borderRadius: 3, overflow: "hidden", display: "flex" }}>
                  <div style={{ height: "100%", width: `${item.percentage}%`, background: item.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
