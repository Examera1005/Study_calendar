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
