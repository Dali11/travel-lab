import { NextResponse } from "next/server";
import { getAdminSession } from "../session";
import { getDb } from "@/db";
import { app_settings } from "@/db/schema";
import { requireAdminWrite } from "@/lib/admin-auth";

/** Flat key/value settings surfaced by the Settings page. These are the
 *  operator-level switches (e.g. site-wide notice text) that should persist.
 *  Edits go through PUT on a specific key. */
export async function GET(request: Request) {
  const identity = await getAdminSession(request);
  if (!identity) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rows = await getDb().select().from(app_settings);
  return NextResponse.json({ items: rows.map((r) => ({ key: r.key, value: r.value })) });
}

export async function PUT(request: Request) {
  const response = await requireAdminWrite(request);
  if (response) return response;

  let body: { key: string; value: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body.key !== "string" || body.key.length === 0 || body.key.length > 120 || typeof body.value !== "string") {
    return NextResponse.json({ error: "A non-empty key and string value are required." }, { status: 400 });
  }

  const [inserted] = await getDb()
    .insert(app_settings)
    .values({ key: body.key, value: body.value })
    .onConflictDoUpdate({ target: app_settings.key, set: { value: body.value } })
    .returning();

  return NextResponse.json({ ok: true, item: { key: inserted.key, value: inserted.value } });
}
