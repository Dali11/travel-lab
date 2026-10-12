import { NextResponse } from "next/server";
import {
  generateCsrfToken,
  isRateLimited,
  recordFailedAttempt,
  clearFailedAttempts,
  SESSION_COOKIE,
  CSRF_COOKIE,
  setSessionCookie,
  getUserForSession,
  createSessionToken,
} from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const { username, password } = raw ?? {};

  if (typeof username !== "string" || typeof password !== "string" || username.length === 0 || password.length === 0) {
    return NextResponse.json({ error: "username and password are required." }, { status: 400 });
  }
  if (password.length < 16) {
    return NextResponse.json({ error: "Password must be at least 16 characters." }, { status: 400 });
  }

  // Rate limit per username before doing any lookup work.
  if (isRateLimited(username)) {
    return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
  }

  const user = await getUserForSession(username);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    recordFailedAttempt(username);
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  clearFailedAttempts(username);

  const sessionToken = createSessionToken({ sub: username, iat: Date.now(), exp: Date.now() + 30 * 24 * 60 * 60 * 1000 });
  const csrfToken = generateCsrfToken();

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, sessionToken);
  // Non-HttpOnly so the admin UI can echo it back on write-only requests.
  response.cookies.set(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return response;
}
