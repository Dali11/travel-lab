import Link from "next/link";
import { Photo } from "../travel/Photo";
import { Reveal } from "../travel/Reveal";
import { SectionHeading, shell, sectionY } from "../travel/Layout";
import { cultureStories } from "@/lib/data/culture";
import { destinationById } from "@/lib/data";

/**
 * "Meet the Warm Heart."
 *
 * Malawi is usually described by what it is not — not Kenya, not Tanzania, not
 * Rwanda. This section argues the opposite. It is the part of the site most
 * likely to be what somebody actually remembers.
 *
 * Editorial photography-forward, no cards, no grid chrome. The lead story runs
 * as a full-bleed band with the rest as a staggered column, so the section reads
 * as magazine layout rather than as a content module.
 */

export function CultureSection() {
  const [lead, ...rest] = cultureStories;

  return (
    <section
      id="culture"
      className={`bg-cream ${sectionY}`}
      aria-labelledby="culture-title"
    >
      <div className={shell}>
        <Reveal>
          <SectionHeading
            eyebrow="Meet the Warm Heart"
            title="It is about more than sightseeing"
            intro="Malawi gets described by what it is not. This is the part of the site that argues for what it is — the food, the people, the markets, and the reason people come back a second time."
          />
        </Reveal>
      </div>

      {/* Lead story: full-bleed */}
      <Reveal delay={100} className="mt-10 lg:mt-20">
        <article className="px-5 sm:px-8 lg:px-12">
          <div className="max-w-[1400px] mx-auto">
            <Link
              href={`/experiences#${lead.id}`}
              className="media-frame media-zoom group relative block h-[480px] sm:h-[560px] lg:h-[620px] rounded-3xl"
            >
              <Photo
                photoKey={lead.photo}
                alt={lead.title}
                seed={lead.id}
                sizes="100vw"
              />
              <div className="scrim-b absolute inset-0" aria-hidden="true" />
              <div className="scrim-l absolute inset-0 opacity-60" aria-hidden="true" />

              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 lg:p-14">
                <div className="max-w-[640px]">
                  <span className="inline-block rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/90 mb-5">
                    {lead.topic}
                  </span>
                  <h3 className="font-display text-[clamp(1.9rem,4.4vw,3.2rem)] font-semibold text-white leading-[1.03] tracking-[-0.025em] text-balance">
                    {lead.title}
                  </h3>
                  <p className="mt-5 text-[15px] sm:text-[16px] text-white/80 leading-relaxed text-pretty line-clamp-3">
                    {lead.body}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </article>
      </Reveal>

      {/* The rest: staggered columns, magazine rhythm */}
      <div className={`${shell} mt-4 lg:mt-6`}>
        <div className="max-w-[1400px] mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {rest.map((story, index) => {
            const destination = story.destinationIds[0]
              ? destinationById.get(story.destinationIds[0])
              : undefined;

            return (
              <Reveal
                key={story.id}
                delay={Math.min(index * 60, 300)}
                // Stagger columns vertically so the grid never looks like a table.
                className={index % 3 === 1 ? "sm:mt-10" : index % 3 === 2 ? "lg:mt-20" : ""}
              >
                <article className="flex flex-col h-full">
                  <Link
                    href={`/experiences#${story.id}`}
                    className="media-frame media-zoom group relative block h-[280px] rounded-2xl"
                  >
                    <Photo
                      photoKey={story.photo}
                      alt={story.title}
                      seed={story.id}
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className="scrim-b absolute inset-0" aria-hidden="true" />
                    <span className="absolute top-4 left-4 rounded-full bg-ink/50 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/85">
                      {story.topic}
                    </span>
                  </Link>

                  <h3 className="font-display text-[21px] font-semibold leading-tight tracking-[-0.015em] mt-5">
                    <Link href={`/experiences#${story.id}`} className="hover:text-ember transition-colors">
                      {story.title}
                    </Link>
                  </h3>

                  <p className="mt-3 text-[14px] text-ink/55 leading-relaxed text-pretty line-clamp-4 flex-1">
                    {story.body}
                  </p>

                  {destination && (
                    <Link
                      href={`/places/${destination.slug}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink/50 hover:text-ember transition-colors self-start"
                    >
                      Where to see it · {destination.name}
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}