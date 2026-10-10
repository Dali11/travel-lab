import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/travel/Navbar";
import { Footer } from "@/components/travel/Footer";
import { Photo } from "@/components/travel/Photo";
import { PillLink, SectionRule, Stars, shell } from "@/components/travel/Layout";
import { stays, experiences } from "@/lib/data";

/**
 * A single property.
 *
 * The booking section is the interesting part: rather than a dead "Book now"
 * button, it explains how this property is actually booked — which, for
 * independent Malawian lodges, means a direct enquiry. `stay.bookingUrl` is
 * null on every entry; if a booking integration is ever connected, that is the
 * one field that changes.
 */

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const stay = stays.find((candidate) => candidate.slug === slug);

  if (!stay) return { title: "Stay not found" };

  return {
    title: `${stay.name}, ${stay.location}`,
    description: stay.blurb,
    openGraph: {
      title: `${stay.name}, ${stay.location}`,
      description: stay.blurb,
      type: "article",
    },
  };
}

export function generateStaticParams() {
  return stays.map((stay) => ({ slug: stay.slug }));
}

export default async function StayDetail({ params }: Props) {
  const { slug } = await params;
  const stay = stays.find((candidate) => candidate.slug === slug);

  if (!stay) notFound();

  const nearby = stays
    .filter((candidate) => candidate.id !== stay.id)
    .filter(
      (candidate) =>
        candidate.location === stay.location || candidate.category === stay.category,
    )
    .slice(0, 3);

  const thingsToDo = experiences
    .filter((experience) =>
      experience.destinationIds.some((id) =>
        stay.location.toLowerCase().includes(id.split("-")[0]),
      ),
    )
    .slice(0, 3);

  return (
    <>
      <Navbar />
      <main id="main">
        {/* Hero */}
        <div className="px-5 sm:px-8 lg:px-12 pt-24 lg:pt-28">
          <div className="media-frame relative h-[52vh] min-h-[380px] max-h-[680px] rounded-3xl">
            <Photo
              photoKey={stay.photo}
              alt={stay.name}
              seed={stay.id}
              priority
              sizes="100vw"
            />
            <div className="scrim-b absolute inset-0" aria-hidden="true" />

            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90">
                  {stay.category}
                </span>
                <Stars rating={stay.rating / 10} className="opacity-95" />
              </div>
              <h1 className="font-display text-[clamp(2.1rem,5.5vw,4rem)] font-semibold text-white leading-[1.02] tracking-[-0.03em]">
                {stay.name}
              </h1>
              <p className="mt-2 text-[15px] text-white/70">{stay.location}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div
          className={`${shell} py-16 lg:py-24 grid lg:grid-cols-[1.5fr_1fr] gap-12 lg:gap-16`}
        >
          <div>
            <p className="text-[clamp(1.05rem,1.9vw,1.3rem)] text-ink/75 leading-relaxed text-pretty">
              {stay.blurb}
            </p>

            <div className="mt-12">
              <SectionRule label="What makes it worth it" />
              <ul className="mt-7 flex flex-col gap-4">
                {stay.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3.5">
                    <span
                      className="flex-none w-5 h-5 rounded-full bg-forest/12 text-forest grid place-items-center mt-0.5"
                      aria-hidden="true"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 6.5l3 3 7-7" />
                      </svg>
                    </span>
                    <span className="text-[15px] text-ink/70 leading-relaxed">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {thingsToDo.length > 0 && (
              <div className="mt-14">
                <SectionRule label="What to do nearby" />
                <div className="mt-7 flex flex-col gap-3">
                  {thingsToDo.map((experience) => (
                    <a
                      key={experience.id}
                      href={`/experiences/${experience.slug}`}
                      className="group flex items-start gap-4 rounded-2xl bg-white border border-ink/8 p-5 transition-all duration-400 hover:border-ink/25"
                    >
                      <div className="relative flex-none w-16 h-16 rounded-xl overflow-hidden bg-ink-soft">
                        <Photo
                          photoKey={experience.photo}
                          alt=""
                          seed={experience.id}
                          sizes="64px"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-[17px] font-semibold group-hover:text-ember transition-colors">
                          {experience.title}
                        </h3>
                        <p className="mt-1 text-[13px] text-ink/50 line-clamp-2">
                          {experience.summary}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking panel */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-3xl bg-white border border-ink/10 p-7">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[2.4rem] font-semibold leading-none tracking-[-0.03em] tabular-nums">
                  ${stay.pricePerNightUsd}
                </span>
                <span className="text-[14px] text-ink/45">/ night</span>
              </div>
              <p className="mt-2 text-[12px] text-ink/45 leading-relaxed">
                Indicative rate. Confirm with the property — nothing here is a quote and
                nothing here is bookable through this site.
              </p>

              <div className="mt-6 pt-6 border-t border-ink/8">
                <h2 className="font-display text-[17px] font-semibold">How to book it</h2>
                <ol className="mt-4 flex flex-col gap-3.5">
                  {[
                    "Email or WhatsApp the property directly with your dates and the number of travellers.",
                    "Ask for the total including any park or conservation fee, in USD or Kwacha.",
                    "Confirm whether they take cards. Many do not, and ATMs run dry outside the towns.",
                    "July and August book out early. Ask about the shoulder months for a better rate.",
                  ].map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex-none w-5 h-5 rounded-full bg-ink text-cream grid place-items-center text-[10px] font-bold mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-[13px] text-ink/60 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-7 flex flex-col gap-2.5">
                <PillLink href="/plan#build" variant="solid">
                  Build a trip around this
                </PillLink>
                <PillLink href="/flights" variant="outline">
                  Getting to Malawi
                </PillLink>
              </div>
            </div>

            {nearby.length > 0 && (
              <div className="mt-5 rounded-2xl border border-ink/10 p-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40 mb-4">
                  Also worth considering
                </h2>
                <ul className="flex flex-col gap-4">
                  {nearby.map((candidate) => (
                    <li key={candidate.id}>
                      <a href={`/hotels/${candidate.slug}`} className="group block">
                        <span className="text-[14px] font-semibold group-hover:text-ember transition-colors">
                          {candidate.name}
                        </span>
                        <span className="block text-[12px] text-ink/45 mt-0.5">
                          {candidate.location} · ${candidate.pricePerNightUsd}/night
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}