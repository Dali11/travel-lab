import type { Metadata } from "next";
import { Navbar } from "@/components/travel/Navbar";
import { Footer } from "@/components/travel/Footer";
import { Photo } from "@/components/travel/Photo";
import {
  Eyebrow,
  PillLink,
  SectionHeading,
  SectionRule,
  shell,
  sectionY,
} from "@/components/travel/Layout";
import { Reveal } from "@/components/travel/Reveal";
import { airlines, airports, fareTips } from "@/lib/flights";
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
 * The one rule this page cannot break: there is no live fare feed connected to
 * Travel Lab, and no free API with usable coverage of Malawian routes, so
 * nothing here is a price. The disclosure sits directly under the H1, before
 * any route data, because a page that leads with route shapes and mentions the
 * caveat in a footer is a page people have already misread.
 *
 * Everything shown is either from `lib/flights` (editorial on carriers and fare
 * traps) or `lib/data/routes` (corridors, airports, typical block times).
 */

export const metadata: Metadata = {
  title: "Getting to Malawi — Who Actually Flies Here",
  description:
    "Which airlines serve Kamuzu and Chileka, which routes are direct, what the codeshares mean, typical block times, and where to check a live fare.",
  openGraph: {
    title: "Getting to Malawi — Flights, Routes and Airports",
    description:
      "Malawi is not a hub. Here is which route you connect through, who operates it, and where to get a real price.",
    type: "website",
  },
};

