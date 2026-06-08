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

/**
 * Check if the user's private key exists in localStorage.
 */
export function hasPrivateKey(): boolean {
  return localStorage.getItem("e2ee_private_key") !== null;
}

/**
 * Generate an RSA-OAEP-2048 key pair.
 * Saves the private key to localStorage and returns the public key as base64.
 */
export async function generateAndSaveKeys(): Promise<string> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );

  // Export private key and save to localStorage
  const exportedPrivate = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );
  const privateKeyBase64 = arrayBufferToBase64(exportedPrivate);
  localStorage.setItem("e2ee_private_key", privateKeyBase64);

  // Export public key to save to Convex
  const exportedPublic = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );
  return arrayBufferToBase64(exportedPublic);
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
  recipientPublicKeyBase64: string
): Promise<string> {
  try {
    // Import recipient's RSA public key
    const pubBuffer = base64ToArrayBuffer(recipientPublicKeyBase64);
    const rsaPublicKey = await window.crypto.subtle.importKey(
      "spki",
      pubBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );

    // Generate a one-time AES-256-GCM key
    const aesKey = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true, // extractable so we can wrap it
      ["encrypt"]
    );

    // Encrypt the plaintext with AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
    const encoder = new TextEncoder();
    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      encoder.encode(plaintext)
    );

    // Export the raw AES key and wrap it with RSA-OAEP
    const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
    const wrappedKey = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      rsaPublicKey,
      rawAesKey
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
  ciphertextPayload: string
): Promise<string> {
  try {
    const privateKeyBase64 = localStorage.getItem("e2ee_private_key");
    if (!privateKeyBase64) {
      return "[Private key missing - cannot decrypt]";
    }

    // Import the user's RSA private key
    const privBuffer = base64ToArrayBuffer(privateKeyBase64);
    const rsaPrivateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      privBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["decrypt"]
    );

    // ── Try v2 hybrid format first ──────────────────────────────────
    let envelope: { v?: number; iv?: string; key?: string; data?: string } | null = null;
    try {
      envelope = JSON.parse(ciphertextPayload);
    } catch {
      // Not JSON → treat as legacy raw-RSA ciphertext below
    }

    if (envelope && envelope.v === 2 && envelope.iv && envelope.key && envelope.data) {
      // Unwrap the AES key with RSA-OAEP
      const wrappedKey = base64ToArrayBuffer(envelope.key);
      const rawAesKey = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        rsaPrivateKey,
        wrappedKey
      );

      // Import the AES key
      const aesKey = await window.crypto.subtle.importKey(
        "raw",
        rawAesKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      // Decrypt the message with AES-GCM
      const iv = base64ToArrayBuffer(envelope.iv);
      const ciphertextBuffer = base64ToArrayBuffer(envelope.data);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        aesKey,
        ciphertextBuffer
      );

      return new TextDecoder().decode(decryptedBuffer);
    }

    // ── Legacy raw-RSA format (pre-v2) ──────────────────────────────
    const ciphertextBuffer = base64ToArrayBuffer(ciphertextPayload);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      rsaPrivateKey,
      ciphertextBuffer
    );
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    return "🔒 Message unavailable (key mismatch)";
  }
}
