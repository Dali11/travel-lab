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
import { destinations, experiences, stays, cultureStories } from "@/lib/data";

/**
 * About Travel Lab.
 *
 * The product used to be framed here as "a guide, not a booking engine", which
 * described a limitation rather than a thing. It is now framed as what it
 * actually is: the digital gateway for discovering, planning and experiencing
 * Malawi — discover, plan, experience being the three verbs the whole site is
 * built around.
 *
 * The honesty about planning figures versus quotes stays, and stays prominent,
 * because that is the one thing about this product a visitor must not
 * misread. The counts below are read from the data modules rather than typed,
 * so they cannot drift away from the site.
 */

export const metadata: Metadata = {
  title: "About Travel Lab — The Digital Gateway to Malawi",
  description:
    "Travel Lab is the digital gateway for discovering, planning and experiencing Malawi: researched destinations, honest planning figures, and no booking engine pretending otherwise.",
  openGraph: {
    title: "About Travel Lab",
    description:
      "Discovering, planning and experiencing Malawi — with every number labelled as a planning figure rather than a quote.",
    type: "website",
  },
};

/** What the product actually does, in the site's own three verbs. */
const PILLARS = [
  {
    verb: "Discover",
    title: "The country, before the itinerary",
    body: "Places written properly, with the story, the practical notes and the honest limitations — not a list of coordinates with photographs attached. Where a fact could not be verified, the page says so instead of guessing.",
    href: "/places",
    cta: "Browse destinations",
  },
  {
    verb: "Plan",
    title: "A trip that adds up on paper",
    body: "Flights, borders, seasons, money and power, assembled into one estimate you can actually budget against. The route data, the visa regions and the connectivity notes are the layer a competitor cannot generate and a forum cannot keep current.",
    href: "/plan",
    cta: "Build a trip",
  },
  {
    verb: "Experience",
    title: "The days, not just the places",
    body: "Experiences, culture and food, each with a realistic duration and a price band labelled indicative. Nothing is marked bookable, because nothing is — and a stale number on a travel site is worse than no number at all.",
    href: "/experiences",
    cta: "See experiences",
  },
];

/** The positions the site holds whether or not they cost money. */
const PRINCIPLES = [
  {
    title: "Planning figures, never quotes",
    body: "Every price, rate and estimate on this site is a bar to beat, not an amount to pay. There is no checkout, no payment and no reservation held anywhere in this product.",
  },
  {
    title: "No fare feed, so no fares",
    body: "There is no free, self-serve flight API with usable coverage of Malawian routes. Rather than display a number that would be stale by the time you read it, we publish route shape and send you to a source that can quote you properly.",
  },
  {
    title: "Unverified is shown as unverified",
    body: "A coordinate we could not source is left off the map. A photograph with no licence is not used. Where a fact is missing, the page says it is missing rather than filling the gap with something plausible.",
  },
  {
    title: "Corrections outrank new content",
    body: "Visa rules, park fees and border procedures change without notice. A correction from someone who was just there is worth more to us than another page of new writing.",
  },
];

