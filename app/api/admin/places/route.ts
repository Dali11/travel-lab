import { NextResponse } from "next/server";
import { desc, eq, isNull, like, or } from "drizzle-orm";
import { getDb } from "@/db";
import { places } from "@/db/schema";
import { getAdminSession } from "../session";
import { requireAdminWrite } from "@/lib/admin-auth";

const MIN_TEXT = 2;
const MIN_BLURB = 10;

interface CreatePlace {
  name: string;
  region: string;
  category: string;
  blurb: string;
  imageUrl?: string;
}

interface UpdatePlace {
  name?: string;
  region?: string;
  category?: string;
  blurb?: string;
  imageUrl?: string;
}

function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 120) || "untitled";
}

/** Build a URL-safe slug from a name when the caller did not supply one. */
function fallbackSlug(input: CreatePlace | UpdatePlace): string {
  const name = (input as { name?: string }).name;
  return typeof name === "string" && name.trim().length > 0 ? normalizeSlug(name) : "";
}

export async function GET(request: Request) {
  const user = await getAdminSession(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(200, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "50", 10)));

  let where: any;
  if (q) {
    where = or(
      like(places.name, `%${q}%`),
      like(places.slug, `%${q.toLowerCase()}%`),
      like(places.region, `%${q}%`)
    );
  } else {
    where = places;
  }

  const [all, total] = await Promise.all([
    getDb()
      .select()
      .from(places)
      .where(where)
      .orderBy(desc(places.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    getDb().select().from(places).where(where).then((rows) => rows.length),
  ]);

  return NextResponse.json({
    items: all,
    total,
    page,
    limit,
    search: q,
  });
}

export async function POST(request: Request) {
  const response = await requireAdminWrite(request);
  if (response) return response;

  let input: CreatePlace;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const { name, region, category, blurb, imageUrl } = input;
  if (typeof name !== "string" || name.trim().length < MIN_TEXT) {
    return NextResponse.json({ error: "A name of at least 2 characters is required." }, { status: 400 });
  }
  if (typeof region !== "string" || region.trim().length < MIN_TEXT) {
    return NextResponse.json({ error: "A region of at least 2 characters is required." }, { status: 400 });
  }
  if (typeof category !== "string" || category.trim().length === 0) {
    return NextResponse.json({ error: "A category is required." }, { status: 400 });
  }
  if (typeof blurb !== "string" || blurb.trim().length < MIN_BLURB) {
    return NextResponse.json({ error: `A blurb of at least ${MIN_BLURB} characters is required.` }, { status: 400 });
  }
  if (imageUrl !== undefined && (typeof imageUrl !== "string" || !imageUrl.startsWith("https://"))) {
    return NextResponse.json({ error: "imageUrl must be a valid https URL." }, { status: 400 });
  }

  const slug = normalizeSlug(name);
  const dupRows = await getDb().select().from(places).where(eq(places.slug, slug));
  if (dupRows[0]) {
    return NextResponse.json({ error: "A place with that name already exists (duplicate slug)." }, { status: 409 });
  }

  const result = await getDb()
    .insert(places)
    .values({ slug, name: name.trim(), region: region.trim(), category: category.trim(), blurb: blurb.trim(), imageUrl: imageUrl ?? null, createdAt: new Date() })
    .returning();

  return NextResponse.json({ ok: true, place: result[0] }, { status: 201 });
}
