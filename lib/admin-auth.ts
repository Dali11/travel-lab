import { NextResponse } from "next/server";
import { getAdminSession } from "@/app/api/admin/session";
import { validateCsrf } from "@/lib/auth";

/**
 * One server-side check for every admin write endpoint: a valid identity AND a
 * CSRF token that matches the `csrf-token` cookie. Reads are NOT checked here —
 * those must keep returning 401 only.
 *
 * Returns `null` when the caller may proceed, otherwise a `Response` to send
 * straight back. Keeping the API as `Response | null` (instead of a custom
 * object) means the route handler keeps its own `Response`-returning type and
 * Next.js does not complain about a mismatched return shape.
 */
export async function requireAdminWrite(request: Request): Promise<Response | null> {
  const identity = await getAdminSession(request);
  if (!identity) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!validateCsrf(request)) {
    return NextResponse.json({ error: "Missing or invalid CSRF token." }, { status: 403 });
  }

  return null;
}
