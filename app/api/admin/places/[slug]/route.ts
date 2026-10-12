import { NextResponse } from "next/server";
import { eq, like, or } from "drizzle-orm";
import { getDb } from "@/db";
import { places } from "@/db/schema";
import { getAdminSession } from "../../session";
import { requireAdminWrite } from "@/lib/admin-auth";

interface UpdatePayload {
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

function validatePatch(input: UpdatePayload): string | null {
  if (input.name !== undefined && (typeof input.name !== "string" || input.name.trim().length < 2)) {
    return "name must be at least 2 characters.";
  }
  if (input.region !== undefined && (typeof input.region !== "string" || input.region.trim().length < 2)) {
    return "region must be at least 2 characters.";
  }
  if (input.category !== undefined && (typeof input.category !== "string" || input.category.trim().length === 0)) {
    return "category must not be empty.";
  }
  if (input.blurb !== undefined && (typeof input.blurb !== "string" || input.blurb.trim().length < 10)) {
    return "blurb must be at least 10 characters.";
  }
  if (input.imageUrl !== undefined && (typeof input.imageUrl !== "string" || !input.imageUrl.startsWith("https://"))) {
    return "imageUrl must be a valid https URL.";
  }
  return null;
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAdminSession(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const { slug } = await params;
  const row = await getDb().select().from(places).where(eq(places.slug, slug)).then((rows) => rows[0]);
  if (!row) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }
  return NextResponse.json({ item: row });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const response = await requireAdminWrite(request);
  if (response) return response;
  const { slug } = await params;
  const existing = await getDb().select().from(places).where(eq(places.slug, slug)).then((rows) => rows[0]);
  if (!existing) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  let input: UpdatePayload;
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
  if (input.region !== undefined) updates.region = input.region.trim();
  if (input.category !== undefined) updates.category = input.category.trim();
  if (input.blurb !== undefined) updates.blurb = input.blurb.trim();
  if (input.imageUrl !== undefined) updates.imageUrl = input.imageUrl;

  const result = await getDb().update(places).set(updates).where(eq(places.slug, slug)).returning();
  if (result.length === 0) {
    return NextResponse.json({ error: "Place was not updated." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, place: result[0] });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getAdminSession(request);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const { slug } = await params;
  const existing = await getDb().select().from(places).where(eq(places.slug, slug)).then((rows) => rows[0]);
  if (!existing) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  // An image that is currently in use on a public page must not be silently destroyed.
  await getDb().delete(places).where(eq(places.slug, slug));
  return NextResponse.json({ ok: true });
}
