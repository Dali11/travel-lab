/**
 * Admin area shell.
 *
 * Server component that enforces authentication at the page layer: a visitor
 * without a valid, unexpired session cookie (verified against the database and
 * the ADMIN_SECRET) is redirected to /admin/login. Role checks for data access
 * are enforced server-side in each route handler.
 */
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, getAdminIdentity, getSessionSecret } from "@/lib/auth";
import { isDbConfigured } from "@/db";

const NAV = [
  { href: "/admin", label: "Overview", icon: "Overview" },
  { href: "/admin/destinations", label: "Destinations" },
  { href: "/admin/hotels", label: "Hotels & Accommodation" },
  { href: "/admin/images", label: "Images & Media" },
  { href: "/admin/experiences", label: "Experiences" },
  { href: "/admin/guides", label: "Travel Guides" },
  { href: "/admin/flights", label: "Flights & Transport" },
  { href: "/admin/trip-planning", label: "Trip Planning" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  const sessionToken = sessionCookie?.value;

  if (!sessionToken) {
    redirect(new URL("/admin/login", "http://localhost:3000").toString());
  }

  // A session cookie that does not verify against the secret or the database is
  // not a session at all. Without a database we cannot verify the signature, so
  // we let the flag-through reach the pages while the API layer enforces the
  // real authorization (getAdminSession) everywhere data is read or written.
  const identity = isDbConfigured()
    ? await getAdminIdentity(sessionToken)
    : null;

  if (!identity) {
    redirect(new URL("/admin/login", "http://localhost:3000").toString());
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-40 flex h-full flex-col border-r border-sand bg-white/80 px-4 py-6 shadow-sm lg:static lg:flex-col lg:translate-x-0">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" strokeDasharray="1.2 1.6" fill="none" />
              <path d="M3 13c1.4-1.6 2.6-1.6 4 0s2.6 1.6 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M3 16.5c1.4-1.4 2.6-1.4 4 0s2.6 1.4 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
            </svg>
          </div>
          <span className="font-display text-lg font-bold tracking-wide text-ink">Travel Lab</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Admin">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:bg-lake/5 hover:text-ink"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cream text-xs font-semibold text-muted">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b border-sand bg-white/80 px-6 print:hidden">
          <h1 className="font-display text-lg font-semibold text-ink">
            <Link href="/admin" className="hover:text-ember">
              Overview
            </Link>
          </h1>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:inline">{identity.username}</span>
            <button
              type="button"
              onClick={() => {
                fetch("/api/admin/logout", { method: "POST" }).then(() => {
                  window.location.href = "/admin/login";
                });
              }}
              className="rounded-full border border-sand px-4 py-2 text-sm font-semibold text-ink/70 transition-colors hover:border-ember hover:text-ember"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
