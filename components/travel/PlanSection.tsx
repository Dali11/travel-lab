import { SectionHeading, shell, sectionY } from "./Layout";
import { Reveal } from "./Reveal";
import { TripBuilder } from "../itinerary/TripBuilder";
import { destinations } from "@/lib/data";
import type { GeoContext } from "@/lib/itinerary";

/**
 * "Build Your Trip" — the signature feature.
 *
 * A server section that owns the framing and the promise, and hands the
 * generator to a client island. The verified coordinates are read here, on the
 * server, and passed down as props: the generator is imported by a client
 * component and therefore must not reach `node:fs` itself.
 */
export function PlanSection() {
  const geo: GeoContext = { destinations };

  return (
    <section
      id="build"
      className={`${shell} ${sectionY} bg-sand/35`}
      aria-labelledby="build-title"
    >
      <Reveal>
        <SectionHeading
          eyebrow="Build your trip"
          title="Tell us the trip. We'll build the route."
          intro="Malawi is 900 kilometres long with a great deal of unpaved road. An itinerary that zig-zags across it wastes days. This one scores destinations against what you actually care about, then solves the route so it never doubles back."
        />
      </Reveal>

      <Reveal delay={120} className="mt-12 lg:mt-16">
        <TripBuilder geo={geo} />
      </Reveal>
    </section>
  );
}