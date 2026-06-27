import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { AnalyticsHeader } from "../components/analytics/AnalyticsHeader";
import { BadgeCard } from "../components/analytics/BadgeCard";
import { KpiCards } from "../components/analytics/KpiCards";
import { ProgressionChart } from "../components/analytics/ProgressionChart";
import { SubjectDistribution } from "../components/analytics/SubjectDistribution";
import { useLanguage } from "../hooks/useLanguage";
import { formatLocalDate } from "../utils/dateUtils";
import { calculateStreak, getAchievements } from "../utils/statsUtils";

type Log = Doc<"dailyLogs">;
type Task = Doc<"tasks">;
type Subject = Doc<"subjects">;

export function AnalyticsView() {
	const allLogs = useQuery(api.dailyLogs.list) as Log[] | undefined;
	const subjects = useQuery(api.subjects.list, {}) as Subject[] | undefined;
	const allTasks = useQuery(api.tasks.listAll) as Task[] | undefined;
	const { t, dateLocale } = useLanguage();

	const [timeRange, setTimeRange] = useState<7 | 30>(7);
	const [endDate, setEndDate] = useState<string>(() => formatLocalDate());
	const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
		null,
	);

	const startDate = useMemo(() => {
		const d = new Date(`${endDate}T00:00:00`);
		d.setDate(d.getDate() - (timeRange - 1));
		return formatLocalDate(d);
	}, [endDate, timeRange]);

	const adjustDate = (days: number) => {
		const d = new Date(`${endDate}T00:00:00`);
		d.setDate(d.getDate() + days);
		const todayStr = formatLocalDate();
		const newDateStr = formatLocalDate(d);
		if (newDateStr > todayStr) {
			setEndDate(todayStr);
		} else {
			setEndDate(newDateStr);
		}
	};

	const isToday = endDate === formatLocalDate();

	const periodLogs = useMemo(() => {
		if (!allLogs) return [];
		return allLogs.filter((l) => l.date >= startDate && l.date <= endDate);
	}, [allLogs, startDate, endDate]);

	const selectedSubject = useMemo(() => {
		if (!selectedSubjectId || !subjects) return null;
		return (
			subjects.find((s) => (s._id as string) === selectedSubjectId) ?? null
		);
	}, [selectedSubjectId, subjects]);

	const chartTitleText = selectedSubject
		? `Progression — ${selectedSubject.icon || "📚"} ${selectedSubject.name}`
		: t.analytics.progressionTitle;

	const stats = useMemo(() => {
		if (!allLogs || !allTasks)
			return { totalHours: 0, totalSessions: 0, completedTasks: 0, streak: 0 };

		const studySessions = periodLogs.filter(
			(l) => l.duration && l.duration > 0,
		);
		const totalMinutes = studySessions.reduce(
			(acc, l) => acc + (l.duration || 0),
			0,
		);

		const periodTasks = allTasks.filter(
			(t) => t.completed && t.date && t.date >= startDate && t.date <= endDate,
		);

		return {
			totalHours: Math.round((totalMinutes / 60) * 10) / 10,
			totalSessions: studySessions.length,
			completedTasks: periodTasks.length,
			streak: calculateStreak(allLogs, endDate),
		};
	}, [allLogs, allTasks, periodLogs, startDate, endDate]);

	const achievementsList = useMemo(() => {
		if (!allLogs || !allTasks) return [];
		const allTimeCompletedTasks = allTasks.filter((t) => t.completed).length;
		const currentStreak = calculateStreak(allLogs);
		return getAchievements(allLogs, allTimeCompletedTasks, currentStreak, t);
	}, [allLogs, allTasks, t]);

	return (
		<div>
			<AnalyticsHeader
				title={t.analytics.title}
				startDate={startDate}
				endDate={endDate}
				timeRange={timeRange}
				setTimeRange={setTimeRange}
				adjustDate={adjustDate}
				setEndDate={setEndDate}
				isToday={isToday}
				t={t}
				dateLocale={dateLocale}
			/>

			<KpiCards stats={stats} />

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
					gap: 24,
					marginBottom: 24,
				}}
			>
				<div className="card">
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: 16,
						}}
					>
						<h3
							style={{
								margin: 0,
								display: "flex",
								alignItems: "center",
								gap: 8,
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
								style={{
									width: "16px",
									height: "16px",
									color: "var(--accent-primary)",
								}}
							>
								<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
							</svg>
							<span>{chartTitleText}</span>
						</h3>
						{selectedSubjectId && (
							<button
								type="button"
								onClick={() => setSelectedSubjectId(null)}
								className="analytics-reset-btn"
							>
								{t.analytics.viewAllBtn}
							</button>
						)}
					</div>
					<ProgressionChart
						allLogs={allLogs || []}
						timeRange={timeRange}
						selectedSubjectId={selectedSubjectId}
						endDate={endDate}
					/>
				</div>
				<div className="card">
					<h3
						style={{
							marginBottom: 16,
							display: "flex",
							alignItems: "center",
							gap: 8,
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
							style={{
								width: "16px",
								height: "16px",
								color: "var(--accent-primary)",
							}}
						>
							<path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
							<path d="M22 12A10 10 0 0 0 12 2v10z" />
						</svg>
						{t.analytics.subjectDistributionTitle}
					</h3>
					<SubjectDistribution
						allLogs={periodLogs}
						subjects={subjects}
						selectedSubjectId={selectedSubjectId}
						onSelectSubject={setSelectedSubjectId}
					/>
				</div>
			</div>

			<div className="card">
				<h3
					style={{
						marginBottom: 16,
						display: "flex",
						alignItems: "center",
						gap: 8,
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
						style={{ width: "18px", height: "18px", color: "var(--warning)" }}
					>
						<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
						<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
						<path d="M4 22h16" />
						<path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
						<path d="M12 2a6 6 0 0 0-6 6v3.34c0 .87.35 1.7 1 2.34l3 3h4l3-3c.65-.64 1-1.47 1-2.34V8a6 6 0 0 0-6-6z" />
					</svg>
					{t.analytics.badgesTitle}
				</h3>
				<p
					style={{
						fontSize: "0.85rem",
						color: "var(--text-muted)",
						marginBottom: 20,
					}}
				>
					{t.analytics.badgesDesc}
				</p>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
						gap: 16,
					}}
				>
					{achievementsList.map((badge) => (
						<BadgeCard key={badge.id} badge={badge} />
					))}
				</div>
			</div>
		</div>
	);
}
