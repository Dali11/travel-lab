import Link from "next/link";
import { photoManifest } from "@/lib/data";

/**
 * Site footer.
 *
 * Dark, full-bleed, and short. It exists to route people to the next part of
 * the product and to restate the site's one non-negotiable position: nothing
 * here is bookable. That disclaimer is repeated because a travel site that
 * eventually takes money has to say clearly which parts currently do not.
 */

const columns = [
  {
    title: "Discover",
    links: [
      { href: "/discover", label: "Explore Malawi" },
      { href: "/places", label: "Destinations" },
      { href: "/experiences", label: "Experiences" },
      { href: "/map", label: "Interactive map" },
    ],
  },
  {
    title: "Plan",
    links: [
      { href: "/plan#build", label: "Build your trip" },
      { href: "/flights", label: "Getting to Malawi" },
      { href: "/hotels", label: "Where to stay" },
    ],
  },
  {
    title: "Know before you go",
    links: [
      { href: "/guide", label: "Visas & borders" },
      { href: "/guide#seasons", label: "When to come" },
      { href: "/guide#money", label: "Money & power" },
    ],
  },
  {
    title: "Travel Lab",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-white/70 px-5 sm:px-8 lg:px-12 pt-16 pb-28 lg:pb-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* Identity */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E2703A"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="12" cy="9" r="4" />
                <path d="M3 16c2.5-2 4.5-2 7 0s4.5 2 7 0 4-2 4-2" strokeLinecap="round" />
                <path
                  d="M3 20c2.5-2 4.5-2 7 0s4.5 2 7 0 4-2 4-2"
                  strokeLinecap="round"
                  opacity="0.55"
                />
              </svg>
              <span className="font-display text-[17px] font-bold tracking-[0.16em] uppercase text-white">
                Travel Lab
              </span>
            </div>
            <p className="mt-5 text-[14px] leading-relaxed">
              The digital gateway for discovering, planning and experiencing Malawi.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mb-4">
                {column.title}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* The disclaimer. Deliberately prominent rather than buried. */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 sm:gap-10 sm:items-center sm:justify-between">
          <p className="text-[12px] leading-relaxed max-w-2xl">
            <strong className="text-white/85 font-semibold">
              Nothing on this site is bookable.
            </strong>{" "}
            There is no booking engine or live fare feed connected to Travel Lab. Every
            price, rate and estimate is a planning figure for you to check — not a quote,
            and never a booking. Confirm anything that matters with the operator
            directly.
          </p>
          <p className="text-[12px] text-white/35 shrink-0">
            © {new Date().getFullYear()} Travel Lab
          </p>
        </div>

        {/*
          Photograph credits for images used across Travel Lab.
        */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <PhotoCredits />
        </div>
      </div>
    </footer>
  );
}

/**
 * The credit line for the photographs actually used.
 *
 * Built from the manifest at build time, so it stays accurate as the manifest
 * changes. Grouped by licence with links back to the Commons file pages.
 */
function PhotoCredits() {
  const used = Object.entries(photoManifest)
    .filter(([, entry]) => Boolean(entry.license))
    .slice(0, 24);

  if (used.length === 0) return null;

  return (
    <details className="group">
      <summary className="list-none cursor-pointer text-[11px] text-white/35 hover:text-white/60 transition-colors [&::-webkit-details-marker]:hidden flex items-center gap-2">
        <svg
          width="9"
          height="9"
          viewBox="0 0 10 10"
          fill="currentColor"
          aria-hidden="true"
          className="transition-transform duration-300 group-open:rotate-90"
        >
          <path d="M3 0l4 5-4 5z" />
        </svg>
        Photography credits — {used.length} images
      </summary>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {used.map(([id, entry]) => (
          <li key={id}>
            <a
              href={entry.attributionUrl || "#"}
              target="_blank"
              rel="noreferrer nofollow"
              className="text-[11px] text-white/40 hover:text-white/70 transition-colors underline decoration-white/15 underline-offset-2"
            >
              {entry.credit} · {entry.license}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}