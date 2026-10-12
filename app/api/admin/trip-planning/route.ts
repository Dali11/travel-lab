import { NextResponse } from "next/server";
import { getAdminSession } from "../session";
import { getDb } from "@/db";
import { trip_planning } from "@/db/schema";
import { requireAdminWrite } from "@/lib/admin-auth";

/** Trip-planning machine defaults. Each row is a `key => JSON value` mapping.
 *  These drive the itinerary builder on the public site, so edits persist to
 *  the database and flow through to the planner. */
export async function GET(request: Request) {
  const identity = await getAdminSession(request);
  if (!identity) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rows = await getDb().select().from(trip_planning);
  return NextResponse.json({
    items: rows.map((r) => ({ key: r.key, value: r.value })),
  });
}

export async function PUT(request: Request) {
  const response = await requireAdminWrite(request);
  if (response) return response;

  let body: { key: string; value: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body.key !== "string" || body.key.length > 120 || typeof body.value === "undefined") {
    return NextResponse.json({ error: "A key and JSON value are required." }, { status: 400 });
  }

  // Upsert on the unique `key`. Never creates duplicates and never deletes other
  // rows.
  const [inserted] = await getDb()
    .insert(trip_planning)
    .values({ key: body.key, value: body.value })
    .onConflictDoUpdate({
      target: trip_planning.key,
      set: { value: body.value },
    })
    .returning();

  return NextResponse.json({ ok: true, item: { key: inserted.key, value: inserted.value } });
}
