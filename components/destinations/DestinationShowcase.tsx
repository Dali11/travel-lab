import Link from "next/link";
import { Reveal } from "../travel/Reveal";
import { shell } from "../travel/Layout";
import { DestinationCompactCard, DestinationRailCard } from "../destinations/DestinationCard";
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
  "zomba-plateau",
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
      className={`${shell} bg-cream py-8 sm:py-10 lg:py-12`}
      aria-labelledby="places-title"
    >
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ember">
              Discover Malawi
            </p>
            <h2 id="places-title" className="font-display text-[clamp(1.55rem,2.5vw,2rem)] font-semibold leading-tight tracking-[-0.03em] text-ink">
              Top destinations
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              Iconic places, hidden gems and unforgettable landscapes.
            </p>
          </div>
          <Link href="/places" className="mb-1 shrink-0 text-[11px] font-semibold text-ember hover:underline">
            View all destinations →
          </Link>
        </div>
      </Reveal>

      {/* Desktop: compact photographic cards with captions underneath */}
      <div className="mt-4 hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {showcase.map((destination, index) => (
          <Reveal key={destination.id} delay={index * 70}>
            <DestinationCompactCard destination={destination} priority={index < 4} />
          </Reveal>
        ))}
      </div>

      {/* Mobile: compact two-column destination cards */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:hidden">
        {showcase.map((destination, index) => (
          <Reveal key={destination.id} delay={index * 60}>
            <DestinationCompactCard destination={destination} priority={index < 2} />
          </Reveal>
        ))}
      </div>

    </section>
  );
}