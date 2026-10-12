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
      className={`${shell} scroll-mt-24 bg-[#F8F4EC] py-6 text-[#10100E] sm:py-8 lg:py-10`}
      aria-labelledby="map-title"
    >
      <Reveal>
        <SectionHeading
          eyebrow="Explore Malawi"
          title="Find your place on the map"
          intro="Discover lakeshores, wildlife reserves, mountain trails and hidden places across Malawi."

        />
      </Reveal>

      <Reveal delay={120} className="mt-4 overflow-hidden rounded-2xl lg:mt-5">
        <DeferredMap geojson={collection} bbox={malawiBbox} height={620} className="map-responsive-frame" />
      </Reveal>

      {/* Honest note about what is and is not plotted. */}
      <Reveal delay={200} className="mt-5">
        <div className="flex flex-col gap-4 border-t border-black/10 pt-5 text-[12px] leading-relaxed text-black/55 sm:flex-row sm:gap-10">
          <p className="max-w-md leading-relaxed">
            <strong className="font-semibold text-black/80">
              {geoDestinations.length} destinations plotted.
            </strong>{" "}
            Every coordinate here was verified against Wikipedia, Wikidata or GeoNames,
            and each place page links to the source it came from. Nothing is placed at an
            approximate position.
          </p>

          {unlocatedDestinations.length > 0 && (
            <p className="max-w-md leading-relaxed">
              <strong className="font-semibold text-black/80">
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