# Travel Lab Malawi — Admin Dashboard Audit Report

Date: 2026-10-10. Scope: existing application (`~Buy Me Coffee/travel-lab`), Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind 4, Drizzle + Neon PostgreSQL, Neon Storage (S3-compatible), Vercel Blob. No authentication package installed.

## 1. What already exists

| Area | Finding |
|---|---|
| `/admin` page | `app/admin/page.tsx` — unauthenticated "photo management" dashboard listing `places` and `hotels` with Replace/Upload buttons. Self-describes as "for local use only". Declared `force-dynamic`, handles missing DB gracefully. |
| Admin upload flow | `app/admin/upload/[type]/[slug]/page.tsx` (client) → `POST /api/upload` (Neon Storage) → `PATCH /api/admin/attach-image` (sets `imageUrl` on `places`/`hotels` by slug). No auth on any of it. |
| `app/api/admin/route.ts` | DOES NOT EXIST. `app/api/admin/attach-image/route.ts` does. |
| `app/api/places/[slug]/image` | DOES NOT EXIST (that path appears in `app/admin/upload/[type]/[slug]/page.tsx` but is stale — the working attach endpoint is `/api/admin/attach-image`). |
| Environment | `.env.example` names `DATABASE_URL`, `ADMIN_SECRET` (min 16 chars, gates `/admin` and upload APIs), `BLOB_READ_WRITE_TOKEN`, `SITE_URL`. `.env.local` is present but secret. No auth library installed. |
| DB schema | `places` (id, slug, name, region, category, blurb, imageUrl, createdAt); `hotels` (id, slug, name, location, tier, pricePerNight, rating, blurb, imageUrl, createdAt). No `experiences`, `guides`, `flights`, or settings tables. |
| DB seed | `db/seed.ts` (6 places, `INSERT`, duplicates on rerun), `db/seed-hotels.ts` (6 hotels, `INSERT`, duplicates on rerun). |
| Public content source of truth | Destinations/experiences/stays: static in `lib/data/*.ts` (editorial), merged at import with verified coordinates in `data/destinations.json`. Photos: `data/photos.json` manifest → Neon Storage URLs. Guides: `lib/guides.ts` (visa/season/connectivity/quick-facts). Flights: `lib/flights.ts` + `lib/data/routes.ts` (curated route shapes, no live fares). **The public site currently reads Postgres 0%** — the database is operator tooling only. |
| Styling | Cream `#F3E9D6`-family backgrounds, ink text, ember orange accents, Fraunces display + Karla UI. `components/travel/Layout.tsx` (`shell`, `sectionY`, `SectionHeading`, `PillLink`, `Stars`). `Navbar.tsx` is the mobile pattern to mirror: fixed bottom tab bar on mobile, collapsible desktop nav. |
| Lint/build baseline | `npm run lint` → 2 pre-existing errors (in `MalawiMap.tsx`, `InterestGrid.tsx`), 18 warnings. Build baseline still running. |

## 2. Architectural relationships (how the pieces connect)

- Uploads: client form → `/api/upload` (`@aws-sdk/client-s3` PutObject → Neon Storage bucket) → `PATCH /api/admin/attach-image` → DB `imageUrl` on `places`/`hotels`.
- `/admin` read: DB `places` + `hotels` — NOT read from the administrative attach endpoint (which is write-only).
- Public photo rendering: `components/travel/Photo.tsx` resolves `src ?? photoFor(photoKey)?.url` — a DB-supplied `imageUrl` would be used where a component passes it; currently no public page passes a DB URL.
- Three ways the public site and admin diverge today: (a) destinations/experiences/stays come from static editorial files; (b) photos from `data/photos.json`; (c) admin writes DB `imageUrl` only on `places`/`hotels`.

## 3. Risks and constraints identified

1. **Unauthenticated admin is the defining security risk.** `/admin`, `/api/upload`, `/api/admin/attach-image` are all open. `ADMIN_SECRET` is documented in `.env.example` but implemented nowhere.
2. **No database-backed content tables exist** for experiences, guides, flights, trip-planning, settings — the admin sections that touch them would be static/docs today.
3. **Seed scripts `INSERT` without upserts** — rerunning seeds duplicates rows.
4. **Public site has no database integration**, so "images assigned in admin appear on public pages" is not currently achievable without migrating public page data sources (large change; do it incrementally and gate it).
5. **Static content treated as source of truth** for places/hotels in public only; DB holds the same records only for the photo dashboard. This mismatch must be resolved per content type before admin edits can be trusted to reflect the public site.
6. **No rate limiting, CSRF tokens, or server-side validation of ownership** beyond slug existence — all present in the current admin APIs.
7. **No upload auth, no file-type/size hardening on the admin side** (endpoint already caps 5 MB / JPEG-PNG-WebP, which is good).
8. **Existing pre-existing lint errors must stay in place** (per brief: report, don't silently fix).

## 4. Phase plan (high level)

- **Phase 1 (audit):** DONE. Report above. Backup all important files before changes.
- **Phase 2 (auth):** Add a lightweight, dependency-free auth module (`lib/auth.ts`): `ADMIN_SECRET` session cookie (HttpOnly, SameSite=Lax, __Host- prefixed), login/ logout API (POST `/api/admin/login`, POST `/api/admin/logout`), session middleware/route guards, server-side `requireAdmin()` helper. No new heavy dependency; keep it compatible with the existing stack. Implement route protection in middleware for `/admin` and the upload/attach APIs + auth endpoints.
- **Phase 3 (DB enhancements):** Add tables `experiences`, `travel_guides`, `flights`, `trip_planning` (additive — no destructive migration, preserves existing records; seed scripts updated to upsert with idempotency).
- **Phase 4 (admin UI):** One layout with sidebar (9 nav items) + top header + workspace. Sections: Overview (stats, recent updates, missing images, quick actions, DB-failure state), Destinations (CRUD + slug + image assign/upload), Hotels (CRUD + images), Experiences (edit + persist to DB + migration note), Travel Guides (edit + persist + publish note), Flights & Transport, Trip Planning, Settings. Confirmations for deletes, loading/error/success states, validation, revalidation.
- **Phase 5 (media library):** `/admin/media` gallery (Neon Storage listing + upload + search/filter), global image assign to destinations/hotels (and experiences/guides where schema allows), in-use protection, clear errors.
- **Phase 6 (public page wiring, incremental):** Destinations/hotels pages read DB `imageUrl` when present (fall back to static manifest); document that experiences/guides/flights remain static until explicitly migrated. No public-page refactor beyond that.
- **Phase 7 (testing):** typecheck, lint, build; unauthenticated access to protected routes; CRUD; upload+assign; validation; DB failure; mobile; public revalidation.
- **Phase 8 (delivery):** report of files changed, features, auth measures, DB changes, env vars, test commands + actual results, incompletes.

## 5. Open questions for the user (buying back)

- Should the public site's destinations/experiences/hotels be switched to read from DB (large, explicit migration), or should the admin write to DB but the public site keep static + image lookup? Brief leans toward: admin writes DB; public pages selectively read DB `imageUrl` where present; static fallback intact.
- Whether `ADMIN_SECRET` is the agreed session model (no heavier auth package wanted; no email/password reset flow requested).
