import { useMemo } from "react";
import { useLanguage } from "../hooks/useLanguage";

interface PomodoroViewProps {
	pomodoroStatus: "idle" | "running" | "paused";
	pomodoroMode: "work" | "break";
	timeLeft: number;
	workDuration: number;
	breakDuration: number;
	setWorkDuration: (w: number) => void;
	setBreakDuration: (b: number) => void;
	startPomodoro: () => void;
	pausePomodoro: () => void;
	resetPomodoro: () => void;
	stopAndLogWork: () => void;
}

// Format seconds to MM:SS
const formatSeconds = (totalSecs: number) => {
	const mins = Math.floor(totalSecs / 60);
	const secs = totalSecs % 60;
	return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const PRESETS = [
	{ key: "classic", work: 25, break: 5 },
	{ key: "productive", work: 50, break: 10 },
	{ key: "sprint", work: 15, break: 3 },
	{ key: "continuous", work: 30, break: 0 },
];

// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
function getPresetLabel(key: string, t: any): string {
	if (key === "classic") return t.pomodoro.presetClassic;
	if (key === "productive") return t.pomodoro.presetProductive;
	if (key === "sprint") return t.pomodoro.presetSprint;
	if (key === "continuous") return t.pomodoro.presetContinuous;
	return key;
}

interface TimerCardProps {
	pomodoroStatus: "idle" | "running" | "paused";
	pomodoroMode: "work" | "break";
	timeLeft: number;
	workDuration: number;
	breakDuration: number;
	startPomodoro: () => void;
	pausePomodoro: () => void;
	stopAndLogWork: () => void;
	// biome-ignore lint/suspicious/noExplicitAny: Translations object
	t: any;
}

function TimerCard({
	pomodoroStatus,
	pomodoroMode,
	timeLeft,
	workDuration,
	breakDuration,
	startPomodoro,
	pausePomodoro,
	stopAndLogWork,
	t,
}: TimerCardProps) {
	// Calculate circular progress percentage
	const progressPercent = useMemo(() => {
		const totalSecs =
			pomodoroMode === "work" ? workDuration * 60 : breakDuration * 60;
		if (totalSecs === 0) return 0;
		return timeLeft / totalSecs;
	}, [timeLeft, pomodoroMode, workDuration, breakDuration]);

	// SVG Circular ring calculations
	const radius = 90;
	const strokeWidth = 10;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - progressPercent * circumference;

	const currentThemeColor =
		pomodoroMode === "work" ? "var(--accent-primary)" : "var(--success)";

	return (
		<div
			className="card pomodoro-main-card"
			style={{
				boxShadow:
					pomodoroStatus === "running"
						? `0 0 20px rgba(${pomodoroMode === "work" ? "59, 130, 246" : "16, 185, 129"}, 0.15)`
						: "var(--shadow-lg)",
				borderColor:
					pomodoroStatus === "running"
						? currentThemeColor
						: "var(--border-subtle)",
			}}
		>
			{/* SVG Circular Ring Clock */}
			<div style={{ position: "relative", width: 220, height: 220 }}>
				<svg
					viewBox="0 0 200 200"
					width="100%"
					height="100%"
					aria-hidden="true"
				>
					{/* Background circle */}
					<circle
						cx="100"
						cy="100"
						r={radius}
						fill="transparent"
						stroke="var(--bg-primary)"
						strokeWidth={strokeWidth}
					/>
					{/* Countdown animated circle */}
					<circle
						cx="100"
						cy="100"
						r={radius}
						fill="transparent"
						stroke={currentThemeColor}
						strokeWidth={strokeWidth}
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
						style={{
							transform: "rotate(-90deg)",
							transformOrigin: "100px 100px",
							transition:
								"stroke-dashoffset 300ms linear, stroke var(--transition-normal)",
						}}
					/>
				</svg>

				{/* Clock Text Centered */}
				<div className="pomodoro-centered-overlay">
					<span
						className="pomodoro-mode-badge"
						style={{
							color: currentThemeColor,
							background:
								pomodoroStatus !== "idle" ? "var(--bg-primary)" : "transparent",
						}}
					>
						{pomodoroStatus === "idle"
							? t.pomodoro.readyStatus
							: pomodoroMode === "work"
								? t.pomodoro.studyState
								: t.pomodoro.breakState}
					</span>
					<span
						style={{
							fontSize: "2.8rem",
							fontWeight: 800,
							fontFamily: "monospace",
							color: "var(--text-primary)",
							lineHeight: 1.2,
							margin: "4px 0",
						}}
					>
						{formatSeconds(timeLeft)}
					</span>
					<span
						style={{
							fontSize: "0.75rem",
							color: "var(--text-muted)",
							fontWeight: 500,
						}}
					>
						{t.pomodoro.goalLabel}:{" "}
						{pomodoroMode === "work" ? workDuration : breakDuration}{" "}
						{t.common.minutesUnit}
					</span>
				</div>
			</div>

			{/* Controls Row */}
			<div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 300 }}>
				{pomodoroStatus === "running" ? (
					<button
						type="button"
						className="btn btn-secondary"
						onClick={pausePomodoro}
						style={{ flex: 1, padding: "12px", fontSize: "0.95rem" }}
					>
						{t.pomodoro.pauseBtn}
					</button>
				) : (
					<button
						type="button"
						className="btn btn-primary"
						onClick={startPomodoro}
						style={{
							flex: 1,
							padding: "12px",
							fontSize: "0.95rem",
							backgroundColor: currentThemeColor,
							borderColor: currentThemeColor,
						}}
					>
						{t.pomodoro.startBtn}
					</button>
				)}

				{pomodoroStatus !== "idle" && (
					<button
						type="button"
						className="btn btn-danger"
						onClick={stopAndLogWork}
						style={{ flex: 1, padding: "12px", fontSize: "0.95rem" }}
					>
						{t.pomodoro.stopBtn}
					</button>
				)}
			</div>
		</div>
	);
}

