import { useState } from "react";
import { useLanguage } from "../../../hooks/useLanguage";
import { playSynthSound } from "./sound";

export function StreakDemo() {
	const { t } = useLanguage();
	const [streakCount, setStreakCount] = useState(4);
	const [showBadge, setShowBadge] = useState(false);

	const handleLogStudySession = () => {
		if (streakCount >= 5) return; // Cap at 5 for simulator
		playSynthSound("success");
		setStreakCount(5);
		setShowBadge(true);
	};

	const handleResetStreak = () => {
		playSynthSound("click");
		setStreakCount(4);
		setShowBadge(false);
	};

	return (
		<>
			<span className="lp-demo-tag lp-tag-streaks">
				{t.landingPage.streakTag}
			</span>
			<h3>{t.landingPage.streakTitle}</h3>
			<p className="lp-demo-desc">{t.landingPage.streakDesc}</p>

			<div className="lp-demo-interactive">
				<div className="lp-streak-panel">
					<div className="lp-streak-flame-container">
						<div className="lp-streak-flame-glow" />
						<span className="lp-streak-flame">🔥</span>
					</div>

					<div className="lp-streak-details">
						<span
							style={{
								fontSize: "0.75rem",
								fontWeight: 700,
								color: "#71717a",
								textTransform: "uppercase",
							}}
						>
							{t.landingPage.streakStatus}
						</span>
						<div className="lp-streak-count">
							{t.landingPage.streakLabel}{" "}
							<span>
								{streakCount} {t.landingPage.daysUnit}
							</span>
						</div>

						{showBadge ? (
							<div
								className="lp-badge-unlocked"
								style={{
									animation: "lpScaleIn 300ms cubic-bezier(0.16, 1, 0.3, 1)",
								}}
							>
								{t.landingPage.streakBadgeUnlocked}
							</div>
						) : (
							<span style={{ fontSize: "0.8rem", color: "#71717a" }}>
								{t.landingPage.streakNextBadge}
							</span>
						)}
					</div>
				</div>

				<div
					style={{
						display: "flex",
						gap: 8,
						justifyContent: "center",
						marginTop: 24,
					}}
				>
					<button
						type="button"
						className="btn btn-primary btn-sm"
						onClick={handleLogStudySession}
						disabled={streakCount === 5}
					>
						{t.landingPage.streakLogSession}
					</button>
					<button
						type="button"
						className="btn btn-secondary btn-sm"
						onClick={handleResetStreak}
					>
						{t.landingPage.streakReset}
					</button>
				</div>
			</div>
		</>
	);
}
