export function formatLocalDate(d: Date = new Date()): string {
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function formatDuration(
	minutes: number,
	options?: { showZero?: string; formatUnderHourAsMins?: boolean },
): string {
	const showZero = options?.showZero ?? "0m";
	const formatUnderHour = options?.formatUnderHourAsMins ?? false;

	if (minutes <= 0) return showZero;

	const h = Math.floor(minutes / 60);
	const m = minutes % 60;

	if (h === 0) {
		return formatUnderHour ? `${m}m` : `0h${m > 0 ? ` ${m}m` : ""}`;
	}

	return `${h}h${m > 0 ? ` ${m}m` : ""}`;
}

export function getWeekDays(dateStr: string): string[] {
	const d = new Date(`${dateStr}T00:00:00`);
	const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	const monday = new Date(d.setDate(diff));

	return Array.from({ length: 7 }, (_, i) => {
		const dayDate = new Date(monday);
		dayDate.setDate(monday.getDate() + i);
		return formatLocalDate(dayDate);
	});
}
