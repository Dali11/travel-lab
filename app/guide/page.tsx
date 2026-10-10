import type { Metadata } from "next";
import Link from "next/link";
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
import {
  connectivity,
  entryNotes,
  quickFacts,
  seasons,
  visaRegions,
} from "@/lib/guides";
import { destinations } from "@/lib/data";

/**
 * Know before you go.
 *
 * The unglamorous page, and the one that decides whether a trip works. Every
 * figure below is editorial guidance from `lib/guides`, not a live government
 * source, and the page says so at the top rather than in a footnote — visa fees
 * and border procedure change without notice.
 *
 * The two footer deep links land here, so `#seasons` and `#money` are load
 * bearing: the footer routes "When to come" and "Money & power" at exactly
 * these two sections.
 */

export const metadata: Metadata = {
  title: "Malawi Practical Guide — Visas, Seasons, Money and Connectivity",
  description:
    "The practical Malawi travel guide: who needs a visa in advance, when to visit, what to bring, and how money and connectivity actually work on the ground.",
  openGraph: {
    title: "Malawi Practical Guide — Know Before You Go",
    description:
      "Visas, borders, seasons, money, signal and power — the unglamorous specifics that decide whether a trip works.",
    type: "article",
  },
};

export default function GuidePage() {
  return (
    <div>
      <Navbar />

      <main id="main">
        {/* ------------------------------------------------------------ Hero */}
        <section className="relative overflow-hidden bg-ink">
          <div className="absolute inset-0" aria-hidden="true">
            <Photo
              photoKey="guide-hero"
              alt=""
              seed="guide-hero"
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

          <div className={`${shell} relative pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24`}>
            <div className="max-w-3xl">
              <Eyebrow tone="light" className="block">
                Know before you go
              </Eyebrow>
              <h1 className="mt-5 font-display text-[clamp(2.4rem,6.5vw,4.8rem)] font-semibold leading-[1.0] tracking-[-0.03em] text-white text-balance">
                The things that are boring until they are not
              </h1>
              <p className="mt-6 max-w-[56ch] text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-white/70 text-pretty">
                Visas, borders, seasons, power cuts and card machines. None of this is
                glamorous, and all of it is the difference between a trip that works
                and one that does not.
              </p>

              <nav
                aria-label="On this page"
                className="mt-9 flex flex-wrap gap-2"
              >
                {[
                  { href: "#at-a-glance", label: "At a glance" },
                  { href: "#visas", label: "Visas" },
                  { href: "#seasons", label: "When to come" },
                  { href: "#money", label: "Money & power" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-white/25 px-4 py-2 text-[13px] font-semibold text-white/85 transition-colors hover:border-white/50 hover:bg-white/10"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- At a glance */}
        <section
          id="at-a-glance"
          className={`${shell} ${sectionY}`}
          aria-labelledby="at-a-glance-title"
        >
          <Reveal>
            <SectionHeading
              eyebrow="At a glance"
              title="The six facts worth memorising"
              intro="None of these change often, and all of them are asked on the first day. Learn them before you land rather than finding out at the border."
            />
          </Reveal>

          <h2 id="at-a-glance-title" className="sr-only">
            Malawi at a glance
          </h2>

          <dl className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickFacts.map((fact, index) => (
              <Reveal key={fact.label} delay={Math.min(index * 70, 280)}>
                <div className="h-full rounded-2xl border border-ink/10 bg-white p-7">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-ember">
                    {fact.label}
                  </dt>
                  <dd className="mt-3 font-display text-[22px] font-semibold leading-tight tracking-[-0.015em] text-ink text-balance">
                    {fact.value}
                  </dd>
                  {fact.note && (
                    <p className="mt-2.5 text-[13px] leading-relaxed text-muted text-pretty">
                      {fact.note}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* ------------------------------------------------------------ Visas */}
        <section
          id="visas"
          className="border-y border-ink/10 bg-white"
          aria-labelledby="visas-title"
        >
          <div className={`${shell} ${sectionY}`}>
            <SectionHeading
              eyebrow="Visas & borders"
              title="Who needs one, and what they ask at the desk"
              intro="Requirements and fees change. Confirm with the Immigration Department or the Immigration Advisory Group for your country of residence before you book anything non-refundable."
            />

            <h2 id="visas-title" className="sr-only">
              Visas and entry requirements
            </h2>

            <div className="mt-14 grid gap-5 lg:grid-cols-2">
              {visaRegions.map((group, index) => (
                <Reveal key={group.region} delay={index * 90}>
                  <div className="h-full rounded-2xl border border-ink/10 bg-cream p-7 sm:p-8">
                    <h3 className="font-display text-[clamp(1.2rem,2.2vw,1.5rem)] font-semibold leading-tight tracking-[-0.02em] text-ink text-balance">
                      {group.region}
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-soft/80 text-pretty">
                      {group.note}
                    </p>
                    <ul className="mt-6 flex flex-wrap gap-1.5">
                      {group.countries.map((country) => (
                        <li
                          key={country}
                          className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-[12px] text-ink/70"
                        >
                          {country}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* At the border */}
            <div className="mt-20">
              <SectionRule label="At the border" />

              <h3 className="mt-12 max-w-[24ch] font-display text-[clamp(1.7rem,3.6vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink text-balance">
                Five things immigration will ask about
              </h3>

              <ul className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
                {entryNotes.map((note, index) => (
                  <Reveal key={note.title} delay={Math.min(index * 70, 280)} as="li">
                    <div className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ember/15 text-[11px] font-bold text-ember"
                      >
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="text-[15px] font-semibold text-ink">
                          {note.title}
                        </h4>
                        <p className="mt-1.5 text-[14px] leading-relaxed text-muted text-pretty">
                          {note.detail}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- Seasons */}
        <section
          id="seasons"
          className={`${shell} ${sectionY} scroll-mt-24`}
          aria-labelledby="seasons-title"
        >
          <Reveal>
            <SectionHeading
              eyebrow="When to come"
              title="One country, three very different trips"
              intro="The dry season is the one everybody photographs. The wet season is the one people remember. The shoulder is the compromise that gives you most of the second without the first one's price."
            />
          </Reveal>

          <h2 id="seasons-title" className="sr-only">
            When to visit Malawi
          </h2>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {seasons.map((season, index) => (
              <Reveal key={season.name} delay={index * 90}>
                <article className="flex h-full flex-col rounded-2xl border border-ink/10 bg-white p-7 sm:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-lake">
                    {season.months}
                  </p>
                  <h3 className="mt-3 font-display text-[clamp(1.4rem,2.6vw,1.9rem)] font-semibold leading-tight tracking-[-0.02em] text-ink">
                    {season.name}
                  </h3>
                  <p className="mt-4 flex-1 text-[14px] leading-relaxed text-ink-soft/80 text-pretty">
                    {season.detail}
                  </p>
                  <div className="mt-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-ink/10 pt-5">
                    <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-ember">
                      {season.verdict}
                    </span>
                    <span className="text-[12px] text-muted">{season.crowds}</span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <p className="mt-8 max-w-[62ch] text-[13px] leading-relaxed text-muted text-pretty">
            If you are building around a specific place rather than a date, the
            destination pages carry their own best months and practical notes.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink href="/places" variant="outline">
              Browse destinations
            </PillLink>
            <PillLink href="/plan">Plan a trip</PillLink>
          </div>
        </section>

        {/* -------------------------------------------------- Money & power */}
        <section
          id="money"
          className="scroll-mt-24 bg-lake-deep"
          aria-labelledby="money-title"
        >
          <div className={`${shell} ${sectionY}`}>
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
              <div>
                <SectionHeading
                  tone="light"
                  eyebrow="Money, signal & power"
                  title="The realities of the first three days"
                  intro="This is the section that catches people out. Card acceptance, load-shedding and signal coverage all sound like minor inconveniences right up until you are at a lodge at eight in the evening with no battery left."
                />

                <p className="mt-8 max-w-[46ch] text-[14px] leading-relaxed text-white/60 text-pretty">
                  Every destination on this site also lists its own practical notes, so
                  you can check the specific park or island rather than the country as a
                  whole.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <PillLink href="/places" variant="light">
                    Destination notes
                  </PillLink>
                  <PillLink href="/hotels" variant="ghost">
                    Where to stay
                  </PillLink>
                </div>
              </div>

              <div>
                <h2
                  id="money-title"
                  className="font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white text-balance"
                >
                  The short version
                </h2>

                <dl className="mt-10 space-y-px overflow-hidden rounded-2xl bg-white/10">
                  {connectivity.map((item, index) => (
                    <Reveal
                      key={item.title}
                      delay={Math.min(index * 80, 280)}
                      className="bg-lake-deep"
                    >
                      <div className="border-b border-white/10 px-6 py-6 last:border-0">
                        <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-ember-soft">
                          {item.title}
                        </dt>
                        <dd className="mt-2.5 text-[15px] leading-relaxed text-white/75 text-pretty">
                          {item.detail}
                        </dd>
                      </div>
                    </Reveal>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- Close */}
        <section className="bg-cream">
          <div className={`${shell} py-20 sm:py-24`}>
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <SectionHeading
                  eyebrow="Next"
                  title="Put the practical bits to work"
                  intro="Pick the places, work out the season, and the plan tool prices the whole thing with the same honest estimates — still not a quote, and still not a booking."
                />
                <div className="mt-9 flex flex-wrap gap-3">
                  <PillLink href="/plan">Plan and price a trip</PillLink>
                  <PillLink href="/flights" variant="outline">
                    Getting to Malawi
                  </PillLink>
                </div>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2">
                {destinations.slice(0, 4).map((destination) => (
                  <li key={destination.id}>
                    <Link
                      href={`/places/${destination.slug}`}
                      className="flex h-full flex-col rounded-2xl border border-ink/10 bg-white p-5 transition-colors hover:border-ink/25"
                    >
                      <span className="font-display text-[17px] font-semibold leading-tight text-ink">
                        {destination.name}
                      </span>
                      <span className="mt-1.5 text-[12px] leading-relaxed text-muted">
                        {destination.essence}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
