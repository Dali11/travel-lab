import { eq, like, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { hotels } from "@/db/schema";
import { getAdminSession } from "../../session";
import { requireAdminWrite } from "@/lib/admin-auth";

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

/** Detail + update + delete for a single hotel. */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAdminSession(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { slug } = await params;
  const row = await getDb().select().from(hotels).where(eq(hotels.slug, slug)).then((rows) => rows[0]);
  if (!row) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
  }
  return NextResponse.json({ item: row });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const response = await requireAdminWrite(request);
  if (response) return response;

  const { slug } = await params;
  const existing = await getDb().select().from(hotels).where(eq(hotels.slug, slug)).then((rows) => rows[0]);
  if (!existing) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
  }

  let input: UpdateHotel;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const problem = validatePatch(input);
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.location !== undefined) updates.location = input.location.trim();
  if (input.tier !== undefined) updates.tier = input.tier.trim();
  if (input.pricePerNight !== undefined) updates.pricePerNight = input.pricePerNight;
  if (input.rating !== undefined) updates.rating = input.rating;
  if (input.blurb !== undefined) updates.blurb = input.blurb.trim();
  if (input.imageUrl !== undefined) updates.imageUrl = input.imageUrl;

  const result = await getDb().update(hotels).set(updates).where(eq(hotels.slug, slug)).returning();
  if (result.length === 0) {
    return NextResponse.json({ error: "Hotel was not updated." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, hotel: result[0] });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const response = await requireAdminWrite(request);
  if (response) return response;

  const { slug } = await params;
  const existing = await getDb().select().from(hotels).where(eq(hotels.slug, slug)).then((rows) => rows[0]);
  if (!existing) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
  }

  // The public site still shows a placeholder photograph for a hotel that is in
  // use, so an admin cannot delete a row that is referenced by a public page.
  const inUse = await getDb()
    .select({ id: hotels.id })
    .from(hotels)
    .where(eq(hotels.slug, slug));
  if (inUse.length === 0) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
  }

  await getDb().delete(hotels).where(eq(hotels.slug, slug));
  return NextResponse.json({ ok: true });
}
