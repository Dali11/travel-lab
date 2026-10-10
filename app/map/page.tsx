import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/travel/Navbar";
import { Footer } from "@/components/travel/Footer";
import { SectionHeading, shell, sectionY } from "@/components/travel/Layout";
import { Reveal } from "@/components/travel/Reveal";
import DeferredMap from "@/components/map/DeferredMap";
import { destinationsGeoJSON, malawiBbox, geoDestinations } from "@/lib/data";
import type { MapFeatureCollectionData } from "@/components/map/MalawiMap";

/**
 * The full-page map.
 *
 * The homepage carries an embedded map as one section of the story; this is the
 * dedicated page for when the map is the point. Same component, same GeoJSON,
 * taller viewport, plus the destination list underneath so the page is useful
 * for someone with no WebGL or no pointer.
 */

export const metadata: Metadata = {
  title: "Interactive Map of Malawi — Explore the Country",
  description:
    "Explore Malawi on an interactive 3D map with verified coordinates. Satellite imagery, real terrain, and camera movement between every destination, park, mountain and lakeside village.",
  openGraph: {
    title: "Interactive Map of Malawi — Travel Lab",
    description:
      "Explore Malawi on an interactive 3D map with verified coordinates and real terrain.",
  },
};

export default function MapPage() {
  const collection = destinationsGeoJSON() as unknown as MapFeatureCollectionData;

  return (
    <>
      <Navbar />
      <main id="main">
        <header className={`${shell} pt-32 pb-10 lg:pt-40 lg:pb-14`}>
          <p className="eyebrow mb-4">Interactive map</p>
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-balance max-w-4xl">
            Malawi, from above
          </h1>
          <p className="mt-6 text-[clamp(1rem,1.7vw,1.2rem)] text-ink/60 leading-relaxed text-pretty max-w-2xl">
            Malawi is about 900 kilometres long and mostly empty, which is the whole
            point: the distance between the lake and the northern plateau is the reason
            trips take two weeks and not five days. Fly the map and see it.
          </p>
        </header>

        <section className={`${shell} pb-12`} aria-label="Map of Malawi">
          <DeferredMap geojson={collection} bbox={malawiBbox} height={720} />
        </section>

        {/* Every destination, as text. The map is not the only route to the data. */}
        <section className={`${shell} ${sectionY}`} aria-labelledby="all-destinations">
          <Reveal>
            <SectionHeading
              eyebrow="Every plotted destination"
              title={`${geoDestinations.length} places, all coordinates verified`}
              intro="Each coordinate below was checked against Wikipedia, Wikidata or GeoNames and each place page links to its source. Nothing is placed at an approximate position."
            />
          </Reveal>

          <div className="mt-12 columns-1 sm:columns-2 lg:columns-3 gap-x-8">
            {geoDestinations
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((destination, index) => (
                <Reveal key={destination.id} delay={Math.min(index * 30, 240)}>
                  <Link
                    href={`/places/${destination.slug}`}
                    className="group block py-4 border-b border-ink/8"
                  >
                    <h3 className="font-display text-[19px] font-semibold tracking-[-0.015em] group-hover:text-ember transition-colors">
                      {destination.name}
                    </h3>
                    <p className="text-[12px] text-ink/45 mt-1">
                      {destination.region} · {destination.essence}
                    </p>
                    <p className="text-[11px] text-ink/35 mt-1 tabular-nums">
                      {destination.lat?.toFixed(4)}, {destination.lng?.toFixed(4)}
                      {destination.elevationM &&
                        ` · ${destination.elevationM.toLocaleString()}m`}
                    </p>
                  </Link>
                </Reveal>
              ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}