import Link from "next/link";
import type { Destination } from "@/lib/types";
import { Photo } from "../travel/Photo";
import { Stars } from "../travel/Layout";

/**
 * Destination cards.
 *
 * One destination, three levels of emphasis — three components rather than one
 * with a `size` prop, because the three are used in genuinely different
 * contexts (a rail, a showcase grid, a related list) and a size prop ends up
 * carrying conditional class strings that nobody can read.
 */

/** Immersive feature card. Used for the three headline destinations. */
export function DestinationFeature({
  destination,
  photoSrc,
  priority = false,
}: {
  destination: Destination;
  photoSrc?: string | null;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/places/${destination.slug}`}
      className="media-frame media-zoom group relative block h-[440px] sm:h-[540px] lg:h-[600px] rounded-3xl"
    >
      <Photo
        photoKey={destination.photo}
        src={photoSrc}
        alt={destination.name}
        seed={destination.id}
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 50vw"
      />

      <div className="scrim-b absolute inset-0" aria-hidden="true" />
      {/* A second, side scrim keeps long place names legible over bright water. */}
      <div className="scrim-l absolute inset-0 opacity-70" aria-hidden="true" />

      <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90">
            {destination.region}
          </span>
        </div>

        <h3 className="font-display text-[clamp(1.9rem,4vw,3.1rem)] font-semibold text-white leading-[1.02] tracking-[-0.025em]">
          {destination.name}
        </h3>

        <p className="mt-2.5 text-[14px] font-medium text-white/70 tracking-wide">
          {destination.essence}
        </p>

        <p className="mt-5 text-[15px] text-white/80 max-w-[46ch] leading-relaxed text-pretty">
          {destination.summary}
        </p>

        <div className="mt-7 flex items-center gap-5">
          <span className="inline-flex items-center gap-2.5 text-[14px] font-semibold text-white">
            View details
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
              className="transition-transform duration-500 group-hover:translate-x-1"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
          <Stars rating={destination.rating} className="opacity-90" />
        </div>
      </div>
    </Link>
  );
}

/** Compact editorial card matching the homepage reference. */
export function DestinationCompactCard({
  destination,
  photoSrc,
  priority = false,
}: {
  destination: Destination;
  photoSrc?: string | null;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/places/${destination.slug}`}
      className="group block min-w-0"
    >
      <div className="media-frame media-zoom relative h-[150px] overflow-hidden rounded-lg sm:h-[170px] lg:h-[150px] xl:h-[165px]">
        <Photo
          photoKey={destination.photo}
          src={photoSrc}
          alt={destination.name}
          seed={destination.id}
          priority={priority}
          sizes="(max-width: 640px) 68vw, (max-width: 1024px) 45vw, 25vw"
        />
      </div>
      <div className="pt-1.5">
        <h3 className="text-[12px] font-bold leading-snug text-ink transition-colors group-hover:text-ember">
          {destination.name}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[10px] leading-snug text-muted">
          {destination.essence}
        </p>
      </div>
    </Link>
  );
}

/** Standard grid card. */
export function DestinationCard({
  destination,
  photoSrc,
  priority = false,
}: {
  destination: Destination;
  photoSrc?: string | null;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/places/${destination.slug}`}
      className="media-frame media-zoom group relative block h-[300px] sm:h-[340px] rounded-2xl"
    >
      <Photo
        photoKey={destination.photo}
        src={photoSrc}
        alt={destination.name}
        seed={destination.id}
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="scrim-b absolute inset-0" aria-hidden="true" />

      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">
          {destination.essence}
        </p>
        <h3 className="font-display text-[24px] font-semibold text-white leading-tight tracking-[-0.02em]">
          {destination.name}
        </h3>
        <p className="mt-1.5 text-[13px] text-white/65 line-clamp-2">{destination.summary}</p>
      </div>
    </Link>
  );
}

/**
 * Rail card. Fixed width, scrolls horizontally on mobile, joins the grid on
 * desktop. This is the mobile story rhythm the brief asks for.
 */
export function DestinationRailCard({
  destination,
  photoSrc,
}: {
  destination: Destination;
  photoSrc?: string | null;
}) {
  return (
    <Link
      href={`/places/${destination.slug}`}
      className="media-frame media-zoom group relative block w-[68vw] max-w-[270px] sm:w-[288px] h-[240px] sm:h-[280px] rounded-xl"
    >
      <Photo
        photoKey={destination.photo}
        src={photoSrc}
        alt={destination.name}
        seed={destination.id}
        sizes="248px"
      />
      <div className="scrim-b absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">
          {destination.essence}
        </p>
        <h3 className="font-display text-[21px] font-semibold text-white leading-tight">
          {destination.name}
        </h3>
        <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/0 group-hover:text-white/90 transition-colors duration-400">
          Explore
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}