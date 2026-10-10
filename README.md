# Travel Lab

A practical guide to visiting Malawi: visas, borders, seasons, flights, stays and
honest trip budgets.

The site is deliberately **not** a booking engine. It answers the questions that
actually decide whether a trip works, then sends you somewhere that can take your
money. Every figure on the site is a planning number, not a quote, and the copy
says so in more than one place.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind 4 · Drizzle ORM ·
Neon Postgres (or any Postgres) · Vercel Blob

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

You need these environment values before anything works:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. **Required.** |
| `ADMIN_SECRET` | Gates `/admin` and the upload APIs. Min 16 characters. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token, only for uploading photos. |
| `SITE_URL` | Canonical URL for the sitemap and canonical tags. |

### Database setup

Create a free Postgres database at [neon.tech](https://neon.tech), paste the
connection string into `.env.local`, then:

```bash
npm run db:push          # create the tables
npm run db:seed          # sample places
npm run db:seed:hotels   # sample hotels
```

**A local Postgres works too.** If your connection string points at
`localhost`, the app switches from the Neon driver to `node-postgres` — the Neon
HTTP driver cannot reach a local database, because it rewrites the host to
`api.<host>` and only speaks to Neon's gateway.

```bash
DATABASE_URL="postgres://user:pass@localhost:5432/travellab"
```

## Routes

| Route | What it is |
| --- | --- |
| `/` | Home — what the site is for, at-a-glance facts, when to go |
| `/places`, `/places/[slug]` | Place directory with working filters and pagination |
| `/hotels`, `/hotels/[slug]` | Stay directory, same |
| `/flights` | Route guide: who flies here, and why "direct" often is not |
| `/guide` | Visas, borders, seasons, money, connectivity, power |
| `/plan` | Interactive Kwacha trip budget calculator |
| `/about`, `/contact` | About the site, and a corrections address |
| `/admin` | Photo management for places and hotels — **auth required** |

## About the admin area

`/admin` and the upload APIs are protected by `proxy.ts` using a shared secret
from `ADMIN_SECRET`, set as an httpOnly cookie.

Two behaviours worth knowing:

- If `ADMIN_SECRET` is unset or shorter than 16 characters, **every admin route
  returns 404**. It fails closed rather than open, and does not advertise that an
  admin area exists.
- If the secret is correct, `/admin/login` sets the cookie and you are through.

This suits a single-operator content tool. It is not a substitute for real user
accounts — if you ever add more than one operator, move to a real auth provider.

## Content that needs your review

Some content is editorial guidance rather than verified fact. Before publishing:

- **`lib/guides.ts`** — visa rules and fees change frequently. Verify against the
  Immigration Department. The country groupings are a starting point, not legal
  advice.
- **`lib/flights.ts`** — which airlines serve which routes changes. Verify
  before relying on it commercially.
- **`db/seed-hotels.ts`** — the sample hotel prices are illustrative, including
  the properties themselves.
- **`app/contact/page.tsx`** — the email address is a placeholder. Replace it
  with a real inbox before launch.

The Kwacha/USD rate used by the trip planner (`USD_TO_MWK` in
`components/TripPlanner.tsx`) is a hardcoded planning constant. It will drift —
update it periodically or source it from an API.

## Why there is no flight search box

There is no free, self-serve flight fare API with usable coverage of Malawian
routes:

- **Amadeus Self-Service** has been decommissioned; only the Enterprise API
  (NDA, custom quote) remains.
- **Kiwi Tequila**, which had the best African and low-cost carrier coverage, is
  closed to new developers.
- Aviationstack, AirLabs and FlightAware return flight status and schedules but
  **no fares**, in any tier.

The remaining live options are paid metasearch (SerpApi scrapes Google Flights)
or booking APIs that charge per search — a poor fit for a site where visitors
browse far more than they book. So `/flights` is an honest guide that links out,
rather than a search box that returns nothing. If you later add SerpApi, respect
the free tier by caching and labelling prices as indicative.

## Scripts

```bash
npm run dev             # dev server
npm run build           # production build
npm run lint            # eslint
npm run db:push         # push schema to the database
npm run db:seed         # seed places
npm run db:seed:hotels  # seed hotels
```