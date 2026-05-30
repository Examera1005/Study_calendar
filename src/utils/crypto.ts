// Web Crypto API End-to-End Encryption Helpers

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

export async function encryptWithPublicKey(
  text: string,
  publicKeyBase64: string
): Promise<string> {
  try {
    const pubBuffer = base64ToArrayBuffer(publicKeyBase64);
    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      pubBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"]
    );

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(text);
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      dataBuffer
    );

    return arrayBufferToBase64(encryptedBuffer);
  } catch (error) {
    console.error("Encryption failed:", error);
    return "[Failed to encrypt message]";
  }
}

export async function decryptWithPrivateKey(
  ciphertextBase64: string
): Promise<string> {
  try {
    const privateKeyBase64 = localStorage.getItem("e2ee_private_key");
    if (!privateKeyBase64) {
      return "[Private key missing - cannot decrypt]";
    }

    const privBuffer = base64ToArrayBuffer(privateKeyBase64);
    const privateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      privBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["decrypt"]
    );

    const ciphertextBuffer = base64ToArrayBuffer(ciphertextBase64);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      ciphertextBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    return "[Decryption Error: Key mismatch]";
  }
}
