import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { useLanguage } from "../../hooks/useLanguage";
import { formatLocalDate } from "../../utils/dateUtils";
import { Modal } from "../ui/Modal";

type Props = {
	defaultMinutes: number;
	subjects: Doc<"subjects">[] | undefined;
	onClose: () => void;
	onSaved?: () => void;
};

export function SaveTimerModal({
	defaultMinutes,
	subjects,
	onClose,
	onSaved,
}: Props) {
	const [sessionMinutes, setSessionMinutes] = useState(defaultMinutes);
	const createLog = useMutation(api.dailyLogs.create);
	const { t } = useLanguage();

	return (
		<Modal title={t.dailyLog.logStudySession} onClose={onClose}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					const duration = Number(fd.get("duration")) || sessionMinutes;
					void createLog({
						date: formatLocalDate(),
						content: fd.get("content") as string,
						duration,
						subjectId: fd.get("subjectId")
							? (fd.get("subjectId") as Id<"subjects">)
							: undefined,
					});
					onSaved?.();
					onClose();
				}}
			>
				<div style={{ textAlign: "center", marginBottom: 20 }}>
					<div
						style={{
							fontSize: "0.85rem",
							color: "var(--text-muted)",
							marginBottom: 8,
						}}
					>
						{t.dailyLog.adjustStudyTime}
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 8,
						}}
					>
						<input
							type="number"
							name="duration"
							min="1"
							value={sessionMinutes}
							onChange={(e) =>
								setSessionMinutes(Math.max(1, Number(e.target.value)))
							}
							aria-label="Study duration in minutes"
							className="session-duration-input"
							required
						/>
						<span
							style={{
								fontSize: "1.2rem",
								fontWeight: 700,
								color: "var(--text-secondary)",
							}}
						>
							{t.common.minutesUnit}
						</span>
					</div>
				</div>
				<div className="form-group">
					<label htmlFor="session-log-content">
						{t.dailyLog.whatDidYouStudy}
					</label>
					<textarea
						id="session-log-content"
						name="content"
						required
						placeholder={t.dailyLog.summaryPlaceholder}
						rows={3}
					/>
				</div>
				{subjects && subjects.length > 0 && (
					<div className="form-group">
						<label htmlFor="session-log-subject">{t.sidebar.subjects}</label>
						<select id="session-log-subject" name="subjectId" defaultValue="">
							<option value="">{t.common.none}</option>
							{subjects.map((s) => (
								<option key={s._id} value={s._id}>
									{s.icon ? `${s.icon} ` : ""}
									{s.name}
								</option>
							))}
						</select>
					</div>
				)}
				<div className="modal-actions">
					<button type="button" className="btn btn-secondary" onClick={onClose}>
						{t.dailyLog.discard}
					</button>
					<button type="submit" className="btn btn-primary">
						{t.dailyLog.saveLog}
					</button>
				</div>
			</form>
		</Modal>
	);
}
