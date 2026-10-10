import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/travel/Navbar";
import { Footer } from "@/components/travel/Footer";
import { Photo } from "@/components/travel/Photo";
import { SectionHeading, shell, sectionY, Stars } from "@/components/travel/Layout";
import { Reveal } from "@/components/travel/Reveal";
import { destinations, experiences, interests } from "@/lib/data";
import type { TravelInterestId } from "@/lib/types";

/**
 * Discover — the filtered entry point every interest card links into.
 *
 * The homepage's eight interest cards all point here with `?interest=X`. Rather
 * than eight separate filter pages, one page reads the query and shows what
 * matches, plus everything, because a filter that hides 90% of a country is
 * worse than no filter.
 *
 * Server component: filtering by query string on the server means the result is
 * crawlable and shareable, and there is no client state to hydrate.
 */

export const metadata: Metadata = {
  title: "Explore Malawi — Destinations and Experiences",
  description:
    "Explore Malawi by interest: wildlife, lake and beaches, adventure, culture, food, romance, family and luxury. Destinations, experiences and stays, all in one filtered view.",
  openGraph: {
    title: "Explore Malawi — Travel Lab",
    description:
      "Explore Malawi by interest. Wildlife, beaches, adventure, culture, food and more — all filtered in one place.",
  },
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ interest?: string }>;
}) {
  const { interest } = await searchParams;

  const activeInterest: TravelInterestId | null = interests.some(
    (candidate) => candidate.id === interest,
  )
    ? (interest as TravelInterestId)
    : null;

  const matched = activeInterest
    ? destinations.filter((destination) =>
        interests
          .find((candidate) => candidate.id === activeInterest)
          ?.destinationIds.includes(destination.id),
      )
    : destinations;

  const matchingExperiences = activeInterest
    ? experiences.filter((experience) =>
        experience.destinationIds.some((id) =>
          matched.some((destination) => destination.id === id),
        ),
      )
    : experiences;

  const heading = activeInterest
    ? interests.find((candidate) => candidate.id === activeInterest)
    : null;

  return (
    <>
      <Navbar />
      <main id="main">
        {/* Hero */}
        <header className={`${shell} pt-32 pb-10 lg:pt-40 lg:pb-14`}>
          <p className="eyebrow mb-4">Explore by interest</p>
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-balance max-w-4xl">
            {heading ? heading.label : "The whole country, filtered your way"}
          </h1>
          <p className="mt-6 text-[clamp(1rem,1.7vw,1.2rem)] text-ink/60 leading-relaxed text-pretty max-w-2xl">
            {heading
              ? heading.tagline
              : "Pick a lens and see Malawi through it. Every destination and experience on the site is below, and nothing is hidden from you by the filter."}
          </p>
        </header>

        {/* Interest switcher */}
        <div className={`${shell} pb-10`}>
          <div className="rail py-4 border-y border-ink/10">
            <Link
              href="/discover"
              aria-current={!activeInterest ? "true" : undefined}
              className={`shrink-0 rounded-full px-5 py-3 text-[13px] font-semibold transition-all duration-300 ${
                !activeInterest
                  ? "bg-ink text-cream"
                  : "border border-ink/12 text-ink/60 hover:border-ink/40 hover:text-ink"
              }`}
            >
              Everything
            </Link>
            {interests.map((candidate) => (
              <Link
                key={candidate.id}
                href={`/discover?interest=${candidate.id}`}
                aria-current={candidate.id === activeInterest ? "true" : undefined}
                className={`shrink-0 rounded-full px-5 py-3 text-[13px] font-semibold text-white transition-all duration-300 ${
                  candidate.id === activeInterest ? "" : "opacity-85 hover:opacity-100"
                }`}
                style={{ background: candidate.accent }}
              >
                {candidate.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Results summary — honest about the size of the match. */}
        <div className={`${shell} pb-8`}>
          <p className="text-[13px] text-ink/45">
            {matched.length} {matched.length === 1 ? "destination" : "destinations"}
            {activeInterest && " match"} ·{" "}
            {matchingExperiences.length}{" "}
            {matchingExperiences.length === 1 ? "experience" : "experiences"} you could
            book a guide for
          </p>
        </div>

        {/* Destinations */}
        <section className={`${shell} pb-16`} aria-labelledby="destinations-heading">
          <h2 id="destinations-heading" className="sr-only">
            Destinations
          </h2>

          {matched.length === 0 ? (
            <div className="rounded-3xl bg-white border border-ink/10 p-12 text-center">
              <p className="text-[15px] text-ink/60">
                Nothing is tagged with that interest yet. Try another lens, or{" "}
                <Link href="/discover" className="text-ember font-semibold">
                  see everything
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matched.map((destination, index) => (
                <Reveal key={destination.id} delay={Math.min(index * 55, 330)}>
                  <Link
                    href={`/places/${destination.slug}`}
                    className="media-frame media-zoom group relative block h-[340px] rounded-2xl"
                  >
                    <Photo
                      photoKey={destination.photo}
                      alt={destination.name}
                      seed={destination.id}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="scrim-b absolute inset-0" aria-hidden="true" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">
                        {destination.essence}
                      </p>
                      <h3 className="font-display text-[23px] font-semibold text-white leading-tight tracking-[-0.02em]">
                        {destination.name}
                      </h3>
                      <p className="mt-1.5 text-[13px] text-white/65 line-clamp-2">
                        {destination.summary}
                      </p>
                      <div className="mt-3">
                        <Stars rating={destination.rating} className="opacity-90" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </section>

        {/* Experiences */}
        {matchingExperiences.length > 0 && (
          <section
            className={`${shell} ${sectionY} border-t border-ink/10`}
            aria-labelledby="exp-heading"
          >
            <Reveal>
              <SectionHeading
                eyebrow="What you'd actually do"
                title="Experiences, not just places"
                intro="The unit of discovery here is what you do, not where you go. These are the things you could book a guide for."
              />
            </Reveal>

            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {matchingExperiences.slice(0, 9).map((experience, index) => (
                <Reveal key={experience.id} delay={Math.min(index * 50, 300)}>
                  <Link
                    href={`/experiences/${experience.slug}`}
                    className="group flex items-center gap-4 rounded-2xl bg-white border border-ink/8 p-4 transition-all duration-400 hover:border-ink/25 hover:shadow-[0_8px_30px_rgba(16,16,14,0.07)] h-full"
                  >
                    <div className="relative flex-none w-16 h-16 rounded-xl overflow-hidden bg-ink-soft">
                      <Photo
                        photoKey={experience.photo}
                        alt=""
                        seed={experience.id}
                        sizes="64px"
                        className="transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-[17px] font-semibold leading-tight group-hover:text-ember transition-colors">
                        {experience.title}
                      </h3>
                      <p className="mt-1 text-[12px] text-ink/45">
                        {experience.priceFromUsd === 0
                          ? "Free"
                          : `From $${experience.priceFromUsd}`}
                        {experience.durationHours > 0 && ` · ${experience.durationHours}h`}{" "}
                        · not bookable here
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>

            {matchingExperiences.length > 9 && (
              <Reveal className="mt-8">
                <Link
                  href="/experiences"
                  className="inline-flex items-center gap-2 text-[15px] font-semibold text-ink hover:text-ember transition-colors"
                >
                  All {matchingExperiences.length} experiences →
                </Link>
              </Reveal>
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}