import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format } from "date-fns";
import { useState } from "react";
import { Modal } from "../components/ui/Modal";
import { SubjectBadge } from "../components/ui/SubjectBadge";
import type { Id } from "../../convex/_generated/dataModel";

const daysUntil = (dateStr: string) => {
  const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (d < 0) return "Passed";
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  return `${d} days`;
};

const countdownClass = (dateStr: string) => {
  const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (d < 0) return "";
  if (d <= 2) return "urgent";
  if (d <= 7) return "soon";
  return "comfortable";
};

export function ExamsView() {
  const exams = useQuery(api.exams.list);
  const subjects = useQuery(api.subjects.list);
  const createExam = useMutation(api.exams.create);
  const updateExam = useMutation(api.exams.update);
  const removeExam = useMutation(api.exams.remove);
  const [showAdd, setShowAdd] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);

  const getSubject = (id: string) => subjects?.find((s) => s._id === id);



  const sorted = [...(exams ?? [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div>
      <div className="page-header">
        <h1>Exams</h1>
        <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)} id="add-exam-btn">
          + Add Exam
        </button>
      </div>

      {(!subjects || subjects.length === 0) && (
        <div className="card" style={{ marginBottom: 16, border: "1px solid var(--warning)", background: "var(--accent-light)", color: "var(--warning)" }}>
          <p style={{ fontSize: "0.88rem", fontWeight: 500 }}>
            ⚠️ Create a subject first in Settings before adding exams.
          </p>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>No exams yet. Add your first exam above!</p>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {sorted.map((exam) => {
            const subj = getSubject(exam.subjectId);
            return (
              <div
                key={exam._id}
                className="exam-card"
                style={{ borderLeftColor: subj?.color ?? "var(--accent-primary)" }}
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
                      <span>{format(new Date(exam.date), "MMM d, yyyy")}</span>
                      <span className="coeff-badge">×{exam.coefficient}</span>
                    </div>
                    {exam.notes && <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 4 }}>{exam.notes}</p>}
                    {exam.grade !== undefined && (
                      <div style={{ marginTop: 6 }}>
                        <span className="duration-badge">Grade: {exam.grade}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <span className={`countdown ${countdownClass(exam.date)}`}>
                      {daysUntil(exam.date)}
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {!exam.completed && (
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            const grade = prompt("Enter your grade:");
                            if (grade !== null) {
                              void updateExam({ id: exam._id, completed: true, grade: Number(grade) || undefined });
                            }
                          }}
                        >
                          ✓ Done
                        </button>
                      )}
                      <button type="button" className="btn-icon" style={{ width: 28, height: 28 }} aria-label={`Edit ${exam.title}`} onClick={() => setEditingExam(exam)}>✏️</button>
                      <button type="button" className="btn-icon" style={{ width: 28, height: 28 }} aria-label={`Delete ${exam.title}`} onClick={() => void removeExam({ id: exam._id })}>🗑</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && subjects && subjects.length > 0 && (
        <Modal title="Add Exam" onClose={() => setShowAdd(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void createExam({
                subjectId: fd.get("subjectId") as Id<"subjects">,
                title: fd.get("title") as string,
                date: fd.get("date") as string,
                coefficient: Number(fd.get("coefficient")),
                notes: (fd.get("notes") as string) || undefined,
              });
              setShowAdd(false);
            }}
          >
            <div className="form-group">
              <label htmlFor="add-exam-title">Title</label>
              <input id="add-exam-title" name="title" required placeholder="Final Exam" />
            </div>
            <div className="form-group">
              <label htmlFor="add-exam-subject">Subject</label>
              <select id="add-exam-subject" name="subjectId" required>
                <option value="">Select a subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label htmlFor="add-exam-date">Date</label>
                <input id="add-exam-date" name="date" type="date" required />
              </div>
              <div className="form-group">
                <label htmlFor="add-exam-coeff">Coefficient</label>
                <input id="add-exam-coeff" name="coefficient" type="number" step="0.5" min="0.5" defaultValue="1" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="add-exam-notes">Notes (optional)</label>
              <textarea id="add-exam-notes" name="notes" placeholder="Chapters to review..." />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Exam</button>
            </div>
          </form>
        </Modal>
      )}
      {editingExam && subjects && subjects.length > 0 && (
        <Modal title="Edit Exam" onClose={() => setEditingExam(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void updateExam({
                id: editingExam._id,
                subjectId: fd.get("subjectId") as Id<"subjects">,
                title: fd.get("title") as string,
                date: fd.get("date") as string,
                coefficient: Number(fd.get("coefficient")),
                notes: (fd.get("notes") as string) || undefined,
                completed: fd.get("completed") === "true",
                grade: fd.get("grade") ? Number(fd.get("grade")) : undefined,
              });
              setEditingExam(null);
            }}
          >
            <div className="form-group">
              <label htmlFor="edit-exam-title">Title</label>
              <input id="edit-exam-title" name="title" defaultValue={editingExam.title} required placeholder="Final Exam" />
            </div>
            <div className="form-group">
              <label htmlFor="edit-exam-subject">Subject</label>
              <select id="edit-exam-subject" name="subjectId" defaultValue={editingExam.subjectId} required>
                <option value="">Select a subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label htmlFor="edit-exam-date">Date</label>
                <input id="edit-exam-date" name="date" type="date" defaultValue={editingExam.date} required />
              </div>
              <div className="form-group">
                <label htmlFor="edit-exam-coeff">Coefficient</label>
                <input id="edit-exam-coeff" name="coefficient" type="number" step="0.5" min="0.5" defaultValue={editingExam.coefficient} required />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label htmlFor="edit-exam-status">Status</label>
                <select id="edit-exam-status" name="completed" defaultValue={editingExam.completed ? "true" : "false"}>
                  <option value="false">Upcoming</option>
                  <option value="true">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-exam-grade">Grade (optional)</label>
                <input id="edit-exam-grade" name="grade" type="number" step="0.1" defaultValue={editingExam.grade} placeholder="e.g. 16" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="edit-exam-notes">Notes (optional)</label>
              <textarea id="edit-exam-notes" name="notes" defaultValue={editingExam.notes || ""} placeholder="Chapters to review..." />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditingExam(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
