import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/travel/Navbar";
import { Footer } from "@/components/travel/Footer";
import { Photo } from "@/components/travel/Photo";
import {
  Eyebrow,
  SectionHeading,
  SectionRule,
  shell,
  sectionY,
} from "@/components/travel/Layout";
import { Reveal } from "@/components/travel/Reveal";
import { destinationById, experiences } from "@/lib/data";
import type { Experience, ExperienceCategory } from "@/lib/types";

/**
 * Everything you can do, grouped by the kind of day it is.
 *
 * One rule governs this page: `bookable` is false for every experience, so every
 * price is labelled as an indicative band rather than a quote. That sentence is
 * repeated on each card and on the detail page because a number without a label
 * is a promise this product cannot keep yet.
 */

export const metadata: Metadata = {
  title: "Experiences in Malawi — What You Can Actually Do",
  description:
    "Diving Cape Maclear, walking Nyika, safaris in Liwonde, food and culture across Malawi — with honest durations and indicative price bands.",
  openGraph: {
    title: "Experiences in Malawi",
    description:
      "Wildlife, water, adventure, culture, food and more — every experience we have documented, with indicative pricing.",
    type: "website",
  },
};

/** Category order follows the shape of a trip, not alphabetical order. */
const CATEGORY_ORDER: ExperienceCategory[] = [
  "wildlife",
  "water",
  "adventure",
  "culture",
  "food",
  "romance",
  "family",
  "wellness",
  "luxury",
];

const CATEGORY_INTRO: Record<ExperienceCategory, string> = {
  wildlife: "Big animals, patient hours, and a guide who knows where they are.",
  water: "The lake at its clearest, from the house reef to the shore at dawn.",
  adventure: "Long days on foot, on rope and on two wheels.",
  culture: "Music, craft and ceremony, approached as a guest rather than a spectator.",
  food: "What Malawians actually cook, and where to sit down and eat it.",
  romance: "Quiet beaches, slow sunsets and nowhere else to be.",
  family: "Trips that hold up with children in them.",
  wellness: "Water, heat and stillness, used the way Malawi has always used them.",
  luxury: "The short list where service is genuinely considered.",
};

function durationLabel(hours: number) {
  if (hours < 24) return `${hours} hr`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day" : `${days} days`;
}

function placeNames(experience: Experience): string[] {
  return experience.destinationIds
    .map((id) => destinationById.get(id)?.name)
    .filter((name): name is string => Boolean(name));
}

function ExperienceCard({ experience }: { experience: Experience }) {
  const places = placeNames(experience);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <Link
        href={`/experiences/${experience.slug}`}
        className="media-frame media-zoom relative block h-[220px] shrink-0"
      >
        <Photo
          photoKey={experience.photo}
          alt={experience.title}
          seed={experience.id}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="scrim-b absolute inset-0" aria-hidden="true" />
        <span className="absolute bottom-4 left-5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
          {experience.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-[21px] font-semibold leading-tight tracking-[-0.01em] text-ink text-balance">
          <Link href={`/experiences/${experience.slug}`} className="hover:underline">
            {experience.title}
          </Link>
        </h3>

        <p className="mt-3 flex-1 text-[14px] leading-relaxed text-muted text-pretty">
          {experience.summary}
        </p>

        <dl className="mt-5 space-y-1.5 border-t border-ink/10 pt-4 text-[13px]">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-muted">Time</dt>
            <dd className="font-semibold text-ink">
              {durationLabel(experience.durationHours)}
            </dd>
          </div>
          {places.length > 0 && (
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-muted">Where</dt>
              <dd className="text-ink-soft/85">{places.join(", ")}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-muted">Price</dt>
            <dd className="text-ink-soft/85">
              From ${experience.priceFromUsd} — indicative, not bookable
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export default function ExperiencesPage() {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: experiences.filter((experience) => experience.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div>
      <Navbar />

      <main>
        {/* ------------------------------------------------------------ Hero */}
        <section className="bg-ink">
          <div className={`${shell} py-20 sm:py-28 lg:py-32`}>
            <div className="max-w-3xl">
              <Eyebrow tone="light" className="block">
                {experiences.length} experiences
              </Eyebrow>
              <h1 className="mt-5 font-display text-[clamp(2.4rem,6.5vw,4.8rem)] font-semibold leading-[1.0] tracking-[-0.03em] text-white text-balance">
                Days you would actually remember
              </h1>
              <p className="mt-6 max-w-[58ch] text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-white/70 text-pretty">
                Grouped by the kind of day it is. Every price on this page is an
                indicative band from our editorial research — nothing is bookable
                here yet, and we would rather say so than fake a checkout.
              </p>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- Sections */}
        {grouped.map((group) => (
          <section
            key={group.category}
            className={`${shell} ${sectionY}`}
            aria-labelledby={`cat-${group.category}`}
          >
            <SectionRule label={group.category} />

            <div className="mt-12">
              <h2
                id={`cat-${group.category}`}
                className="max-w-[20ch] font-display text-[clamp(1.9rem,4.4vw,3.2rem)] font-semibold capitalize leading-[1.05] tracking-[-0.02em] text-ink text-balance"
              >
                {group.category}
              </h2>
              <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-muted text-pretty">
                {CATEGORY_INTRO[group.category]}
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((experience, index) => (
                <Reveal key={experience.id} delay={index * 80} as="article">
                  <ExperienceCard experience={experience} />
                </Reveal>
              ))}
            </div>
          </section>
        ))}

        {/* ----------------------------------------------------------- Close */}
        <section className="border-t border-ink/10 bg-white">
          <div className={`${shell} py-20 text-center sm:py-24`}>
            <SectionHeading
              align="center"
              eyebrow="Next"
              title="Turn one into a trip"
              intro="Pick the places and dates and we will price a whole itinerary — the same honest estimates, in one place."
            />
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/plan"
                className="inline-flex items-center justify-center rounded-full bg-ember px-7 py-3.5 text-[15px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
              >
                Plan a trip
              </Link>
              <Link
                href="/places"
                className="inline-flex items-center justify-center rounded-full border border-ink/20 px-7 py-3.5 text-[15px] font-semibold text-ink transition-all duration-300 hover:border-ink"
              >
                Browse places
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}