export default function FlightsPage() {
  return (
    <div>
      <Navbar />

      <main id="main">
        {/* ------------------------------------------------------------ Hero */}
        <section className="relative overflow-hidden bg-ink">
          <div className="absolute inset-0" aria-hidden="true">
            <Photo
              photoKey="flights-hero"
              alt=""
              seed="flights-hero"
              priority
              sizes="100vw"
              fallbackTone="deep"
            />
          </div>
          <div className="scrim-b absolute inset-0" aria-hidden="true" />
          <div
            className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/55 to-transparent"
            aria-hidden="true"
          />

          <div
            className={`${shell} relative pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24`}
          >
            <div className="max-w-3xl">
              <Eyebrow tone="light" className="block">
                Getting there
              </Eyebrow>
              <h1 className="mt-5 font-display text-[clamp(2.4rem,6.5vw,4.8rem)] font-semibold leading-[1.0] tracking-[-0.03em] text-white text-balance">
                Flights to Malawi
              </h1>
              <p className="mt-6 max-w-[56ch] text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-white/70 text-pretty">
                Malawi is not a hub, so the practical question is not which airline is
                cheapest — it is which route you connect through, and whether a ticket
                sold as direct actually is.
              </p>
            </div>

            {/* The disclosure. Above the fold, before any route data. */}
            <div className="mt-10 max-w-[68ch] rounded-2xl border-l-2 border-ember bg-white/10 p-6 backdrop-blur-md sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ember-soft">
                Read this first
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-white/85 text-pretty">
                {flightDisclosure}
              </p>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- Airports */}
        <section
          className={`${shell} ${sectionY}`}
          aria-labelledby="airports-title"
        >
          <Reveal>
            <SectionHeading
              eyebrow="Your two airports"
              title="Almost everything funnels through one of these two"
              intro="Kamuzu in the north, Chileka in the south. Which one you fly into is a real decision, not a detail — it can save you three hours of driving."
            />
          </Reveal>

          <h2 id="airports-title" className="sr-only">
            The two international airports
          </h2>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {airports.map((airport, index) => {
              // `lib/flights` holds the short note; `lib/data/routes` holds the
              // longer one and what each airport is actually the gateway for.
              const gate = airportGates.find((entry) => entry.code === airport.code);
              return (
                <Reveal key={airport.code} delay={index * 90}>
                  <article className="h-full rounded-2xl border border-ink/10 bg-white p-7 sm:p-8">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-[clamp(2.2rem,5vw,3rem)] font-semibold leading-none tracking-[-0.03em] text-lake">
                        {airport.code}
                      </span>
                      <span className="text-[14px] text-muted">{airport.city}</span>
                    </div>
                    <h3 className="mt-4 font-display text-[21px] font-semibold tracking-[-0.015em] text-ink">
                      {airport.name}
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-soft/80 text-pretty">
                      {gate?.note ?? airport.note}
                    </p>

                    {gate && (
                      <div className="mt-7 border-t border-ink/10 pt-5">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40">
                          Gateway for
                        </p>
                        <ul className="flex flex-wrap gap-1.5">
                          {gate.gatewayFor.map((item) => (
                            <li
                              key={item}
                              className="rounded-full border border-ink/10 bg-cream px-3 py-1.5 text-[12px] text-ink/65"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------- Corridors */}
        <section
          className="border-y border-ink/10 bg-white"
          aria-labelledby="corridors-title"
        >
          <div className={`${shell} ${sectionY}`}>
            <SectionRule label="Corridors" />

            <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
              <div>
                <SectionHeading
                  eyebrow="The routes people actually fly"
                  title="Five corridors, and the one question that decides your ticket"
                  intro="Where you connect changes the total journey time more than the airline does. These are the corridors that carry almost all of the traffic."
                />
              </div>

              <div className="flex flex-col gap-3">
                {corridors.map((corridor, index) => (
                  <Reveal key={corridor.id} delay={Math.min(index * 70, 280)}>
                    <article className="group rounded-2xl border border-ink/10 bg-cream p-6 transition-colors hover:border-ink/25 sm:p-7">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <span className="font-display text-[19px] font-semibold tracking-[-0.015em] text-ink">
                          {corridor.originCity}
                        </span>
                        <span className="text-[12px] uppercase tracking-[0.14em] text-ink/40">
                          {corridor.originCountry}
                        </span>
                        <svg
                          width="52"
                          height="12"
                          viewBox="0 0 52 12"
                          fill="none"
                          aria-hidden="true"
                          className="flex-none text-ink/25 transition-colors group-hover:text-ember"
                        >
                          <path
                            d="M0 6h44"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeDasharray="2 3"
                          />
                          <path
                            d="M41 2l5 4-5 4"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="rounded-full bg-lake/10 px-3 py-1 text-[11px] font-bold text-lake">
                          {corridor.via}
                        </span>
                      </div>

                      <p className="mt-4 text-[15px] font-medium text-ink/85">
                        {corridor.summary}
                      </p>
                      <p className="mt-2.5 max-w-[68ch] text-[14px] leading-relaxed text-muted text-pretty">
                        {corridor.character}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------- Route shapes */}
        <section
          className={`${shell} ${sectionY}`}
          aria-labelledby="block-times-title"
        >
          <SectionRule label="Block times" />

          <div className="mt-12 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2
                id="block-times-title"
                className="font-display text-[clamp(1.9rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink text-balance"
              >
                How long the journey actually takes
              </h2>
              <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted text-pretty">
                Typical scheduled block times, not today&rsquo;s schedule and not a
                fare. They move seasonally and with the timetable, and a codeshare may
                add a change of aircraft that is not in this number.
              </p>
            </div>
            <PillLink href="#live-price" variant="outline" className="shrink-0">
              Where to check a price
            </PillLink>
          </div>

          {/* Desktop table / mobile stacked cards */}
          <div className="mt-10 hidden overflow-hidden rounded-2xl border border-ink/10 bg-white sm:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <caption className="sr-only">
                  Typical scheduled block times from major origins to Malawi
                </caption>
                <thead>
                  <tr className="border-b border-ink/10">
                    {["Route", "Carrier", "Stops", "Block time"].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {routeShapes.map((route) => (
                    <tr
                      key={route.id}
                      className="border-b border-ink/5 last:border-0"
                    >
                      <td className="px-5 py-4 text-[14px] font-semibold text-ink">
                        {route.fromCity}
                        <span className="font-normal text-ink/40"> → </span>
                        {route.toAirport}
                        {route.note && (
                          <span className="mt-1 block text-[12px] font-normal leading-relaxed text-muted">
                            {route.note}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[14px] text-ink/70">
                        {route.airline}
                        {route.airlineCode !== "—" && (
                          <span className="ml-1.5 text-[11px] font-bold text-ink/35">
                            {route.airlineCode}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[13px] text-ink/60">{route.stops}</td>
                      <td className="px-5 py-4 text-[14px] font-semibold tabular-nums text-ink">
                        {formatDuration(route.durationMinutes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:hidden">
            {routeShapes.map((route, index) => (
              <Reveal key={route.id} delay={Math.min(index * 50, 250)}>
                <div className="rounded-2xl border border-ink/10 bg-white p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[15px] font-semibold text-ink">
                      {route.fromCity} → {route.toAirport}
                    </span>
                    <span className="shrink-0 text-[14px] font-bold tabular-nums text-ink">
                      {formatDuration(route.durationMinutes)}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] text-ink/60">
                    {route.airline} · {route.stops}
                  </p>
                  {route.note && (
                    <p className="mt-2 text-[12px] leading-relaxed text-muted text-pretty">
                      {route.note}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* --------------------------------------------------------- Airlines */}
        <section
          className="bg-lake-pale"
          aria-labelledby="airlines-title"
        >
          <div className={`${shell} ${sectionY}`}>
            <SectionHeading
              eyebrow="Who flies here"
              title="Most itineraries touch two carriers at minimum"
              intro="Knowing which carrier actually operates your flight matters for baggage, rebooking and who answers the phone when it is delayed."
            />

            <h2 id="airlines-title" className="sr-only">
              Airlines serving Malawi
            </h2>

            <div className="mt-14 grid gap-5 lg:grid-cols-2">
              {airlines.map((airline, index) => (
                <Reveal key={airline.name} delay={Math.min(index * 80, 320)}>
                  <article className="flex h-full flex-col rounded-2xl border border-ink/10 bg-white p-7 sm:p-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                      <div className="flex items-baseline gap-2.5">
                        <h3 className="font-display text-[clamp(1.25rem,2.4vw,1.6rem)] font-semibold tracking-[-0.02em] text-ink">
                          {airline.name}
                        </h3>
                        {airline.code !== "—" && (
                          <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink/40">
                            {airline.code}
                          </span>
                        )}
                      </div>
                      {airline.affiliate && (
                        <span className="rounded-full bg-forest/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-forest">
                          Affiliate programme
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-[12px] uppercase tracking-[0.12em] text-ink/40">
                      Hub · {airline.hub}
                    </p>

                    <p className="mt-4 flex-1 text-[14px] leading-relaxed text-ink-soft/80 text-pretty">
                      {airline.note}
                    </p>

                    <ul className="mt-6 flex flex-wrap gap-1.5">
                      {airline.serves.map((destination) => (
                        <li
                          key={destination}
                          className="rounded-full border border-ink/10 bg-cream px-3 py-1.5 text-[12px] text-ink/65"
                        >
                          {destination}
                        </li>
                      ))}
                    </ul>

                    {airline.affiliate?.commission && (
                      <p className="mt-5 border-t border-ink/10 pt-4 text-[12px] leading-relaxed text-muted text-pretty">
                        Some links on this site are affiliate links — if you book through
                        one we may receive a commission, at no extra cost to you. The
                        route information above is not affected by it.
                      </p>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- Fare tips */}
        <section
          className={`${shell} ${sectionY}`}
          aria-labelledby="fare-traps-title"
        >
          <SectionRule label="Fare traps" />

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <h2
                id="fare-traps-title"
                className="max-w-[18ch] font-display text-[clamp(1.9rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink text-balance"
              >
                Four things that cost people money
              </h2>
              <p className="mt-5 max-w-[44ch] text-[15px] leading-relaxed text-muted text-pretty">
                None of these are tricks. They are just how this market works, and every
                one of them is avoidable if you know to look.
              </p>
            </div>

            <ol className="grid gap-6 sm:grid-cols-2">
              {fareTips.map((tip, index) => (
                <Reveal
                  key={tip.title}
                  delay={Math.min(index * 80, 280)}
                  as="li"
                  className="rounded-2xl border border-ink/10 bg-white p-6"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-ember/15 text-[13px] font-bold text-ember"
                  >
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-ink">
                    {tip.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted text-pretty">
                    {tip.detail}
                  </p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------------- Live price */}
        <section id="live-price" className="scroll-mt-24 bg-lake-deep">
          <div className={`${shell} ${sectionY}`}>
            <div className="max-w-3xl">
              <Eyebrow tone="light" className="block">
                The only honest place to get a price
              </Eyebrow>
              <h2 className="mt-5 font-display text-[clamp(2rem,5.2vw,3.9rem)] font-semibold leading-[1.03] tracking-[-0.02em] text-white text-balance">
                Check a live price
              </h2>
              <p className="mt-6 max-w-[58ch] text-[clamp(1rem,1.6vw,1.15rem)] leading-relaxed text-white/70 text-pretty">
                Live pricing for Malawian routes only exists behind the airline or a
                metasearch site, and most of it sits behind an account. A stale number
                on this page would be worse than no number, because people book on it.
                These will quote today&rsquo;s actual fares properly.
              </p>
            </div>

            <ul className="mt-10 flex flex-wrap gap-3">
              {priceCheckers.map((checker) => (
                <li key={checker.name}>
                  <PillLink href={checker.url} variant="light">
                    {checker.name} ↗
                  </PillLink>
                </li>
              ))}
            </ul>

            <p className="mt-8 max-w-[62ch] border-t border-white/10 pt-6 text-[13px] leading-relaxed text-white/55 text-pretty">
              Some of these are affiliate links. A booking made through one may pay us a
              commission, which does not change the price you pay and does not change
              what is written above. Travel Lab takes no payment, holds no booking and
              is not a quote.
            </p>
          </div>
        </section>

        {/* ----------------------------------------------------------- Close */}
        <section className="border-t border-ink/10 bg-white">
          <div className={`${shell} py-20 sm:py-24`}>
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <SectionHeading
                  eyebrow="Next"
                  title="Now the part that decides everything"
                  intro="The airport is thirty minutes of your trip. Where you go once you land is the other ninety per cent — and that is what the rest of this site is for."
                />
                <div className="mt-9 flex flex-wrap gap-3">
                  <PillLink href="/plan">Plan a trip</PillLink>
                  <PillLink href="/places" variant="outline">
                    Browse destinations
                  </PillLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
