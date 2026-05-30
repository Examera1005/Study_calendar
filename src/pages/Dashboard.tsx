import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format } from "date-fns";
import type { View } from "../App";
import { SubjectBadge } from "../components/ui/SubjectBadge";

export function Dashboard({
  setView,
  selectedDate,
  setSelectedDate,
}: {
  setView: (v: View) => void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const upcomingExams = useQuery(api.exams.upcoming, { limit: 5 });
  const todayTasks = useQuery(api.tasks.getByDate, { date: today });
  const todayLogs = useQuery(api.dailyLogs.getByDate, { date: today });
  const todayEvents = useQuery(api.events.getByDate, { date: today });
  const subjects = useQuery(api.subjects.list);

  const getSubject = (id: string) => subjects?.find((s) => s._id === id);

  const daysUntil = (dateStr: string) => {
    const d = Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / 86400000,
    );
    if (d === 0) return "Today";
    if (d === 1) return "Tomorrow";
    return `${d} days`;
  };

  const countdownClass = (dateStr: string) => {
    const d = Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / 86400000,
    );
    if (d <= 2) return "urgent";
    if (d <= 7) return "soon";
    return "comfortable";
  };

  const completedTasks = todayTasks?.filter((t) => t.completed).length ?? 0;
  const totalTasks = todayTasks?.length ?? 0;
  const totalMinutes = todayLogs?.reduce((a, l) => a + (l.duration ?? 0), 0) ?? 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="date-display">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{upcomingExams?.length ?? 0}</div>
          <div className="stat-label">Upcoming Exams</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {completedTasks}/{totalTasks}
          </div>
          <div className="stat-label">Today's Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{todayLogs?.length ?? 0}</div>
          <div className="stat-label">Study Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {totalMinutes > 0
              ? `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60 > 0 ? ` ${totalMinutes % 60}m` : ""}`
              : "0h"}
          </div>
          <div className="stat-label">Study Time Today</div>
        </div>
      </div>

      <div className="card-grid">
        {/* Upcoming Exams */}
        <div className="card">
          <div className="card-header">
            <h3>🎯 Upcoming Exams</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setView("exams")}>
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
            <h3>✅ Today's Tasks</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSelectedDate(today);
                setView("tasks");
              }}
            >
              View all
            </button>
          </div>
          {!todayTasks || todayTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No tasks for today</p>
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

        {/* Today's Events */}
        <div className="card">
          <div className="card-header">
            <h3>📅 Today's Events</h3>
          </div>
          {!todayEvents || todayEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🗓️</div>
              <p>No events scheduled</p>
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
            <h3>📝 Study Log</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSelectedDate(today);
                setView("log");
              }}
            >
              Add entry
            </button>
          </div>
          {!todayLogs || todayLogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✏️</div>
              <p>No study entries yet today</p>
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
      </div>
    </div>
  );
}
