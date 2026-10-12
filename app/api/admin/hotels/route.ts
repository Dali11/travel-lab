import { NextResponse } from "next/server";
import { desc, eq, like, or } from "drizzle-orm";
import { getDb } from "@/db";
import { hotels } from "@/db/schema";
import { getAdminSession } from "../session";
import { requireAdminWrite } from "@/lib/admin-auth";

interface CreateHotel {
  name: string;
  location: string;
  tier: string;
  pricePerNight: number;
  rating: number;
  blurb: string;
  imageUrl?: string;
}

interface UpdateHotel {
  name?: string;
  location?: string;
  tier?: string;
  pricePerNight?: number;
  rating?: number;
  blurb?: string;
  imageUrl?: string;
}

const MIN_TEXT = 2;
const MIN_BLURB = 10;

function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 120) || "untitled";
}

function validateCreate(input: Omit<CreateHotel, "name"> & { name: string }): string | null {
  if (typeof input.name !== "string" || input.name.trim().length < MIN_TEXT) {
    return "A name of at least 2 characters is required.";
  }
  if (typeof input.location !== "string" || input.location.trim().length < MIN_TEXT) {
    return "A location is required.";
  }
  if (typeof input.tier !== "string" || input.tier.trim().length === 0) {
    return "A tier is required.";
  }
  if (!Number.isInteger(input.pricePerNight) || input.pricePerNight < 0) {
    return "pricePerNight must be a whole number of USD.";
  }
  if (input.rating < 0 || input.rating > 50) {
    return "rating must be between 0 and 50.";
  }
  if (typeof input.blurb !== "string" || input.blurb.trim().length < MIN_BLURB) {
    return `A blurb of at least ${MIN_BLURB} characters is required.`;
  }
  if (input.imageUrl !== undefined && (typeof input.imageUrl !== "string" || !input.imageUrl.startsWith("https://"))) {
    return "imageUrl must be a valid https URL.";
  }
  return null;
}

function validatePatch(input: UpdateHotel): string | null {
  if (input.name !== undefined && (typeof input.name !== "string" || input.name.trim().length < MIN_TEXT)) {
    return "name must be at least 2 characters.";
  }
  if (input.location !== undefined && (typeof input.location !== "string" || input.location.trim().length < MIN_TEXT)) {
    return "location must be at least 2 characters.";
  }
  if (input.tier !== undefined && (typeof input.tier !== "string" || input.tier.trim().length === 0)) {
    return "tier must not be empty.";
  }
  if (input.pricePerNight !== undefined && (!Number.isInteger(input.pricePerNight) || input.pricePerNight < 0)) {
    return "pricePerNight must be a whole number of USD.";
  }
  if (input.rating !== undefined && (input.rating < 0 || input.rating > 50)) {
    return "rating must be between 0 and 50.";
  }
  if (input.blurb !== undefined && (typeof input.blurb !== "string" || input.blurb.trim().length < MIN_BLURB)) {
    return "blurb must be at least 10 characters.";
  }
  if (input.imageUrl !== undefined && (typeof input.imageUrl !== "string" || !input.imageUrl.startsWith("https://"))) {
    return "imageUrl must be a valid https URL.";
  }
  return null;
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
      like(hotels.name, `%${q}%`),
      like(hotels.slug, `%${q.toLowerCase()}%`),
      like(hotels.location, `%${q}%`),
      like(hotels.tier, `%${q}%`)
    );
  } else {
    where = hotels;
  }

  const [all, total] = await Promise.all([
    getDb()
      .select()
      .from(hotels)
      .where(where)
      .orderBy(desc(hotels.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    getDb().select().from(hotels).where(where).then((rows) => rows.length),
  ]);
  const data = { items: all, total, page, limit, search: q };
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const response = await requireAdminWrite(request);
  if (response) return response;

  let input: CreateHotel;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const problem = validateCreate(input);
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 400 });
  }

  const { name, location, tier, pricePerNight, rating, blurb, imageUrl } = input;
  const slug = normalizeSlug(name);

  const dupRows = await getDb().select().from(hotels).where(eq(hotels.slug, slug));
  if (dupRows[0]) {
    return NextResponse.json({ error: "A hotel with that name already exists (duplicate slug)." }, { status: 409 });
  }

  const result = await getDb()
    .insert(hotels)
    .values({
      slug,
      name: name.trim(),
      location: location.trim(),
      tier: tier.trim(),
      pricePerNight,
      rating,
      blurb: blurb.trim(),
      imageUrl: imageUrl ?? null,
      createdAt: new Date(),
    })
    .returning();

  return NextResponse.json({ ok: true, hotel: result[0] }, { status: 201 });
}
