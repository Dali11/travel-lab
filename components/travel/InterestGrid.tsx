import Link from "next/link";
import { Photo } from "../travel/Photo";
import { SectionHeading, shell, sectionY } from "../travel/Layout";
import { interests } from "@/lib/data/interests";
import { destinations } from "@/lib/data";

/**
 * "What kind of Malawi are you looking for?"
 *
 * Photography-first cards, not a category grid. Each card links to /discover
 * pre-filtered by that interest, so the card is a doorway into the product
 * rather than a dead end.
 *
 * Layout is deliberately not a uniform 4x2 grid: an 8-card grid reads as a
 * dashboard. Instead the first card is a wide feature, the rest form an
 * editorial grid that collapses to a swipe rail on mobile.
 */
export function InterestGrid() {
  return (
    <section
      className={`${shell} py-8 sm:py-14 lg:py-24 bg-cream`}
      aria-labelledby="interests-title"
    >
      <SectionHeading
        eyebrow="Explore by interest"
        title="What kind of Malawi are you looking for?"
        intro="Pick the version of this country that sounds like you. Everything below is filtered by what you choose, not by what happens to be trending."
      />

      <div className="mt-8 sm:mt-10 lg:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {interests.map((interest, index) => {
          const matched = destinations.filter((destination) =>
            interest.destinationIds.includes(destination.id),
          );
          const featured = index === 0;

          return (
            <div
              key={interest.id}
              className={featured ? "col-span-2 lg:col-span-2 lg:row-span-2" : ""}
            >
              <Link
                href={`/discover?interest=${interest.id}`}
                className={`media-frame media-zoom group relative block h-full min-h-[220px] w-full overflow-hidden ${
                  featured ? "h-[320px] sm:h-[420px] lg:h-full lg:min-h-[560px]" : "h-[220px] sm:h-[260px] lg:h-[272px]"
                } rounded-2xl lg:rounded-3xl`}
                aria-label={`Explore ${interest.label} — ${matched.length} destinations`}
              >
                <Photo
                  photoKey={interest.photo}
                  alt={`${interest.label} in Malawi`}
                  seed={interest.id}
                  sizes={
                    featured
                      ? "(max-width: 1024px) 100vw, 50vw"
                      : "(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  }
                />

                {/* Accent glow on hover — subtle, tinted by the interest. */}
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(120% 90% at 50% 110%, ${interest.accent}88 0%, transparent 62%)`,
                  }}
                  aria-hidden="true"
                />

                {/* Bottom scrim + copy */}
                <div className="scrim-b absolute inset-0" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h3
                        className={`font-display font-semibold text-white leading-[1.05] tracking-[-0.02em] ${
                          featured ? "text-[28px] lg:text-[40px]" : "text-[20px] lg:text-[22px]"
                        }`}
                      >
                        {interest.label}
                      </h3>
                      {featured && (
                        <p className="mt-2 text-[14px] text-white/75 max-w-[34ch] leading-relaxed text-pretty hidden sm:block">
                          {interest.tagline}
                        </p>
                      )}
                    </div>

                    {/* Arrow that slides on hover. Decorative. */}
                    <span className="flex-none w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/25 grid place-items-center text-white transition-all duration-500 group-hover:bg-white group-hover:text-ink group-hover:border-white">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        aria-hidden="true"
                        className="transition-transform duration-500 group-hover:translate-x-0.5"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </div>

                  {!featured && (
                    <p className="mt-1 text-[12px] text-white/60 truncate">
                      {interest.tagline}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}