import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format, addDays, subDays } from "date-fns";
import { useState } from "react";
import { Modal } from "../components/ui/Modal";
import { SubjectBadge } from "../components/ui/SubjectBadge";
import type { Id } from "../../convex/_generated/dataModel";
import { formatLocalDate, formatDuration } from "../utils/dateUtils";
import { useLanguage } from "../hooks/useLanguage";

export function DailyLogView({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
}) {
  const { t, language, dateLocale } = useLanguage();
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
          <h1>{t.dailyLog.title}</h1>
          <div className="date-display">
            {t.dailyLog.entriesCount(logs?.length ?? 0)} · {totalMinutes > 0 ? t.dailyLog.studiedTime(formatDuration(totalMinutes)) : t.dailyLog.noStudyTimeLogged}
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)} id="add-log-btn">
          {t.dailyLog.addEntryBtn}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button type="button" className="btn-icon" aria-label={t.tasks.prevDay} onClick={() => navDate(-1)}>◀</button>
        <h2 style={{ fontSize: "1.1rem" }}>
          {format(
            new Date(selectedDate + "T00:00:00"),
            t.common.dateFormatLong,
            { locale: dateLocale }
          )}
        </h2>
        <button type="button" className="btn-icon" aria-label={t.tasks.nextDay} onClick={() => navDate(1)}>▶</button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setSelectedDate(formatLocalDate())}
        >
          {t.common.today}
        </button>
      </div>

      <div className="card">
        {!logs || logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✏️</div>
            <p>{t.dailyLog.noStudyEntriesForDay}</p>
            <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setShowAdd(true)}>
              {t.dailyLog.logFirstSession}
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
                    {log.duration && <span className="duration-badge">⏱ {log.duration}{t.common.minutesUnit}</span>}
                  </div>
                </div>
                <div className="item-actions" style={{ display: "flex", gap: 4 }}>
                  <button type="button" className="btn-icon" style={{ width: 28, height: 28 }} aria-label={`${t.common.edit}: ${log.content}`} onClick={() => setEditingLog(log)}>✏️</button>
                  <button type="button" className="btn-icon" style={{ width: 28, height: 28 }} aria-label={`${t.common.delete}: ${log.content}`} onClick={() => void removeLog({ id: log._id })}>🗑</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAdd && (
        <Modal title={t.calendar.addLog} onClose={() => setShowAdd(false)}>
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
              <label htmlFor="add-log-content">{t.dailyLog.whatDidYouStudy}</label>
              <textarea
                id="add-log-content"
                name="content"
                required
                placeholder={t.dailyLog.summaryPlaceholder}
              />
            </div>
            <div className="form-group">
              <label htmlFor="add-log-duration">{t.dailyLog.durationMinutes}</label>
              <input id="add-log-duration" name="duration" type="number" min="1" placeholder="45" />
            </div>
            {subjects && subjects.length > 0 && (
              <div className="form-group">
                <label htmlFor="add-log-subject">{t.tasks.subjectLabelOptional}</label>
                <select id="add-log-subject" name="subjectId" defaultValue="">
                  <option value="">{t.common.none}</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.icon ? `${s.icon} ` : ""}{s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>{t.common.cancel}</button>
              <button type="submit" className="btn btn-primary">{t.common.add}</button>
            </div>
          </form>
        </Modal>
      )}

      {editingLog && (
        <Modal title={t.calendar.editLog} onClose={() => setEditingLog(null)}>
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
              <label htmlFor="edit-log-content">{t.dailyLog.whatDidYouStudy}</label>
              <textarea id="edit-log-content" name="content" defaultValue={editingLog.content} required />
            </div>
            <div className="form-group">
              <label htmlFor="edit-log-duration">{t.dailyLog.durationMinutes}</label>
              <input id="edit-log-duration" name="duration" type="number" min="1" defaultValue={editingLog.duration} />
            </div>
            {subjects && subjects.length > 0 && (
              <div className="form-group">
                <label htmlFor="edit-log-subject">{t.tasks.subjectLabel}</label>
                <select id="edit-log-subject" name="subjectId" defaultValue={editingLog.subjectId || ""}>
                  <option value="">{t.common.none}</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.icon ? `${s.icon} ` : ""}{s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditingLog(null)}>{t.common.cancel}</button>
              <button type="submit" className="btn btn-primary">{t.common.saveChanges}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
