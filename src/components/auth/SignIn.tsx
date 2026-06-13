import { useAuthActions } from "@convex-dev/auth/react";
import React, { useReducer } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { Modal } from "../ui/Modal";

type StepType = "signIn" | "signUp" | "forgotPassword" | "verifyResetCode";
type LegalType = "privacy" | "terms" | null;

interface AuthState {
	step: StepType;
	email: string;
	successMessage: string;
	error: string;
	loading: boolean;
	showLegal: LegalType;
}

type AuthAction =
	| { type: "SET_STEP"; payload: StepType }
	| { type: "SET_EMAIL"; payload: string }
	| { type: "SET_SUCCESS"; payload: string }
	| { type: "SET_ERROR"; payload: string }
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "SET_LEGAL"; payload: LegalType }
	| { type: "START_REQUEST" }
	| { type: "REQUEST_SUCCESS"; successMessage: string; nextStep?: StepType }
	| { type: "REQUEST_FAILURE"; error: string };

const initialState: AuthState = {
	step: "signIn",
	email: "",
	successMessage: "",
	error: "",
	loading: false,
	showLegal: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
	switch (action.type) {
		case "SET_STEP":
			return { ...state, step: action.payload, error: "", successMessage: "" };
		case "SET_EMAIL":
			return { ...state, email: action.payload };
		case "SET_SUCCESS":
			return { ...state, successMessage: action.payload };
		case "SET_ERROR":
			return { ...state, error: action.payload };
		case "SET_LOADING":
			return { ...state, loading: action.payload };
		case "SET_LEGAL":
			return { ...state, showLegal: action.payload };
		case "START_REQUEST":
			return { ...state, loading: true, error: "", successMessage: "" };
		case "REQUEST_SUCCESS":
			return {
				...state,
				loading: false,
				error: "",
				successMessage: action.successMessage,
				step: action.nextStep ?? state.step,
			};
		case "REQUEST_FAILURE":
			return { ...state, loading: false, error: action.error };
		default:
			return state;
	}
}

