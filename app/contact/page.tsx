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

/**
 * Contact.
 *
 * The corrections-welcome framing is the point of this page, so it stays first
 * and stays specific about why a correction beats a compliment.
 *
 * There is deliberately no email address rendered. The old placeholder
 * `hello@travellab.example` is a reserved TLD and cannot receive mail, and
 * inventing a plausible-looking replacement would be worse than shipping
 * nothing: a visitor who writes to a dead or wrong address concludes the whole
 * site is unmaintained. When a real inbox exists it goes in
 * `lib/site.ts`-style config and is rendered in both cards below.
 */

export const metadata: Metadata = {
  title: "Contact Travel Lab — Corrections Welcome",
  description:
    "Report a correction to the visa, border, park fee or flight information on Travel Lab, or ask a planning question the guide does not cover.",
  openGraph: {
    title: "Contact Travel Lab",
    description:
      "Visa rules, park fees and border procedures change without notice. Corrections are genuinely welcome.",
    type: "website",
  },
};

/**
 * Set to a real address before launch. Left null rather than filled with a
 * plausible-looking string, because a fabricated contact address is a promise
 * this product cannot keep.
 */
const CONTACT_EMAIL: string | null = null;

/** What is worth sending. Ordered by how much it helps. */
const REASONS = [
  {
    title: "A correction",
    body: "Something out of date on the guide — a visa fee, a park fee, a border procedure, a route that no longer runs, or a lodge that has closed. Send the page and the date you were there.",
    strongest: true,
  },
  {
    title: "A question about a specific trip",
    body: "Planning something the guide does not cover: a route combination, a season that is awkward for your dates, an accessibility question about a place we have documented.",
    strongest: false,
  },
  {
    title: "Something missing",
    body: "A place, an experience or a practical note we should have. Gaps in our data are things we would rather hear about than have you discover at the border.",
    strongest: false,
  },
  {
    title: "Something wrong with the site",
    body: "A broken link, a page that will not load, a figure that contradicts itself between two pages. Boring, useful, and worth saying.",
    strongest: false,
  },
];

