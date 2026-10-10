import Link from "next/link";
import { PillLink, SectionHeading, shell, sectionY } from "../travel/Layout";
import { Reveal } from "../travel/Reveal";
import {
  airportGates,
  corridors,
  flightDisclosure,
  formatDuration,
  priceCheckers,
  routeShapes,
} from "@/lib/data/routes";

/**
 * Getting to Malawi.
 *
 * The hard constraint of this section, stated once and stated plainly: there is
 * no live fare feed connected to this project, and there is no free API with
 * usable coverage of Malawian routes. So this shows ROUTE SHAPE — who flies the
 * corridor, who connects where, how long it takes — and links out for a real
 * price. It does not show a fare, because a stale fare on a travel site is worse
 * than no fare: people book on it.
 *
 * The disclosure sits at the top of the content, not at the bottom.
 */

export function GettingThereSection() {
  return (
    <section
      id="getting-there"
      className={`${shell} ${sectionY} bg-sand/35`}
      aria-labelledby="getting-there-title"
    >
      <Reveal>
        <SectionHeading
          eyebrow="Getting to Malawi"
          title="Two airports, and everything funnels through them"
          intro="Kamuzu in the north, Chileka in the south. Almost every itinerary starts at one and ends at the other. Here is what the journey actually looks like — and where to get a real fare."
        />
      </Reveal>

      {/* The disclaimer, prominent and early. */}
      <Reveal delay={80}>
        <div className="mt-10 rounded-2xl border-l-2 border-ember bg-white/70 p-6">
          <p className="text-[13px] leading-relaxed text-ink/65">{flightDisclosure}</p>
        </div>
      </Reveal>

      {/* Airports */}
      <div className="mt-12 grid sm:grid-cols-2 gap-4">
        {airportGates.map((gate, index) => (
          <Reveal key={gate.code} delay={index * 100}>
            <div className="h-full rounded-2xl bg-white border border-ink/8 p-7">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[2.6rem] font-semibold leading-none tracking-[-0.03em] text-lake">
                  {gate.code}
                </span>
                <span className="text-[14px] text-ink/45">{gate.city}</span>
              </div>
              <h3 className="font-display text-[19px] font-semibold mt-3 tracking-[-0.015em]">
                {gate.name}
              </h3>
              <p className="text-[14px] text-ink/55 mt-3 leading-relaxed">{gate.note}</p>

              <div className="mt-6 pt-5 border-t border-ink/8">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/40 mb-2.5">
                  Gateway for
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {gate.gatewayFor.map((item) => (
                    <li
                      key={item}
                      className="text-[11px] bg-cream border border-ink/8 rounded-full px-2.5 py-1 text-ink/60"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Corridors */}
      <Reveal className="mt-16">
        <h3 className="font-display text-[clamp(1.3rem,2.4vw,1.75rem)] font-semibold tracking-[-0.02em]">
          The corridors people actually fly
        </h3>
        <div className="mt-7 flex flex-col gap-3">
          {corridors.map((corridor, index) => (
            <Reveal key={corridor.id} delay={Math.min(index * 70, 300)}>
              <article className="group rounded-2xl bg-white border border-ink/8 p-6 sm:p-7 transition-all duration-400 hover:border-ink/20">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <span className="font-display text-[19px] font-semibold tracking-[-0.015em]">
                    {corridor.originCity}
                  </span>
                  <svg
                    width="52"
                    height="12"
                    viewBox="0 0 52 12"
                    fill="none"
                    aria-hidden="true"
                    className="flex-none text-ink/25 group-hover:text-ember transition-colors"
                  >
                    <path d="M0 6h44" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 3" />
                    <path d="M41 2l5 4-5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="rounded-full bg-lake/10 text-lake px-3 py-1 text-[11px] font-bold">
                    {corridor.via}
                  </span>
                </div>

                <p className="mt-3.5 text-[15px] font-medium text-ink/80">{corridor.summary}</p>
                <p className="mt-2.5 text-[14px] text-ink/50 leading-relaxed text-pretty max-w-[68ch]">
                  {corridor.character}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* Route shapes table */}
      <Reveal className="mt-16">
        <h3 className="font-display text-[clamp(1.3rem,2.4vw,1.75rem)] font-semibold tracking-[-0.02em]">
          Typical block times
        </h3>
        <p className="mt-2.5 text-[13px] text-ink/50 max-w-[60ch] leading-relaxed">
          Scheduled figures, not a live schedule and not a fare. Changes seasonally and
          with the timetable.
        </p>

        {/* Desktop table / mobile stacked cards */}
        <div className="mt-6 hidden sm:block rounded-2xl bg-white border border-ink/8 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-ink/8">
                {["Route", "Carrier", "Stops", "Block time"].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routeShapes.map((route) => (
                <tr key={route.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-4 text-[14px] font-semibold">
                    {route.fromCity}
                    <span className="text-ink/40 font-normal"> → </span>
                    {route.toAirport}
                  </td>
                  <td className="px-5 py-4 text-[14px] text-ink/65">
                    {route.airline}
                    {route.airlineCode !== "—" && (
                      <span className="text-ink/35 font-bold text-[11px] ml-1.5">
                        {route.airlineCode}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[13px] text-ink/55">{route.stops}</td>
                  <td className="px-5 py-4 text-[14px] font-semibold tabular-nums">
                    {formatDuration(route.durationMinutes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 sm:hidden flex flex-col gap-3">
          {routeShapes.map((route) => (
            <div key={route.id} className="rounded-2xl bg-white border border-ink/8 p-5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-semibold">
                  {route.fromCity} → {route.toAirport}
                </span>
                <span className="text-[14px] font-bold tabular-nums shrink-0">
                  {formatDuration(route.durationMinutes)}
                </span>
              </div>
              <p className="mt-2 text-[13px] text-ink/55">
                {route.airline} · {route.stops}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Where to actually check a price */}
      <Reveal className="mt-16">
        <div className="rounded-3xl bg-lake-deep text-white p-8 sm:p-11">
          <h3 className="font-display text-[clamp(1.4rem,2.6vw,2rem)] font-semibold tracking-[-0.02em]">
            Check a real fare
          </h3>
          <p className="mt-3.5 text-[15px] text-white/70 leading-relaxed max-w-[60ch] text-pretty">
            Live pricing for Malawian routes only exists behind the airline or a
            metasearch site, and most of it is behind an account. Rather than show you a
            number that would be out of date by the time you read it, here is where to get
            today&rsquo;s actual price.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {priceCheckers.map((checker) => (
              <PillLink key={checker.name} href={checker.url} variant="light">
                {checker.name} ↗
              </PillLink>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-8">
        <Link
          href="/flights"
          className="inline-flex items-center gap-2 text-[15px] font-semibold text-ink hover:text-ember transition-colors"
        >
          The full flights guide — codeshares, baggage, and four things that cost people money →
        </Link>
      </Reveal>
    </section>
  );
}