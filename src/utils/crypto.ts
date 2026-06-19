// Web Crypto API End-to-End Encryption Helpers
// Hybrid scheme: AES-256-GCM for message body + RSA-OAEP-2048 to wrap the AES key
// This follows the same pattern used by PGP, S/MIME, and modern secure messengers.

// ─── Base64 helpers ──────────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const binaryString = window.atob(base64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes.buffer;
}

// ─── Key management ─────────────────────────────────────────────────
// ponytail: simple direct IndexedDB helper instead of loading a wrapper library.

const DB_NAME = "e2ee_db";
const STORE_NAME = "keys";
const KEY_NAME = "private_key";

function getDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = window.indexedDB.open(DB_NAME, 1);
		request.onupgradeneeded = () => {
			request.result.createObjectStore(STORE_NAME);
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

export async function storePrivateKey(key: CryptoKey): Promise<void> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.put(key, KEY_NAME);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

async function getPrivateKey(): Promise<CryptoKey | null> {
	const db = await getDB();
	const key = await new Promise<CryptoKey | null>((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, "readonly");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.get(KEY_NAME);
		request.onsuccess = () => resolve(request.result || null);
		request.onerror = () => reject(request.error);
	});

	if (key) return key;

	// Migration path: if key not in IndexedDB, check localStorage
	const legacyBase64 = localStorage.getItem("e2ee_private_key");
	if (legacyBase64) {
		try {
			const privBuffer = base64ToArrayBuffer(legacyBase64);
			const importedKey = await window.crypto.subtle.importKey(
				"pkcs8",
				privBuffer,
				{ name: "RSA-OAEP", hash: "SHA-256" },
				false, // Make it non-extractable in IndexedDB!
				["decrypt"],
			);
			await storePrivateKey(importedKey);
			localStorage.removeItem("e2ee_private_key");
			return importedKey;
		} catch (error) {
			console.error("Failed to migrate legacy key from localStorage:", error);
		}
	}
	return null;
}

async function deletePrivateKey(): Promise<void> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.delete(KEY_NAME);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

export async function clearPrivateKey(): Promise<void> {
	localStorage.removeItem("e2ee_private_key");
	await deletePrivateKey();
}

/**
 * Check if the user's private key exists.
 */
export async function hasPrivateKey(): Promise<boolean> {
	const key = await getPrivateKey();
	return key !== null;
}

/**
 * Generate an RSA-OAEP-2048 key pair.
 * Saves the private key to IndexedDB (non-extractable) and returns the public key as base64
 * along with the extractable private key (for password backup).
 */
export async function generateAndSaveKeys(): Promise<{
	publicKeyBase64: string;
	rsaPrivateKey: CryptoKey;
}> {
	const keyPair = await window.crypto.subtle.generateKey(
		{
			name: "RSA-OAEP",
			modulusLength: 2048,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: "SHA-256",
		},
		true, // extractable (so we can export and ZKE backup)
		["encrypt", "decrypt"],
	);

	// Export private key to save as non-extractable in IndexedDB
	const exportedPrivate = await window.crypto.subtle.exportKey(
		"pkcs8",
		keyPair.privateKey,
	);
	const nonExtractablePrivateKey = await window.crypto.subtle.importKey(
		"pkcs8",
		exportedPrivate,
		{ name: "RSA-OAEP", hash: "SHA-256" },
		false, // non-extractable!
		["decrypt"],
	);
	await storePrivateKey(nonExtractablePrivateKey);

	// Export public key to save to Convex
	const exportedPublic = await window.crypto.subtle.exportKey(
		"spki",
		keyPair.publicKey,
	);
	return {
		publicKeyBase64: arrayBufferToBase64(exportedPublic),
		rsaPrivateKey: keyPair.privateKey, // return extractable private key for backup
	};
}

// ─── Hybrid encrypt: AES-GCM message + RSA-OAEP wrapped key ────────

/**
 * Encrypt a plaintext message for a recipient.
 *
 * 1. Generate a random 256-bit AES-GCM key
 * 2. Encrypt the plaintext with AES-GCM
 * 3. Wrap (encrypt) the AES key with the recipient's RSA-OAEP public key
 * 4. Return a JSON envelope: { v:2, iv, key, data } (all base64)
 *
 * The "v:2" marker distinguishes hybrid ciphertexts from the old raw-RSA format.
 */
