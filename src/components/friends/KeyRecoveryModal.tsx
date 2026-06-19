import { useState } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import {
	deriveAesKeyFromPassword,
	restorePrivateKey,
	storePrivateKey,
} from "../../utils/crypto";
import { Modal } from "../ui/Modal";

interface KeyRecoveryModalProps {
	/** Base64-encoded PBKDF2 salt stored on Convex */
	userSalt: string;
	/** Base64 AES-GCM escrow payload: iv || ciphertext */
	encryptedPrivateKey: string;
	/** Called when the key has been successfully restored to localStorage */
	onRestored: () => void;
	/** Called when the user chooses to regenerate a new key pair (old msgs lost) */
	onRegenerate: () => void;
}

export function KeyRecoveryModal({
	userSalt,
	encryptedPrivateKey,
	onRestored,
	onRegenerate,
}: KeyRecoveryModalProps) {
	const { t } = useLanguage();
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleRestore = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!password) return;

		setLoading(true);
		setError("");

		try {
			// 1. Decode the stored Base64 salt back to a Uint8Array
			const saltBinary = window.atob(userSalt);
			const salt = new Uint8Array(saltBinary.length);
			for (let i = 0; i < saltBinary.length; i++) {
				salt[i] = saltBinary.charCodeAt(i);
			}

			// 2. Derive the AES-GCM key from the entered password + stored salt
			const aesKey = await deriveAesKeyFromPassword(password, salt);

			// 3. Decrypt the escrow payload → re-import as RSA CryptoKey (non-extractable)
			const rsaPrivateKey = await restorePrivateKey(
				encryptedPrivateKey,
				aesKey,
			);

			// 4. Save to IndexedDB
			await storePrivateKey(rsaPrivateKey);

			// 5. Notify the parent — it will re-render
			onRestored();
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			if (
				msg.includes("incorrect password") ||
				msg.includes("decryption failed") ||
				msg.includes("Key decryption failed")
			) {
				setError(t.friends.keyRecoveryError);
			} else {
				setError(msg);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal title={t.friends.keyRecoveryTitle} onClose={onRestored}>
			<div className="key-recovery-modal-body">
				{/* Icon + description */}
				<div className="key-recovery-icon-row">
					<span className="key-recovery-icon">🔐</span>
					<p className="key-recovery-desc">{t.friends.keyRecoveryDesc}</p>
				</div>

				{/* Zero-knowledge notice */}
				<div className="key-recovery-zk-notice">
					🔒 {t.friends.keyRecoveryZeroKnowledgeNotice}
				</div>

				{/* Error */}
				{error && (
					<div className="error-msg" style={{ marginBottom: 16 }}>
						{error}
					</div>
				)}

				{/* Password form */}
				<form onSubmit={handleRestore}>
					<div className="form-group">
						<label htmlFor="key-recovery-password">
							{t.friends.keyRecoveryPasswordLabel}
						</label>
						<input
							id="key-recovery-password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder={t.friends.keyRecoveryPasswordPlaceholder}
							autoComplete="current-password"
							required
						/>
					</div>

					<button
						type="submit"
						className="btn btn-primary btn-full"
						disabled={loading || !password}
						id="key-recovery-submit"
					>
						{loading ? t.friends.keyRecoveryLoading : t.friends.keyRecoveryBtn}
					</button>
				</form>

				{/* Regenerate fallback */}
				<div className="key-recovery-regenerate-section">
					<p className="key-recovery-forgot-desc">
						{t.friends.keyRecoveryForgotDesc}
					</p>
					<button
						type="button"
						className="btn btn-ghost key-recovery-regenerate-btn"
						onClick={onRegenerate}
						id="key-recovery-regenerate"
					>
						{t.friends.keyRecoveryRegenerateLink}
					</button>
				</div>
			</div>
		</Modal>
	);
}