interface DurationSettingsCardProps {
	pomodoroStatus: "idle" | "running" | "paused";
	workDuration: number;
	breakDuration: number;
	setWorkDuration: (w: number) => void;
	setBreakDuration: (b: number) => void;
	resetPomodoro: () => void;
	// biome-ignore lint/suspicious/noExplicitAny: Translations object
	t: any;
}

function DurationSettingsCard({
	pomodoroStatus,
	workDuration,
	breakDuration,
	setWorkDuration,
	setBreakDuration,
	resetPomodoro,
	t,
}: DurationSettingsCardProps) {
	const handlePresetSelect = (w: number, b: number) => {
		if (pomodoroStatus !== "idle") {
			if (!confirm(t.pomodoro.resetMinuterPrompt)) {
				return;
			}
		}
		setWorkDuration(w);
		setBreakDuration(b);
		resetPomodoro();
	};

	return (
		<div className="card" style={{ width: "100%" }}>
			<h3 style={{ marginBottom: 16 }}>{t.pomodoro.durationSettings}</h3>

			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: 20,
					marginBottom: 24,
				}}
			>
				{/* Work duration range */}
				<div
					style={{
						flex: 1,
						minWidth: 200,
						display: "flex",
						flexDirection: "column",
						gap: 8,
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							fontSize: "0.85rem",
							fontWeight: 600,
						}}
					>
						<span style={{ color: "var(--text-secondary)" }}>
							{t.pomodoro.studyDurationLabel}
						</span>
						<span style={{ color: "var(--accent-primary)" }}>
							{workDuration} {t.common.minutesUnit}
						</span>
					</div>
					<input
						type="range"
						min={5}
						max={120}
						step={5}
						value={workDuration}
						disabled={pomodoroStatus !== "idle"}
						onChange={(e) => setWorkDuration(Number(e.target.value))}
						aria-label="Work duration in minutes"
						className="pomodoro-range-input"
						style={{
							width: "100%",
							height: 6,
							background: "var(--bg-primary)",
							borderRadius: 3,
							cursor: pomodoroStatus === "idle" ? "pointer" : "not-allowed",
							opacity: pomodoroStatus === "idle" ? 1 : 0.5,
						}}
					/>
				</div>

				{/* Break duration range */}
				<div
					style={{
						flex: 1,
						minWidth: 200,
						display: "flex",
						flexDirection: "column",
						gap: 8,
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							fontSize: "0.85rem",
							fontWeight: 600,
						}}
					>
						<span style={{ color: "var(--text-secondary)" }}>
							{t.pomodoro.breakDurationLabel}
						</span>
						<span style={{ color: "var(--success)" }}>
							{breakDuration === 0
								? t.pomodoro.continuousLabel
								: `${breakDuration} ${t.common.minutesUnit}`}
						</span>
					</div>
					<input
						type="range"
						min={0}
						max={30}
						step={breakDuration <= 5 ? 1 : 5}
						value={breakDuration}
						disabled={pomodoroStatus !== "idle"}
						onChange={(e) => setBreakDuration(Number(e.target.value))}
						aria-label="Break duration in minutes"
						className="pomodoro-range-input"
						style={{
							width: "100%",
							height: 6,
							background: "var(--bg-primary)",
							borderRadius: 3,
							cursor: pomodoroStatus === "idle" ? "pointer" : "not-allowed",
							opacity: pomodoroStatus === "idle" ? 1 : 0.5,
						}}
					/>
				</div>
			</div>

			{/* Quick presets grid */}
			<div>
				<h4
					style={{
						fontSize: "0.8rem",
						color: "var(--text-muted)",
						textTransform: "uppercase",
						fontWeight: 600,
						marginBottom: 12,
					}}
				>
					{t.pomodoro.durationSettingsShortcuts}
				</h4>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
						gap: 10,
					}}
				>
					{PRESETS.map((preset) => (
						<button
							key={preset.key}
							type="button"
							className="btn btn-secondary"
							onClick={() => handlePresetSelect(preset.work, preset.break)}
							style={{
								padding: "10px",
								fontSize: "0.82rem",
								textAlign: "left",
								display: "flex",
								justifyContent: "space-between",
								fontWeight: 500,
							}}
						>
							<span>{getPresetLabel(preset.key, t)}</span>
							<span
								style={{
									color: "var(--text-muted)",
									fontFamily: "monospace",
								}}
							>
								{preset.work}
								{t.common.minutesUnit} /{" "}
								{preset.break === 0
									? t.common.none
									: `${preset.break}${t.common.minutesUnit}`}
							</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

export function PomodoroView({
	pomodoroStatus,
	pomodoroMode,
	timeLeft,
	workDuration,
	breakDuration,
	setWorkDuration,
	setBreakDuration,
	startPomodoro,
	pausePomodoro,
	resetPomodoro,
	stopAndLogWork,
}: PomodoroViewProps) {
	// biome-ignore lint/correctness/noUnusedVariables: Context language used for translations hook
	const { t, language } = useLanguage();

	return (
		<div
			style={{
				maxWidth: 600,
				margin: "0 auto",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 32,
				padding: "20px 0",
			}}
		>
			<div style={{ textAlign: "center" }}>
				<h1>{t.pomodoro.timerTitle}</h1>
				<p
					style={{
						color: "var(--text-muted)",
						fontSize: "0.9rem",
						marginTop: 4,
					}}
				>
					{t.pomodoro.subtitle}
				</p>
			</div>

			<TimerCard
				pomodoroStatus={pomodoroStatus}
				pomodoroMode={pomodoroMode}
				timeLeft={timeLeft}
				workDuration={workDuration}
				breakDuration={breakDuration}
				startPomodoro={startPomodoro}
				pausePomodoro={pausePomodoro}
				stopAndLogWork={stopAndLogWork}
				t={t}
			/>

			<DurationSettingsCard
				pomodoroStatus={pomodoroStatus}
				workDuration={workDuration}
				breakDuration={breakDuration}
				setWorkDuration={setWorkDuration}
				setBreakDuration={setBreakDuration}
				resetPomodoro={resetPomodoro}
				t={t}
			/>
		</div>
	);
}
