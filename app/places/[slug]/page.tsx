import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/travel/Navbar";
import { Footer } from "@/components/travel/Footer";
import { Photo } from "@/components/travel/Photo";
import {
  Eyebrow,
  PillLink,
  SectionHeading,
  SectionRule,
  Stars,
  shell,
  sectionY,
} from "@/components/travel/Layout";
import { Reveal } from "@/components/travel/Reveal";
import { destinationBySlug, destinations, experiences, stays } from "@/lib/data";
import type { Experience, Stay } from "@/lib/types";

/**
 * A destination, told properly.
 *
 * Static editorial data only — no database, no request-time fetch. Everything
 * below is either written by an editor (story, practical notes) or verified
 * against a named source (coordinates), and the page keeps those two visibly
 * separate rather than blending them into one confident voice.
 */

type Props = { params: Promise<{ slug: string }> };

/** Every destination is prerendered; there is no dynamic data source. */
export function generateStaticParams() {
  return destinations.map((destination) => ({ slug: destination.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const destination = destinationBySlug.get(slug);
  if (!destination) return { title: "Place not found" };

  const title = `${destination.name}, Malawi — ${destination.essence}`;
  const description = destination.summary;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}

/* ------------------------------------------------------------------ Pieces */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Duration in words. No invented precision. */
function durationLabel(hours: number) {
  if (hours < 24) return `${hours} hours`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day" : `${days} days`;
}

/** Turn a source URL into something readable. Falls back to the raw string. */
function hostOf(source: string) {
  try {
    return new URL(source).host;
  } catch {
    return source;
  }
}

function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <Link
      href={`/experiences/${experience.slug}`}
      className="media-frame media-zoom group relative block h-[280px] sm:h-[300px] rounded-2xl"
    >
      <Photo
        photoKey={experience.photo}
        alt={experience.title}
        seed={experience.id}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="scrim-b absolute inset-0" aria-hidden="true" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
          {experience.category} · {durationLabel(experience.durationHours)}
        </p>
        <h3 className="font-display text-[21px] font-semibold leading-tight tracking-[-0.01em] text-white text-balance">
          {experience.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/70 text-pretty">
          {experience.summary}
        </p>
      </div>
    </Link>
  );
}

function StayCard({ stay }: { stay: Stay }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-ink/10 bg-white p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ember">
          {stay.category}
        </span>
        <span className="text-[12px] font-semibold text-muted">
          From ${stay.pricePerNightUsd} / night
        </span>
      </div>

      <h3 className="mt-3 font-display text-[22px] font-semibold leading-tight text-ink">
        {stay.name}
      </h3>
      <p className="mt-1 text-[13px] text-muted">{stay.location}</p>

      <p className="mt-4 text-[14px] leading-relaxed text-ink-soft/80 text-pretty">
        {stay.blurb}
      </p>

      <p className="mt-5 border-t border-ink/10 pt-4 text-[12px] text-muted">
        Indicative published rate band. Not bookable here — confirm availability
        with the property directly.
      </p>
    </article>
  );
}

/* -------------------------------------------------------------------- Page */

export default async function PlaceDetail({ params }: Props) {
  const { slug } = await params;
  const destination = destinationBySlug.get(slug);
  if (!destination) notFound();

  // Filtered here in the server component: the sets are small and static, so
  // this costs nothing and keeps the page free of a client-side data fetch.
  const hereExperiences = experiences.filter((experience) =>
    experience.destinationIds.includes(destination.id),
  );
  const hereStays = stays.filter((stay) =>
    stay.location.toLowerCase().includes(destination.slug.replace(/-/g, " ")),
  );

  const hasPosition = destination.lat !== null && destination.lng !== null;

  return (
    <div>
      <Navbar />

      <main>
        {/* ------------------------------------------------------------ Hero */}
        <section className={`${shell} pt-6`}>
          <div className="relative h-[60vh] min-h-[440px] overflow-hidden rounded-3xl">
            <Photo
              photoKey={destination.photo}
              alt={`${destination.name}, ${destination.region}, Malawi`}
              seed={destination.id}
              priority
              sizes="100vw"
              fallbackTone="deep"
            />
            <div className="scrim-b absolute inset-0" aria-hidden="true" />
            <div className="scrim-l absolute inset-0 opacity-70" aria-hidden="true" />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
                  {destination.region}
                </span>
                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
                  {destination.kind}
                </span>
              </div>

              <h1 className="max-w-[16ch] font-display text-[clamp(2.4rem,7vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-white text-balance">
                {destination.name}
              </h1>

              <p className="mt-4 max-w-[40ch] text-[clamp(0.95rem,1.5vw,1.1rem)] font-medium text-white/80 text-pretty">
                {destination.essence}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Stars rating={destination.rating} />
                <span className="text-[13px] text-white/60">
                  Rated {destination.rating.toFixed(1)} out of 5, from traveller
                  ratings.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- Story */}
        <section className={`${shell} ${sectionY}`}>
          <div className="mx-auto max-w-[68ch]">
            <Eyebrow className="block">The story</Eyebrow>
            <p className="mt-7 font-display text-[clamp(1.25rem,2.4vw,1.7rem)] font-medium leading-[1.45] text-ink text-pretty">
              {destination.summary}
            </p>
            <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-ink-soft/85 text-pretty">
              {destination.story
                .split(/\n{2,}/)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <PillLink href="/plan">Plan a trip here</PillLink>
              <PillLink href="/experiences" variant="outline">
                All experiences
              </PillLink>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- Practical */}
        {destination.practical.length > 0 && (
          <section className="border-y border-ink/10 bg-white">
            <div className={`${shell} ${sectionY}`}>
              <SectionHeading
                eyebrow="Practical"
                title="Before you go"
                intro="The details that decide whether a day works: reaching it, what to carry, and what to expect on the ground."
              />

              <ul className="mt-12 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                {destination.practical.map((note) => (
                  <li key={note} className="flex gap-4">
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/15 text-forest"
                      aria-hidden="true"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 12.5l5 5L20 6.5" />
                      </svg>
                    </span>
                    <span className="text-[15px] leading-relaxed text-ink-soft/85 text-pretty">
                      {note}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-12 max-w-[60ch] text-[13px] text-muted">
                Best months to visit:{" "}
                {destination.bestMonths.length > 0
                  ? destination.bestMonths
                      .map((month) => MONTHS[month - 1])
                      .join(", ")
                  : "not yet recorded"}
                .
              </p>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------- Experiences */}
        <section className={`${shell} ${sectionY}`}>
          <SectionRule label="Experiences here" />

          <div className="mt-12 flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              title={`What people do in ${destination.name}`}
              className="max-w-2xl"
            />
            <PillLink href="/experiences" variant="outline" className="shrink-0">
              Everything else
            </PillLink>
          </div>

          {hereExperiences.length > 0 ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {hereExperiences.map((experience, index) => (
                <Reveal key={experience.id} delay={index * 90} as="article">
                  <ExperienceCard experience={experience} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-10 max-w-[52ch] text-[15px] leading-relaxed text-muted text-pretty">
              Nothing is catalogued here yet — that is a gap in our data rather
              than a gap in the place.{" "}
              <Link
                href="/experiences"
                className="text-ink underline underline-offset-4"
              >
                Browse every experience we have recorded
              </Link>
              .
            </p>
          )}
        </section>

        {/* ----------------------------------------------------- Where to stay */}
        <section className="bg-lake-pale">
          <div className={`${shell} ${sectionY}`}>
            <SectionHeading
              eyebrow="Where to stay"
              title="A bed nearby"
              intro="Rates are indicative published bands. No booking engine is connected to this site, so nothing here takes money."
            />

            {hereStays.length > 0 ? (
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {hereStays.map((stay, index) => (
                  <Reveal key={stay.id} delay={index * 90} as="article">
                    <StayCard stay={stay} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <p className="mt-10 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft/75 text-pretty">
                We have not recorded a property in {destination.name} yet.
              </p>
            )}
          </div>
        </section>

        {/* --------------------------------------------------------- The map */}
        <section className={`${shell} ${sectionY}`}>
          <div className="max-w-3xl">
            <SectionHeading eyebrow="On the map" title="Finding it" />

            <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-7 sm:p-9">
              {hasPosition ? (
                <>
                  <p className="font-display text-[clamp(1.5rem,3.4vw,2.2rem)] font-semibold tabular-nums tracking-[-0.02em] text-ink">
                    {destination.lat?.toFixed(4)}°, {destination.lng?.toFixed(4)}°
                  </p>
                  <p className="mt-2 text-[13px] uppercase tracking-[0.16em] text-muted">
                    {destination.region}
                    {destination.elevationM !== null
                      ? ` · ${destination.elevationM} m above sea level`
                      : ""}
                  </p>
                  {destination.coordinateSource && (
                    <p className="mt-6 text-[13px] leading-relaxed text-muted text-pretty">
                      Coordinates verified from{" "}
                      {hostOf(destination.coordinateSource)}.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-display text-[clamp(1.3rem,3vw,1.9rem)] font-semibold leading-tight text-ink text-balance">
                    The position of {destination.name} has not been verified yet.
                  </p>
                  <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-muted text-pretty">
                    We only place a marker where a coordinate came from a source we
                    can name. Until this one does, we would rather show nothing
                    than a point that is plausibly in the wrong place.
                  </p>
                </>
              )}

              <div className="mt-8">
                <PillLink href="/map" variant="outline">
                  Open the map
                </PillLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}