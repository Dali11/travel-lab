"use client";

import { useTransition, useState } from "react";
import { Field, TextArea } from "./Field";

export interface FormField {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "url" | "tel";
  required?: boolean;
  rows?: number;
}

/**
 * Generic form controller shared by every manage page.
 *
 * Collects the fields into a FormData payload, POSTs or PATCHes it to `url`, and
 * reports back via `onSuccess`. Errors and the success state are shown inline,
 * so the page never renders as an empty form that claims to work.
 */
export function DataForm({
  url,
  method,
  fields,
  initialData,
  onSuccess,
}: {
  url: string;
  method: "POST" | "PATCH";
  fields: FormField[];
  initialData?: Record<string, string>;
  onSuccess?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isPost = method === "POST";
  const [values, setValues] = useState<Record<string, string>>(() => ({ ...initialData }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    for (const f of fields) {
      formData.append(f.name, values[f.name] ?? "");
    }

    const payload = Object.fromEntries(formData) as Record<string, string>;

    startTransition(async () => {
      const res = await fetch(url, {
        method: isPost ? "POST" : "PATCH",
        headers: { "x-csrf-token": "", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = "Request failed.";
        try {
          const body = await res.json();
          message = body.error ?? message;
        } catch {
          /* keep the generic message */
        }
        setError(message);
        return;
      }

      setSuccess(`${isPost ? "Created" : "Saved"} successfully.`);
      setValues({});
      onSuccess?.();
    });
  };

  return (
    <form className="rounded-2xl border border-sand bg-white" onSubmit={handleSubmit}>
      {success ? (
        <div className="rounded-xl bg-lake/5 px-4 py-3 text-sm font-semibold text-lake">{success}</div>
      ) : (
        <>
          {error ? (
            <div className="rounded-xl bg-red/5 px-4 py-3 text-sm font-semibold text-red">{error}</div>
          ) : null}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {fields.map((f) =>
              f.rows ? (
                <TextArea key={f.name} {...f} value={values[f.name] ?? ""} onChange={(v) => setValues((p) => ({ ...p, [f.name]: v }))} />
              ) : (
                <Field key={f.name} {...f} value={values[f.name] ?? ""} onChange={(v) => setValues((p) => ({ ...p, [f.name]: v }))} />
              )
            )}
          </div>
        </>
      )}
      <div className="mt-6 flex justify-end gap-3">
        {initialData ? (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setSuccess(null);
            }}
            className="rounded-full border border-sand px-4 py-2 text-sm font-semibold text-ink hover:border-ember hover:text-ember transition-colors"
          >
            Discard
          </button>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-ink/90 transition-colors disabled:opacity-60"
        >
          {pending ? "Saving…" : initialData ? "Save changes" : "Create"}
        </button>
      </div>
    </form>
  );
}
