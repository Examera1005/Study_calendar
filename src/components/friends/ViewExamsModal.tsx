import React from "react";
import { Modal } from "../ui/Modal";
import { useLanguage } from "../../hooks/useLanguage";

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
  const { t } = useLanguage();

  return (
    <Modal
      title={`🎯 ${t.friends.friendsExamsTitle(viewExamsFriend.username)}`}
      onClose={() => setViewExamsFriend(null)}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
          {t.friends.importExamsDesc}
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
                      {t.common.date}: <strong>{exam.date}</strong> · {t.common.coefficient}: {exam.coefficient}
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
                    {isImported ? t.friends.addedToast : t.friends.addToCalendarBtn}
                  </button>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>
              {t.friends.noUpcomingExams}
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setViewExamsFriend(null)}
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </Modal>
  );
}
