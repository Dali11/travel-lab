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
  shell,
  sectionY,
} from "@/components/travel/Layout";
import { Reveal } from "@/components/travel/Reveal";
import { destinationById, experiences } from "@/lib/data";
import type { Experience } from "@/lib/types";

/**
 * One experience, in full.
 *
 * Same discipline as the destination page: editorial detail from a human,
 * duration and price from the dataset, and the price carries its label every
 * single time it appears. `bookable` is false across the board, so this page
 * never renders a checkout affordance.
 */

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return experiences.map((experience) => ({ slug: experience.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const experience = experiences.find((item) => item.slug === slug);
  if (!experience) return { title: "Experience not found" };

  const title = `${experience.title}, Malawi`;
  const description = experience.summary;

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

function durationLabel(hours: number) {
  if (hours < 24) return `${hours} hours`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day" : `${days} days`;
}

function RelatedCard({ experience }: { experience: Experience }) {
  return (
    <Link
      href={`/experiences/${experience.slug}`}
      className="media-frame media-zoom group relative block h-[260px] rounded-2xl"
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
        <h3 className="font-display text-[20px] font-semibold leading-tight text-white text-balance">
          {experience.title}
        </h3>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------- Page */

export default async function ExperienceDetail({ params }: Props) {
  const { slug } = await params;
  const experience = experiences.find((item) => item.slug === slug);
  if (!experience) notFound();

  const places = experience.destinationIds
    .map((id) => destinationById.get(id))
    .filter((place): place is NonNullable<typeof place> => Boolean(place));

  const related = experiences
    .filter(
      (item) => item.category === experience.category && item.id !== experience.id,
    )
    .slice(0, 3);

  return (
    <div>
      <Navbar />

      <main>
        {/* ------------------------------------------------------------ Hero */}
        <section className={`${shell} pt-6`}>
          <div className="relative h-[52vh] min-h-[380px] overflow-hidden rounded-3xl">
            <Photo
              photoKey={experience.photo}
              alt={experience.title}
              seed={experience.id}
              priority
              sizes="100vw"
              fallbackTone="deep"
            />
            <div className="scrim-b absolute inset-0" aria-hidden="true" />
            <div className="scrim-l absolute inset-0 opacity-70" aria-hidden="true" />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
              <span className="inline-flex rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
                {experience.category}
              </span>

              <h1 className="mt-5 max-w-[20ch] font-display text-[clamp(2.1rem,6vw,4.4rem)] font-semibold leading-[1.0] tracking-[-0.03em] text-white text-balance">
                {experience.title}
              </h1>

              <p className="mt-5 max-w-[52ch] text-[clamp(0.95rem,1.5vw,1.1rem)] leading-relaxed text-white/80 text-pretty">
                {experience.summary}
              </p>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- Facts */}
        <section className="border-b border-ink/10 bg-white">
          <div className={`${shell} py-10 sm:py-12`}>
            <dl className="grid gap-8 sm:grid-cols-3">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40">
                  Time
                </dt>
                <dd className="mt-2 font-display text-[26px] font-semibold text-ink">
                  {durationLabel(experience.durationHours)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40">
                  Where
                </dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-ink-soft/85">
                  {places.length > 0
                    ? places.map((place) => place.name).join(", ")
                    : "Not recorded yet"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40">
                  Price
                </dt>
                <dd className="mt-2 font-display text-[26px] font-semibold text-ink">
                  From ${experience.priceFromUsd}
                </dd>
                <dd className="mt-1.5 text-[12px] leading-relaxed text-muted">
                  Indicative, not bookable. No booking engine is connected to this
                  site.
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ----------------------------------------------------------- Detail */}
        <section className={`${shell} ${sectionY}`}>
          <div className="mx-auto max-w-[68ch]">
            <Eyebrow className="block">The detail</Eyebrow>
            <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-ink-soft/85 text-pretty">
              {experience.detail
                .split(/\n{2,}/)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <PillLink href="/plan">Add to a trip</PillLink>
              <PillLink href="/experiences" variant="outline">
                All experiences
              </PillLink>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- Places */}
        {places.length > 0 && (
          <section className="border-y border-ink/10 bg-white">
            <div className={`${shell} ${sectionY}`}>
              <SectionHeading
                eyebrow="Where it happens"
                title="The places this runs in"
              />

              <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {places.map((place, index) => (
                  <Reveal key={place.id} delay={index * 90} as="li">
                    <Link
                      href={`/places/${place.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-ink/10 transition-colors hover:border-ember"
                    >
                      <span className="media-frame relative block h-[170px]">
                        <Photo
                          photoKey={place.photo}
                          alt={place.name}
                          seed={place.id}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </span>
                      <span className="block p-6">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-ember">
                          {place.region}
                        </span>
                        <span className="mt-2 block font-display text-[20px] font-semibold text-ink">
                          {place.name}
                        </span>
                        <span className="mt-2 block text-[14px] leading-relaxed text-muted text-pretty">
                          {place.summary}
                        </span>
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* --------------------------------------------------------- Related */}
        {related.length > 0 && (
          <section className={`${shell} ${sectionY}`}>
            <SectionRule label="Related" />

            <div className="mt-12">
              <SectionHeading
                title={`More in ${experience.category}`}
                className="max-w-2xl"
              />
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <Reveal key={item.id} delay={index * 90} as="article">
                  <RelatedCard experience={item} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}