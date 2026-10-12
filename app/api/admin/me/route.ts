import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/**
 * Return the identity of the caller, or 401 when there is no valid session.
 *
 * Read-only: a guest can call this to discover whether they are logged in. Does
 * not reveal who is logged in when unauthenticated.
 */
export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, username: user.username, role: user.role });
}
