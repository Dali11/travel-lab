import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/travel/Navbar";
import { Footer } from "@/components/travel/Footer";
import { Eyebrow, SectionHeading, shell, sectionY } from "@/components/travel/Layout";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { destinations, interests } from "@/lib/data";
import type { DestinationKind } from "@/lib/types";

/**
 * The places directory.
 *
 * A filterable index over the editorial destination set — static data, filtered
 * by `searchParams` on the server so the URL is shareable and the first paint
 * is already correct. No pagination: the whole set is small enough to render,
 * and a paginated directory of thirty places is worse than a long one.
 */

export const metadata: Metadata = {
  title: "Places in Malawi — Lakes, Parks, Highlands, Culture",
  description:
    "Every destination we have documented in Malawi, from Cape Maclear and Liwonde to the highlands and the island shores — with stories, practical notes and verified coordinates.",
  openGraph: {
    title: "Places in Malawi",
    description:
      "Lakes, national parks, highlands and cultural sites across Malawi, with practical notes and verified coordinates.",
    type: "website",
  },
};

/** Only kinds that actually appear in the data get a chip. */
function activeKinds(): DestinationKind[] {
  const present = new Set(destinations.map((destination) => destination.kind));
  return [...present].sort();
}

const KIND_LABEL: Record<DestinationKind, string> = {
  lake: "Lakes & shores",
  island: "Islands",
  mountain: "Mountains",
  park: "National parks",
  reserve: "Reserves",
  city: "Cities",
  plateau: "Plateaus",
  river: "Rivers",
  cultural: "Cultural",
};

export default async function Places({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const kinds = activeKinds();

  // An unknown kind falls back to everything rather than 404-ing, so a stale or
  // mistyped link still shows the directory.
  const activeKind = kinds.includes(kind as DestinationKind)
    ? (kind as DestinationKind)
    : null;

  const visible = activeKind
    ? destinations.filter((destination) => destination.kind === activeKind)
    : destinations;

  return (
    <div>
      <Navbar />

      <main>
        {/* ------------------------------------------------------- Hero band */}
        <section className="border-b border-ink/10 bg-white">
          <div className={`${shell} py-16 sm:py-20 lg:py-24`}>
            <div className="max-w-3xl">
              <Eyebrow className="block">The directory</Eyebrow>
              <h1 className="mt-5 font-display text-[clamp(2.4rem,6.5vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-ink text-balance">
                Every place we have documented
              </h1>
              <p className="mt-6 text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-muted text-pretty">
                {destinations.length} destinations across Malawi — the lake and its
                islands, the parks, the highlands and the places where the culture
                is the reason to come. Each one carries the story, the practical
                notes, and a coordinate we can point at a source for.
              </p>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- Filters */}
        <section className={`${shell} py-10 sm:py-12`}>
          <nav aria-label="Filter places by type">
            <ul className="rail -mx-5 flex gap-3 px-5 sm:mx-0 sm:flex-wrap sm:px-0">
              <li>
                <Link
                  href="/places"
                  aria-current={activeKind ? undefined : "true"}
                  className={
                    activeKind
                      ? "inline-flex rounded-full border border-ink/20 px-5 py-2.5 text-[14px] font-semibold text-ink transition-colors hover:border-ink"
                      : "inline-flex rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-cream"
                  }
                >
                  All
                </Link>
              </li>
              {kinds.map((value) => {
                const isActive = value === activeKind;
                return (
                  <li key={value}>
                    <Link
                      href={`/places?kind=${value}`}
                      aria-current={isActive ? "true" : undefined}
                      className={
                        isActive
                          ? "inline-flex rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-cream"
                          : "inline-flex rounded-full border border-ink/20 px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:border-ink"
                      }
                    >
                      {KIND_LABEL[value]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </section>

        {/* ---------------------------------------------------------- Grid */}
        <section className={`${shell} pb-20 sm:pb-28 lg:pb-36`}>
          <h2 className="sr-only">
            {activeKind
              ? `${KIND_LABEL[activeKind]} in Malawi`
              : "All destinations in Malawi"}
          </h2>

          {visible.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                />
              ))}
            </div>
          ) : (
            <p className="py-20 text-center text-[15px] text-muted">
              Nothing recorded under this filter yet.
            </p>
          )}

          <p className="mt-10 text-[13px] text-muted" aria-live="polite">
            Showing {visible.length} of {destinations.length} places
            {activeKind ? ` in ${KIND_LABEL[activeKind].toLowerCase()}` : ""}.
          </p>
        </section>

        {/* ------------------------------------------------------ By interest */}
        <section className={`${shell} ${sectionY} border-t border-ink/10`}>
          <SectionHeading
            eyebrow="Another way in"
            title="Start from what you love doing"
            intro="The same places, sorted by the trip you actually want — wildlife, water, food, romance, family."
          />

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {interests.map((interest) => (
              <li key={interest.id}>
                <Link
                  href={`/discover?interest=${interest.id}`}
                  className="flex h-full flex-col rounded-2xl border border-ink/10 bg-white p-6 transition-colors hover:border-ember"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ember">
                    {interest.destinationIds.length} places
                  </span>
                  <span className="mt-3 font-display text-[20px] font-semibold text-ink">
                    {interest.label}
                  </span>
                  <span className="mt-2 text-[14px] leading-relaxed text-muted text-pretty">
                    {interest.tagline}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}