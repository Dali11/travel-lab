import { createRequire } from "module";

// `node:crypto` is an ESM namespace under `@types/node`, and its named exports
// (`randomBytes`, `timingSafeEqual`) are not consistently visible through a
// namespace import. `createRequire` gives us the real CommonJS module where all
// of them are present.
const require = createRequire(import.meta.url);
const crypto = require("node:crypto");

const MIN_PASSWORD_LENGTH = 16;

/** Hash a password using scrypt (memory-hard KDF). Never store the plaintext. */
export async function hashPassword(password: string): Promise<string> {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be a string of at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64);
  const hash = Buffer.from(derived).toString("hex");
  return `${salt}:${hash}`;
}

/** Verify a password against a stored `salt:hash` string, in constant time. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return crypto.timingSafeEqual(Buffer.from(derived), expected);
}
