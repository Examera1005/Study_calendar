import { useConvex, useMutation, useQuery } from "convex/react";
import { useEffect, useReducer, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { useLanguage } from "../../hooks/useLanguage";

interface CheckState {
	isChecking: boolean;
	isAvailable: boolean | null;
	error: string;
}

type CheckAction =
	| { type: "SAME_USERNAME" }
	| { type: "TOO_SHORT"; error: string }
	| { type: "INVALID_CHARS"; error: string }
	| { type: "START_CHECKING" }
	| { type: "RESULT"; available: boolean; takenError: string }
	| { type: "RESULT_ERROR" }
	| { type: "FIELD_ERROR"; error: string };

function checkReducer(_state: CheckState, action: CheckAction): CheckState {
	switch (action.type) {
		case "SAME_USERNAME":
			return { isChecking: false, isAvailable: true, error: "" };
		case "TOO_SHORT":
			return { isChecking: false, isAvailable: false, error: action.error };
		case "INVALID_CHARS":
			return { isChecking: false, isAvailable: false, error: action.error };
		case "START_CHECKING":
			return { isChecking: true, isAvailable: null, error: "" };
		case "RESULT":
			return {
				isChecking: false,
				isAvailable: action.available,
				error: action.available ? "" : action.takenError,
			};
		case "RESULT_ERROR":
			return { isChecking: false, isAvailable: null, error: "" };
		case "FIELD_ERROR":
			return { isChecking: false, isAvailable: null, error: action.error };
	}
}

const INITIAL_CHECK: CheckState = {
	isChecking: false,
	isAvailable: null,
	error: "",
};

export function ProfileHandleCard() {
	const convex = useConvex();
	const profile = useQuery(api.friends.getProfile);
	const updateProfile = useMutation(api.friends.createOrUpdateProfile);
	const { t } = useLanguage();

	const [usernameInput, setUsernameInput] = useState("");
	const [check, dispatch] = useReducer(checkReducer, INITIAL_CHECK);
	const [saveSuccess, setSaveSuccess] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	// Ref to read latest input inside async callback without closure staleness
	const latestInputRef = useRef(usernameInput);
	useEffect(() => {
		latestInputRef.current = usernameInput;
	});

	// Initialize input when profile loads
	useEffect(() => {
		if (profile) {
			setUsernameInput(profile.username.replace("@", ""));
		}
	}, [profile]);

	// Single effect: validate, debounce, query (no cascade)
	useEffect(() => {
		if (!profile) return;

		const cleanInput = usernameInput.trim().toLowerCase();
		const currentClean = profile.username.replace("@", "");

		if (cleanInput === currentClean) {
			dispatch({ type: "SAME_USERNAME" });
			return;
		}

		if (cleanInput.length < 3) {
			dispatch({ type: "TOO_SHORT", error: t.settings.profileHandleMinChars });
			return;
		}

		if (/[^a-z0-9_]/.test(cleanInput)) {
			dispatch({
				type: "INVALID_CHARS",
				error: t.settings.profileHandleInvalidChars,
			});
			return;
		}

		dispatch({ type: "START_CHECKING" });

		const timer = window.setTimeout(async () => {
			if (latestInputRef.current.trim().toLowerCase() !== cleanInput) return;

			try {
				const available = await convex.query(
					api.friends.checkUsernameAvailable,
					{
						username: `@${cleanInput}`,
					},
				);

				dispatch({
					type: "RESULT",
					available,
					takenError: t.settings.profileHandleTaken,
				});
			} catch {
				dispatch({ type: "RESULT_ERROR" });
			}
		}, 400);

		return () => clearTimeout(timer);
	}, [usernameInput, profile, t, convex]);

	const handleSaveUsername = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!profile || !check.isAvailable || check.isChecking) return;

		setIsSaving(true);
		setSaveSuccess("");
		try {
			await updateProfile({
				username: usernameInput,
				publicKey: profile.publicKey,
			});
			setSaveSuccess(t.settings.profileHandleUpdateSuccess);
			setTimeout(() => setSaveSuccess(""), 3000);
		} catch (err) {
			const message =
				err instanceof Error
					? err.message
					: t.settings.profileHandleUpdateFailed;
			dispatch({ type: "FIELD_ERROR", error: message });
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="card">
			<h3 style={{ marginBottom: 12 }}>{t.settings.profileHandleTitle}</h3>
			<p
				style={{
					fontSize: "0.85rem",
					color: "var(--text-muted)",
					marginBottom: 20,
				}}
			>
				{t.settings.profileHandleDesc}
			</p>

			{!profile ? (
				<div
					style={{
						padding: 12,
						background: "var(--accent-light)",
						borderRadius: "var(--radius-md)",
						color: "var(--accent-primary)",
						fontSize: "0.85rem",
					}}
				>
					{t.settings.profileHandleSetupRequired}
				</div>
			) : (
				<form onSubmit={handleSaveUsername}>
					<div className="form-group" style={{ marginBottom: 16 }}>
						<label htmlFor="settings-username">
							{t.settings.profileHandleChangeLabel}
						</label>
						<div
							style={{
								position: "relative",
								display: "flex",
								alignItems: "center",
							}}
						>
							<span
								style={{
									position: "absolute",
									left: 12,
									color: "var(--text-muted)",
									fontWeight: 600,
								}}
							>
								@
							</span>
							<input
								id="settings-username"
								type="text"
								value={usernameInput}
								onChange={(e) => setUsernameInput(e.target.value)}
								placeholder="e.g. math_wizard"
								style={{ paddingLeft: 28 }}
								required
							/>
						</div>

						<div style={{ marginTop: 8, fontSize: "0.8rem" }}>
							{check.isChecking && (
								<span style={{ color: "var(--text-muted)" }}>
									{t.settings.profileHandleChecking}
								</span>
							)}
							{!check.isChecking &&
								check.isAvailable === true &&
								usernameInput.trim().toLowerCase() !==
									profile.username.replace("@", "") && (
									<span style={{ color: "var(--success)" }}>
										✅ {t.settings.profileHandleAvailable}
									</span>
								)}
							{!check.isChecking && check.error && (
								<span style={{ color: "var(--danger)" }}>❌ {check.error}</span>
							)}
						</div>
					</div>

					{saveSuccess && (
						<div
							style={{
								color: "var(--success)",
								fontSize: "0.85rem",
								fontWeight: 500,
								marginBottom: 16,
							}}
						>
							{saveSuccess}
						</div>
					)}

					<button
						type="submit"
						className="btn btn-primary"
						disabled={
							!check.isAvailable ||
							check.isChecking ||
							isSaving ||
							usernameInput.trim().toLowerCase() ===
								profile.username.replace("@", "")
						}
					>
						{isSaving
							? t.settings.profileHandleSaving
							: t.settings.profileHandleUpdateBtn}
					</button>
				</form>
			)}
		</div>
	);
}
