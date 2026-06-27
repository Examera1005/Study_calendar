import { useMutation, useQuery } from "convex/react";
import { addDays, format, subDays } from "date-fns";
import { useMemo, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { Modal } from "../components/ui/Modal";
import { SubjectBadge } from "../components/ui/SubjectBadge";
import { useLanguage } from "../hooks/useLanguage";
import { formatDuration, formatLocalDate } from "../utils/dateUtils";

interface DailyLogHeaderProps {
	logsCount: number;
	totalMinutes: number;
	setShowAdd: (v: boolean) => void;
	// biome-ignore lint/suspicious/noExplicitAny: translations object
	t: any;
}

function DailyLogHeader({
	logsCount,
	totalMinutes,
	setShowAdd,
	t,
}: DailyLogHeaderProps) {
	return (
		<div className="page-header">
			<div>
				<h1>{t.dailyLog.title}</h1>
				<div className="date-display">
					{t.dailyLog.entriesCount(logsCount)} ·{" "}
					{totalMinutes > 0
						? t.dailyLog.studiedTime(formatDuration(totalMinutes))
						: t.dailyLog.noStudyTimeLogged}
				</div>
			</div>
			<button
				type="button"
				className="btn btn-primary"
				onClick={() => setShowAdd(true)}
				id="add-log-btn"
			>
				{t.dailyLog.addEntryBtn}
			</button>
		</div>
	);
}

interface DailyLogDateNavProps {
	selectedDate: string;
	setSelectedDate: (d: string) => void;
	navDate: (dir: number) => void;
	// biome-ignore lint/suspicious/noExplicitAny: dateLocale
	dateLocale: any;
	// biome-ignore lint/suspicious/noExplicitAny: translations object
	t: any;
}

function DailyLogDateNav({
	selectedDate,
	setSelectedDate,
	navDate,
	dateLocale,
	t,
}: DailyLogDateNavProps) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 12,
				marginBottom: 20,
			}}
		>
			<button
				type="button"
				className="btn-icon"
				aria-label={t.tasks.prevDay}
				onClick={() => navDate(-1)}
			>
				◀
			</button>
			<h2 style={{ fontSize: "1.1rem" }}>
				{format(new Date(`${selectedDate}T00:00:00`), t.common.dateFormatLong, {
					locale: dateLocale,
				})}
			</h2>
			<button
				type="button"
				className="btn-icon"
				aria-label={t.tasks.nextDay}
				onClick={() => navDate(1)}
			>
				▶
			</button>
			<button
				type="button"
				className="btn btn-secondary btn-sm"
				onClick={() => setSelectedDate(formatLocalDate())}
			>
				{t.common.today}
			</button>
		</div>
	);
}

interface DailyLogAddModalProps {
	selectedDate: string;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	subjects: any[] | undefined;
	setShowAdd: (v: boolean) => void;
	// biome-ignore lint/suspicious/noExplicitAny: Convex mutation
	createLog: any;
	// biome-ignore lint/suspicious/noExplicitAny: translations object
	t: any;
}

