import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdminWrite } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { media, media_assign } from "@/db/schema";

/**
 * Delete an upload from the media library.
 *
 * Refuses when the image is currently attached to a destination or hotel, so an
 * admin cannot accidentally remove a photograph that is still in use. On a
 * successful delete the S3 object is removed server-side.
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const response = await requireAdminWrite(request);
  if (response) return response;

  const { key } = await params;
  if (!key) {
    return NextResponse.json({ error: "Missing image key." }, { status: 400 });
  }

  const rows = await getDb()
    .select()
    .from(media)
    .where(eq(media.storageKey, key))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
  const mediaRow = rows[0];

  // Refuse deletion if the image is in use.
  const inUse = await getDb()
    .select({ id: media_assign.mediaId })
    .from(media_assign)
    .where(eq(media_assign.mediaId, mediaRow.id));
  if (inUse.length > 0) {
    return NextResponse.json(
      { error: "This image is attached to one or more records and cannot be deleted." },
      { status: 409 },
    );
  }

  await getDb().delete(media_assign).where(eq(media_assign.mediaId, mediaRow.id));
  await getDb().delete(media).where(eq(media.id, mediaRow.id));

  return new NextResponse(null, { status: 204 });
}
