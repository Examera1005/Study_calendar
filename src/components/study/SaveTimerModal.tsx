import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { Modal } from "../ui/Modal";
import { formatLocalDate } from "../../utils/dateUtils";

type Props = {
  defaultMinutes: number;
  subjects: Doc<"subjects">[] | undefined;
  onClose: () => void;
  onSaved?: () => void;
};

export function SaveTimerModal({ defaultMinutes, subjects, onClose, onSaved }: Props) {
  const [sessionMinutes, setSessionMinutes] = useState(defaultMinutes);
  const createLog = useMutation(api.dailyLogs.create);

  return (
    <Modal title="Log Study Session" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const duration = Number(fd.get("duration")) || sessionMinutes;
          void createLog({
            date: formatLocalDate(),
            content: fd.get("content") as string,
            duration,
            subjectId: fd.get("subjectId") ? (fd.get("subjectId") as Id<"subjects">) : undefined,
          });
          onSaved?.();
          onClose();
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8 }}>Adjust Study Time (minutes)</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <input
              type="number"
              name="duration"
              min="1"
              value={sessionMinutes}
              onChange={(e) => setSessionMinutes(Math.max(1, Number(e.target.value)))}
              aria-label="Study duration in minutes"
              className="session-duration-input"
              required
            />
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-secondary)" }}>min</span>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="session-log-content">What did you study?</label>
          <textarea id="session-log-content" name="content" required placeholder="Summarize your study session progress..." rows={3} />
        </div>
        {subjects && subjects.length > 0 && (
          <div className="form-group">
            <label htmlFor="session-log-subject">Subject</label>
            <select id="session-log-subject" name="subjectId" defaultValue="">
              <option value="">None</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Discard</button>
          <button type="submit" className="btn btn-primary">Save Log</button>
        </div>
      </form>
    </Modal>
  );
}
