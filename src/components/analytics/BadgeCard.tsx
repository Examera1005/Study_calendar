import type { Badge } from "../../utils/statsUtils";

export function BadgeCard({ badge }: { badge: Badge }) {
	const progressPercent = Math.min(
		100,
		Math.round((badge.current / badge.target) * 100),
	);
	return (
		<div
			className="badge-item-card"
			style={{
				background: badge.unlocked
					? "var(--bg-glass)"
					: "rgba(120, 120, 120, 0.05)",
				border: badge.unlocked
					? "1px solid var(--accent-primary)"
					: "1px solid var(--border-subtle)",
				boxShadow: badge.unlocked
					? "0 0 10px rgba(59, 130, 246, 0.15)"
					: "none",
				opacity: badge.unlocked ? 1 : 0.65,
			}}
		>
			<div
				className="badge-item-icon"
				style={{
					background: badge.unlocked
						? "var(--accent-light)"
						: "var(--bg-elevated)",
					border: badge.unlocked
						? "2px solid var(--accent-primary)"
						: "1px solid var(--border-medium)",
					boxShadow: badge.unlocked
						? "0 0 8px rgba(59, 130, 246, 0.2)"
						: "none",
					filter: badge.unlocked ? "none" : "grayscale(80%)",
				}}
			>
				{badge.unlocked ? badge.icon : "🔒"}
			</div>
			<div style={{ flex: 1, minWidth: 0 }}>
				<h4
					style={{
						fontSize: "0.95rem",
						fontWeight: 700,
						color: badge.unlocked
							? "var(--text-primary)"
							: "var(--text-secondary)",
						marginBottom: 4,
					}}
				>
					{badge.title} {badge.unlocked && "✅"}
				</h4>
				<p
					style={{
						fontSize: "0.78rem",
						color: "var(--text-muted)",
						marginBottom: 8,
						lineHeight: 1.3,
					}}
				>
					{badge.description}
				</p>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<div
						style={{
							flex: 1,
							height: 6,
							background: "var(--bg-elevated)",
							borderRadius: 3,
							overflow: "hidden",
						}}
					>
						<div
							style={{
								height: "100%",
								width: "100%",
								transform: `scaleX(${progressPercent / 100})`,
								transformOrigin: "left",
								background: badge.unlocked
									? "var(--accent-primary)"
									: "var(--text-muted)",
								borderRadius: 3,
								transition: "transform 0.4s ease",
							}}
						/>
					</div>
					<span
						style={{
							fontSize: "0.75rem",
							fontWeight: 600,
							color: "var(--text-muted)",
							minWidth: 40,
							textAlign: "right",
						}}
					>
						{badge.unlocked
							? `${badge.target}/${badge.target}`
							: `${Math.round(badge.current)}/${badge.target}`}
					</span>
				</div>
			</div>
		</div>
	);
}
