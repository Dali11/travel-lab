import { NextResponse } from "next/server";
import { getAdminSession } from "../session";
import { getDb } from "@/db";
import { flights } from "@/db/schema";

/** Flight corridors admin surface. Public pages read `lib/flights.ts` and
 *  `lib/data/routes.ts`, so this surface mirrors the database value rather
 *  than swapping the public source. */
export async function GET(request: Request) {
  const identity = await getAdminSession(request);
  if (!identity) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const order = searchParams.get("order") ?? "newest";
  const limit = Math.min(500, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "50", 10)));

  const rows = await getDb().select().from(flights);

  const items = rows
    .sort((a, b) => (order === "oldest" ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()))
    .map((r) => ({
      id: r.id,
      corridorId: r.corridorId,
      fromCity: r.fromCity,
      fromAirport: r.fromAirport,
      toAirport: r.toAirport,
      airline: r.airline,
      airlineCode: r.airlineCode,
      stops: r.stops,
      durationMinutes: r.durationMinutes,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

  return NextResponse.json({ items, total: items.length });
}
