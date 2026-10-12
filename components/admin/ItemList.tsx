"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export interface Item {
  id: number;
  slug: string;
  name: string;
  imageUrl: string | null;
}

/**
 * Reusable list table for the destinations and hotels manage pages.
 *
 * Reads from the admin API (which enforces session + CSRF server-side) and
 * renders a sortable-looking table with a thumbnail and edit/delete actions.
 * Pass a `deleteHref` when the page also supports deletion.
 */
export function ItemList({
  title,
  route,
  newHref,
  editHrefSuffix,
  deleteHref,
}: {
  title: string;
  route: string;
  newHref: string;
  editHrefSuffix: string;
  deleteHref?: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(route);
        if (!res.ok) throw new Error("Could not load records.");
        const data = await res.json();
        if (!cancelled) setItems(data.items ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load records.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [route]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-muted">
            {items.length} {items.length === 1 ? "record" : "records"}
          </p>
        </div>
        <Link
          href={newHref}
          className="inline-flex items-center justify-center rounded-full border border-sand px-4 py-2.5 text-sm font-semibold text-ink hover:border-ember hover:text-ember transition-colors"
        >
          + New
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red/30 bg-red/5 p-5 text-sm font-semibold text-red">{error}</div>
      ) : loading ? (
        <div className="h-48 rounded-2xl border border-sand bg-cream flex items-center justify-center text-sm text-muted">Loading…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-sand bg-white p-10 text-center">
          <p className="font-display text-lg font-semibold text-ink">No records yet.</p>
          <p className="mt-2 text-sm text-muted">Add your first {title.toLowerCase()} with the button above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-sand">
                  <td className="px-4 py-3">
                    <Link href={`/admin/${editHrefSuffix}/${item.slug}`} className="font-semibold text-ink hover:underline">
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{item.slug}</td>
                  <td className="px-4 py-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-cream flex items-center justify-center text-xs text-muted">No photo</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/${editHrefSuffix}/${item.slug}`} className="text-xs font-semibold text-ember hover:underline">Edit</Link>
                      {deleteHref ? (
                        <Link
                          href={`${deleteHref}/${item.slug}`}
                          className="text-xs font-semibold text-red hover:underline"
                          onClick={(e) => {
                            if (!window.confirm("Delete this record? This cannot be undone.")) e.preventDefault();
                          }}
                        >
                          Delete
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
