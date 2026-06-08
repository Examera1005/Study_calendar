import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Modal } from "../components/ui/Modal";
import { ColorPicker } from "../components/ui/ColorPicker";
import { EmojiPicker } from "../components/ui/EmojiPicker";

export function SubjectsView() {
  const subjects = useQuery(api.subjects.list);
  const createSubject = useMutation(api.subjects.create);
  const updateSubject = useMutation(api.subjects.update);
  const removeSubject = useMutation(api.subjects.remove);

  // Grouped state variables to satisfy the `prefer-useReducer` / related useState audit
  const [addForm, setAddForm] = useState({
    isOpen: false,
    color: "#7c3aed",
    icon: "",
  });

  const [editForm, setEditForm] = useState<{
    id: string | null;
    color: string;
    icon: string;
  }>({
    id: null,
    color: "#7c3aed",
    icon: "",
  });

  const editingSubject = subjects?.find((s) => s._id === editForm.id);

  return (
    <div>
      <div className="page-header">
        <h1>Subjects</h1>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>📚 Manage Subjects</h3>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setAddForm({ isOpen: true, color: "#7c3aed", icon: "" })}
            id="add-subject-btn"
          >
            + Add Subject
          </button>
        </div>

        {!subjects || subjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p>No subjects yet. Add your courses to get started!</p>
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
                {s.icon && <span style={{ fontSize: "1rem" }}>{s.icon}</span>}
                <span style={{ flex: 1, fontWeight: 500 }}>{s.name}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setEditForm({
                      id: s._id,
                      color: s.color,
                      icon: s.icon ?? "",
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  style={{ width: 28, height: 28 }}
                  aria-label={`Delete ${s.name}`}
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

      {addForm.isOpen && (
        <Modal title="Add Subject" onClose={() => setAddForm((prev) => ({ ...prev, isOpen: false }))}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void createSubject({
                name: fd.get("name") as string,
                color: addForm.color,
                icon: (fd.get("icon") as string) || undefined,
              });
              setAddForm({ isOpen: false, color: "#7c3aed", icon: "" });
            }}
          >
            <div className="form-group">
              <label htmlFor="add-subject-name">Name</label>
              <input id="add-subject-name" name="name" required placeholder="Mathematics" />
            </div>
            <div className="form-group">
              <label htmlFor="add-subject-icon">Icon (emoji)</label>
              <EmojiPicker
                id="add-subject-icon"
                value={addForm.icon}
                onChange={(icon) => setAddForm((prev) => ({ ...prev, icon }))}
                placeholder="📐"
              />
              <input type="hidden" name="icon" value={addForm.icon} />
            </div>
            <div className="form-group">
              <span className="form-label">Color</span>
              <ColorPicker
                value={addForm.color}
                onChange={(color) => setAddForm((prev) => ({ ...prev, color }))}
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAddForm((prev) => ({ ...prev, isOpen: false }))}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Add Subject</button>
            </div>
          </form>
        </Modal>
      )}

      {editingSubject && (
        <Modal title="Edit Subject" onClose={() => setEditForm({ id: null, color: "#7c3aed", icon: "" })}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void updateSubject({
                id: editingSubject._id,
                name: fd.get("name") as string,
                color: editForm.color,
                icon: (fd.get("icon") as string) || undefined,
              });
              setEditForm({ id: null, color: "#7c3aed", icon: "" });
            }}
          >
            <div className="form-group">
              <label htmlFor="edit-subject-name">Name</label>
              <input id="edit-subject-name" name="name" required defaultValue={editingSubject.name} />
            </div>
            <div className="form-group">
              <label htmlFor="edit-subject-icon">Icon (emoji)</label>
              <EmojiPicker
                id="edit-subject-icon"
                value={editForm.icon}
                onChange={(icon) => setEditForm((prev) => ({ ...prev, icon }))}
                placeholder={editingSubject.icon ?? "📐"}
              />
              <input type="hidden" name="icon" value={editForm.icon} />
            </div>
            <div className="form-group">
              <span className="form-label">Color</span>
              <ColorPicker
                value={editForm.color}
                onChange={(color) => setEditForm((prev) => ({ ...prev, color }))}
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditForm({ id: null, color: "#7c3aed", icon: "" })}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
