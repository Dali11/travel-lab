"use client";

import { useEffect, useState } from "react";

export interface Item {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  photo: string;
  destinationIds: number[];
  bookable: boolean;
  published: boolean;
  priceFromUsd: number;
  durationHours: number;
  corridorId: string;
  fromCity: string;
  fromAirport: string;
  toAirport: string;
  airline: string;
  airlineCode: string;
  stops: number;
  durationMinutes: number;
  note: string;
  key: string;
  value: unknown;
  topic: string;
  body: string;
  name?: string;
  location?: string;
  tier?: string;
  pricePerNight?: number;
  rating?: number;
  blurb?: string;
  imageUrl?: string;
}

/**
 * Read-only detail view for a static-content record. Fetches the list endpoint
 * and renders the single record that matches `slug`.
 */
export function RecordDetail({ route, slug }: { route: string; slug: string }) {
  const [item, setItem] = useState<Item | null>(null);
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
        const found = data.items?.find((i: Item) => i.slug === slug) ?? null;
        if (!cancelled) setItem(found);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load records.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [route, slug]);

  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (error) return <p className="text-sm text-red">{error}</p>;
  if (!item) return <p className="text-sm text-muted">Record not found.</p>;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-sand bg-white p-6">
        <h2 className="font-display text-2xl font-bold text-ink">{item.title ?? item.name ?? item.slug}</h2>
        <p className="mt-1 text-sm text-muted">Record ID {item.id} — slugs and fields below.</p>
      </div>

      <dl className="grid grid-cols-1 gap-5 text-sm">
        {item.title && <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Title</dt><dd className="mt-0.5 text-ink">{item.title}</dd></div>}
        {item.summary && <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Summary</dt><dd className="mt-0.5 text-ink">{item.summary}</dd></div>}
        {item.photo && <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Photo</dt><dd className="mt-0.5 text-ink">{item.photo}</dd></div>}
        {item.priceFromUsd !== undefined && (
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Price from (USD)</dt><dd className="mt-0.5 text-ink">{item.priceFromUsd}</dd></div>
        )}
        {item.destinationIds?.length ? (
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Destination IDs</dt><dd className="mt-0.5 text-ink">{item.destinationIds.join(", ")}</dd></div>
        ) : null}
        {item.bookable !== undefined ? (
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Bookable</dt><dd className="mt-0.5 text-ink">{item.bookable ? "Yes" : "No"}</dd></div>
        ) : null}
        {item.published !== undefined ? (
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Published</dt><dd className="mt-0.5 text-ink">{item.published ? "Yes" : "No"}</dd></div>
        ) : null}
        {item.topic && <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Topic</dt><dd className="mt-0.5 text-ink">{item.topic}</dd></div>}
        {item.body && <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Body</dt><dd className="mt-0.5 text-ink">{item.body}</dd></div>}
        {item.fromCity && (
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">From city</dt><dd className="mt-0.5 text-ink">{item.fromCity}</dd></div>
        )}
        {item.toAirport && (
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">To airport</dt><dd className="mt-0.5 text-ink">{item.toAirport}</dd></div>
        )}
        {item.airline && (
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Airline</dt><dd className="mt-0.5 text-ink">{item.airline}</dd></div>
        )}
        {item.stops !== undefined ? (
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Stops</dt><dd className="mt-0.5 text-ink">{item.stops}</dd></div>
        ) : null}
        {item.durationMinutes !== undefined ? (
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Duration (min)</dt><dd className="mt-0.5 text-ink">{item.durationMinutes}</dd></div>
        ) : null}
        {item.note && <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Note</dt><dd className="mt-0.5 text-ink">{item.note}</dd></div>}
        {item.key && item.value !== undefined && (
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Key</dt><dd className="mt-0.5 text-ink">{item.key}</dd></div>
        )}
      </dl>

      <details className="rounded-2xl border border-sand bg-white p-6">
        <summary className="font-display text-lg font-semibold text-ink">Full record (JSON)</summary>
        <pre className="mt-4 rounded-lg bg-cream p-4 text-xs text-ink-soft overflow-x-auto">{JSON.stringify(item, null, 2)}</pre>
      </details>
    </div>
  );
}
