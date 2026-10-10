import Link from "next/link";
import { Photo } from "./Photo";


/**
 * The hero.
 *
 * A server component. The only client behaviour is the video toggle below, and
 * that is a two-state disclosure that a native <details> element handles
 * natively — so the hero ships zero JavaScript.
 *
 * Photography, not illustration, and not a gradient with a stock texture. If no
 * verified hero photograph exists, Photo renders a designed colour field rather
 * than nothing, and the type still carries the section.
 */

export function Hero() {
  return (
    <section
      className="relative flex min-h-[100svh] w-full items-end overflow-hidden bg-ink"
      aria-labelledby="hero-title"
    >
      {/* Full-bleed Lake Malawi photography */}
      <div className="absolute inset-0">
        <Photo
          photoKey="lake-malawi-national-park"
          alt="Lake Malawi at Cape Maclear, with the shoreline and islands in the distance"
          seed="hero-lake-malawi"
          priority
          sizes="100vw"
          fallbackTone="deep"
          className=""
        />
      </div>

      {/* Cinematic contrast for legible editorial typography */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#071923]/55 via-[#071923]/10 to-[#031015]/85"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#04151c]/45 via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* Transparent navigation occupies the top of the photograph */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#04151c]/35 to-transparent"
        aria-hidden="true"
      />

      {/* Editorial hero copy */}
      <div className="relative z-[1] w-full px-5 pb-40 pt-8 sm:px-8 sm:pb-32 sm:pt-24 lg:px-16 lg:pb-24 lg:pt-36">
        <div className="max-w-[900px]">
          <p
            className="animate-rise mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white/85 sm:mb-7 sm:text-[11px]"
            style={{ animationDelay: "120ms" }}
          >
            <span className="h-px w-7 bg-[#F2C36B]" aria-hidden="true" />
            Lake Malawi · Travel Lab
          </p>

          <h1
            id="hero-title"
            className="animate-rise max-w-[780px] font-display text-[clamp(4rem,13vw,9.5rem)] font-medium leading-[0.83] tracking-[-0.055em] text-white"
            style={{ animationDelay: "220ms" }}
          >
            <span className="block">The real</span>
            <span className="mt-1 block text-[#F4C66E]">Malawi.</span>
          </h1>

          <p
            className="animate-rise mt-6 max-w-[36ch] text-[clamp(0.95rem,1.7vw,1.2rem)] leading-relaxed text-white/85 sm:mt-8"
            style={{ animationDelay: "360ms" }}
          >
            Extraordinary places. Authentic experiences. Journeys that make a difference.
          </p>

          <div
            className="animate-rise mt-7 flex flex-col items-stretch gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4"
            style={{ animationDelay: "480ms" }}
          >
            <Link
              href="/plan#build"
              className="group inline-flex min-h-14 items-center justify-center gap-4 rounded-full bg-[#F4C66E] px-7 text-[14px] font-bold text-[#17140E] shadow-[0_8px_32px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFDA8B] sm:min-h-[58px] sm:min-w-[190px] sm:px-8"
            >
              Build My Trip
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>

            <Link
              href="/discover"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/55 bg-white/[0.04] px-6 text-[14px] font-semibold text-white backdrop-blur-sm transition duration-300 hover:border-[#F4C66E] hover:bg-white/10 sm:min-h-[58px] sm:px-7"
            >
              Explore Destinations
              <span
                className="grid h-7 w-7 place-items-center rounded-full border border-white/40 transition-colors group-hover:border-[#F4C66E]"
                aria-hidden="true"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          </div>

          <div
            className="animate-rise mt-9 hidden items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65 sm:flex lg:mt-12"
            style={{ animationDelay: "620ms" }}
          >
            <span>01</span>
            <span className="h-px w-20 bg-gradient-to-r from-[#F4C66E] to-white/20" />
            <span>Discover the extraordinary</span>
          </div>
        </div>
      </div>

      {/* Desktop scroll cue */}
      <div
        className="absolute bottom-8 right-10 z-[1] hidden flex-col items-center gap-3 text-white/65 lg:flex"
        aria-hidden="true"
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.28em]">Scroll to explore</span>
        <span className="h-10 w-px bg-gradient-to-b from-[#F4C66E]/80 to-transparent" />
      </div>
    </section>
  );
}