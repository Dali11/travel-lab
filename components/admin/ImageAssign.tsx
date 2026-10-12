"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

type Action = "idle" | "uploading" | "assigning" | "deleting";

/**
 * Image assign + upload surface for the Images & Media page.
 *
 * - Uploads a file through /api/upload.
 * - Assigns an uploaded photograph to a place or hotel by slug.
 * - Deletes a file only when it is not in use (the API enforces the guard).
 *
 * The "Assign to" toggle switches the target table for the form below.
 */
export function ImageAssign({ initialSlug }: { initialSlug?: string | null }) {
  const [targetType, setTargetType] = useState<"place" | "hotel">("place");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<Action>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState({ draft: "", target: "" });
  const [assignTarget, setAssignTarget] = useState<{ slug: string; label: string } | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/media");
        if (!res.ok) throw new Error("Could not load the media library.");
        const data = await res.json();
        if (!cancelled) setItems(data.items);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load the media library.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const uploading = action === "uploading";

  const doUpload = async (file: File) => {
    setUploadError(null);
    setAction("uploading");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Upload failed.");
      }
      const res2 = await fetch("/api/admin/media");
      const data = await res2.json();
      setItems(data.items);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setAction("idle");
    }
  };

  const doAssign = async () => {
    if (!assignTarget) return;
    setAssigning(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/attach-image", {
        method: "PATCH",
        headers: { "x-csrf-token": "" },
        body: JSON.stringify({ type: targetType, slug: assignTarget.slug, imageUrl: assignForm.draft }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Assign failed.");
      }
      setAssignTarget(null);
      setAssignForm({ draft: "", target: "" });
      const res2 = await fetch("/api/admin/media");
      const data = await res2.json();
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assign failed.");
    } finally {
      setAssigning(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setAction("deleting");
    try {
      const res = await fetch(`/api/admin/media/${encodeURIComponent(deleteTarget.storageKey)}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Delete failed.");
      }
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setAction("idle");
    }
  };

  const targetLabel = targetType === "place" ? "Destination" : "Hotel";
  const assignedCount = items.filter((i) => i.assignedTo.some((a) => a.type === targetType)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Images & media</h2>
          <p className="mt-1 text-sm text-muted">
            {items.length} {items.length === 1 ? "photo" : "photos"} on file. {assignedCount} {assignedCount === 1 ? "is" : "are"} attached to a destination or hotel.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-2.5 text-sm font-semibold text-ink cursor-pointer transition-colors hover:border-ember hover:text-ember">
          + Upload
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void doUpload(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {uploadError ? (
        <p className="rounded-xl bg-red/5 px-4 py-3 text-sm font-semibold text-red">{uploadError}</p>
      ) : null}
      {loading ? (
        <p className="text-sm text-muted">Loading library…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">No photographs uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-sand bg-white">
              <div className="aspect-[4/3] bg-cream">
                {item.url ? (
                  <img src={item.url} alt={item.originalName ?? "Upload"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted">No preview</div>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-ink">{item.originalName ?? item.storageKey}</p>
                <p className="text-xs text-muted">{new Date(item.uploadedAt).toLocaleString()}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.assignedTo.some((a) => a.type === targetType) ? (
                    <span className="rounded-full bg-lake/10 px-3 py-1 text-xs font-semibold text-lake">Used on {targetLabel}</span>
                  ) : (
                    <button
                      type="button"
                      disabled={action === "deleting"}
                      onClick={() => {
                        setAssignTarget({ slug: "", label: targetLabel });
                        setAssignForm({ draft: "", target: "" });
                      }}
                      className="rounded-full border border-sand px-3 py-1 text-xs font-semibold text-ink hover:border-ember hover:text-ember transition-colors"
                    >
                      Assign
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={action === "deleting"}
                    onClick={() => setDeleteTarget(item)}
                    className="rounded-full border border-red/40 px-3 py-1 text-xs font-semibold text-red hover:bg-red/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {deleteTarget ? (
        <div className="rounded-2xl border border-red/30 bg-red/5 p-5">
          <p className="text-sm font-semibold text-ink">Delete "{deleteTarget.originalName ?? deleteTarget.storageKey}"?</p>
          <p className="mt-1 text-xs text-muted">This removes the object from storage. The image cannot be deleted while it is attached to a record.</p>
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-full border border-sand px-4 py-2 text-sm font-semibold text-ink hover:border-ember hover:text-ember transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={doDelete}
              disabled={action === "deleting"}
              className="rounded-full bg-red px-4 py-2 text-sm font-semibold text-cream hover:bg-red/90 transition-colors disabled:opacity-60"
            >
              {action === "deleting" ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      ) : null}

      {assignTarget ? (
        <div className="rounded-2xl border border-sand bg-white p-6">
          <p className="text-sm font-semibold text-ink">Assign a photo to {targetLabel}</p>
          <p className="mt-1 text-xs text-muted">Paste the exact slug of the {targetLabel.toLowerCase()} below and set the uploaded URL.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="col-span-1">
              <label className="mb-1.5 block text-sm font-semibold text-ink">{targetLabel} slug <span className="text-ember">*</span></label>
              <input
                value={assignForm.target}
                onChange={(e) => setAssignForm((p) => ({ ...p, target: e.target.value }))}
                placeholder={`e.g. ${targetLabel.toLowerCase()}s/lilongwe-castle`}
                className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/30"
              />
            </div>
            <div className="col-span-1">
              <label className="mb-1.5 block text-sm font-semibold text-ink">Photo URL <span className="text-ember">*</span></label>
              <input
                value={assignForm.draft}
                onChange={(e) => setAssignForm((p) => ({ ...p, draft: e.target.value }))}
                placeholder="https://…"
                className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/30"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setAssignTarget(null)}
              className="rounded-full border border-sand px-4 py-2 text-sm font-semibold text-ink hover:border-ember hover:text-ember transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={doAssign}
              disabled={assigning}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-ink/90 transition-colors disabled:opacity-60"
            >
              {assigning ? "Assigning…" : "Assign"}
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl bg-red/5 px-4 py-3 text-sm font-semibold text-red">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTargetType("place")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${targetType === "place" ? "bg-lake/10 text-lake" : "border border-sand text-ink hover:border-ember hover:text-ember"}`}
        >
          Destinations
        </button>
        <button
          type="button"
          onClick={() => setTargetType("hotel")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${targetType === "hotel" ? "bg-lake-deep/10 text-lake-deep" : "border border-sand text-ink hover:border-ember hover:text-ember"}`}
        >
          Hotels
        </button>
      </div>
    </div>
  );
}
