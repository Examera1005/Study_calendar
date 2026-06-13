import { useQuery } from "convex/react";
import { format } from "date-fns";
import { useMemo } from "react";
import { api } from "../../convex/_generated/api";
import type { View } from "../App";
import { DashboardCardGrid } from "../components/dashboard/DashboardCardGrid";
import {
	PercentageBadge,
	WeeklyActivityChart,
} from "../components/dashboard/WeeklyActivityChart";
import { useLanguage } from "../hooks/useLanguage";
import { formatDuration, formatLocalDate } from "../utils/dateUtils";
import { calculateStreak } from "../utils/statsUtils";

interface DashboardHeaderProps {
	// biome-ignore lint/suspicious/noExplicitAny: translations object
	t: any;
	activeDate: string;
	today: string;
	dateFormat: string;
	// biome-ignore lint/suspicious/noExplicitAny: dateLocale is standard date-fns locale
	dateLocale: any;
	setSelectedDate: (d: string) => void;
}

function DashboardHeader({
	t,
	activeDate,
	today,
	dateFormat,
	dateLocale,
	setSelectedDate,
}: DashboardHeaderProps) {
	return (
		<div className="page-header">
			<div>
				<h1>{t.dashboard.title}</h1>
				<div
					className="date-display"
					style={{
						display: "flex",
						alignItems: "center",
						gap: 12,
						flexWrap: "wrap",
						minHeight: "32px",
					}}
				>
					<span>
						{format(new Date(`${activeDate}T00:00:00`), dateFormat, {
							locale: dateLocale,
						})}
					</span>
					{activeDate !== today && (
						<button
							type="button"
							className="btn btn-ghost btn-sm"
							onClick={() => setSelectedDate(today)}
							style={{
								padding: "4px 8px",
								fontSize: "0.75rem",
								border: "1px solid var(--border-medium)",
								borderRadius: "var(--radius-sm)",
								background: "var(--bg-glass)",
								color: "var(--text-primary)",
								cursor: "pointer",
							}}
						>
							{t.dashboard.returnToday}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

interface DashboardStatsRowProps {
	// biome-ignore lint/suspicious/noExplicitAny: translations object
	t: any;
	activeDate: string;
	today: string;
	// biome-ignore lint/suspicious/noExplicitAny: Convex query result
	upcomingExams: any;
	completedTasks: number;
	totalTasks: number;
	setView: (v: View) => void;
	streak: number;
	totalMinutes: number;
	// biome-ignore lint/suspicious/noExplicitAny: Convex query result
	yesterdayLogs: any;
	todayChangePct: number;
}

function DashboardStatsRow({
	t,
	activeDate,
	today,
	upcomingExams,
	completedTasks,
	totalTasks,
	setView,
	streak,
	totalMinutes,
	yesterdayLogs,
	todayChangePct,
}: DashboardStatsRowProps) {
	return (
		<div className="stats-row">
			<div className="stat-card">
				<div className="stat-value">{upcomingExams?.length ?? 0}</div>
				<div className="stat-label">{t.dashboard.upcomingExams}</div>
			</div>
			<div className="stat-card">
				<div className="stat-value">
					{completedTasks}/{totalTasks}
				</div>
				<div className="stat-label">
					{activeDate === today
						? t.dashboard.todaysTasks
						: t.dashboard.tasksOfDay}
				</div>
			</div>
			<button
				type="button"
				className="stat-card stat-card-button"
				onClick={() => setView("analytics")}
			>
				<div
					className="stat-value"
					style={{ display: "flex", alignItems: "center", gap: 8 }}
				>
					{/** biome-ignore lint/a11y/noSvgWithoutTitle: Dynamic Convex API / third-party type */}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						style={{ width: "22px", height: "22px", color: "var(--warning)" }}
					>
						<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
					</svg>
					<span>
						{streak}{" "}
						{streak > 1
							? t.dashboard.streakDayPlural
							: t.dashboard.streakDaySingular}
					</span>
				</div>
				<div className="stat-label">{t.dashboard.studyStreak}</div>
			</button>
			<div className="stat-card">
				<div
					className="stat-value"
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<span>{formatDuration(totalMinutes, { showZero: "0h" })}</span>
					{yesterdayLogs !== undefined && (
						<PercentageBadge pct={todayChangePct} />
					)}
				</div>
				<div
					className="stat-label"
					style={{ display: "flex", justifyContent: "space-between" }}
				>
					<span>
						{activeDate === today
							? t.dashboard.studyTimeToday
							: t.dashboard.studyTimeDay}
					</span>
					{yesterdayLogs !== undefined && (
						<span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
							{activeDate === today
								? t.dashboard.vsYesterday
								: t.dashboard.vsPreviousDay}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

export function Dashboard({
	setView,
	selectedDate,
	setSelectedDate,
}: {
	setView: (v: View) => void;
	selectedDate: string;
	setSelectedDate: (d: string) => void;
}) {
	// biome-ignore lint/correctness/noUnusedVariables: Dynamic Convex API / third-party type
	const { t, language, dateLocale } = useLanguage();
	const dateFormat = t.common.dateFormatLong;

	const today = formatLocalDate();
	const activeDate = selectedDate || today;
	const yesterday = (() => {
		const d = new Date(`${activeDate}T00:00:00`);
		d.setDate(d.getDate() - 1);
		return formatLocalDate(d);
	})();

	const upcomingExams = useQuery(api.exams.upcoming, { limit: 5 });
	const todayTasks = useQuery(api.tasks.getByDate, { date: activeDate });
	const generalTasks = useQuery(api.tasks.listGeneral);
	const todayLogs = useQuery(api.dailyLogs.getByDate, { date: activeDate });
	const yesterdayLogs = useQuery(api.dailyLogs.getByDate, { date: yesterday });
	const todayEvents = useQuery(api.events.getByDate, { date: activeDate });
	const subjects = useQuery(api.subjects.list);
	const allLogs = useQuery(api.dailyLogs.list);
	const streak = calculateStreak(allLogs || []);

	const getSubject = (id: string) => subjects?.find((s) => s._id === id);

	const comparisonData = useMemo(() => {
		if (!allLogs)
			return {
				totalChangePct: 0,
				subjectChanges: {} as Record<string, number>,
				prevTotal: 0,
				currentTotal: 0,
			};

		// Current 7 days: today to 6 days ago
		const currentWeekDates = Array.from({ length: 7 }, (_, i) => {
			const d = new Date();
			d.setDate(d.getDate() - (6 - i));
			return formatLocalDate(d);
		});

		// Previous 7 days: 7 days ago to 13 days ago
		const prevWeekDates = Array.from({ length: 7 }, (_, i) => {
			const d = new Date();
			d.setDate(d.getDate() - (13 - i));
			return formatLocalDate(d);
		});

		let currentTotal = 0;
		let prevTotal = 0;

		const currentSubjectTotals: Record<string, number> = {};
		const prevSubjectTotals: Record<string, number> = {};

		allLogs.forEach((log) => {
			const dur = log.duration ?? 0;
			if (dur <= 0) return;

			const subId = log.subjectId || "uncategorized";

			if (currentWeekDates.includes(log.date)) {
				currentTotal += dur;
				currentSubjectTotals[subId] = (currentSubjectTotals[subId] || 0) + dur;
			} else if (prevWeekDates.includes(log.date)) {
				prevTotal += dur;
				prevSubjectTotals[subId] = (prevSubjectTotals[subId] || 0) + dur;
			}
		});

		// Calculate overall percentage change
		let totalChangePct = 0;
		if (prevTotal > 0) {
			totalChangePct = Math.round(
				((currentTotal - prevTotal) / prevTotal) * 100,
			);
		} else if (currentTotal > 0) {
			totalChangePct = 100;
		}

		// Calculate subject-specific percentage changes
		const subjectChanges: Record<string, number> = {};
		const allSubjectIds = new Set([
			...Object.keys(currentSubjectTotals),
			...Object.keys(prevSubjectTotals),
		]);
		allSubjectIds.forEach((subId) => {
			const currSub = currentSubjectTotals[subId] || 0;
			const prevSub = prevSubjectTotals[subId] || 0;

			if (prevSub > 0) {
				subjectChanges[subId] = Math.round(
					((currSub - prevSub) / prevSub) * 100,
				);
			} else if (currSub > 0) {
				subjectChanges[subId] = 100;
			} else {
				subjectChanges[subId] = 0;
			}
		});

		return {
			currentTotal,
			prevTotal,
			totalChangePct,
			subjectChanges,
			currentSubjectTotals,
		};
	}, [allLogs]);

	const subjectBreakdown = useMemo(() => {
		if (!allLogs) return [];

		const timeMap: Record<string, number> = {};
		let totalLoggedTime = 0;

		allLogs.forEach((log) => {
			const subId = log.subjectId || "uncategorized";
			const duration = log.duration ?? 0;
			timeMap[subId] = (timeMap[subId] || 0) + duration;
			totalLoggedTime += duration;
		});

		const breakdown = (subjects || []).map((subj) => {
			const minutes = timeMap[subj._id] || 0;
			return {
				name: subj.name,
				icon: subj.icon,
				color: subj.color,
				minutes,
				percentage: totalLoggedTime > 0 ? (minutes / totalLoggedTime) * 100 : 0,
			};
		});

		if (timeMap.uncategorized) {
			breakdown.push({
				name: t.common.uncategorized,
				icon: "📝",
				color: "var(--text-muted)",
				minutes: timeMap.uncategorized,
				percentage:
					totalLoggedTime > 0
						? (timeMap.uncategorized / totalLoggedTime) * 100
						: 0,
			});
		}

		return breakdown
			.filter((item) => item.minutes > 0)
			.sort((a, b) => b.minutes - a.minutes);
	}, [allLogs, subjects, t]);

	const completedTasks = todayTasks?.filter((t) => t.completed).length ?? 0;
	const totalTasks = todayTasks?.length ?? 0;
	const generalIncomplete =
		generalTasks?.filter((t) => !t.completed).length ?? 0;
	const totalMinutes =
		todayLogs?.reduce((a, l) => a + (l.duration ?? 0), 0) ?? 0;
	const yesterdayMinutes =
		yesterdayLogs?.reduce((a, l) => a + (l.duration ?? 0), 0) ?? 0;
	const todayChangePct = (() => {
		if (yesterdayMinutes > 0) {
			return Math.round(
				((totalMinutes - yesterdayMinutes) / yesterdayMinutes) * 100,
			);
		} else if (totalMinutes > 0) {
			return 100;
		}
		return 0;
	})();

	return (
		<div>
			<DashboardHeader
				t={t}
				activeDate={activeDate}
				today={today}
				dateFormat={dateFormat}
				dateLocale={dateLocale}
				setSelectedDate={setSelectedDate}
			/>

			<DashboardStatsRow
				t={t}
				activeDate={activeDate}
				today={today}
				upcomingExams={upcomingExams}
				completedTasks={completedTasks}
				totalTasks={totalTasks}
				setView={setView}
				streak={streak}
				totalMinutes={totalMinutes}
				yesterdayLogs={yesterdayLogs}
				todayChangePct={todayChangePct}
			/>

			{/* Weekly Study Activity Chart */}
			<WeeklyActivityChart
				allLogs={allLogs}
				subjects={subjects}
				selectedDate={activeDate}
				setSelectedDate={setSelectedDate}
				today={today}
				getSubject={getSubject}
				comparisonData={comparisonData}
			/>

			{/* Cards Grid */}
			<DashboardCardGrid
				upcomingExams={upcomingExams}
				todayTasks={todayTasks}
				generalTasks={generalTasks}
				todayEvents={todayEvents}
				todayLogs={todayLogs}
				subjectBreakdown={subjectBreakdown}
				activeDate={activeDate}
				today={today}
				setView={setView}
				setSelectedDate={setSelectedDate}
				getSubject={getSubject}
				generalIncomplete={generalIncomplete}
			/>
		</div>
	);
}
