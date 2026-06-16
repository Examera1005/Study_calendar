import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { Modal } from "../components/ui/Modal";
import { SubjectBadge } from "../components/ui/SubjectBadge";
import { useLanguage } from "../hooks/useLanguage";

// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
const daysUntil = (dateStr: string, t: any) => {
	const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
	if (d < 0) return t.exams.passed;
	if (d === 0) return t.exams.today;
	if (d === 1) return t.exams.tomorrow;
	return t.exams.daysCount(d);
};

const countdownClass = (dateStr: string) => {
	const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
	if (d < 0) return "";
	if (d <= 2) return "urgent";
	if (d <= 7) return "soon";
	return "comfortable";
};

interface ExamCardProps {
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	exam: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	subj: any;
	// biome-ignore lint/suspicious/noExplicitAny: translations object
	t: any;
	// biome-ignore lint/suspicious/noExplicitAny: dateLocale
	dateLocale: any;
	// biome-ignore lint/suspicious/noExplicitAny: Convex mutation
	updateExam: any;
	setEditingExam: (exam: Doc<"exams"> | null) => void;
	// biome-ignore lint/suspicious/noExplicitAny: Convex mutation
	removeExam: any;
}

function ExamCard({
	exam,
	subj,
	t,
	dateLocale,
	updateExam,
	setEditingExam,
	removeExam,
}: ExamCardProps) {
	return (
		<div
			className="exam-card"
			style={{
				borderLeftColor: subj?.color ?? "var(--accent-primary)",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
				}}
			>
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
						<span>
							{format(new Date(exam.date), "MMM d, yyyy", {
								locale: dateLocale,
							})}
						</span>
						<span className="coeff-badge">×{exam.coefficient}</span>
					</div>
					{exam.notes && (
						<p
							style={{
								fontSize: "0.82rem",
								color: "var(--text-secondary)",
								marginTop: 4,
							}}
						>
							{exam.notes}
						</p>
					)}
					{exam.grade !== undefined && (
						<div style={{ marginTop: 6 }}>
							<span className="duration-badge">
								{t.common.grade}: {exam.grade}
							</span>
						</div>
					)}
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "flex-end",
						gap: 8,
					}}
				>
					<span className={`countdown ${countdownClass(exam.date)}`}>
						{daysUntil(exam.date, t)}
					</span>
					<div style={{ display: "flex", gap: 4 }}>
						{!exam.completed && (
							<button
								type="button"
								className="btn btn-sm btn-secondary"
								onClick={() => {
									const grade = prompt(t.exams.enterGradePrompt);
									if (grade !== null) {
										void updateExam({
											id: exam._id,
											completed: true,
											grade: Number(grade) || undefined,
										});
									}
								}}
							>
								✓ {t.common.done}
							</button>
						)}
						<button
							type="button"
							className="btn-icon"
							style={{ width: 28, height: 28 }}
							aria-label={`Edit ${exam.title}`}
							onClick={() => setEditingExam(exam)}
						>
							✏️
						</button>
						<button
							type="button"
							className="btn-icon"
							style={{ width: 28, height: 28 }}
							aria-label={`Delete ${exam.title}`}
							onClick={() => {
								if (confirm(t.exams.confirmDeleteExam)) {
									void removeExam({ id: exam._id });
								}
							}}
						>
							🗑
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

interface AddExamModalProps {
	// biome-ignore lint/suspicious/noExplicitAny: translations object
	t: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	subjects: any[] | undefined;
	setShowAdd: (v: boolean) => void;
	// biome-ignore lint/suspicious/noExplicitAny: Convex mutation
	createExam: any;
}

function AddExamModal({
	t,
	subjects,
	setShowAdd,
	createExam,
}: AddExamModalProps) {
	return (
		<Modal title={t.exams.addExam} onClose={() => setShowAdd(false)}>
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
					<label htmlFor="add-exam-title">{t.common.title}</label>
					<input
						id="add-exam-title"
						name="title"
						required
						placeholder={t.exams.finalExamPlaceholder}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="add-exam-subject">{t.common.subject}</label>
					<select id="add-exam-subject" name="subjectId" required>
						<option value="">{t.exams.selectSubjectPlaceholder}</option>
						{subjects?.map((s) => (
							<option key={s._id} value={s._id}>
								{s.icon ? `${s.icon} ` : ""}
								{s.name}
							</option>
						))}
					</select>
				</div>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 12,
					}}
				>
					<div className="form-group">
						<label htmlFor="add-exam-date">{t.common.date}</label>
						<input id="add-exam-date" name="date" type="date" required />
					</div>
					<div className="form-group">
						<label htmlFor="add-exam-coeff">{t.common.coefficient}</label>
						<input
							id="add-exam-coeff"
							name="coefficient"
							type="number"
							step="0.5"
							min="0.5"
							defaultValue="1"
							required
						/>
					</div>
				</div>
				<div className="form-group">
					<label htmlFor="add-exam-notes">
						{t.common.notes} ({t.common.optional})
					</label>
					<textarea
						id="add-exam-notes"
						name="notes"
						placeholder={t.exams.notesPlaceholder}
					/>
				</div>
				<div className="modal-actions">
					<button
						type="button"
						className="btn btn-secondary"
						onClick={() => setShowAdd(false)}
					>
						{t.common.cancel}
					</button>
					<button type="submit" className="btn btn-primary">
						{t.exams.addExam}
					</button>
				</div>
			</form>
		</Modal>
	);
}

