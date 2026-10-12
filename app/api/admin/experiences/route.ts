import { NextResponse } from "next/server";
import { getAdminSession } from "../session";
import { getDb } from "@/db";
import { experiences } from "@/db/schema";

/** Experiences admin surface. Public pages read `lib/data/experiences.ts`, so
 *  these records are threaded through the database first and surfaced here.
 *  Changing the public site is a separate, reviewed step. */
export async function GET(request: Request) {
  const identity = await getAdminSession(request);
  if (!identity) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const order = searchParams.get("order") ?? "newest";
  const limit = Math.min(500, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "50", 10)));

  const rows = await getDb().select().from(experiences);

  const items = rows
    .filter((r) => !q || r.title.includes(q) || r.slug.includes(q) || r.category.includes(q))
    .sort((a, b) => (order === "oldest" ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()))
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: r.category,
      summary: r.summary,
      photo: r.photo,
      destinationIds: r.destinationIds,
      bookable: r.bookable,
      published: r.published,
      priceFromUsd: r.priceFromUsd,
      durationHours: r.durationHours,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

  return NextResponse.json({ items, total: items.length });
}
