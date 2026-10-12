import { NextResponse } from "next/server";
import { clearSessionCookie, clearFailedAttempts } from "@/lib/auth";

/** De-authenticate a browser: clear session + CSRF cookies and clear the rate-limit key. */
export async function POST() {
  const response = NextResponse.redirect(new URL("/admin/login", process.env.SITE_URL ? process.env.SITE_URL : "http://localhost:3000"));
  clearSessionCookie(response);
  response.cookies.delete("csrf-token");
  clearFailedAttempts("__logout__");
  return response;
}
