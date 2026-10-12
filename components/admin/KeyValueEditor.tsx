"use client";

import { useEffect, useState } from "react";

/** A key/value editor shared by the Trip Planning and Settings pages. */
export function KeyValueEditor({ route, title }: { route: string; title: string }) {
  const [items, setItems] = useState<{ key: string; value: unknown }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(route);
        if (!res.ok) throw new Error("Could not load values.");
        const data = await res.json();
        if (!cancelled) setItems(data.items ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load values.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [route]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    setError(null);
    const res = await fetch(route, {
      method: "PUT",
      headers: { "x-csrf-token": "", "Content-Type": "application/json" },
      body: JSON.stringify({ key: key.trim(), value: value.trim() ? JSON.parse(value) : null }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Save failed.");
      return;
    }
    setKey("");
    setValue("");
    setEditingKey(null);
    refetch();
  };

  const refetch = async () => {
    try {
      const res = await fetch(route);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      /* keep current list */
    }
  };

  const save = async (k: string) => {
    const res = await fetch(route, {
      method: "PUT",
      headers: { "x-csrf-token": "", "Content-Type": "application/json" },
      body: JSON.stringify({ key: k, value: value || null }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Save failed.");
      return;
    }
    setEditingKey(null);
    setValue("");
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
      </div>

      <form className="rounded-2xl border border-sand bg-white p-5" onSubmit={handleSubmit}>
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="col-span-1">
            <label className="mb-1.5 block text-sm font-semibold text-ink">Key</label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. home_region"
              className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/30"
            />
          </div>
          <div className="col-span-1">
            <label className="mb-1.5 block text-sm font-semibold text-ink">Value (JSON)</label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='e.g. "blantyre" or {"days": 3}'
              rows={4}
              className="w-full rounded-lg border border-sand bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/30"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-ink/90 transition-colors"
          >
            Save
          </button>
        </div>
        {error ? <p className="mt-3 text-sm font-semibold text-red">{error}</p> : null}
      </form>

      {loading ? (
        <p className="text-sm text-muted">Loading values…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">No values yet.</p>
      ) : (
        <dl className="grid grid-cols-1 gap-4 text-sm">
          {items.map((item) => (
            <div key={item.key} className="rounded-xl border border-sand p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{item.key}</dt>
              <dd
                className="mt-1 text-ink cursor-text"
                onClick={() => {
                  setEditingKey(item.key);
                  setValue(JSON.stringify(item.value, null, 2));
                }}
              >
                {editingKey === item.key ? (
                  <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    rows={4}
                    className="w-full rounded border border-sand bg-cream px-2 py-1 text-xs"
                  />
                ) : (
                  <code className="text-xs text-ink-soft">{JSON.stringify(item.value, null, 2)}</code>
                )}
              </dd>
              <dd className="mt-2 flex gap-2">
                {editingKey === item.key ? (
                  <>
                    <button
                      type="button"
                      onClick={() => save(item.key)}
                      className="text-xs font-semibold text-lake hover:underline"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingKey(null)}
                      className="text-xs font-semibold text-muted hover:underline"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingKey(item.key)}
                    className="text-xs font-semibold text-ember hover:underline"
                  >
                    Edit
                  </button>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
