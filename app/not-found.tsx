import Link from "next/link";
import { Navbar } from "@/components/travel/Navbar";
import { Footer } from "@/components/travel/Footer";
import { PillLink } from "@/components/travel/Layout";
import { Photo } from "@/components/travel/Photo";

/**
 * Site-wide 404.
 *
 * Rendered outside the route tree, so it needs its own Navbar and Footer — the
 * root layout supplies neither.
 */

export default function NotFound() {
  return (
    <div>
      <Navbar />

      <main id="main">
        <section className="relative flex min-h-[70svh] items-center overflow-hidden bg-ink">
          <div className="absolute inset-0" aria-hidden="true">
            <Photo
              photoKey="not-found"
              alt=""
              seed="not-found"
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
                className="font-display text-[clamp(4rem,14vw,8rem)] font-semibold leading-none tracking-[-0.04em] text-white/20"
                aria-hidden="true"
              >
                404
              </p>
              <h1 className="mt-2 font-display text-[clamp(2.1rem,6vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white text-balance">
                This page is not on the map
              </h1>
              <p className="mt-5 max-w-[48ch] text-[clamp(1rem,1.6vw,1.15rem)] leading-relaxed text-white/70 text-pretty">
                The link may be old, or the place may have been renamed. Nothing is
                broken on your side.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <PillLink href="/" variant="light">
                  Back home
                </PillLink>
                <PillLink href="/places" variant="ghost">
                  Browse places
                </PillLink>
                <PillLink href="/guide" variant="ghost">
                  Practical guide
                </PillLink>
              </div>
            </div>
          </div>
        </section>

        {/* Somewhere useful to go next, rather than a dead end. */}
        <section className="border-t border-ink/10 bg-white">
          <div className="px-5 py-16 sm:px-8 lg:px-12">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40">
              Where most people were heading
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/discover", label: "Explore Malawi" },
                { href: "/places", label: "Destinations" },
                { href: "/experiences", label: "Experiences" },
                { href: "/plan", label: "Build a trip" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 px-5 py-4 text-[15px] font-semibold text-ink transition-colors hover:border-ink/30"
                  >
                    {item.label}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      aria-hidden="true"
                      className="text-ink/30"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
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
