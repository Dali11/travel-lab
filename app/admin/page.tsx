import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminIdentity } from "@/lib/auth";

const ADMIN_ORIGIN = "http://localhost:3000";

/** Build a single dashboard overview, read directly from the database. */
async function fetchOverview(): Promise<{
  destinations: number;
  experiences: number;
  hotels: number;
  images: number;
  missingImages: number;
  recent: { destinations: string | null; hotels: string | null; experiences: string | null };
}> {
  const fetchJson = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  };

  const [placesRes, hotelsRes, experiencesRes, mediaRes] = await Promise.all([
    fetchJson(`${ADMIN_ORIGIN}/api/admin/places`),
    fetchJson(`${ADMIN_ORIGIN}/api/admin/hotels`),
    fetchJson(`${ADMIN_ORIGIN}/api/admin/experiences`),
    fetchJson(`${ADMIN_ORIGIN}/api/admin/media`),
  ]);

  const places = placesRes?.items ?? [];
  const hotels = hotelsRes?.items ?? [];
  const experiences = experiencesRes?.items ?? [];
  const media = mediaRes?.items ?? [];

  const missing = places.filter((p: { imageUrl: string | null }) => !p.imageUrl).length + hotels.filter((h: { imageUrl: string | null }) => !h.imageUrl).length;

  const latest =
    (places.length && places[0].createdAt) ||
    (hotels.length && hotels[0].createdAt) ||
    (experiences.length && experiences[0].createdAt);

  return {
    destinations: places.length,
    experiences: experiences.length,
    hotels: hotels.length,
    images: media.length,
    missingImages: missing,
    recent: {
      destinations: places[0]?.createdAt ?? null,
      hotels: hotels[0]?.createdAt ?? null,
      experiences: experiences[0]?.createdAt ?? null,
    },
  };
}

function redirectToLogin() {
  redirect(`${ADMIN_ORIGIN}/admin/login`);
}

export default async function AdminDashboard() {
  const sessionCookie = (await cookies()).get("admin-session")?.value;

  let stats;
  try {
    if (!sessionCookie) redirectToLogin();
    stats = await fetchOverview();
  } catch (error) {
    return <OverviewUnavailable error={error} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Welcome back</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Content overview</h1>
        <p className="mt-1 text-sm text-muted">
          Everything the public site reads from Postgres, and how much of it still has a photograph. Freshness is shown per table so gaps are visible.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Destinations" value={stats.destinations} icon="Place" accent="lake" href="/admin/destinations" />
        <SummaryCard label="Hotels & accommodation" value={stats.hotels} icon="Hotel" accent="lake-deep" href="/admin/hotels" />
        <SummaryCard label="Experiences" value={stats.experiences} icon="Experiences" accent="ember" href="/admin/experiences" />
        <SummaryCard label="Uploaded images" value={stats.images} icon="Images" accent="forest" href="/admin/images" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-sand bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Missing images</h2>
          <p className="mt-1 text-sm text-muted">{stats.missingImages} destinations or hotels still have no photograph attached.</p>
          <div className="mt-4">
            <Link href="/admin/destinations" className="text-sm font-semibold text-ember hover:underline">Open destinations</Link>
            {" · "}
            <Link href="/admin/hotels" className="text-sm font-semibold text-ember hover:underline">Open hotels</Link>
          </div>
        </section>

        <section className="rounded-2xl border border-sand bg-white p-6 lg:col-span-3">
          <h2 className="font-display text-lg font-semibold text-ink">Recent content updates</h2>
          <p className="mt-1 text-sm text-muted">The freshest changes across the tables. A blank cell means the table is empty.</p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-cream p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Destinations</dt>
              <dd className="mt-1 font-display text-lg font-semibold text-ink">{stats.recent.destinations ? new Date(stats.recent.destinations).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"}</dd>
            </div>
            <div className="rounded-xl bg-cream p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Hotels</dt>
              <dd className="mt-1 font-display text-lg font-semibold text-ink">{stats.recent.hotels ? new Date(stats.recent.hotels).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"}</dd>
            </div>
            <div className="rounded-xl bg-cream p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Experiences</dt>
              <dd className="mt-1 font-display text-lg font-semibold text-ink">{stats.recent.experiences ? new Date(stats.recent.experiences).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-2xl border border-sand bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Quick actions</h2>
        <p className="mt-1 text-sm text-muted">Add a new destination or hotel, or review the media library.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/destinations/new" className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream hover:bg-ink/90 transition-colors">+ New destination</Link>
          <Link href="/admin/hotels/new" className="inline-flex items-center justify-center rounded-full border border-sand px-5 py-2.5 text-sm font-semibold text-ink hover:border-ember hover:text-ember transition-colors">+ New hotel</Link>
          <Link href="/admin/images" className="inline-flex items-center justify-center rounded-full border border-sand px-5 py-2.5 text-sm font-semibold text-ink hover:border-ember hover:text-ember transition-colors">Media library</Link>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, icon, accent, href }: { label: string; value: number; icon: string; accent: string; href: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-sand bg-white p-6 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">{label}</p>
        <span className={`flex h-10 w-10 rounded-xl flex-none items-center justify-center text-sm font-semibold ${accent === "lake" ? "bg-lake/10 text-lake" : accent === "lake-deep" ? "bg-lake-deep/10 text-lake-deep" : accent === "ember" ? "bg-ember/10 text-ember" : "bg-forest/10 text-forest"}`}>{icon}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-ink">{value}</p>
    </Link>
  );
}

function OverviewUnavailable({ error }: { error: unknown }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-sand bg-white p-8 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Could not load the overview</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The dashboard reads Postgres, so it cannot build when the database is unreachable. Check that <code className="text-ink">DATABASE_URL</code> is set, the database is accepting connections, and the tables have been pushed.
        </p>
        <pre className="mt-4 rounded-lg bg-cream p-4 text-xs text-ink-soft overflow-x-auto">{error instanceof Error ? error.message : String(error)}</pre>
        <Link href="/admin" className="mt-6 underline underline-offset-4">Try again</Link>
      </div>
    </div>
  );
}