export async function encryptMessage(
	plaintext: string,
	recipientPublicKeyBase64: string,
): Promise<string> {
	try {
		// Import recipient's RSA public key
		const pubBuffer = base64ToArrayBuffer(recipientPublicKeyBase64);
		const rsaPublicKey = await window.crypto.subtle.importKey(
			"spki",
			pubBuffer,
			{ name: "RSA-OAEP", hash: "SHA-256" },
			false,
			["encrypt"],
		);

		// Generate a one-time AES-256-GCM key
		const aesKey = await window.crypto.subtle.generateKey(
			{ name: "AES-GCM", length: 256 },
			true, // extractable so we can wrap it
			["encrypt"],
		);

		// Encrypt the plaintext with AES-GCM
		const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
		const encoder = new TextEncoder();
		const ciphertextBuffer = await window.crypto.subtle.encrypt(
			{ name: "AES-GCM", iv },
			aesKey,
			encoder.encode(plaintext),
		);

		// Export the raw AES key and wrap it with RSA-OAEP
		const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
		const wrappedKey = await window.crypto.subtle.encrypt(
			{ name: "RSA-OAEP" },
			rsaPublicKey,
			rawAesKey,
		);

		// Bundle everything as a JSON envelope
		const envelope = {
			v: 2, // version marker — distinguishes from old raw-RSA format
			iv: arrayBufferToBase64(iv.buffer),
			key: arrayBufferToBase64(wrappedKey),
			data: arrayBufferToBase64(ciphertextBuffer),
		};
		return JSON.stringify(envelope);
	} catch (error) {
		console.error("Encryption failed:", error);
		return "[Failed to encrypt message]";
	}
}

// ─── Hybrid decrypt ─────────────────────────────────────────────────

/**
 * Decrypt a message. Handles both:
 *   - v2 hybrid envelopes (JSON with { v:2, iv, key, data })
 *   - Legacy raw-RSA ciphertexts (plain base64 string)
 */
export async function decryptMessage(
	ciphertextPayload: string,
): Promise<string> {
	try {
		const rsaPrivateKey = await getPrivateKey();
		if (!rsaPrivateKey) {
			return "[Private key missing - cannot decrypt]";
		}

		// ── Try v2 hybrid format first ──────────────────────────────────
		let envelope: {
			v?: number;
			iv?: string;
			key?: string;
			data?: string;
		} | null = null;
		try {
			envelope = JSON.parse(ciphertextPayload);
		} catch {
			// Not JSON → treat as legacy raw-RSA ciphertext below
		}

		if (
			envelope &&
			envelope.v === 2 &&
			envelope.iv &&
			envelope.key &&
			envelope.data
		) {
			// Unwrap the AES key with RSA-OAEP
			const wrappedKey = base64ToArrayBuffer(envelope.key);
			const rawAesKey = await window.crypto.subtle.decrypt(
				{ name: "RSA-OAEP" },
				rsaPrivateKey,
				wrappedKey,
			);

			// Import the AES key
			const aesKey = await window.crypto.subtle.importKey(
				"raw",
				rawAesKey,
				{ name: "AES-GCM", length: 256 },
				false,
				["decrypt"],
			);

			// Decrypt the message with AES-GCM
			const iv = base64ToArrayBuffer(envelope.iv);
			const ciphertextBuffer = base64ToArrayBuffer(envelope.data);
			const decryptedBuffer = await window.crypto.subtle.decrypt(
				{ name: "AES-GCM", iv: new Uint8Array(iv) },
				aesKey,
				ciphertextBuffer,
			);

			return new TextDecoder().decode(decryptedBuffer);
		}

		// ── Legacy raw-RSA format (pre-v2) ──────────────────────────────
		const ciphertextBuffer = base64ToArrayBuffer(ciphertextPayload);
		const decryptedBuffer = await window.crypto.subtle.decrypt(
			{ name: "RSA-OAEP" },
			rsaPrivateKey,
			ciphertextBuffer,
		);
		return new TextDecoder().decode(decryptedBuffer);
	} catch (error) {
		console.error("Decryption failed:", error);
		return "🔒 Message unavailable (key mismatch)";
	}
}

