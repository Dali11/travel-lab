import Link from "next/link";
import { Photo } from "./Photo";

export function Hero() {
  return (
    <section
      className="relative flex min-h-[82svh] w-full items-end overflow-hidden bg-ink sm:min-h-[88svh] lg:min-h-[92svh]"
      aria-labelledby="hero-title"
    >
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

      <div
        className="absolute inset-0 bg-gradient-to-b from-[#071923]/50 via-[#071923]/15 to-[#031015]/85"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-gradient-to-r from-[#04151c]/55 via-[#04151c]/20 to-transparent"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#04151c]/35 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-[1] w-full px-5 pb-28 pt-32 sm:px-8 sm:pb-24 lg:px-16 lg:pb-24 lg:pt-36">
        <div className="max-w-[760px]">
          <p
            className="animate-rise mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-white/85 sm:mb-6 sm:text-[11px]"
            style={{ animationDelay: "120ms" }}
          >
            <span className="h-px w-7 bg-[#F4C66E]" aria-hidden="true" />
            Discover Malawi
          </p>

          <h1
            id="hero-title"
            className="animate-rise max-w-[760px] font-display text-[clamp(3.25rem,8.2vw,7.25rem)] font-medium leading-[0.91] tracking-[-0.055em] text-white"
            style={{ animationDelay: "220ms" }}
          >
            Extraordinary
            <br />
            places. Real
            <br />
            <span className="text-[#F4C66E]">experiences.</span>
          </h1>

          <p
            className="animate-rise mt-5 max-w-[39ch] text-[15px] leading-relaxed text-white/85 sm:mt-6 sm:text-[17px]"
            style={{ animationDelay: "360ms" }}
          >
            From pristine lakes and wild highlands to vibrant culture and warm
            communities — discover a journey that feels like yours.
          </p>

          <div
            className="animate-rise mt-7 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-3"
            style={{ animationDelay: "480ms" }}
          >
            <Link
              href="/discover"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#E2703A] px-6 text-[14px] font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#c95b2b] sm:min-h-[52px] sm:px-7"
            >
              Explore Destinations
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>

            <Link
              href="/plan#build"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/60 bg-white/10 px-6 text-[14px] font-semibold text-white backdrop-blur-sm transition duration-300 hover:border-white hover:bg-white/20 sm:min-h-[52px] sm:px-7"
            >
              Plan Your Trip
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div
            className="animate-rise mt-9 hidden items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65 sm:flex lg:mt-12"
            style={{ animationDelay: "620ms" }}
          >
            <span>01</span>
            <span className="h-px w-16 bg-gradient-to-r from-[#F4C66E] to-white/20" />
            <span>A thousand ways to experience Malawi</span>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-7 right-10 z-[1] hidden flex-col items-center gap-3 text-white/65 lg:flex"
        aria-hidden="true"
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.25em]">
          Scroll to explore
        </span>
        <span className="h-10 w-px bg-gradient-to-b from-[#F4C66E]/80 to-transparent" />
      </div>
    </section>
  );
}
