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
          eyebrow="Your journey, your way"
          title="Your Malawi adventure starts here."
          intro="Tell us when you're coming, what you love and how long you have. We'll shape a day-by-day journey around Malawi's lakeshores, wild places, mountain trails and local culture—without wasting precious days doubling back."
        />
      </Reveal>

      <Reveal delay={120} className="mt-7 lg:mt-10">
        <TripBuilder geo={geo} />
      </Reveal>
    </section>
  );
}