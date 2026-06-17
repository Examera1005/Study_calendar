import type React from "react";
import { useLanguage } from "../../hooks/useLanguage";

interface ProfileSetupProps {
	usernameInput: string;
	setUsernameInput: (v: string) => void;
	passwordInput: string;
	setPasswordInput: (v: string) => void;
	isSubmittingProfile: boolean;
	profileError: string;
	handleCreateProfile: (e: React.FormEvent) => void;
}

export function ProfileSetup({
	usernameInput,
	setUsernameInput,
	passwordInput,
	setPasswordInput,
	isSubmittingProfile,
	profileError,
	handleCreateProfile,
}: ProfileSetupProps) {
	const { t } = useLanguage();

	return (
		<div
			className="card"
			style={{ maxWidth: 450, margin: "60px auto", padding: 30 }}
		>
			<h2 style={{ textAlign: "center", marginBottom: 10 }}>
				👥 {t.friends.setupProfileTitle}
			</h2>
			<p
				style={{
					fontSize: "0.88rem",
					color: "var(--text-muted)",
					textAlign: "center",
					marginBottom: 24,
				}}
			>
				{t.friends.setupProfileDesc}
			</p>

			{profileError && (
				<div className="error-msg" style={{ marginBottom: 16 }}>
					{profileError}
				</div>
			)}

			<form onSubmit={handleCreateProfile}>
				<div className="form-group">
					<label htmlFor="friends-username">
						{t.friends.profileHandleLabel}
					</label>
					<input
						id="friends-username"
						type="text"
						value={usernameInput}
						onChange={(e) => setUsernameInput(e.target.value)}
						placeholder={t.friends.profileHandlePlaceholder}
						required
					/>
					<span
						style={{
							fontSize: "0.75rem",
							color: "var(--text-muted)",
							marginTop: 4,
							display: "block",
						}}
					>
						{t.friends.onlyLettersAllowed}
					</span>
				</div>

				{/* Password field for Zero-Knowledge Escrow key backup */}
				<div className="form-group">
					<label htmlFor="friends-password">
						{t.friends.setupPasswordLabel}
					</label>
					<input
						id="friends-password"
						type="password"
						value={passwordInput}
						onChange={(e) => setPasswordInput(e.target.value)}
						placeholder={t.friends.setupPasswordPlaceholder}
						autoComplete="current-password"
					/>
					<span
						style={{
							fontSize: "0.75rem",
							color: "var(--text-muted)",
							marginTop: 4,
							display: "block",
						}}
					>
						{t.friends.setupPasswordHint}
					</span>
				</div>

				<div
					style={{
						background: "var(--accent-light)",
						padding: "12px 14px",
						borderRadius: "var(--radius-md)",
						border: "1px solid var(--accent-primary)",
						marginBottom: 24,
					}}
				>
					<div
						style={{
							fontSize: "0.8rem",
							color: "var(--accent-primary)",
							fontWeight: 700,
							marginBottom: 4,
						}}
					>
						{t.friends.e2eTitle}
					</div>
					<div
						style={{
							fontSize: "0.75rem",
							color: "var(--text-secondary)",
							lineHeight: "1.4",
						}}
					>
						{t.friends.e2eDesc}
					</div>
				</div>

				<button
					type="submit"
					className="btn btn-primary btn-full"
					disabled={isSubmittingProfile}
				>
					{isSubmittingProfile
						? t.friends.generatingKeys
						: t.friends.saveProfileBtn}
				</button>
			</form>
		</div>
	);
}
