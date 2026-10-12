"use client";

import { useEffect, useState } from "react";
import { DataForm, FormField } from "./DataForm";
import { ImageAssign } from "./ImageAssign";

/**
 * Full record editor for a single destination or hotel.
 *
 * Renders the DataForm (create or edit) and the ImageAssign surface, so a
 * management page never shows an isolated form that claims to work.
 */
export function RecordForm({
  mode,
  createUrl,
  editUrl,
  fields,
  heading,
  onSuccess,
}: {
  mode: "create" | "edit";
  createUrl: string;
  editUrl?: string;
  fields: FormField[];
  heading?: string;
  onSuccess?: () => void;
}) {
  const [data, setData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "edit" || !editUrl) return;
    (async () => {
      try {
        const res = await fetch(editUrl);
        if (!res.ok) throw new Error("Could not load record.");
        const json = await res.json();
        setData(json.item ?? {});
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load record.");
      }
    })();
  }, [mode, editUrl]);

  const handleSuccess = () => {
    setError(null);
    onSuccess?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-2xl font-bold text-ink">{heading ?? (mode === "edit" ? "Edit record" : "New record")}</h2>
        {mode === "edit" ? <span className="text-sm text-muted">{data.name ?? ""}</span> : null}
      </div>

      {error ? (
        <p className="rounded-xl bg-red/5 px-4 py-3 text-sm font-semibold text-red">{error}</p>
      ) : null}

      <DataForm url={mode === "edit" && editUrl ? editUrl : createUrl} method={mode === "edit" ? "PATCH" : "POST"} fields={fields} initialData={data} onSuccess={handleSuccess} />

      <div className="rounded-2xl border border-sand bg-white p-5">
        <h3 className="font-display text-lg font-semibold text-ink">Photograph</h3>
        <p className="mt-1 text-sm text-muted">
          {mode === "edit"
            ? data.imageUrl
              ? "This record already has a photograph. Pick a different one, or upload a new file."
              : "No photograph attached. Upload a new file or assign an existing one below."
            : "Upload a photograph for this record, or assign an existing one from the library below."}
        </p>
        <ImageAssign initialSlug={mode === "edit" ? (data.slug ?? null) : null} />
      </div>
    </div>
  );
}
