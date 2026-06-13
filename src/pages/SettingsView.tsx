import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { BlockedUsersCard } from "../components/settings/BlockedUsersCard";
import { ProfileHandleCard } from "../components/settings/ProfileHandleCard";
import { SettingsFooter } from "../components/settings/SettingsFooter";
import { ThemeSettingsCard } from "../components/settings/ThemeSettingsCard";
import {
	type TimerCorner,
	TimerWidgetSettingsCard,
} from "../components/settings/TimerWidgetSettingsCard";
import { Modal } from "../components/ui/Modal";
import { useLanguage } from "../hooks/useLanguage";

export function SettingsView({
	theme,
	setTheme,
	timerCorner,
	timerScale,
	onTimerCornerChange,
	onTimerScaleChange,
}: {
	theme: "light" | "dark";
	setTheme: (t: "light" | "dark") => void;
	timerCorner: TimerCorner;
	timerScale: number;
	onTimerCornerChange: (c: TimerCorner) => void;
	onTimerScaleChange: (s: number) => void;
}) {
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic Convex API / third-party type
	const friendsApi = (api as any).friends;
	const userEmail = useQuery(friendsApi.getUserEmail);
	const [showLegal, setShowLegal] = useState<"privacy" | "terms" | null>(null);
	const { t, language, setLanguage } = useLanguage();

	return (
		<div>
			<div className="page-header">
				<h1>{t.settings.title}</h1>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
				{/* Section: Account Information */}
				<div className="card">
					<h3 style={{ marginBottom: 12 }}>{t.settings.accountInfoTitle}</h3>
					<p
						style={{
							fontSize: "0.85rem",
							color: "var(--text-muted)",
							marginBottom: 16,
						}}
					>
						{t.settings.accountInfoDesc}
					</p>
					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: "12px 16px",
								background: "var(--bg-primary)",
								border: "1px solid var(--border-subtle)",
								borderRadius: "var(--radius-md)",
							}}
						>
							<span
								style={{
									fontSize: "0.88rem",
									fontWeight: 600,
									color: "var(--text-secondary)",
								}}
							>
								{t.settings.emailLabel}
							</span>
							<span
								style={{
									fontSize: "0.9rem",
									fontWeight: 700,
									color: "var(--text-primary)",
								}}
							>
								{userEmail === undefined
									? t.common.loading
									: (userEmail ?? t.settings.notSet)}
							</span>
						</div>
					</div>
				</div>

				{/* Language Selection Card */}
				<div className="card">
					<h3 style={{ marginBottom: 12 }}>🌐 {t.settings.languageTitle}</h3>
					<p
						style={{
							fontSize: "0.85rem",
							color: "var(--text-muted)",
							marginBottom: 16,
						}}
					>
						{t.settings.languageDesc}
					</p>
					<div className="form-group" style={{ maxWidth: 280 }}>
						<label
							htmlFor="settings-language"
							style={{
								fontSize: "0.85rem",
								fontWeight: 600,
								color: "var(--text-secondary)",
								marginBottom: 8,
								display: "block",
							}}
						>
							{t.settings.languageLabel}
						</label>
						<select
							id="settings-language"
							value={language}
							onChange={(e) => setLanguage(e.target.value as "en" | "fr")}
							style={{
								background: "var(--bg-primary)",
								border: "1px solid var(--border-subtle)",
								borderRadius: "var(--radius-md)",
								padding: "10px 14px",
								color: "var(--text-primary)",
								width: "100%",
								cursor: "pointer",
							}}
						>
							<option value="en">🇬🇧 English</option>
							<option value="fr">🇫🇷 Français</option>
						</select>
					</div>
				</div>

				{/* Theme Settings Card */}
				<ThemeSettingsCard theme={theme} setTheme={setTheme} />

				{/* Timer Widget Settings Card */}
				<TimerWidgetSettingsCard
					corner={timerCorner}
					scale={timerScale}
					onCornerChange={onTimerCornerChange}
					onScaleChange={onTimerScaleChange}
				/>

				{/* Profile Handle Card */}
				<ProfileHandleCard />

				{/* Blocked Users Card */}
				<BlockedUsersCard />

				{/* Settings Footer */}
				<SettingsFooter onShowLegal={setShowLegal} />
			</div>

			{showLegal === "privacy" && (
				<Modal
					title={t.settings.privacyPolicyTitle}
					onClose={() => setShowLegal(null)}
				>
					<div
						style={{
							fontSize: "0.85rem",
							lineHeight: "1.5",
							color: "var(--text-secondary)",
							display: "flex",
							flexDirection: "column",
							gap: 12,
						}}
					>
						{t.settings.privacyPolicyText.map((p) => (
							<p key={p}>
								{p.startsWith("Effective Date:") ||
								p.startsWith("Date d'effet :") ? (
									<strong>{p}</strong>
								) : p.includes(": ") ? (
									<>
										<strong>{p.split(": ")[0]} : </strong>
										{p.split(": ").slice(1).join(": ")}
									</>
								) : (
									p
								)}
							</p>
						))}
					</div>
				</Modal>
			)}

			{showLegal === "terms" && (
				<Modal
					title={t.settings.termsOfServiceTitle}
					onClose={() => setShowLegal(null)}
				>
					<div
						style={{
							fontSize: "0.85rem",
							lineHeight: "1.5",
							color: "var(--text-secondary)",
							display: "flex",
							flexDirection: "column",
							gap: 12,
						}}
					>
						{t.settings.termsOfServiceText.map((p) => (
							<p key={p}>
								{p.startsWith("Effective Date:") ||
								p.startsWith("Date d'effet :") ? (
									<strong>{p}</strong>
								) : p.includes(": ") ? (
									<>
										<strong>{p.split(": ")[0]} : </strong>
										{p.split(": ").slice(1).join(": ")}
									</>
								) : (
									p
								)}
							</p>
						))}
					</div>
				</Modal>
			)}
		</div>
	);
}
