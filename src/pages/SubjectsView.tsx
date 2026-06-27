import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { ColorPicker } from "../components/ui/ColorPicker";
import { EmojiPicker } from "../components/ui/EmojiPicker";
import { Modal } from "../components/ui/Modal";
import { useLanguage } from "../hooks/useLanguage";
import type { TranslationSchema } from "../i18n/translations";

interface SubjectRowProps {
	subject: Doc<"subjects">;
	onEdit: (s: Doc<"subjects">) => void;
	onArchive: (id: Doc<"subjects">["_id"], archived: boolean) => void;
	onDelete: (s: Doc<"subjects">) => void;
	t: TranslationSchema;
	archived?: boolean;
}

function SubjectRow({
	subject: s,
	onEdit,
	onArchive,
	onDelete,
	t,
	archived,
}: SubjectRowProps) {
	return (
		<div className={`subject-row${archived ? " subject-row--archived" : ""}`}>
			<div className="subject-dot" style={{ background: s.color }} />
			{s.icon && <span>{s.icon}</span>}
			<span className="subject-name">{s.name}</span>
			{!archived && (
				<button
					type="button"
					className="btn btn-ghost btn-sm"
					onClick={() => onEdit(s)}
				>
					{t.common.edit}
				</button>
			)}
			<button
				type="button"
				className="btn btn-ghost btn-sm"
				onClick={() =>
					archived
						? onArchive(s._id, false)
						: confirm(t.subjects.confirmArchiveSubject(s.name)) &&
							onArchive(s._id, true)
				}
				id={`${archived ? "unarchive" : "archive"}-subject-${s._id}`}
			>
				{archived ? `↩️ ${t.subjects.unarchive}` : `📦 ${t.subjects.archive}`}
			</button>
			<button
				type="button"
				className="btn-icon"
				style={{ width: 28, height: 28 }}
				aria-label={`${t.common.delete} ${s.name}`}
				onClick={() => onDelete(s)}
			>
				🗑
			</button>
		</div>
	);
}

interface SubjectFormModalProps {
	title: string;
	onClose: () => void;
	onSubmit: (name: string, color: string, icon: string | undefined) => void;
	submitLabel: string;
	t: TranslationSchema;
	defaultName?: string;
	defaultColor?: string;
	defaultIcon?: string;
}

function SubjectFormModal({
	title,
	onClose,
	onSubmit,
	submitLabel,
	t,
	defaultName,
	defaultColor = "#7c3aed",
	defaultIcon = "",
}: SubjectFormModalProps) {
	const [color, setColor] = useState(defaultColor);
	const [icon, setIcon] = useState(defaultIcon);

	return (
		<Modal title={title} onClose={onClose}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					onSubmit(fd.get("name") as string, color, icon || undefined);
				}}
			>
				<div className="form-group">
					<label htmlFor="subject-form-name">
						{t.subjects.subjectNameLabel}
					</label>
					<input
						id="subject-form-name"
						name="name"
						required
						defaultValue={defaultName}
						placeholder={t.subjects.subjectNamePlaceholder}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="subject-form-icon">
						{t.subjects.subjectIconLabel}
					</label>
					<EmojiPicker
						id="subject-form-icon"
						value={icon}
						onChange={setIcon}
						placeholder={defaultIcon || "📐"}
					/>
					<input type="hidden" name="icon" value={icon} />
				</div>
				<div className="form-group">
					<span className="form-label">{t.subjects.subjectColorLabel}</span>
					<ColorPicker value={color} onChange={setColor} />
				</div>
				<div className="modal-actions">
					<button type="button" className="btn btn-secondary" onClick={onClose}>
						{t.common.cancel}
					</button>
					<button type="submit" className="btn btn-primary">
						{submitLabel}
					</button>
				</div>
			</form>
		</Modal>
	);
}

export function SubjectsView() {
	const { t } = useLanguage();
	// ponytail: fetch all subjects (including archived) only in SubjectsView
	const subjects = useQuery(api.subjects.list, { includeArchived: true });
	const createSubject = useMutation(api.subjects.create);
	const updateSubject = useMutation(api.subjects.update);
	const removeSubject = useMutation(api.subjects.remove);
	const archiveSubject = useMutation(api.subjects.archive);

	const [showAdd, setShowAdd] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const editingSubject = subjects?.find((s) => s._id === editingId);
	const activeSubjects = subjects?.filter((s) => !s.archived) ?? [];
	const archivedSubjects = subjects?.filter((s) => s.archived) ?? [];

	const handleArchive = (id: Doc<"subjects">["_id"], archived: boolean) => {
		void archiveSubject({ id, archived });
	};

	const handleDelete = (s: Doc<"subjects">) => {
		if (confirm(t.subjects.confirmDeleteSubject(s.name))) {
			void removeSubject({ id: s._id });
		}
	};

	return (
		<div>
			<div className="page-header">
				<h1>{t.subjects.title}</h1>
			</div>

			<div className="card">
				<div className="card-header">
					<h3>📚 {t.subjects.title}</h3>
					<button
						type="button"
						className="btn btn-primary btn-sm"
						onClick={() => setShowAdd(true)}
						id="add-subject-btn"
					>
						+ {t.subjects.addSubject}
					</button>
				</div>

				{activeSubjects.length === 0 ? (
					<div className="empty-state">
						<div className="empty-icon">📚</div>
						<p>{t.subjects.noSubjectsYet}</p>
					</div>
				) : (
					<div className="subject-list">
						{activeSubjects.map((s) => (
							<SubjectRow
								key={s._id}
								subject={s}
								onEdit={(sub) => setEditingId(sub._id)}
								onArchive={handleArchive}
								onDelete={handleDelete}
								t={t}
							/>
						))}
					</div>
				)}
			</div>

			{archivedSubjects.length > 0 && (
				<div className="card" style={{ marginTop: 24 }}>
					<div className="card-header">
						<h3>📦 {t.subjects.archivedSubjects}</h3>
					</div>
					<div className="subject-list">
						{archivedSubjects.map((s) => (
							<SubjectRow
								key={s._id}
								subject={s}
								onEdit={() => {}}
								onArchive={handleArchive}
								onDelete={handleDelete}
								t={t}
								archived
							/>
						))}
					</div>
				</div>
			)}

			{showAdd && (
				<SubjectFormModal
					title={t.subjects.createSubjectTitle}
					onClose={() => setShowAdd(false)}
					onSubmit={(name, color, icon) => {
						void createSubject({ name, color, icon });
						setShowAdd(false);
					}}
					submitLabel={t.subjects.addSubject}
					t={t}
				/>
			)}

			{editingSubject && (
				<SubjectFormModal
					title={t.subjects.editSubjectTitle}
					onClose={() => setEditingId(null)}
					onSubmit={(name, color, icon) => {
						void updateSubject({ id: editingSubject._id, name, color, icon });
						setEditingId(null);
					}}
					submitLabel={t.common.save}
					t={t}
					defaultName={editingSubject.name}
					defaultColor={editingSubject.color}
					defaultIcon={editingSubject.icon ?? ""}
				/>
			)}
		</div>
	);
}