export default function AboutPage() {
  const counts = [
    { label: "Destinations written up", value: destinations.length },
    { label: "Experiences catalogued", value: experiences.length },
    { label: "Stays recorded", value: stays.length },
    { label: "Culture and food stories", value: cultureStories.length },
  ];

  return (
    <div>
      <Navbar />

      <main id="main">
        {/* ------------------------------------------------------------ Hero */}
        <section className="relative overflow-hidden bg-ink">
          <div className="absolute inset-0" aria-hidden="true">
            <Photo
              photoKey="about-hero"
              alt=""
              seed="about-hero"
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
            <div className="max-w-4xl">
              <Eyebrow tone="light" className="block">
                About Travel Lab
              </Eyebrow>
              <h1 className="mt-5 font-display text-[clamp(2.4rem,6.8vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-white text-balance">
                The digital gateway for discovering, planning and experiencing Malawi
              </h1>
              <p className="mt-7 max-w-[58ch] text-[clamp(1rem,1.7vw,1.2rem)] leading-relaxed text-white/70 text-pretty">
                Travel Lab exists because planning a trip to Malawi is unusually hard to
                do from outside the country. The information is either buried in forum
                threads, written for someone who already knows the shape of the trip, or
                simply out of date.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ Story */}
        <section className={`${shell} ${sectionY}`} aria-labelledby="why-title">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Why it exists"
                title="One country, a thousand ways in — and no one writing it down properly"
              />
            </div>

            <div className="max-w-[64ch] space-y-6 text-[clamp(1rem,1.5vw,1.1rem)] leading-[1.75] text-ink-soft/85 text-pretty">
              <p>
                So this site does not try to sell you something you can buy anywhere. It
                answers the questions that actually decide whether a trip works: do you
                need a visa in advance, when does the park road turn to mud, will your
                card work in Mangochi, and is the ticket sold as direct actually direct.
              </p>
              <p>
                Those questions span three stages, and the site is built around them in
                the same order. First you decide <em className="not-italic text-ink">where</em>{" "}
                and <em className="not-italic text-ink">when</em> — the discovery layer,
                which is the part that gets you to Malawi in the first place. Then you
                make it add up: flights, visas, seasons, money, the honest arithmetic of
                a budget. Then you decide what the days themselves look like, which is
                the part most travel sites reduce to a list of tours.
              </p>
              <p>
                Where we send you to book — airlines, metasearch sites — we say so
                plainly. Every number here is a planning figure rather than a quote.
                Treat them as the bar to beat, not the amount to pay.
              </p>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- PIllars */}
        <section
          className="border-y border-ink/10 bg-white"
          aria-labelledby="pillars-title"
        >
          <div className={`${shell} ${sectionY}`}>
            <SectionRule label="The product" />

            <div className="mt-12 max-w-3xl">
              <h2
                id="pillars-title"
                className="font-display text-[clamp(2rem,5.2vw,3.9rem)] font-semibold leading-[1.03] tracking-[-0.02em] text-ink text-balance"
              >
                Three verbs, one journey
              </h2>
              <p className="mt-6 text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-muted text-pretty">
                Everything on Travel Lab is one of these three things. Nothing is here
                because it filled a gap in the navigation.
              </p>
            </div>

            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {PILLARS.map((pillar, index) => (
                <Reveal key={pillar.verb} delay={index * 90}>
                  <article className="flex h-full flex-col rounded-2xl border border-ink/10 bg-cream p-7 sm:p-8">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-ember">
                      {pillar.verb}
                    </span>
                    <h3 className="mt-4 font-display text-[clamp(1.4rem,2.6vw,1.85rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink text-balance">
                      {pillar.title}
                    </h3>
                    <p className="mt-4 flex-1 text-[14px] leading-relaxed text-ink-soft/80 text-pretty">
                      {pillar.body}
                    </p>
                    <div className="mt-7">
                      <PillLink href={pillar.href} variant="outline">
                        {pillar.cta}
                      </PillLink>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- Counts */}
        <section className={`${shell} ${sectionY}`} aria-labelledby="counts-title">
          <h2
            id="counts-title"
            className="max-w-[22ch] font-display text-[clamp(1.9rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink text-balance"
          >
            What is actually documented so far
          </h2>

          <dl className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {counts.map((count, index) => (
              <Reveal key={count.label} delay={index * 70} className="bg-white">
                <div className="px-7 py-9">
                  <dd className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-none tracking-[-0.03em] tabular-nums text-lake">
                    {count.value}
                  </dd>
                  <dt className="mt-3.5 text-[13px] leading-relaxed text-muted">
                    {count.label}
                  </dt>
                </div>
              </Reveal>
            ))}
          </dl>

          <p className="mt-6 max-w-[62ch] text-[13px] leading-relaxed text-muted text-pretty">
            Read straight from the site&rsquo;s own data rather than written by hand, so
            these figures cannot quietly fall out of date. A gap in the count is a gap
            in our research, and the pages say so where it happens.
          </p>
        </section>

        {/* ------------------------------------------------------ Principles */}
        <section
          className="bg-lake-deep"
          aria-labelledby="principles-title"
        >
          <div className={`${shell} ${sectionY}`}>
            <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
              <div>
                <SectionHeading
                  tone="light"
                  eyebrow="What we will not do"
                  title="Four positions that cost us money"
                  intro="This is a commercial product with no booking engine attached to it. These are the lines we are not going to cross, and they are the reason the content is worth reading."
                />
              </div>

              <ul className="flex flex-col gap-px overflow-hidden rounded-2xl bg-white/10">
                {PRINCIPLES.map((principle, index) => (
                  <Reveal
                    key={principle.title}
                    delay={Math.min(index * 80, 280)}
                    as="li"
                    className="bg-lake-deep"
                  >
                    <div className="border-b border-white/10 px-6 py-6 last:border-0 sm:px-7 sm:py-7">
                      <h3 className="font-display text-[19px] font-semibold tracking-[-0.015em] text-white">
                        {principle.title}
                      </h3>
                      <p className="mt-2.5 text-[14px] leading-relaxed text-white/70 text-pretty">
                        {principle.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- Close */}
        <section className="bg-cream">
          <div className={`${shell} py-20 sm:py-24`}>
            <SectionHeading
              align="center"
              eyebrow="Start here"
              title="Wherever you are in the trip"
              intro="Whichever of the three you need first, it is one click away."
            />

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <PillLink href="/discover">Explore Malawi</PillLink>
              <PillLink href="/places" variant="outline">
                Destinations
              </PillLink>
              <PillLink href="/experiences" variant="outline">
                Experiences
              </PillLink>
              <PillLink href="/plan" variant="outline">
                Plan and price
              </PillLink>
              <PillLink href="/guide" variant="outline">
                The practical guide
              </PillLink>
              <PillLink href="/flights" variant="outline">
                Flights
              </PillLink>
            </div>

            <p className="mx-auto mt-12 max-w-[52ch] text-center text-[14px] leading-relaxed text-muted text-pretty">
              Found something wrong?{" "}
              <Link
                href="/contact"
                className="font-semibold text-ink underline underline-offset-4 transition-colors hover:text-ember"
              >
                Corrections are welcome
              </Link>{" "}
              — visa rules and park fees change without notice, and someone who was
              just there is the only person who knows.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
