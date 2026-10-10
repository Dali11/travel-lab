import { SectionHeading, shell, sectionY } from "./Layout";
import { Reveal } from "./Reveal";
import DeferredMap from "../map/DeferredMap";
import { destinationsGeoJSON, malawiBbox, geoDestinations, unlocatedDestinations } from "@/lib/data";
import type { MapFeatureCollectionData } from "../map/MalawiMap";

/**
 * The interactive map section.
 *
 * A server component that owns the copy, the GeoJSON and the frame, and hands
 * all three to a lazily-loaded client island. GeoJSON is built here and passed
 * as a prop, so the coordinates are serialised into the HTML rather than
 * fetched after paint — the markers exist on first frame.
 */
export function MapSection() {
  // Only destinations with a verified coordinate reach the map. A marker in the
  // wrong place is worse than no marker.
  const collection = destinationsGeoJSON() as unknown as MapFeatureCollectionData;

  return (
    <section
      id="map"
      className={`${shell} ${sectionY} bg-ink text-white`}
      aria-labelledby="map-title"
    >
      <Reveal>
        <SectionHeading
          eyebrow="Interactive map"
          title="Explore Malawi geographically"
          intro="Not a list with pins. Real terrain, real relief, and a camera that moves the way a plane would. Select a place and the country tilts into focus."
          tone="light"
        />
      </Reveal>

      <Reveal delay={120} className="mt-12 lg:mt-16">
        <DeferredMap geojson={collection} bbox={malawiBbox} height={620} />
      </Reveal>

      {/* Honest note about what is and is not plotted. */}
      <Reveal delay={200} className="mt-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 text-[13px] text-white/45 border-t border-white/10 pt-7">
          <p className="max-w-md leading-relaxed">
            <strong className="text-white/70 font-semibold">
              {geoDestinations.length} destinations plotted.
            </strong>{" "}
            Every coordinate here was verified against Wikipedia, Wikidata or GeoNames,
            and each place page links to the source it came from. Nothing is placed at an
            approximate position.
          </p>

          {unlocatedDestinations.length > 0 && (
            <p className="max-w-md leading-relaxed">
              <strong className="text-white/70 font-semibold">
                {unlocatedDestinations.length} more{" "}
                {unlocatedDestinations.length === 1 ? "place is" : "places are"} written
                up but not plotted
              </strong>{" "}
              —{" "}
              {unlocatedDestinations
                .slice(0, 4)
                .map((destination) => destination.name)
                .join(", ")}
              {unlocatedDestinations.length > 4 && " and others"}. They appear on their
              own pages. We would rather leave them off the map than guess.
            </p>
          )}
        </div>
      </Reveal>
    </section>
  );
}