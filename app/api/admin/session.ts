import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/**
 * Authenticate and authorise the caller for the /admin area.
 *
 * Returns the caller's identity when there is a valid, unexpired session AND the
 * caller's database role is "admin". Returns null when no valid session exists or
 * the role is not admin. Never throws.
 *
 * This is the single server-side enforcement point for every admin route: the
 * client may hide navigation, but only this function can actually grant access.
 */
export async function getAdminSession(request: Request): Promise<{ username: string } | null> {
  const user = await getSessionUser(request);
  if (!user || user.role !== "admin") return null;
  return { username: user.username };
}

/** Redirect an unauthenticated caller to the login page. */
export function redirectUnauthenticated(): NextResponse {
  const target = process.env.SITE_URL
    ? `${process.env.SITE_URL}/admin/login`
    : "http://localhost:3000/admin/login";
  return NextResponse.redirect(new URL(target));
}
