"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Site navigation.
 *
 * One component, two shapes:
 *
 *   - Desktop: a transparent bar that turns solid once you scroll past the hero,
 *     so the hero photograph is unobstructed at the top of the page.
 *   - Mobile: the same links become a fixed bottom tab bar, which is where the
 *     brief asks for Home / Explore / Plan / Book / Profile. Thumb-reachable,
 *     and it never covers content because the page reserves bottom padding.
 *
 * The header is a client component because scroll position and the mobile menu
 * both need it. Everything it renders is a link, so the crawlable navigation is
 * in the server-rendered markup regardless.
 */

type NavItem = { href: string; label: string; match?: string };

const navItems: NavItem[] = [
  { href: "/discover", label: "Discover", match: "/discover" },
  { href: "/experiences", label: "Experiences", match: "/experiences" },
  { href: "/places", label: "Places", match: "/places" },
  { href: "/plan", label: "Plan", match: "/plan" },
  { href: "/flights", label: "Getting there", match: "/flights" },
  { href: "/guide", label: "Travel tips", match: "/guide" },
];

/** Bottom tab bar. Deliberately five items and no more — thumb reach fails fast. */
const tabItems: NavItem[] = [
  { href: "/", label: "Home", match: "/" },
  { href: "/discover", label: "Explore", match: "/discover" },
  { href: "/plan", label: "Plan", match: "/plan" },
  { href: "/hotels", label: "Book", match: "/hotels" },
  { href: "/about", label: "Profile", match: "/about" },
];

const isActive = (pathname: string, item: NavItem) => {
  if (!item.match) return pathname === item.href;
  if (item.match === "/") return pathname === "/";
  return pathname.startsWith(item.match);
};

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Solid header only once past the hero, so the top of the page stays full-bleed.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Route change closes the mobile sheet.
  //
  // Comparing against the previous pathname rather than calling setState
  // unconditionally: the effect only needs to fire on an actual navigation,
  // and a bare setState on every render is the cascading-render pattern the
  // lint rule exists to catch. The guard makes the intent explicit too — this
  // is about closing on navigation, not about resetting state on mount.
  const lastPathname = useRef(pathname);
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled || menuOpen
            ? "bg-cream/92 backdrop-blur-xl border-b border-ink/8"
            : "bg-transparent"
        }`}
      >
        <nav
          className="px-5 sm:px-8 lg:px-12 h-[68px] lg:h-[76px] flex items-center justify-between gap-8"
          aria-label="Main"
        >
          {/* Wordmark. The sun/lake mark doubles as the mobile menu button. */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <SunMark className={scrolled || menuOpen ? "text-ember" : "text-white"} />
            <span
              className={`font-display text-[17px] lg:text-[19px] font-bold tracking-[0.16em] uppercase transition-colors duration-500 ${
                scrolled || menuOpen ? "text-ink" : "text-white"
              }`}
            >
              Travel Lab
            </span>
          </Link>

          {/* Desktop links. Hidden below lg, where the tab bar takes over. */}
          <ul className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative text-[14px] font-medium tracking-wide transition-colors duration-300 ${
                      scrolled || menuOpen
                        ? active
                          ? "text-ink"
                          : "text-ink/60 hover:text-ink"
                        : active
                          ? "text-white"
                          : "text-white/75 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute -bottom-1.5 left-0 h-px bg-ember transition-all duration-400 ${
                        active ? "w-full" : "w-0"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3">
            <Link
              href="/plan#build"
              className={`hidden sm:inline-flex items-center rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all duration-400 ${
                scrolled || menuOpen
                  ? "bg-ink text-cream hover:bg-lake-deep"
                  : "bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
              }`}
            >
              Build My Trip
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="lg:hidden w-11 h-11 -mr-2 flex items-center justify-center"
            >
              <span className="relative block w-6 h-4">
                <span
                  className={`absolute left-0 h-px w-6 transition-all duration-400 ${
                    scrolled || menuOpen ? "bg-ink" : "bg-white"
                  } ${menuOpen ? "top-[7px] rotate-45" : "top-0.5"}`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-px w-6 transition-all duration-200 ${
                    scrolled || menuOpen ? "bg-ink" : "bg-white"
                  } ${menuOpen ? "opacity-0" : "opacity-100"}`}
                />
                <span
                  className={`absolute left-0 h-px w-6 transition-all duration-400 ${
                    scrolled || menuOpen ? "bg-ink" : "bg-white"
                  } ${menuOpen ? "top-[7px] -rotate-45" : "top-[13.5px]"}`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile sheet */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-ink transition-opacity duration-400 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="h-full flex flex-col px-6 pt-28 pb-10">
          <ul className="flex flex-col gap-1">
            {navItems.map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  tabIndex={menuOpen ? 0 : -1}
                  className="block font-display text-[32px] font-semibold text-white/90 hover:text-white transition-colors"
                  style={{
                    transitionDelay: menuOpen ? `${index * 45}ms` : "0ms",
                    transform: menuOpen ? "translateY(0)" : "translateY(14px)",
                    opacity: menuOpen ? 1 : 0,
                    transition: "opacity 500ms ease, transform 500ms cubic-bezier(0.16,1,0.3,1), color 300ms",
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-8 border-t border-white/12">
            <Link
              href="/plan#build"
              tabIndex={menuOpen ? 0 : -1}
              className="flex items-center justify-center rounded-full bg-ember text-white py-4 text-[15px] font-semibold"
            >
              Build My Trip
            </Link>
            <p className="mt-5 text-[11px] text-white/40 leading-relaxed">
              Planning figures only. No fares, no rates and no availability on this site
              are bookable.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom tab bar — mobile only. */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur-xl border-t border-ink/10 pb-[env(safe-area-inset-bottom)]"
        aria-label="Primary"
      >
        <ul className="grid grid-cols-5">
          {tabItems.map((item) => {
            const active = isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold tracking-wide transition-colors ${
                    active ? "text-ember" : "text-ink/45"
                  }`}
                >
                  <TabIcon name={item.label} active={active} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

/** Sun over water. Reads at 26px, which is the only size it is ever used at. */
function SunMark({ className }: { className?: string }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      className={`transition-colors duration-500 ${className ?? ""}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="9" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 16c2.5-2 4.5-2 7 0s4.5 2 7 0 4-2 4-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3 20c2.5-2 4.5-2 7 0s4.5 2 7 0 4-2 4-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? 2.2 : 1.7;
  const common = {
    width: 21,
    height: 21,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "Home":
      return (
        <svg {...common}>
          <path d="M3 11l9-7 9 7" />
          <path d="M6 9.5V20h12V9.5" />
        </svg>
      );
    case "Explore":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3 12h17M12 3.5c2.5 2.5 2.5 14.5 0 17-2.5-2.5-2.5-14.5 0-17z" />
        </svg>
      );
    case "Plan":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="16" rx="2.5" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );
    case "Book":
      return (
        <svg {...common}>
          <path d="M4 8l8-4 8 4-8 4-8-4z" />
          <path d="M4 8v8l8 4 8-4V8" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="8.5" r="3.8" />
          <path d="M4.5 20a7.5 7.5 0 0115 0" />
        </svg>
      );
  }
}