import { addDays, format, isSameMonth, isToday } from "date-fns";
import { useLanguage } from "../../hooks/useLanguage";
import { formatDuration } from "../../utils/dateUtils";

type DayData = {
	dots: { color: string; type: "exam" | "event" | "log" }[];
	items: {
		id: string;
		title: string;
		color: string;
		icon?: string;
		type: "exam" | "event" | "log";
	}[];
	totalStudyMinutes?: number;
};

type Props = {
	days: Date[];
	currentMonth: Date;
	selectedDate: string;
	dayData: Record<string, DayData>;
	onSelectDate: (dateStr: string) => void;
};

export function CalendarGrid({
	days,
	currentMonth,
	selectedDate,
	dayData,
	onSelectDate,
}: Props) {
	const { dateLocale } = useLanguage();

	// Generate weekday headers starting from Monday dynamically according to the active locale
	const baseDate = new Date(2026, 5, 1); // June 1st, 2026 (Monday)
	const dayNames = Array.from({ length: 7 }, (_, i) => {
		const d = addDays(baseDate, i);
		const formatted = format(d, "ccc", { locale: dateLocale }); // Short day representation
		const clean = formatted.replace(/\.$/, ""); // Strip trailing dots (often present in French: "lun.")
		return clean.charAt(0).toUpperCase() + clean.slice(1);
	});

	return (
		<div className="calendar-grid">
			{dayNames.map((dn) => (
				<div key={dn} className="calendar-day-header">
					{dn}
				</div>
			))}
			{days.map((day) => (
				<CalendarDay
					key={format(day, "yyyy-MM-dd")}
					day={day}
					currentMonth={currentMonth}
					isSelected={format(day, "yyyy-MM-dd") === selectedDate}
					data={dayData[format(day, "yyyy-MM-dd")]}
					onSelect={onSelectDate}
				/>
			))}
		</div>
	);
}

function CalendarDay({
	day,
	currentMonth,
	isSelected,
	data,
	onSelect,
}: {
	day: Date;
	currentMonth: Date;
	isSelected: boolean;
	data?: DayData;
	onSelect: (dateStr: string) => void;
}) {
	const { t } = useLanguage();
	const dateStr = format(day, "yyyy-MM-dd");
	const className = `calendar-day${!isSameMonth(day, currentMonth) ? " other-month" : ""}${isToday(day) ? " today" : ""}${isSelected ? " selected" : ""}`;

	return (
		<button
			type="button"
			className={className}
			onClick={() => onSelect(dateStr)}
		>
			<div className="day-header">
				<div className="day-number">
					{isToday(day) ? <span>{format(day, "d")}</span> : format(day, "d")}
				</div>
				{data?.totalStudyMinutes && data.totalStudyMinutes > 0 && (
					<div className="day-study-badge" title={t.dailyLog.studyTimeLabel}>
						⏱️{" "}
						{formatDuration(data.totalStudyMinutes, {
							formatUnderHourAsMins: true,
						})}
					</div>
				)}
			</div>
			{data && (
				<>
					<div className="day-dots">
						{data.dots.map((dot, i) => (
							<div
								key={`dot-${
									// biome-ignore lint/suspicious/noArrayIndexKey: Dynamic Convex API / third-party type
									i
								}`}
								className="day-dot"
								style={{
									background: dot.color,
									opacity: dot.type === "event" ? 0.75 : 1,
								}}
							/>
						))}
					</div>
					<div className="calendar-day-items">
						{data.items.slice(0, 2).map((item) => (
							<div
								key={item.id}
								className={`calendar-day-item ${item.type}`}
								style={{ background: `${item.color}15`, color: item.color }}
							>
								<span className="item-icon">{item.icon}</span>
								<span className="item-text">{item.title}</span>
							</div>
						))}
						{data.items.length > 2 && (
							<div className="calendar-day-item-more">
								{t.calendar.moreItems(data.items.length - 2)}
							</div>
						)}
					</div>
				</>
			)}
		</button>
	);
}

export type { DayData };
