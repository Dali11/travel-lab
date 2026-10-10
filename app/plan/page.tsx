import type { Metadata } from "next";
import { Navbar } from "@/components/travel/Navbar";
import { Footer } from "@/components/travel/Footer";
import { PlanSection } from "@/components/travel/PlanSection";
import { SectionHeading, shell, sectionY } from "@/components/travel/Layout";
import { Reveal } from "@/components/travel/Reveal";
import { seasons, quickFacts } from "@/lib/guides";
import { budgetBands } from "@/lib/itinerary";

/**
 * The plan page.
 *
 * Two jobs. The trip builder is the main event and lives on the homepage too —
 * this is where it gets the whole page. The supporting material around it is the
 * part that decides whether a trip works: when to go, what it costs, what
 * surprises people.
 *
 * Static data. The old Kwacha calculator is gone; the generator in
 * lib/itinerary.ts prices the whole trip properly instead, in USD, which is the
 * currency anyone booking a Malawian lodge is actually quoted in.
 */

export const metadata: Metadata = {
  title: "Plan Your Trip to Malawi — Build an Itinerary That Works",
  description:
    "Build a real Malawi itinerary: set your dates, length, interests and budget, and get a route that accounts for Malawi's size and its roads. Plus when to go and what it costs.",
  openGraph: {
    title: "Plan Your Trip to Malawi — Travel Lab",
    description:
      "Build a real Malawi itinerary. Set your dates, length, interests and budget and get a route that accounts for Malawi's size and its roads.",
  },
};

export default function PlanPage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <header className={`${shell} pt-32 pb-10 lg:pt-40 lg:pb-14`}>
          <p className="eyebrow mb-4">Plan</p>
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-balance max-w-4xl">
            Build the trip, then price it honestly
          </h1>
          <p className="mt-6 text-[clamp(1rem,1.7vw,1.2rem)] text-ink/60 leading-relaxed text-pretty max-w-2xl">
            Two questions decide whether a Malawi trip happens: when you go, and whether
            you can afford it. Both are answered below with real numbers rather than
            optimistic ones.
          </p>
        </header>

        <PlanSection />

        {/* When to go */}
        <section className={`${shell} ${sectionY}`} aria-labelledby="when-title">
          <Reveal>
            <SectionHeading
              eyebrow="When to go"
              title="The best window is narrow, and everyone knows it"
              intro="July and August are simultaneously the best weather and the worst prices, because Malawian school holidays and international summer holidays overlap exactly. Here is the actual trade-off."
            />
          </Reveal>

          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {seasons.map((season, index) => (
              <Reveal key={season.name} delay={index * 100}>
                <article
                  className={`h-full rounded-2xl p-7 ${
                    index === 0
                      ? "bg-forest text-white"
                      : index === 1
                        ? "bg-lake text-white"
                        : "bg-white border border-ink/10"
                  }`}
                >
                  <h3 className="font-display text-[24px] font-semibold tracking-[-0.02em]">
                    {season.name}
                  </h3>
                  <p
                    className={`text-[13px] mt-1 ${index < 2 ? "text-white/60" : "text-ink/45"}`}
                  >
                    {season.months}
                  </p>
                  <p
                    className={`mt-5 text-[14px] leading-relaxed text-pretty ${
                      index < 2 ? "text-white/85" : "text-ink/60"
                    }`}
                  >
                    {season.detail}
                  </p>
                  <div
                    className={`mt-6 pt-5 border-t flex justify-between gap-3 text-[12px] font-semibold ${
                      index < 2 ? "border-white/15 text-white" : "border-ink/10"
                    }`}
                  >
                    <span>{season.verdict}</span>
                    <span
                      className={`font-normal ${index < 2 ? "text-white/60" : "text-ink/45"}`}
                    >
                      {season.crowds}
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Budget bands */}
        <section className={`${shell} ${sectionY}`} aria-labelledby="budget-title">
          <Reveal>
            <SectionHeading
              eyebrow="What it costs"
              title="Four budget bands, and what you actually give up"
              intro="Per person, per day, excluding international flights. These are the bands the trip builder prices against, written out so you can see what each one buys."
            />
          </Reveal>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {budgetBands.map((band, index) => (
              <Reveal key={band.id} delay={index * 80}>
                <article className="h-full rounded-2xl bg-white border border-ink/10 p-7">
                  <p className="font-display text-[28px] font-semibold tracking-[-0.025em]">
                    {band.label}
                  </p>
                  <p className="text-[12px] text-ink/40 mt-1.5 tabular-nums">
                    ${band.minUsd}–${band.maxUsd} per person, per day
                  </p>
                  <p className="mt-5 text-[13px] text-ink/60 leading-relaxed text-pretty">
                    {band.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* At a glance */}
        <section className={`${shell} pb-24`} aria-labelledby="facts-title">
          <Reveal>
            <h2
              id="facts-title"
              className="font-display text-[clamp(1.3rem,2.4vw,1.8rem)] font-semibold tracking-[-0.02em] mb-7"
            >
              The facts that decide things
            </h2>
            <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickFacts.map((fact) => (
                <div key={fact.label} className="rounded-2xl bg-white border border-ink/10 p-6">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40">
                    {fact.label}
                  </dt>
                  <dd className="font-display text-[17px] font-semibold mt-2">{fact.value}</dd>
                  {fact.note && <p className="text-[12px] text-ink/50 mt-1.5">{fact.note}</p>}
                </div>
              ))}
            </dl>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}