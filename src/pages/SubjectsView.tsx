import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Modal } from "../components/ui/Modal";
import { ColorPicker } from "../components/ui/ColorPicker";

export function SubjectsView() {
  const subjects = useQuery(api.subjects.list);
  const createSubject = useMutation(api.subjects.create);
  const updateSubject = useMutation(api.subjects.update);
  const removeSubject = useMutation(api.subjects.remove);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newColor, setNewColor] = useState("#7c3aed");
  const [editColor, setEditColor] = useState("#7c3aed");

  const editingSubject = subjects?.find((s) => s._id === editId);

  return (
    <div>
      <div className="page-header">
        <h1>Subjects</h1>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>📚 Manage Subjects</h3>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)} id="add-subject-btn">
            + Add Subject
          </button>
        </div>

        {!subjects || subjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p>No subjects yet — add your courses to get started</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {subjects.map((s) => (
              <div
                key={s._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-glass)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: "1rem" }}>{s.icon}</span>
                <span style={{ flex: 1, fontWeight: 500 }}>{s.name}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setEditId(s._id);
                    setEditColor(s.color);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  style={{ width: 28, height: 28 }}
                  onClick={() => {
                    if (confirm(`Delete "${s.name}"?`)) {
                      void removeSubject({ id: s._id });
                    }
                  }}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title="Add Subject" onClose={() => setShowAdd(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void createSubject({
                name: fd.get("name") as string,
                color: newColor,
                icon: (fd.get("icon") as string) || undefined,
              });
              setShowAdd(false);
              setNewColor("#7c3aed");
            }}
          >
            <div className="form-group">
              <label>Name</label>
              <input name="name" required placeholder="Mathematics" />
            </div>
            <div className="form-group">
              <label>Icon (emoji)</label>
              <input name="icon" placeholder="📐" maxLength={4} />
            </div>
            <div className="form-group">
              <label>Color</label>
              <ColorPicker value={newColor} onChange={setNewColor} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Subject</button>
            </div>
          </form>
        </Modal>
      )}

      {editingSubject && (
        <Modal title="Edit Subject" onClose={() => setEditId(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void updateSubject({
                id: editingSubject._id,
                name: fd.get("name") as string,
                color: editColor,
                icon: (fd.get("icon") as string) || undefined,
              });
              setEditId(null);
            }}
          >
            <div className="form-group">
              <label>Name</label>
              <input name="name" required defaultValue={editingSubject.name} />
            </div>
            <div className="form-group">
              <label>Icon (emoji)</label>
              <input name="icon" defaultValue={editingSubject.icon ?? ""} maxLength={4} />
            </div>
            <div className="form-group">
              <label>Color</label>
              <ColorPicker value={editColor} onChange={setEditColor} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
