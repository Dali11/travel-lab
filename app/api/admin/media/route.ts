import { NextResponse } from "next/server";
import { getAdminSession } from "../session";
import { getDb } from "@/db";
import { media, media_assign } from "@/db/schema";

export interface MediaItem {
  id: number;
  storageKey: string;
  originalName: string | null;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadedAt: string;
  assignedTo: { type: string; id: number }[];
}

/** Media library endpoint — lists every photograph uploaded through /api/upload. */
export async function GET(request: Request) {
  const identity = await getAdminSession(request);
  if (!identity) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const order = searchParams.get("order") ?? "newest";

  const rows = await getDb().select().from(media);

  // Filter + order in JS: the admin library is for the operator, not a
  // production search, and this keeps the query simple and types straight.
  const items: MediaItem[] = rows
    .filter((r) => !q || (r.originalName ?? "").includes(q) || (r.storageKey ?? "").includes(q))
    .sort((a, b) => (order === "oldest" ? a.uploadedAt.getTime() - b.uploadedAt.getTime() : b.uploadedAt.getTime() - a.uploadedAt.getTime()))
    .map((row) => ({ id: row.id, storageKey: row.storageKey, originalName: row.originalName, url: row.url, mimeType: row.mimeType, sizeBytes: row.sizeBytes, uploadedAt: row.uploadedAt.toISOString(), assignedTo: [] }));

  // Fetch attachments so we can warn about in-use images.
  const assigns = await getDb().select({
    mediaId: media_assign.mediaId,
    assignableType: media_assign.assignableType,
    assignableId: media_assign.assignableId,
  }).from(media_assign);

  const assignedMap = new Map<number, { type: string; id: number }[]>();
  for (const a of assigns) {
    const list = assignedMap.get(a.mediaId) ?? [];
    list.push({ type: a.assignableType, id: a.assignableId });
    assignedMap.set(a.mediaId, list);
  }

  for (const item of items) {
    item.assignedTo = assignedMap.get(item.id) ?? [];
  }

  return NextResponse.json({ items });
}