function DailyLogAddModal({
	selectedDate,
	subjects,
	setShowAdd,
	createLog,
	t,
}: DailyLogAddModalProps) {
	return (
		<Modal title={t.calendar.addLog} onClose={() => setShowAdd(false)}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					void createLog({
						date: selectedDate,
						content: fd.get("content") as string,
						duration: fd.get("duration")
							? Number(fd.get("duration"))
							: undefined,
						subjectId: fd.get("subjectId")
							? (fd.get("subjectId") as Id<"subjects">)
							: undefined,
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
					<input
						id="add-log-duration"
						name="duration"
						type="number"
						min="1"
						placeholder="45"
					/>
				</div>
				{subjects && subjects.length > 0 && (
					<div className="form-group">
						<label htmlFor="add-log-subject">
							{t.tasks.subjectLabelOptional}
						</label>
						<select id="add-log-subject" name="subjectId" defaultValue="">
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
					<button
						type="button"
						className="btn btn-secondary"
						onClick={() => setShowAdd(false)}
					>
						{t.common.cancel}
					</button>
					<button type="submit" className="btn btn-primary">
						{t.common.add}
					</button>
				</div>
			</form>
		</Modal>
	);
}

interface DailyLogEditModalProps {
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	editingLog: any;
	setEditingLog: (v: Doc<"dailyLogs"> | null) => void;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	subjects: any[] | undefined;
	// biome-ignore lint/suspicious/noExplicitAny: Convex mutation
	updateLog: any;
	// biome-ignore lint/suspicious/noExplicitAny: translations object
	t: any;
}

function DailyLogEditModal({
	editingLog,
	setEditingLog,
	subjects,
	updateLog,
	t,
}: DailyLogEditModalProps) {
	return (
		<Modal title={t.calendar.editLog} onClose={() => setEditingLog(null)}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const fd = new FormData(e.currentTarget);
					void updateLog({
						id: editingLog._id,
						content: fd.get("content") as string,
						duration: fd.get("duration")
							? Number(fd.get("duration"))
							: undefined,
						subjectId: fd.get("subjectId")
							? (fd.get("subjectId") as Id<"subjects">)
							: undefined,
					});
					setEditingLog(null);
				}}
			>
				<div className="form-group">
					<label htmlFor="edit-log-content">{t.dailyLog.whatDidYouStudy}</label>
					<textarea
						id="edit-log-content"
						name="content"
						defaultValue={editingLog.content}
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="edit-log-duration">
						{t.dailyLog.durationMinutes}
					</label>
					<input
						id="edit-log-duration"
						name="duration"
						type="number"
						min="1"
						defaultValue={editingLog.duration}
					/>
				</div>
				{subjects && subjects.length > 0 && (
					<div className="form-group">
						<label htmlFor="edit-log-subject">{t.tasks.subjectLabel}</label>
						<select
							id="edit-log-subject"
							name="subjectId"
							defaultValue={editingLog.subjectId || ""}
						>
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
					<button
						type="button"
						className="btn btn-secondary"
						onClick={() => setEditingLog(null)}
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

interface DailyLogSearchTabProps {
	allLogs: Doc<"dailyLogs">[] | undefined;
	subjects: Doc<"subjects">[] | undefined;
	getSubject: (id: string) => Doc<"subjects"> | undefined;
	setEditingLog: (log: Doc<"dailyLogs">) => void;
	// biome-ignore lint/suspicious/noExplicitAny: mutation function
	removeLog: any;
	sortedLogs: Doc<"dailyLogs">[];
	searchFilters: {
		query: string;
		subject: string;
		sortBy: "dateDesc" | "dateAsc" | "durationDesc" | "durationAsc";
	};
	setSearchFilters: React.Dispatch<
		React.SetStateAction<{
			query: string;
			subject: string;
			sortBy: "dateDesc" | "dateAsc" | "durationDesc" | "durationAsc";
		}>
	>;
	// biome-ignore lint/suspicious/noExplicitAny: translations object
	t: any;
	// biome-ignore lint/suspicious/noExplicitAny: dateLocale
	dateLocale: any;
}

function DailyLogSearchTab({
	allLogs,
	subjects,
	getSubject,
	setEditingLog,
	removeLog,
	sortedLogs,
	searchFilters,
	setSearchFilters,
	t,
	dateLocale,
}: DailyLogSearchTabProps) {
	return (
		<>
			<div className="log-filters-container">
				<div className="log-search-wrapper">
					<span className="log-search-icon">🔍</span>
					<input
						id="log-search-input"
						type="text"
						className="log-search-input"
						placeholder={t.dailyLog.searchPlaceholder}
						aria-label={t.dailyLog.searchPlaceholder}
						value={searchFilters.query}
						onChange={(e) =>
							setSearchFilters((prev) => ({ ...prev, query: e.target.value }))
						}
					/>
				</div>
				<div className="log-filter-select-wrapper">
					<select
						id="log-subject-filter"
						value={searchFilters.subject}
						onChange={(e) =>
							setSearchFilters((prev) => ({ ...prev, subject: e.target.value }))
						}
					>
						<option value="">{t.dailyLog.allSubjectsOption}</option>
						{subjects?.map((s) => (
							<option key={s._id} value={s._id}>
								{s.icon ? `${s.icon} ` : ""}
								{s.name}
							</option>
						))}
					</select>
				</div>
				<div className="log-filter-select-wrapper">
					<select
						id="log-sort-by"
						value={searchFilters.sortBy}
						onChange={(e) =>
							setSearchFilters((prev) => ({
								...prev,
								sortBy: e.target.value as typeof searchFilters.sortBy,
							}))
						}
					>
						<option value="dateDesc">{t.dailyLog.sortDateDesc}</option>
						<option value="dateAsc">{t.dailyLog.sortDateAsc}</option>
						<option value="durationDesc">{t.dailyLog.sortDurationDesc}</option>
						<option value="durationAsc">{t.dailyLog.sortDurationAsc}</option>
					</select>
				</div>
			</div>

			<div className="card">
				{!allLogs ? (
					<div className="empty-state">{t.common.loading}</div>
				) : sortedLogs.length === 0 ? (
					<div className="empty-state">
						<div className="empty-icon">🔍</div>
						<p>{t.dailyLog.noResults}</p>
					</div>
				) : (
					sortedLogs.map((log) => {
						const subj = log.subjectId ? getSubject(log.subjectId) : null;
						return (
							<div
								key={log._id}
								className="log-entry"
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
								}}
							>
								<div>
									<div className="log-content">{log.content}</div>
									<div className="log-meta">
										<span className="duration-badge">
											📅{" "}
											{format(
												new Date(`${log.date}T00:00:00`),
												t.common.dateFormatShort,
												{ locale: dateLocale },
											)}
										</span>
										{subj && (
											<SubjectBadge
												name={subj.name}
												color={subj.color}
												icon={subj.icon}
											/>
										)}
										{log.duration && (
											<span className="duration-badge">
												⏱ {log.duration}
												{t.common.minutesUnit}
											</span>
										)}
									</div>
								</div>
								<div
									className="item-actions"
									style={{ display: "flex", gap: 4 }}
								>
									<button
										type="button"
										className="btn-icon"
										style={{ width: 28, height: 28 }}
										aria-label={`${t.common.edit}: ${log.content}`}
										onClick={() => setEditingLog(log)}
									>
										✏️
									</button>
									<button
										type="button"
										className="btn-icon"
										style={{ width: 28, height: 28 }}
										aria-label={`${t.common.delete}: ${log.content}`}
										onClick={() => void removeLog({ id: log._id })}
									>
										🗑
									</button>
								</div>
							</div>
						);
					})
				)}
			</div>
		</>
	);
}

export function DailyLogView({
	selectedDate,
	setSelectedDate,
}: {
	selectedDate: string;
	setSelectedDate: (d: string) => void;
}) {
	// biome-ignore lint/correctness/noUnusedVariables: Dynamic Convex API / third-party type
	const { t, language, dateLocale } = useLanguage();
	const logs = useQuery(api.dailyLogs.getByDate, { date: selectedDate });
	const allLogs = useQuery(api.dailyLogs.list);
	const subjects = useQuery(api.subjects.list);
	const createLog = useMutation(api.dailyLogs.create);
	const removeLog = useMutation(api.dailyLogs.remove);
	const updateLog = useMutation(api.dailyLogs.update);

	const [activeTab, setActiveTab] = useState<"byDate" | "search">("byDate");
	const [showAdd, setShowAdd] = useState(false);
	const [editingLog, setEditingLog] = useState<Doc<"dailyLogs"> | null>(null);
	const [searchFilters, setSearchFilters] = useState({
		query: "",
		subject: "",
		sortBy: "dateDesc" as
			| "dateDesc"
			| "dateAsc"
			| "durationDesc"
			| "durationAsc",
	});

	const getSubject = useMemo(() => {
		return (id: string) => subjects?.find((s) => s._id === id);
	}, [subjects]);

	const totalMinutes = logs?.reduce((a, l) => a + (l.duration ?? 0), 0) ?? 0;

	// ponytail: perform search and sort filtering in-memory to keep code lazy and responsive
	const filteredLogs = useMemo(() => {
		if (!allLogs) return [];
		return allLogs.filter((log) => {
			if (searchFilters.subject && log.subjectId !== searchFilters.subject) {
				return false;
			}
			if (searchFilters.query.trim()) {
				const query = searchFilters.query.toLowerCase();
				const contentMatches = log.content.toLowerCase().includes(query);
				const subj = log.subjectId ? getSubject(log.subjectId) : null;
				const subjectMatches = subj
					? subj.name.toLowerCase().includes(query)
					: false;
				return contentMatches || subjectMatches;
			}
			return true;
		});
	}, [allLogs, searchFilters.subject, searchFilters.query, getSubject]);

	const sortedLogs = useMemo(() => {
		return filteredLogs.toSorted((a, b) => {
			if (searchFilters.sortBy === "dateDesc") {
				const dateComp = b.date.localeCompare(a.date);
				if (dateComp !== 0) return dateComp;
				return b._creationTime - a._creationTime;
			}
			if (searchFilters.sortBy === "dateAsc") {
				const dateComp = a.date.localeCompare(b.date);
				if (dateComp !== 0) return dateComp;
				return a._creationTime - b._creationTime;
			}
			if (searchFilters.sortBy === "durationDesc") {
				return (b.duration ?? 0) - (a.duration ?? 0);
			}
			if (searchFilters.sortBy === "durationAsc") {
				return (a.duration ?? 0) - (b.duration ?? 0);
			}
			return 0;
		});
	}, [filteredLogs, searchFilters.sortBy]);

	const searchTotalMinutes = useMemo(() => {
		return sortedLogs.reduce((a, l) => a + (l.duration ?? 0), 0);
	}, [sortedLogs]);

	const navDate = (dir: number) => {
		const d =
			dir > 0
				? addDays(new Date(selectedDate), 1)
				: subDays(new Date(selectedDate), 1);
		setSelectedDate(format(d, "yyyy-MM-dd"));
	};

	const displayCount =
		activeTab === "byDate" ? (logs?.length ?? 0) : sortedLogs.length;
	const displayMinutes =
		activeTab === "byDate" ? totalMinutes : searchTotalMinutes;

	return (
		<div>
			<DailyLogHeader
				logsCount={displayCount}
				totalMinutes={displayMinutes}
				setShowAdd={setShowAdd}
				t={t}
			/>

			<div className="task-tabs" style={{ marginBottom: 20 }}>
				<button
					type="button"
					className={`task-tab ${activeTab === "byDate" ? "active" : ""}`}
					onClick={() => setActiveTab("byDate")}
					id="log-tab-by-date"
				>
					<span className="task-tab-icon">📅</span>
					{t.dailyLog.byDateTab}
				</button>
				<button
					type="button"
					className={`task-tab ${activeTab === "search" ? "active" : ""}`}
					onClick={() => setActiveTab("search")}
					id="log-tab-search"
				>
					<span className="task-tab-icon">🔍</span>
					{t.dailyLog.allLogsTab}
				</button>
			</div>

			{activeTab === "byDate" ? (
				<>
					<DailyLogDateNav
						selectedDate={selectedDate}
						setSelectedDate={setSelectedDate}
						navDate={navDate}
						dateLocale={dateLocale}
						t={t}
					/>

					<div className="card">
						{!logs || logs.length === 0 ? (
							<div className="empty-state">
								<div className="empty-icon">✏️</div>
								<p>{t.dailyLog.noStudyEntriesForDay}</p>
								<button
									type="button"
									className="btn btn-primary"
									style={{ marginTop: 12 }}
									onClick={() => setShowAdd(true)}
								>
									{t.dailyLog.logFirstSession}
								</button>
							</div>
						) : (
							logs.map((log) => {
								const subj = log.subjectId ? getSubject(log.subjectId) : null;
								return (
									<div
										key={log._id}
										className="log-entry"
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start",
										}}
									>
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
												{log.duration && (
													<span className="duration-badge">
														⏱ {log.duration}
														{t.common.minutesUnit}
													</span>
												)}
											</div>
										</div>
										<div
											className="item-actions"
											style={{ display: "flex", gap: 4 }}
										>
											<button
												type="button"
												className="btn-icon"
												style={{ width: 28, height: 28 }}
												aria-label={`${t.common.edit}: ${log.content}`}
												onClick={() => setEditingLog(log)}
											>
												✏️
											</button>
											<button
												type="button"
												className="btn-icon"
												style={{ width: 28, height: 28 }}
												aria-label={`${t.common.delete}: ${log.content}`}
												onClick={() => void removeLog({ id: log._id })}
											>
												🗑
											</button>
										</div>
									</div>
								);
							})
						)}
					</div>
				</>
			) : (
				<DailyLogSearchTab
					allLogs={allLogs}
					subjects={subjects}
					getSubject={getSubject}
					setEditingLog={setEditingLog}
					removeLog={removeLog}
					sortedLogs={sortedLogs}
					searchFilters={searchFilters}
					setSearchFilters={setSearchFilters}
					t={t}
					dateLocale={dateLocale}
				/>
			)}

			{showAdd && (
				<DailyLogAddModal
					selectedDate={selectedDate}
					subjects={subjects}
					setShowAdd={setShowAdd}
					createLog={createLog}
					t={t}
				/>
			)}

			{editingLog && (
				<DailyLogEditModal
					editingLog={editingLog}
					setEditingLog={setEditingLog}
					subjects={subjects}
					updateLog={updateLog}
					t={t}
				/>
			)}
		</div>
	);
}
