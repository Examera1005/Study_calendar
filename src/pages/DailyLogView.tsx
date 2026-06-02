import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format, addDays, subDays } from "date-fns";
import { useState } from "react";
import { Modal } from "../components/ui/Modal";
import { SubjectBadge } from "../components/ui/SubjectBadge";
import type { Id } from "../../convex/_generated/dataModel";
import { formatLocalDate, formatDuration } from "../utils/dateUtils";

export function DailyLogView({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
}) {
  const logs = useQuery(api.dailyLogs.getByDate, { date: selectedDate });
  const subjects = useQuery(api.subjects.list);
  const createLog = useMutation(api.dailyLogs.create);
  const removeLog = useMutation(api.dailyLogs.remove);
  const updateLog = useMutation(api.dailyLogs.update);
  const [showAdd, setShowAdd] = useState(false);
  const [editingLog, setEditingLog] = useState<any | null>(null);

  const getSubject = (id: string) => subjects?.find((s) => s._id === id);
  const totalMinutes = logs?.reduce((a, l) => a + (l.duration ?? 0), 0) ?? 0;

  const navDate = (dir: number) => {
    const d = dir > 0 ? addDays(new Date(selectedDate), 1) : subDays(new Date(selectedDate), 1);
    setSelectedDate(format(d, "yyyy-MM-dd"));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Daily Log</h1>
          <div className="date-display">
            {logs?.length ?? 0} entries · {totalMinutes > 0 ? `${formatDuration(totalMinutes)} studied` : "No study time logged"}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)} id="add-log-btn">
          + Add Entry
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
          onClick={() => setSelectedDate(formatLocalDate())}
        >
          Today
        </button>
      </div>

      <div className="card">
        {!logs || logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✏️</div>
            <p>No study entries for this day</p>
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setShowAdd(true)}>
              Log your first session
            </button>
          </div>
        ) : (
          logs.map((log) => {
            const subj = log.subjectId ? getSubject(log.subjectId) : null;
            return (
              <div key={log._id} className="log-entry" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="log-content">{log.content}</div>
                  <div className="log-meta">
                    {subj && (
                      <SubjectBadge
                        name={subj.name}
                        color={subj.color}
                        icon={subj.icon}
                      />
                    )}
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

      {showAdd && (
        <Modal title="Add Study Log" onClose={() => setShowAdd(false)}>
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
              setShowAdd(false);
            }}
          >
            <div className="form-group">
              <label>What did you study?</label>
              <textarea name="content" required placeholder="Reviewed chapter 5 on thermodynamics..." />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input name="duration" type="number" min="1" placeholder="45" />
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
              <button type="submit" className="btn btn-primary">Add Entry</button>
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
