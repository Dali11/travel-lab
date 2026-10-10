import Link from "next/link";
import { Photo } from "../travel/Photo";
import { Reveal } from "../travel/Reveal";
import { SectionHeading, shell, sectionY } from "../travel/Layout";
import { experiences } from "@/lib/data/experiences";

/**
 * "Experiences, not just places."
 *
 * The product's central reorganisation, and the section that most distinguishes
 * this from a tourism directory. Travel Lab is organised around what you do
 * rather than where you go.
 *
 * Every price is labelled as indicative and non-bookable, because `bookable` is
 * false for every entry and there is no booking engine behind any of them. The
 * label sits on the card, not in a footer.
 */

const featured = experiences.slice(0, 5);

const categoryLabel: Record<string, string> = {
  wildlife: "Wildlife",
  water: "On the water",
  adventure: "Adventure",
  culture: "Culture",
  food: "Food",
  romance: "Romance",
  family: "Family",
  wellness: "Slow",
};

export function ExperienceSection() {
  return (
    <section
      id="experiences"
      className={`${shell} ${sectionY} bg-cream`}
      aria-labelledby="experiences-title"
    >
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <SectionHeading
          eyebrow="Experiences"
          title="Experiences, not just places."
          intro="Most travel sites are organised by geography. This one is organised by what you actually want to do — and these are the things worth flying to Malawi for."
        />

      </div>

      {/* Five visible featured experiences. */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-4">
        {featured.map((experience, index) => {
          const span = "";
          const height =
            index === 0
              ? "h-[230px] sm:h-[280px] lg:h-[300px]"
              : "h-[230px] sm:h-[280px] lg:h-[300px]";

          return (
            <div key={experience.id} className={span}>
              <Link
                href={`/experiences/${experience.slug}`}
                className={`media-frame media-zoom group relative block w-full rounded-2xl lg:rounded-3xl ${height}`} style={{ height: index === 0 ? "230px" : "230px" }}
              >
                <Photo
                  photoKey={experience.photo}
                  alt={experience.title}
                  seed={experience.id}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="scrim-b absolute inset-0" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-5 lg:p-7">
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur-md">
                      {categoryLabel[experience.category]}
                    </span>
                    <span className="text-[11px] font-semibold text-white/70">
                      {experience.priceFromUsd === 0 ? "Free" : `From $${experience.priceFromUsd}`}
                    </span>
                  </div>
                  <h3 className={`font-display font-semibold leading-[1.05] tracking-[-0.02em] text-pretty text-white ${
                    index === 0 ? "text-[26px] lg:text-[38px]" : "text-[22px] lg:text-[25px]"
                  }`}>
                    {experience.title}
                  </h3>
                  {index === 0 && (
                    <p className="mt-3 max-w-[42ch] text-[14px] leading-relaxed text-white/75 text-pretty">
                      {experience.summary}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <Link
          href="/experiences"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink hover:text-ember transition-colors"
        >
          See all experiences
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <p className="mt-4 text-[12px] text-ink/40 leading-relaxed max-w-2xl">
        Prices are indicative planning figures for the activity itself and exclude
        accommodation and transport. Nothing here is bookable — there is no booking
        engine connected to Travel Lab, and a price shown on a travel site that people
        book from must come from somewhere real.
      </p>
    </section>
  );
}