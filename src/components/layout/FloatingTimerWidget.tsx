import { useLanguage } from "../../hooks/useLanguage";
import type { TimerCorner } from "../settings/TimerWidgetSettingsCard";

type Props = {
	status: "idle" | "running" | "paused";
	elapsedSeconds: number;
	onStart: () => void;
	onPause: () => void;
	onResume: () => void;
	onStop: () => void;
	corner?: TimerCorner;
	scale?: number;
};

function formatElapsed(totalSeconds: number): string {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
		2,
		"0",
	);
	const seconds = String(totalSeconds % 60).padStart(2, "0");
	if (hours > 0) {
		return `${String(hours).padStart(2, "0")}:${minutes}:${seconds}`;
	}
	return `${minutes}:${seconds}`;
}

function getPositionStyle(corner: TimerCorner): React.CSSProperties {
	const pos: React.CSSProperties = { position: "fixed", zIndex: 1000 };
	if (corner.includes("bottom")) {
		pos.bottom = 24;
	} else {
		pos.top = 24;
	}
	if (corner.includes("right")) {
		pos.right = 24;
	} else {
		pos.left = 24;
	}
	return pos;
}

export function FloatingTimerWidget({
	status,
	elapsedSeconds,
	onStart,
	onPause,
	onResume,
	onStop,
	corner = "bottom-right",
	scale = 1,
}: Props) {
	const { t } = useLanguage();
	const positionStyle = getPositionStyle(corner);
	const widgetStyle: React.CSSProperties = {
		...positionStyle,
		transform: scale !== 1 ? `scale(${scale})` : undefined,
		transformOrigin: corner.replace("-", " "),
	};

	if (status === "idle") {
		return (
			<div className="floating-timer-widget" style={widgetStyle}>
				<button
					type="button"
					className="btn btn-primary floating-timer-start-btn"
					onClick={onStart}
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
						style={{ width: "16px", height: "16px" }}
					>
						<circle cx="12" cy="12" r="10" />
						<polyline points="12 6 12 12 16 14" />
					</svg>
					{t.dailyLog.addLog}
				</button>
			</div>
		);
	}

	return (
		<div className="floating-timer-widget" style={widgetStyle}>
			<div className="floating-timer-active">
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: 8,
					}}
				>
					{status === "running" ? (
						<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
							<span
								className="pulse-dot"
								style={{
									width: 8,
									height: 8,
									borderRadius: "50%",
									background: "var(--danger)",
								}}
							/>
							<span
								style={{
									fontSize: "0.75rem",
									fontWeight: 700,
									color: "var(--danger)",
									letterSpacing: "0.03em",
								}}
							>
								{t.mobileHeader.live}
							</span>
						</div>
					) : (
						<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
							<span
								style={{
									width: 8,
									height: 8,
									borderRadius: "50%",
									background: "var(--warning)",
								}}
							/>
							<span
								style={{
									fontSize: "0.75rem",
									fontWeight: 700,
									color: "var(--warning)",
									letterSpacing: "0.03em",
								}}
							>
								{t.mobileHeader.paused}
							</span>
						</div>
					)}
					<div
						style={{
							fontSize: "1.25rem",
							fontWeight: 800,
							fontFamily: "monospace",
							color: "var(--text-primary)",
							letterSpacing: "-0.01em",
						}}
					>
						{formatElapsed(elapsedSeconds)}
					</div>
				</div>
				<div style={{ display: "flex", gap: 6 }}>
					{status === "running" ? (
						<button
							type="button"
							className="btn btn-secondary btn-sm"
							onClick={onPause}
							style={{
								flex: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: 4,
							}}
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
								style={{ width: "12px", height: "12px" }}
							>
								<rect x="14" y="4" width="4" height="16" rx="1" />
								<rect x="6" y="4" width="4" height="16" rx="1" />
							</svg>
							{t.common.pause}
						</button>
					) : (
						<button
							type="button"
							className="btn btn-primary btn-sm"
							onClick={onResume}
							style={{
								flex: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: 4,
							}}
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
								style={{ width: "12px", height: "12px" }}
							>
								<polygon points="6 3 20 12 6 21 6 3" />
							</svg>
							{t.common.resume}
						</button>
					)}
					<button
						type="button"
						className="btn btn-danger btn-sm"
						onClick={onStop}
						style={{
							flex: 1,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 4,
						}}
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
							style={{ width: "12px", height: "12px" }}
						>
							<rect x="4" y="4" width="16" height="16" rx="1" />
						</svg>
						{t.common.stop}
					</button>
				</div>
			</div>
		</div>
	);
}
