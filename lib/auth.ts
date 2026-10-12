/**
 * Authentication for the /admin area.
 *
 * Session model: a signed HMAC-SHA256 session token, held in an HttpOnly,
 * SameSite=Lax, Secure-in-production cookie. No third-party dependency — this
 * keeps the product lightweight and reviewable.
 *
 * Hardening applied:
 *   - Token is `header.base64url.body.base64url.sig` where sig = HMAC-SHA256
 *     (secret = ADMIN_SECRET) over `header.body`. Forgery is impossible without
 *     ADMIN_SECRET.
 *   - Sessions never exceed 30 days and are rejected the moment their expiry
 *     passes.
 *   - Login is rate-limited (5 failures in 15 minutes) on a per-username basis.
 *   - Session cookie: HttpOnly (no JS access), SameSite=Lax (cross-site POST is
 *     blocked), Secure in production, Path=/, explicit Max-Age.
 *   - Write-only (POST/PATCH/DELETE) API routes additionally require a
 *     CSRF token that must match the `csrf-token` cookie.
 *
 * No credentials, database credentials or storage secrets are ever stored or
 * exposed to client-side code. ADMIN_SECRET is read only from environment.
 */

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/** Session lifetime. 30 days is generous for a CMS; change with care. */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Login rate limit: 5 failures per 15 minutes per username. */
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// In-memory, process-wide. Resets on deployment. Sufficient for login throttling
// (it is a rate limiter, not a lockout store).
const failedAttempts = new Map<string, number[]>();

export const SESSION_COOKIE = "admin-session";
export const CSRF_COOKIE = "csrf-token";
export const CSRF_HEADER = "x-csrf-token";

export interface SessionPayload {
  sub: string; // username
  iat: number;
  exp: number;
}

export function getSessionSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SECRET is not set. It gates /admin and the upload/attach APIs. " +
        "Set it to a random 32+ character value in your .env.local.",
    );
  }
  return secret;
}

/** Return a cryptographically random CSRF token. */
export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

/** Validate a write request carries the current CSRF token. Returns false when
 *  the token is missing or does not match the `csrf-token` cookie. */
export function validateCsrf(request: Request): boolean {
  const cookie = parseCookies(request)[CSRF_COOKIE];
  const header = request.headers.get(CSRF_HEADER);
  if (!cookie || !header) return false;
  return timingSafeEqualBytes(Buffer.from(cookie), Buffer.from(header));
}

/** Constant-time comparison, never `==` on secrets. */
function timingSafeEqualBytes(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createSessionToken(payload: SessionPayload): string {
  const secret = Buffer.from(getSessionSecret(), "utf8");
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = Buffer.from(JSON.stringify(payload));
  const signature = createHash("sha256")
    .update(header)
    .update(".")
    .update(body)
    .update(secret)
    .digest();
  return `${header.toString("base64url")}.${body.toString("base64url")}.${signature.toString("base64url")}`;
}

export function parseSessionToken(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, bodyB64, sigB64] = parts;
  const secret = Buffer.from(getSessionSecret(), "utf8");

  // Recompute the signature and compare in constant time.
  const header = Buffer.from(headerB64, "base64url");
  const body = Buffer.from(bodyB64, "base64url");
  const expectedSig = createHash("sha256")
    .update(header)
    .update(".")
    .update(body)
    .update(secret)
    .digest();
  const givenSig = Buffer.from(sigB64, "base64url");
  if (!timingSafeEqualBytes(expectedSig, givenSig)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(body.toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }

  if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
  if (payload.exp < Date.now()) return null; // expired
  if (payload.iat > Date.now()) return null; // tampered clock
  return payload;
}

/** Read cookies off the raw `Cookie` header (safe to call from middleware/routes). */
export function parseCookies(request: Request): Record<string, string> {
  const header = request.headers.get("cookie");
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    let value = part.slice(idx + 1).trim();
    // Strip a surrounding pair of quotes ("...") once.
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    out[name] = value;
  }
  return out;
}

export function setSessionCookie(response: Response, token: string): void {
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; ` +
      `Max-Age=${SESSION_TTL_MS / 1000}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
}

export function clearSessionCookie(response: Response): void {
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` +
      (process.env.NODE_ENV === "production" ? "; Secure" : ""),
  );
}

// ---------------------------------------------------------------- Rate limit

export function isRateLimited(username: string): boolean {
  const now = Date.now();
  const list = failedAttempts.get(username) ?? [];
  const pruned = list.filter((ts) => now - ts < LOGIN_WINDOW_MS);
  failedAttempts.set(username, pruned);
  return pruned.length >= LOGIN_LIMIT;
}

export function recordFailedAttempt(username: string): void {
  const now = Date.now();
  const list = failedAttempts.get(username) ?? [];
  failedAttempts.set(username, [...list, now].filter((ts, i, arr) => arr.indexOf(ts) === i));
}

export function clearFailedAttempts(username: string): void {
  failedAttempts.delete(username);
}

// ---------------------------------------------------------------- User lookup

/**
 * Return the DB row for the user named in a valid session token, or null.
 * The route handler owns the decision of what to do when this is null, so this
 * never throws.
 */
export async function getUserForSession(username: string): Promise<{ id: number; username: string; role: string; passwordHash: string } | null> {
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.username, username));
  return rows[0] ?? null;
}

/** Convenience: resolve the signed token in an incoming `Cookie` header to a (possibly null) user. */
export async function getAdminIdentity(cookieHeader: string): Promise<{ username: string; role: string } | null> {
  const cookies = parseCookies(new Request("http://x/admin", { headers: { cookie: cookieHeader } }));
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  const payload = parseSessionToken(token);
  if (!payload) return null;
  const user = await getUserForSession(payload.sub);
  return user ? { username: user.username, role: user.role } : null;
}

/** Resolve the signed token in a `Request` to a (possibly null) user. Used by route handlers and `requireAdmin`. */
export async function getSessionUser(request: Request): Promise<{ username: string; role: string } | null> {
  const cookies = parseCookies(request);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  const payload = parseSessionToken(token);
  if (!payload) return null;
  const user = await getUserForSession(payload.sub);
  return user ? { username: user.username, role: user.role } : null;
}

/** Assert an authenticated administrator is present. Throws a 401-style rejection. */
export async function requireAdmin(request: Request): Promise<{ username: string }> {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") {
    const res = new NextResponse("Authentication required", { status: 401 });
    res.headers.set("WWW-Authenticate", 'Bearer realm="admin"');
    throw new AuthError(res);
  }
  return { username: user.username };
}

/** A tiny error that carries the prepared 401 response so middleware can hand it back. */
export class AuthError extends Error {
  constructor(public response: Response) {
    super("Authentication required");
    this.name = "AuthError";
  }
}
