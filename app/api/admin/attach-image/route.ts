import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdminWrite } from "@/lib/admin-auth";
import { getDb, isDbConfigured } from "@/db";
import { places, hotels } from "@/db/schema";

const TABLES = { place: places, hotel: hotels } as const;

export async function PATCH(request: Request) {
  const response = await requireAdminWrite(request);
  if (response) return response;

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not set on this deployment." },
      { status: 503 },
    );
  }

  const { type, slug, imageUrl } = await request.json();

  if (!(type in TABLES)) {
    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }
  if (typeof imageUrl !== "string" || !imageUrl.startsWith("https://")) {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  const table = TABLES[type as keyof typeof TABLES];
  const result = await getDb()
    .update(table)
    .set({ imageUrl })
    .where(eq(table.slug, slug))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
