import { format } from "date-fns";
import { formatLocalDate } from "../../utils/dateUtils";
import { TimeRangeToggle } from "./KpiCards";

interface AnalyticsHeaderProps {
	title: string;
	startDate: string;
	endDate: string;
	timeRange: 7 | 30;
	setTimeRange: (v: 7 | 30) => void;
	adjustDate: (days: number) => void;
	setEndDate: (v: string) => void;
	isToday: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: translations object
	t: any;
	// biome-ignore lint/suspicious/noExplicitAny: dateLocale is standard date-fns locale
	dateLocale: any;
}

export function AnalyticsHeader({
	title,
	startDate,
	endDate,
	timeRange,
	setTimeRange,
	adjustDate,
	setEndDate,
	isToday,
	t,
	dateLocale,
}: AnalyticsHeaderProps) {
	return (
		<div
			className="page-header"
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				flexWrap: "wrap",
				gap: 16,
				marginBottom: 24,
			}}
		>
			<div>
				<h1>{title}</h1>
				<div
					className="date-display"
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						marginTop: 4,
					}}
				>
					<span
						style={{
							fontSize: "0.88rem",
							fontWeight: 500,
							color: "var(--text-secondary)",
						}}
					>
						{format(
							new Date(`${startDate}T00:00:00`),
							t.common.dateFormatShort,
							{
								locale: dateLocale,
							},
						)}
						{" — "}
						{format(new Date(`${endDate}T00:00:00`), t.common.dateFormatShort, {
							locale: dateLocale,
						})}
					</span>
				</div>
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 12,
					flexWrap: "wrap",
				}}
			>
				<div className="date-navigation-capsule">
					<button
						type="button"
						className="btn-icon"
						onClick={() => adjustDate(-7)}
						title={t.dashboard.prevWeek}
						aria-label={t.dashboard.prevWeek}
						style={{ width: "32px", height: "32px" }}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{ width: 14, height: 14 }}
							aria-hidden="true"
						>
							<polyline points="11 17 6 12 11 7" />
							<polyline points="18 17 13 12 18 7" />
						</svg>
					</button>
					<button
						type="button"
						className="btn-icon"
						onClick={() => adjustDate(-1)}
						title={t.dashboard.prevDay}
						aria-label={t.dashboard.prevDay}
						style={{ width: "32px", height: "32px" }}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{ width: 14, height: 14 }}
							aria-hidden="true"
						>
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</button>

					{!isToday ? (
						<button
							type="button"
							className="btn btn-ghost btn-sm"
							onClick={() => setEndDate(formatLocalDate())}
							style={{
								padding: "4px 10px",
								fontSize: "0.78rem",
								fontWeight: 600,
								height: "32px",
								borderRadius: "var(--radius-sm)",
								color: "var(--accent-primary)",
							}}
						>
							{t.common.today}
						</button>
					) : (
						<span
							style={{
								padding: "0 10px",
								fontSize: "0.78rem",
								fontWeight: 600,
								color: "var(--text-muted)",
								userSelect: "none",
							}}
						>
							{t.common.today}
						</span>
					)}

					<button
						type="button"
						className="btn-icon"
						onClick={() => adjustDate(1)}
						disabled={isToday}
						title={t.dashboard.nextDay}
						aria-label={t.dashboard.nextDay}
						style={{
							width: "32px",
							height: "32px",
							opacity: isToday ? 0.4 : 1,
							cursor: isToday ? "not-allowed" : "pointer",
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
							style={{ width: 14, height: 14 }}
							aria-hidden="true"
						>
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</button>
					<button
						type="button"
						className="btn-icon"
						onClick={() => adjustDate(7)}
						disabled={isToday}
						title={t.dashboard.nextWeek}
						aria-label={t.dashboard.nextWeek}
						style={{
							width: "32px",
							height: "32px",
							opacity: isToday ? 0.4 : 1,
							cursor: isToday ? "not-allowed" : "pointer",
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
							style={{ width: 14, height: 14 }}
							aria-hidden="true"
						>
							<polyline points="13 17 18 12 13 7" />
							<polyline points="6 17 11 12 6 7" />
						</svg>
					</button>
				</div>

				<TimeRangeToggle value={timeRange} onChange={setTimeRange} />
			</div>
		</div>
	);
}
