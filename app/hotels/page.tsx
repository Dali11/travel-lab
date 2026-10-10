import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/travel/Navbar";
import { Footer } from "@/components/travel/Footer";
import { Photo } from "@/components/travel/Photo";
import { shell, Stars } from "@/components/travel/Layout";
import { Reveal } from "@/components/travel/Reveal";
import { stays, stayCategories } from "@/lib/data";
import type { AccommodationCategory } from "@/lib/types";

/**
 * Accommodation discovery.
 *
 * One rule on this page, and it is not negotiable: there is no booking engine.
 * Every `bookingUrl` is null because none exists, so the page filters, compares
 * and ranks, and then tells you honestly how to actually book — which for
 * Malawian lodges means emailing the property, because most of them are not on
 * any OTA at all.
 *
 * Static data. No database, so the whole directory is prerendered.
 */

export const metadata: Metadata = {
  title: "Where to Stay in Malawi — Hotels, Lodges & Lake Houses",
  description:
    "Lakeside lodges, bush camps, eco stays and city hotels across Malawi, with indicative nightly rates and honest booking notes.",
  openGraph: {
    title: "Where to Stay in Malawi — Travel Lab",
    description:
      "Lakeside lodges, bush camps, eco stays and city hotels across Malawi, with indicative nightly rates.",
  },
};

const FILTERS: (AccommodationCategory | "All")[] = ["All", ...stayCategories];

export default async function Hotels({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { category, sort } = await searchParams;

  const activeFilter =
    category && FILTERS.includes(category as AccommodationCategory)
      ? (category as AccommodationCategory)
      : "All";

  const filtered =
    activeFilter === "All"
      ? stays
      : stays.filter((stay) => stay.category === activeFilter);

  // Two useful orders. Price is the one people actually want; rating is the one
  // people think they want.
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.pricePerNightUsd - b.pricePerNightUsd;
    if (sort === "price-desc") return b.pricePerNightUsd - a.pricePerNightUsd;
    if (sort === "rating") return b.rating - a.rating;
    return 0;
  });

  const cheapest = Math.min(...stays.map((stay) => stay.pricePerNightUsd));
  const dearest = Math.max(...stays.map((stay) => stay.pricePerNightUsd));

  return (
    <>
      <Navbar />
      <main id="main">
        {/* Hero band */}
        <header className={`${shell} pt-32 pb-12 lg:pt-40 lg:pb-16`}>
          <p className="eyebrow mb-4">Stay in Malawi</p>
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-balance max-w-4xl">
            Where to sleep, and what it will actually cost
          </h1>
          <p className="mt-6 text-[clamp(1rem,1.7vw,1.2rem)] text-ink/60 leading-relaxed text-pretty max-w-2xl">
            Malawi&rsquo;s accommodation is small, seasonal and mostly independent — a
            handful of good lodges on the lake, bush camps run on solar, and city hotels
            for the night before a flight. Indicative rates from ${cheapest} to ${dearest}{" "}
            a night.
          </p>
        </header>

        {/* Filters + sort */}
        <div className={`${shell} pb-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-y border-ink/10">
            <div className="rail">
              {FILTERS.map((filter) => {
                const active = filter === activeFilter;
                const href =
                  filter === "All"
                    ? "/hotels"
                    : `/hotels?category=${encodeURIComponent(filter)}`;
                return (
                  <Link
                    key={filter}
                    href={href}
                    aria-current={active ? "true" : undefined}
                    className={`shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-all duration-300 ${
                      active
                        ? "bg-ink text-cream"
                        : "border border-ink/12 text-ink/60 hover:border-ink/40 hover:text-ink"
                    }`}
                  >
                    {filter}
                  </Link>
                );
              })}
            </div>

            <form className="flex items-center gap-2 shrink-0">
              <label
                htmlFor="stay-sort"
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink/40"
              >
                Sort
              </label>
              <select
                id="stay-sort"
                name="sort"
                defaultValue={sort ?? "featured"}
                className="rounded-full border border-ink/12 bg-white px-4 py-2.5 text-[13px] font-semibold text-ink focus:border-ink"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Rating</option>
              </select>
              {/* Preserve the category filter across a sort change. */}
              {activeFilter !== "All" && (
                <input type="hidden" name="category" value={activeFilter} />
              )}
              <button
                type="submit"
                className="rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-cream"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <section className={`${shell} pb-16`}>
          {sorted.length === 0 ? (
            <p className="text-center text-ink/50 py-20 text-[15px]">
              No stays in that category yet.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sorted.map((stay, index) => (
                <Reveal key={stay.id} delay={Math.min(index * 55, 330)}>
                  <Link
                    href={`/hotels/${stay.slug}`}
                    className="media-frame media-zoom group relative block h-[380px] rounded-2xl"
                  >
                    <Photo
                      photoKey={stay.photo}
                      alt={stay.name}
                      seed={stay.id}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="scrim-b absolute inset-0" aria-hidden="true" />

                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/90">
                          {stay.category}
                        </span>
                        <Stars rating={stay.rating / 10} className="opacity-95" />
                      </div>
                      <h2 className="font-display text-[24px] font-semibold text-white leading-tight tracking-[-0.02em]">
                        {stay.name}
                      </h2>
                      <p className="mt-1 text-[13px] text-white/60">{stay.location}</p>
                      <p className="mt-3 text-[13px] text-white/75 leading-relaxed line-clamp-2 text-pretty">
                        {stay.blurb}
                      </p>
                      <div className="mt-5 flex items-baseline gap-2">
                        <span className="text-[21px] font-bold text-white tabular-nums">
                          ${stay.pricePerNightUsd}
                        </span>
                        <span className="text-[12px] text-white/55">
                          / night · indicative
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </section>

        {/* Honest booking note. Replaces a checkout that does not exist. */}
        <section className={`${shell} pb-24`}>
          <div className="rounded-3xl bg-lake-deep text-white p-8 sm:p-12">
            <h2 className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-semibold tracking-[-0.02em]">
              How to actually book a Malawian lodge
            </h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-x-12 gap-y-5 max-w-4xl">
              {[
                "Travel Lab has no booking engine. Nothing on this page can be booked here, and we have not pretended otherwise.",
                "Most Malawian lodges are independent and take a direct enquiry by email or WhatsApp. That is faster and cheaper than an OTA.",
                "Rates in USD are the norm at the top tier. Carry Kwacha as well — smaller places and the market are cash only.",
                "July and August book out months ahead because Malawian school holidays and international summer holidays overlap.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <span
                    className="flex-none w-1.5 h-1.5 rounded-full bg-ember mt-2.5"
                    aria-hidden="true"
                  />
                  <p className="text-[14px] text-white/70 leading-relaxed text-pretty">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/plan#build"
                className="inline-flex items-center rounded-full bg-white text-ink px-7 py-3.5 text-[14px] font-semibold hover:bg-cream transition-colors"
              >
                Build a trip around this
              </Link>
              <Link
                href="/flights"
                className="inline-flex items-center rounded-full border border-white/30 px-7 py-3.5 text-[14px] font-semibold hover:bg-white/10 transition-colors"
              >
                Getting to Malawi
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}