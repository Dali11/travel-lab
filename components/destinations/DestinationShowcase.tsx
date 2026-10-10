import Link from "next/link";
import { Reveal } from "../travel/Reveal";
import { SectionHeading, shell, sectionY } from "../travel/Layout";
import { DestinationFeature, DestinationRailCard } from "../destinations/DestinationCard";
import { destinations } from "@/lib/data";

/**
 * "Places you'll remember."
 *
 * Three cinematic features on desktop, a swipe rail on mobile. The rail is the
 * mobile story rhythm the brief asks for — a vertical travel story with
 * horizontal carousels where a grid would otherwise become a wall.
 */

/** Chosen for being the three places that define what Malawi actually is. */
const showcaseIds = [
  "cape-maclear",
  "liwonde-national-park",
  "mount-mulanje",
];

const railIds = [
  "lake-malawi-national-park",
  "likoma",
  "zomba-plateau",
  "nyika-national-park",
  "malangalanga",
  "mua-mission",
  "nkhata-bay",
  "viphya",
  "chizumulu",
  "livingstonia",
  "banaba",
  "kasungu-national-park",
];

export function DestinationShowcase() {
  const showcase = showcaseIds
    .map((id) => destinations.find((destination) => destination.id === id))
    .filter((destination): destination is NonNullable<typeof destination> => Boolean(destination));

  const rail = railIds
    .map((id) => destinations.find((destination) => destination.id === id))
    .filter((destination): destination is NonNullable<typeof destination> => Boolean(destination));

  return (
    <section
      id="places"
      className={`${shell} ${sectionY} bg-cream`}
      aria-labelledby="places-title"
    >
      <Reveal>
        <SectionHeading
          eyebrow="Places you'll remember"
          title="The ones that end up on the camera roll"
          intro="Lake water you can see the bottom of, elephants on a river at dawn, and a granite mountain that makes people cry. Three places, and the rest of the country."
        />
      </Reveal>

      {/* Desktop: asymmetric two-column features */}
      <div className="mt-14 lg:mt-20 hidden lg:grid lg:grid-cols-2 gap-4">
        {showcase.map((destination, index) => (
          <Reveal key={destination.id} delay={index * 110}>
            <DestinationFeature destination={destination} priority={index < 2} />
          </Reveal>
        ))}
      </div>

      {/* Mobile: swipe rail */}
      <Reveal className="mt-8 lg:hidden">
        <div className="rail -mx-5 px-5">
          {showcase.map((destination) => (
            <div key={destination.id} className="w-[82vw] max-w-[380px]">
              <DestinationRailCard destination={destination} />
            </div>
          ))}
        </div>
      </Reveal>

      {/* Everything else */}
      <Reveal className="mt-10 lg:mt-24">
        <div className="flex items-baseline justify-between gap-6 mb-6">
          <h3 className="font-display text-[clamp(1.4rem,2.6vw,1.9rem)] font-semibold tracking-[-0.02em]">
            And the rest of the country
          </h3>
          <Link
            href="/places"
            className="shrink-0 text-[14px] font-semibold text-ink/60 hover:text-ink transition-colors"
          >
            All {destinations.length} →
          </Link>
        </div>

        <div className="rail pb-3">
          {rail.map((destination) => (
            <DestinationRailCard key={destination.id} destination={destination} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}