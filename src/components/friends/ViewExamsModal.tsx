import React from "react";
import { Modal } from "../ui/Modal";

interface ViewExamsModalProps {
  viewExamsFriend: any;
  setViewExamsFriend: (f: any) => void;
  friendExams: any[] | undefined;
  importSuccessId: string | null;
  handleImportExam: (examId: any) => void;
}

export function ViewExamsModal({
  viewExamsFriend,
  setViewExamsFriend,
  friendExams,
  importSuccessId,
  handleImportExam,
}: ViewExamsModalProps) {
  return (
    <Modal
      title={`🎯 ${viewExamsFriend.username}'s Exams`}
      onClose={() => setViewExamsFriend(null)}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
          If you share these exams or want to remember when they happen, click "Add to My Calendar" to copy them directly into your exam list.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 350, overflowY: "auto" }}>
          {friendExams && friendExams.length > 0 ? (
            friendExams.map((exam: any) => {
              const isImported = importSuccessId === exam._id;
              return (
                <div
                  key={exam._id}
                  style={{
                    padding: 12,
                    background: "var(--bg-primary)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{exam.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                      Date: <strong>{exam.date}</strong> · Coeff: {exam.coefficient}
                    </div>
                    <div
                      className="friend-exam-subject-badge"
                      style={{
                        background: exam.subjectColor + "1A",
                        color: exam.subjectColor,
                        border: `1px solid ${exam.subjectColor}`,
                      }}
                    >
                      {exam.subjectIcon} {exam.subjectName}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`btn btn-sm ${isImported ? "btn-secondary" : "btn-primary"}`}
                    onClick={() => handleImportExam(exam._id)}
                    disabled={isImported}
                  >
                    {isImported ? "✓ Added!" : "+ Add to My Calendar"}
                  </button>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>
              No exams registered for this user yet.
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setViewExamsFriend(null)}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