export function SignIn() {
	const { signIn } = useAuthActions();
	const { t } = useLanguage();
	const [state, dispatch] = useReducer(authReducer, initialState);
	const { step, email, successMessage, error, loading, showLegal } = state;

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		dispatch({ type: "START_REQUEST" });
		const formData = new FormData(e.currentTarget);
		const formEmail = formData.get("email") as string;
		const formPassword = formData.get("password") as string;
		const formCode = formData.get("code") as string;

		try {
			if (step === "forgotPassword") {
				await signIn("password", { email: formEmail, flow: "reset" });
				dispatch({ type: "SET_EMAIL", payload: formEmail });
				dispatch({
					type: "REQUEST_SUCCESS",
					successMessage: t.auth.checkEmailMsg,
					nextStep: "verifyResetCode",
				});
			} else if (step === "verifyResetCode") {
				await signIn("password", {
					email: formEmail,
					code: formCode,
					newPassword: formPassword,
					flow: "reset-verification",
				});
				dispatch({
					type: "REQUEST_SUCCESS",
					successMessage: t.auth.passwordResetSuccess,
					nextStep: "signIn",
				});
			} else {
				await signIn("password", formData);
				dispatch({ type: "SET_LOADING", payload: false });
			}
		} catch (err: unknown) {
			let userFriendlyError = "";
			if (err instanceof Error) {
				const msg = err.message;
				if (
					msg.includes("invalid_credentials") ||
					msg.includes("Invalid credentials")
				) {
					userFriendlyError = t.auth.invalidCredentialsError;
				} else if (
					msg.includes("signUpError") ||
					msg.includes("could not create account")
				) {
					userFriendlyError = t.auth.signUpError;
				} else {
					userFriendlyError = msg;
				}
			} else {
				userFriendlyError =
					step === "signIn"
						? t.auth.invalidCredentialsError
						: t.auth.signUpError;
			}
			dispatch({ type: "REQUEST_FAILURE", error: userFriendlyError });
			console.error(err);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-card">
				<h1>📚 {t.auth.copyright}</h1>
				<p className="subtitle">
					{step === "signIn"
						? t.auth.welcomeBackSubtitle
						: step === "signUp"
							? t.auth.createAccountSubtitle
							: step === "forgotPassword"
								? t.auth.resetPasswordSubtitle
								: t.auth.checkEmailMsg}
				</p>

				{error && <div className="error-msg">{error}</div>}

				{successMessage && <div className="success-msg">{successMessage}</div>}

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="auth-email">{t.auth.emailLabel}</label>
						<input
							id="auth-email"
							name="email"
							type="email"
							placeholder="you@example.com"
							autoComplete="email"
							defaultValue={email}
							required
						/>
					</div>

					{step === "verifyResetCode" && (
						<div className="form-group">
							<label htmlFor="auth-code">{t.auth.codeLabel}</label>
							<input
								id="auth-code"
								name="code"
								type="text"
								placeholder={t.auth.codePlaceholder}
								required
							/>
						</div>
					)}

					{step !== "forgotPassword" && (
						<div className="form-group">
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "baseline",
								}}
							>
								<label htmlFor="auth-password">
									{step === "verifyResetCode"
										? t.auth.newPasswordLabel
										: t.auth.passwordLabel}
								</label>
								{step === "signIn" && (
									<button
										type="button"
										className="btn-link"
										style={{
											fontSize: "0.8rem",
											background: "none",
											border: "none",
											color: "var(--accent-primary)",
											cursor: "pointer",
											padding: 0,
										}}
										onClick={() => {
											dispatch({ type: "SET_STEP", payload: "forgotPassword" });
										}}
									>
										{t.auth.forgotPasswordBtn}
									</button>
								)}
							</div>
							<input
								id="auth-password"
								name="password"
								type="password"
								placeholder={t.auth.passwordPlaceholder}
								autoComplete={
									step === "signUp"
										? "new-password"
										: step === "verifyResetCode"
											? "new-password"
											: "current-password"
								}
								required
								minLength={8}
							/>
						</div>
					)}

					{(step === "signIn" || step === "signUp") && (
						<input name="flow" type="hidden" value={step} />
					)}

					<button
						type="submit"
						className="btn btn-primary btn-full"
						disabled={loading}
						id="auth-submit"
					>
						{loading
							? t.auth.pleaseWait
							: step === "signIn"
								? t.auth.signInBtn
								: step === "signUp"
									? t.auth.signUpBtn
									: step === "forgotPassword"
										? t.auth.sendResetCodeBtn
										: t.auth.resetPasswordBtn}
					</button>
				</form>

				{(step === "forgotPassword" || step === "verifyResetCode") && (
					<div style={{ textAlign: "center", marginTop: 16 }}>
						<button
							type="button"
							className="btn btn-ghost"
							onClick={() => {
								dispatch({ type: "SET_STEP", payload: "signIn" });
							}}
						>
							← {t.auth.backToSignIn}
						</button>
					</div>
				)}

				{(step === "signIn" || step === "signUp") && (
					<div style={{ textAlign: "center", marginTop: 16 }}>
						<button
							type="button"
							className="btn btn-ghost"
							onClick={() => {
								dispatch({
									type: "SET_STEP",
									payload: step === "signIn" ? "signUp" : "signIn",
								});
							}}
							id="auth-toggle"
						>
							{step === "signIn"
								? t.auth.toggleSignUpPrompt
								: t.auth.toggleSignInPrompt}
						</button>
					</div>
				)}

				<div className="auth-footer">
					<span suppressHydrationWarning>
						© {new Date().getFullYear()} {t.auth.copyright}
					</span>
					<span>•</span>
					<button
						type="button"
						className="auth-footer-btn"
						onClick={() => dispatch({ type: "SET_LEGAL", payload: "privacy" })}
					>
						{t.settings.privacyBtn}
					</button>
					<span>•</span>
					<button
						type="button"
						className="auth-footer-btn"
						onClick={() => dispatch({ type: "SET_LEGAL", payload: "terms" })}
					>
						{t.settings.termsBtn}
					</button>
				</div>
			</div>

			{showLegal === "privacy" && (
				<Modal
					title={t.settings.privacyPolicyTitle}
					onClose={() => dispatch({ type: "SET_LEGAL", payload: null })}
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
						<LegalText paragraphs={t.settings.privacyPolicyText} />
					</div>
				</Modal>
			)}

			{showLegal === "terms" && (
				<Modal
					title={t.settings.termsOfServiceTitle}
					onClose={() => dispatch({ type: "SET_LEGAL", payload: null })}
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
						<LegalText paragraphs={t.settings.termsOfServiceText} />
					</div>
				</Modal>
			)}
		</div>
	);
}

function LegalText({ paragraphs }: { paragraphs: string[] }) {
	return (
		<>
			{paragraphs.map((paragraph, index) => {
				if (index === 0) {
					return (
						<p key={paragraph}>
							<strong>{paragraph}</strong>
						</p>
					);
				}
				const match = paragraph.match(/^(\d+\.\s*[^:]+)(?::)?(.*)$/);
				if (match) {
					return (
						<React.Fragment key={paragraph}>
							<h4 style={{ color: "var(--text-primary)", marginTop: 10 }}>
								{match[1]}
							</h4>
							{match[2] && <p>{match[2].trim()}</p>}
						</React.Fragment>
					);
				}
				return <p key={paragraph}>{paragraph}</p>;
			})}
		</>
	);
}