interface EditExamModalProps {
	// biome-ignore lint/suspicious/noExplicitAny: translations object
	t: any;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	subjects: any[] | undefined;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	editingExam: any;
	setEditingExam: (exam: Doc<"exams"> | null) => void;
	// biome-ignore lint/suspicious/noExplicitAny: Convex mutation
	updateExam: any;
}

function EditExamModal({
	t,
	subjects,
	editingExam,
	setEditingExam,
	updateExam,
}: EditExamModalProps) {
	return (
		<Modal title={t.exams.editExam} onClose={() => setEditingExam(null)}>
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
					<label htmlFor="edit-exam-title">{t.common.title}</label>
					<input
						id="edit-exam-title"
						name="title"
						defaultValue={editingExam.title}
						required
						placeholder={t.exams.finalExamPlaceholder}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="edit-exam-subject">{t.common.subject}</label>
					<select
						id="edit-exam-subject"
						name="subjectId"
						defaultValue={editingExam.subjectId}
						required
					>
						<option value="">{t.exams.selectSubjectPlaceholder}</option>
						{subjects?.map((s) => (
							<option key={s._id} value={s._id}>
								{s.icon ? `${s.icon} ` : ""}
								{s.name}
							</option>
						))}
					</select>
				</div>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 12,
					}}
				>
					<div className="form-group">
						<label htmlFor="edit-exam-date">{t.common.date}</label>
						<input
							id="edit-exam-date"
							name="date"
							type="date"
							defaultValue={editingExam.date}
							required
						/>
					</div>
					<div className="form-group">
						<label htmlFor="edit-exam-coeff">{t.common.coefficient}</label>
						<input
							id="edit-exam-coeff"
							name="coefficient"
							type="number"
							step="0.5"
							min="0.5"
							defaultValue={editingExam.coefficient}
							required
						/>
					</div>
				</div>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 12,
					}}
				>
					<div className="form-group">
						<label htmlFor="edit-exam-status">{t.common.status}</label>
						<select
							id="edit-exam-status"
							name="completed"
							defaultValue={editingExam.completed ? "true" : "false"}
						>
							<option value="false">{t.common.upcoming}</option>
							<option value="true">{t.common.completed}</option>
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="edit-exam-grade">
							{t.common.grade} ({t.common.optional})
						</label>
						<input
							id="edit-exam-grade"
							name="grade"
							type="number"
							step="0.1"
							defaultValue={editingExam.grade}
							placeholder="e.g. 16"
						/>
					</div>
				</div>
				<div className="form-group">
					<label htmlFor="edit-exam-notes">
						{t.common.notes} ({t.common.optional})
					</label>
					<textarea
						id="edit-exam-notes"
						name="notes"
						defaultValue={editingExam.notes || ""}
						placeholder={t.exams.notesPlaceholder}
					/>
				</div>
				<div className="modal-actions">
					<button
						type="button"
						className="btn btn-secondary"
						onClick={() => setEditingExam(null)}
					>
						{t.common.cancel}
					</button>
					<button type="submit" className="btn btn-primary">
						{t.common.saveChanges}
					</button>
				</div>
			</form>
		</Modal>
	);
}

export function ExamsView() {
	const exams = useQuery(api.exams.list);
	const subjects = useQuery(api.subjects.list);
	const createExam = useMutation(api.exams.create);
	const updateExam = useMutation(api.exams.update);
	const removeExam = useMutation(api.exams.remove);
	const [showAdd, setShowAdd] = useState(false);
	const [editingExam, setEditingExam] = useState<Doc<"exams"> | null>(null);
	// biome-ignore lint/correctness/noUnusedVariables: Dynamic Convex API / third-party type
	const { t, language, dateLocale } = useLanguage();

	const getSubject = (id: string) => subjects?.find((s) => s._id === id);

	const sorted = (exams ?? []).toSorted(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);

	return (
		<div>
			<div className="page-header">
				<h1>{t.exams.title}</h1>
				<button
					type="button"
					className="btn btn-primary"
					onClick={() => setShowAdd(true)}
					id="add-exam-btn"
				>
					+ {t.exams.addExam}
				</button>
			</div>

			{(!subjects || subjects.length === 0) && (
				<div
					className="card"
					style={{
						marginBottom: 16,
						border: "1px solid var(--warning)",
						background: "var(--accent-light)",
						color: "var(--warning)",
					}}
				>
					<p style={{ fontSize: "0.88rem", fontWeight: 500 }}>
						{t.exams.createSubjectWarning}
					</p>
				</div>
			)}

			{sorted.length === 0 ? (
				<div className="card">
					<div className="empty-state">
						<div className="empty-icon">🎯</div>
						<p>{t.exams.noExamsYet}</p>
					</div>
				</div>
			) : (
				<div className="card-grid">
					{sorted.map((exam) => {
						const subj = getSubject(exam.subjectId);
						return (
							<ExamCard
								key={exam._id}
								exam={exam}
								subj={subj}
								t={t}
								dateLocale={dateLocale}
								updateExam={updateExam}
								setEditingExam={setEditingExam}
								removeExam={removeExam}
							/>
						);
					})}
				</div>
			)}

			{showAdd && subjects && subjects.length > 0 && (
				<AddExamModal
					t={t}
					subjects={subjects}
					setShowAdd={setShowAdd}
					createExam={createExam}
				/>
			)}
			{editingExam && subjects && subjects.length > 0 && (
				<EditExamModal
					t={t}
					subjects={subjects}
					editingExam={editingExam}
					setEditingExam={setEditingExam}
					updateExam={updateExam}
				/>
			)}
		</div>
	);
}
