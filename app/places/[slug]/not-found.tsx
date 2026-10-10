import Link from "next/link";
import { Navbar } from "@/components/travel/Navbar";
import { Footer } from "@/components/travel/Footer";
import { PillLink } from "@/components/travel/Layout";
import { Photo } from "@/components/travel/Photo";
import { destinations } from "@/lib/data";

/**
 * 404 for an unknown destination slug.
 *
 * Distinct from the site-wide 404 because the visitor arrived here from a place
 * link — so rather than a generic apology, this offers the destinations that do
 * exist. Keeps the tone: a missing destination is a gap in our data, not a
 * broken site.
 */

export default function PlaceNotFound() {
  const suggestions = destinations.slice(0, 6);

  return (
    <div>
      <Navbar />

      <main id="main">
        <section className="relative flex min-h-[60svh] items-center overflow-hidden bg-ink">
          <div className="absolute inset-0" aria-hidden="true">
            <Photo
              photoKey="place-not-found"
              alt=""
              seed="place-not-found"
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

          <div className="relative mx-auto w-full max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12">
            <div className="max-w-2xl">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.22em] text-ember"
                aria-hidden="true"
              >
                404
              </p>
              <h1 className="mt-5 font-display text-[clamp(2.1rem,6vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white text-balance">
                Place not found
              </h1>
              <p className="mt-5 max-w-[48ch] text-[clamp(1rem,1.6vw,1.15rem)] leading-relaxed text-white/70 text-pretty">
                We could not find that destination. It may have been renamed, or the
                link that brought you here may be out of date — a gap in our data rather
                than anything broken on your side.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <PillLink href="/places" variant="light">
                  All destinations
                </PillLink>
                <PillLink href="/" variant="ghost">
                  Back home
                </PillLink>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-ink/10 bg-white">
          <div className="px-5 py-16 sm:px-8 lg:px-12">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40">
              Destinations we do have
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((destination) => (
                <li key={destination.id}>
                  <Link
                    href={`/places/${destination.slug}`}
                    className="flex h-full flex-col rounded-2xl border border-ink/10 px-5 py-4 transition-colors hover:border-ink/30"
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
