import Link from "next/link";
import { Photo } from "../travel/Photo";
import { Reveal } from "../travel/Reveal";
import { SectionHeading, shell, sectionY, Stars } from "../travel/Layout";
import { stays } from "@/lib/data/stays";

/**
 * "Stay in Malawi."
 *
 * Premium and image-driven, as the brief asks. The critical constraint is that
 * NOTHING here is bookable: `bookingUrl` is null on every entry because there is
 * no booking integration, and the UI says so instead of rendering a checkout
 * button that would go nowhere.
 *
 * Where a "Book" button would sit, there is a "How to book this honestly" link
 * that explains what to actually do. That is more useful than a dead button and
 * it is honest about what the product is.
 */

const featuredIds = ["pumulani", "liwonde-riverside", "likoma-island-lodge", "kumbali-island-stay"];

export function StaySection() {
  const featured = featuredIds
    .map((id) => stays.find((stay) => stay.id === id))
    .filter((stay): stay is (typeof stays)[number] => Boolean(stay));

  const more = stays.filter((stay) => !featured.includes(stay));

  return (
    <section
      id="stay"
      className={`${shell} ${sectionY} bg-cream`}
      aria-labelledby="stay-title"
    >
      <Reveal>
        <SectionHeading
          eyebrow="Stay in Malawi"
          title="Where to sleep, honestly"
          intro="Malawi's accommodation is small, seasonal and mostly independent. Here is what is worth staying in — with the real price band, and no pretending you can book it here."
        />
      </Reveal>

      {/* Featured stays */}
      <div className="mt-10 lg:mt-20 grid sm:grid-cols-2 gap-4">
        {featured.map((stay, index) => (
          <Reveal key={stay.id} delay={index * 90}>
            <Link
              href={`/hotels/${stay.slug}`}
              className="media-frame media-zoom group relative block h-[380px] sm:h-[440px] rounded-2xl lg:rounded-3xl"
            >
              <Photo
                photoKey={stay.photo}
                alt={stay.name}
                seed={stay.id}
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="scrim-b absolute inset-0" aria-hidden="true" />

              <div className="absolute inset-x-0 bottom-0 p-6 lg:p-7">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/90">
                    {stay.category}
                  </span>
                  <Stars rating={stay.rating / 10} className="opacity-95" />
                </div>

                <h3 className="font-display text-[26px] lg:text-[30px] font-semibold text-white leading-tight tracking-[-0.02em]">
                  {stay.name}
                </h3>
                <p className="mt-1 text-[13px] text-white/60">{stay.location}</p>
                <p className="mt-3 text-[14px] text-white/80 leading-relaxed line-clamp-2 text-pretty">
                  {stay.blurb}
                </p>

              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      {/* Everything else: compact rows */}
      <Reveal className="mt-14">
        <div className="flex items-baseline justify-between gap-6 mb-6">
          <h3 className="font-display text-[clamp(1.3rem,2.4vw,1.8rem)] font-semibold tracking-[-0.02em]">
            The full list
          </h3>
          <Link
            href="/hotels"
            className="shrink-0 text-[14px] font-semibold text-ink/60 hover:text-ink transition-colors"
          >
            Compare all {stays.length} →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {more.map((stay, index) => (
            <Reveal key={stay.id} delay={Math.min(index * 45, 280)}>
              <Link
                href={`/hotels/${stay.slug}`}
                className="group flex items-center gap-4 rounded-2xl bg-white border border-ink/8 p-4 transition-all duration-400 hover:border-ink/25 hover:shadow-[0_8px_30px_rgba(16,16,14,0.07)]"
              >
                <div className="relative flex-none w-[72px] h-[72px] rounded-xl overflow-hidden bg-ink-soft">
                  <Photo
                    photoKey={stay.photo}
                    alt=""
                    seed={stay.id}
                    sizes="72px"
                    className="transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-display text-[17px] font-semibold leading-tight tracking-[-0.01em] group-hover:text-ember transition-colors truncate">
                    {stay.name}
                  </h4>
                  <p className="mt-0.5 text-[12px] text-ink/45 truncate">
                    {stay.category} · {stay.location}
                  </p>
                  <div className="mt-1.5">
                    <Stars rating={stay.rating / 10} />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* The honest non-booking note, replacing a checkout button. */}
      <Reveal className="mt-10">
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-6 flex flex-col sm:flex-row gap-5 sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h4 className="font-display text-[17px] font-semibold">
              None of this is bookable here
            </h4>
            <p className="mt-2 text-[13px] text-ink/55 leading-relaxed">
              Travel Lab has no booking engine connected. Malawi&rsquo;s lodges are
              small and seasonal, and most do not use a global OTA at all — they take a
              direct enquiry by email or WhatsApp. Book by asking the property directly,
              and confirm the rate before you commit to a flight.
            </p>
          </div>
          <Link
            href="/hotels"
            className="shrink-0 inline-flex items-center justify-center rounded-full bg-ink text-cream px-7 py-3.5 text-[14px] font-semibold hover:bg-lake-deep transition-colors"
          >
            How to book honestly
          </Link>
        </div>
      </Reveal>
    </section>
  );
}