export default function ContactPage() {
  return (
    <div>
      <Navbar />

      <main id="main">
        {/* ------------------------------------------------------------ Hero */}
        <section className="relative overflow-hidden bg-ink">
          <div className="absolute inset-0" aria-hidden="true">
            <Photo
              photoKey="contact-hero"
              alt=""
              seed="contact-hero"
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
                Contact
              </Eyebrow>
              <h1 className="mt-5 font-display text-[clamp(2.4rem,6.5vw,4.8rem)] font-semibold leading-[1.0] tracking-[-0.03em] text-white text-balance">
                Corrections welcome
              </h1>
              <p className="mt-6 max-w-[56ch] text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-white/70 text-pretty">
                Visa rules, park fees and border procedures change without notice, and
                some of what is here will eventually be out of date. If you have been
                recently and know that something on the guide is wrong, that correction
                is worth more than anything else you could send.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- Reasons */}
        <section
          className={`${shell} ${sectionY}`}
          aria-labelledby="reasons-title"
        >
          <SectionRule label="What to send" />

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <div>
              <h2
                id="reasons-title"
                className="max-w-[18ch] font-display text-[clamp(1.9rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink text-balance"
              >
                What is actually worth hearing about
              </h2>
              <p className="mt-5 max-w-[44ch] text-[15px] leading-relaxed text-muted text-pretty">
                Almost anything is welcome. These four come up most, and the first one
                matters most.
              </p>
            </div>

            <ul className="flex flex-col gap-4">
              {REASONS.map((reason, index) => (
                <Reveal
                  key={reason.title}
                  delay={Math.min(index * 80, 280)}
                  as="li"
                >
                  <article
                    className={`rounded-2xl border p-6 sm:p-7 ${
                      reason.strongest
                        ? "border-ember/30 bg-ember/5"
                        : "border-ink/10 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-[20px] font-semibold tracking-[-0.015em] text-ink">
                        {reason.title}
                      </h3>
                      {reason.strongest && (
                        <span className="rounded-full bg-ember/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ember">
                          Most useful
                        </span>
                      )}
                    </div>
                    <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-ink-soft/80 text-pretty">
                      {reason.body}
                    </p>
                  </article>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------------------------------------------------- Contact */}
        <section
          className="bg-lake-deep"
          aria-labelledby="contact-title"
        >
          <div className={`${shell} ${sectionY}`}>
            <div className="max-w-3xl">
              <SectionHeading
                tone="light"
                eyebrow="Where to send it"
                title="An address that receives mail, not one that looks like it does"
                intro="A travel guide about out-of-date visa fees has no business publishing an address that bounces. Here is the honest state of it."
              />
            </div>

            <h2 id="contact-title" className="sr-only">
              How to reach Travel Lab
            </h2>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <Reveal>
                <article className="flex h-full flex-col rounded-2xl border border-white/12 bg-white/[0.04] p-7 sm:p-8">
                  <h3 className="font-display text-[22px] font-semibold tracking-[-0.015em] text-white">
                    Report a correction
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/65 text-pretty">
                    Something out of date on the guide, a route that no longer runs, or a
                    fee that has changed. Include the page and roughly when you were
                    there.
                  </p>

                  {CONTACT_EMAIL ? (
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  ) : (
                    <p className="mt-7 rounded-xl border border-dashed border-white/25 px-5 py-5 text-[14px] leading-relaxed text-white/60 text-pretty">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-ember-soft">
                        Not yet published
                      </span>
                      <span className="mt-2 block">
                        A contact address has not been set for this site yet. It will
                        appear here before launch rather than as a placeholder that
                        does not receive mail.
                      </span>
                    </p>
                  )}
                </article>
              </Reveal>

              <Reveal delay={90}>
                <article className="flex h-full flex-col rounded-2xl border border-white/12 bg-white/[0.04] p-7 sm:p-8">
                  <h3 className="font-display text-[22px] font-semibold tracking-[-0.015em] text-white">
                    Ask a question
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/65 text-pretty">
                    Planning a specific trip and stuck on something the guide does not
                    cover. The guide is the fastest answer for most of it, and it is
                    worth searching there first.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <PillLink href="/guide" variant="light">
                      Read the guide first
                    </PillLink>
                    <PillLink href="/plan" variant="ghost">
                      Plan a trip
                    </PillLink>
                  </div>
                </article>
              </Reveal>
            </div>

            <p className="mt-10 max-w-[68ch] border-t border-white/10 pt-6 text-[13px] leading-relaxed text-white/55 text-pretty">
              In the meantime the fastest route to a good answer is the guide itself —
              visas and borders,{" "}
              <Link
                href="/guide#seasons"
                className="font-semibold text-white/85 underline underline-offset-4 transition-colors hover:text-white"
              >
                when to come
              </Link>
              ,{" "}
              <Link
                href="/guide#money"
                className="font-semibold text-white/85 underline underline-offset-4 transition-colors hover:text-white"
              >
                money and power
              </Link>{" "}
              , and{" "}
              <Link
                href="/flights"
                className="font-semibold text-white/85 underline underline-offset-4 transition-colors hover:text-white"
              >
                getting to Malawi
              </Link>{" "}
              cover most of what people ask.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------------ Close */}
        <section className="border-t border-ink/10 bg-cream">
          <div className={`${shell} py-20 text-center sm:py-24`}>
            <SectionHeading
              align="center"
              eyebrow="Meanwhile"
              title="There is a lot here already"
              intro="The destination, experience and planning layers are the fastest way to answer most Malawi questions."
            />
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <PillLink href="/discover">Explore Malawi</PillLink>
              <PillLink href="/places" variant="outline">
                Browse places
              </PillLink>
              <PillLink href="/guide" variant="outline">
                The practical guide
              </PillLink>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
