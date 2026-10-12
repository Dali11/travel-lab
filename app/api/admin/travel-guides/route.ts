import { desc, like, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAdminSession } from "../session";
import { getDb } from "@/db";
import { travel_guides } from "@/db/schema";

/** Travel guides admin surface. Public pages read `lib/guides.ts`, so the values
 *  below are the persistent source used by the site. Edits persist to Postgres. */
export async function GET(request: Request) {
  const identity = await getAdminSession(request);
  if (!identity) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const order = searchParams.get("order") ?? "newest";
  const limit = Math.min(500, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10)));

  const rows = await getDb().select().from(travel_guides);

  const items = rows
    .filter((r) => !q || r.title.includes(q) || r.slug.includes(q) || r.topic.includes(q))
    .sort((a, b) => (order === "oldest" ? a.createdAt.getTime() - b.createdAt.getTime() : b.createdAt.getTime() - a.createdAt.getTime()))
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      topic: r.topic,
      body: r.body,
      photo: r.photo,
      destinationIds: r.destinationIds,
      published: r.published,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

  return NextResponse.json({ items, total: items.length });
}