// ─── Zero-Knowledge Escrow (ZKE) helpers ─────────────────────────────

/**
 * Derive a 256-bit AES-GCM CryptoKey from a user password and salt using
 * PBKDF2-HMAC-SHA256 with 600 000 iterations (NIST SP 800-132 / 2025).
 *
 * ZERO-KNOWLEDGE: This function runs 100% client-side.
 * The derived key MUST NOT be transmitted to the server.
 */
export async function deriveAesKeyFromPassword(
	password: string,
	salt: Uint8Array,
): Promise<CryptoKey> {
	// 1. Import the password as raw PBKDF2 key material
	const enc = new TextEncoder();
	const keyMaterial = await window.crypto.subtle.importKey(
		"raw",
		enc.encode(password),
		{ name: "PBKDF2" },
		false,
		["deriveKey"],
	);

	// 2. Derive a non-extractable AES-GCM-256 key
	return window.crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: salt as unknown as BufferSource,
			iterations: 600_000,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		false, // non-extractable: the AES key itself never leaves the browser
		["encrypt", "decrypt"],
	);
}

/**
 * Export an RSA-OAEP private key as PKCS#8 and encrypt it with an AES-GCM key.
 *
 * Returns a single Base64 string: base64( iv[12 bytes] || ciphertext ).
 *
 * ZERO-KNOWLEDGE: Only the ciphertext is sent to the server; the AES key and
 * plaintext private key bytes never leave the browser.
 */
export async function backupPrivateKey(
	rsaPrivateKey: CryptoKey,
	aesKey: CryptoKey,
): Promise<string> {
	// Export the RSA private key as raw PKCS#8 bytes
	const pkcs8Buffer = await window.crypto.subtle.exportKey(
		"pkcs8",
		rsaPrivateKey,
	);

	// Generate a fresh 96-bit IV for AES-GCM (12 bytes)
	const iv = window.crypto.getRandomValues(new Uint8Array(12));

	// Encrypt the PKCS#8 bytes with AES-GCM
	const ciphertextBuffer = await window.crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		aesKey,
		pkcs8Buffer,
	);

	// Concatenate IV || ciphertext into a single Uint8Array, then Base64-encode
	const payload = new Uint8Array(iv.byteLength + ciphertextBuffer.byteLength);
	payload.set(iv, 0);
	payload.set(new Uint8Array(ciphertextBuffer), iv.byteLength);

	return arrayBufferToBase64(payload.buffer);
}

/**
 * Decrypt a ZKE escrow payload (base64( iv || ciphertext )) with an AES-GCM
 * key and re-import the result as an RSA-OAEP-2048 private key.
 *
 * Throws a descriptive error if the AES-GCM auth tag verification fails
 * (wrong password -> wrong AES key -> decryption error).
 */
export async function restorePrivateKey(
	encryptedPayload: string,
	aesKey: CryptoKey,
): Promise<CryptoKey> {
	const raw = new Uint8Array(base64ToArrayBuffer(encryptedPayload));

	if (raw.byteLength < 13) {
		throw new Error("Invalid escrow payload: too short.");
	}

	const iv = raw.slice(0, 12);
	const ciphertext = raw.slice(12);

	let pkcs8Buffer: ArrayBuffer;
	try {
		pkcs8Buffer = await window.crypto.subtle.decrypt(
			{ name: "AES-GCM", iv },
			aesKey,
			ciphertext,
		);
	} catch {
		// AES-GCM auth tag failure -> wrong password or corrupted payload
		throw new Error(
			"Key decryption failed: incorrect password or corrupted escrow data.",
		);
	}

	// Re-import the decrypted PKCS#8 bytes as a usable RSA-OAEP private key
	return window.crypto.subtle.importKey(
		"pkcs8",
		pkcs8Buffer,
		{ name: "RSA-OAEP", hash: "SHA-256" },
		false, // non-extractable!
		["decrypt"],
	);
}
