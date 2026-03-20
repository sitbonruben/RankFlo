import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    // In OSS/dev mode without a key, return a deterministic zero key.
    // Data is still stored — just not encrypted. Log a warning.
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[RankFlo] WARNING: ENCRYPTION_KEY is not set. API keys are stored in plaintext. " +
        "Set ENCRYPTION_KEY to a 64-char hex string to enable encryption at rest."
      );
    }
    return Buffer.alloc(32, 0);
  }
  const buf = Buffer.from(raw, "hex");
  if (buf.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
  }
  return buf;
}

/**
 * Encrypt a plaintext string. Returns a hex string: iv + tag + ciphertext.
 * Safe to store in the database.
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: hex(iv) + ":" + hex(tag) + ":" + hex(ciphertext)
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt a value produced by encrypt(). Returns the original plaintext.
 * If the value doesn't look encrypted (no colons), returns it as-is
 * so plaintext values stored before encryption was added still work.
 */
export function decrypt(value: string): string {
  if (!value.includes(":")) {
    // Legacy plaintext value — return as-is
    return value;
  }
  const parts = value.split(":");
  if (parts.length !== 3) return value;
  const [ivHex, tagHex, encHex] = parts;
  const key = getKey();
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");
}

/**
 * Mask a decrypted key for display (e.g. "sk-ant-api03-xxxx...").
 */
export function maskKey(plaintext: string, visibleChars = 14): string {
  return `${plaintext.slice(0, visibleChars)}...`;
}
