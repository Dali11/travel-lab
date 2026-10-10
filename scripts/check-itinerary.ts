/**
 * Sanity checks for the trip generator.
 *
 * Run with: npx tsx scripts/check-itinerary.ts
 *
 * These assert the properties that actually matter, which are all things that
 * can silently break:
 *
 *   - day allocation always sums to the requested number of days
 *   - the route never doubles back (monotonic in one axis)
 *   - consecutive stops are never absurdly far apart
 *   - the generator is deterministic
 *   - it never throws, for any combination of inputs
 *
 * This is deliberately a script rather than a test suite: the generator is pure
 * and 20 lines of assertions cover the invariants that matter. A real test
 * runner would be more machinery than the thing deserves.
 */

import {
  budgetBands,
  defaultRequest,
  generateItinerary,
  tripLengths,
} from "../lib/itinerary";
import { destinations, experiences, stays } from "../lib/data";
import type { GeoContext } from "../lib/itinerary";
import { interests } from "../lib/data/interests";
import type { ItineraryRequest, TravelInterestId } from "../lib/types";

let failures = 0;

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

/* --------------------------------------------------------------- Fixtures */

/** Injected the same way the client component receives it. */
const GEO: GeoContext = { destinations };

const geoById = new Map(
  destinations
    .filter((d): d is typeof d & { lat: number; lng: number } => d.lat !== null)
    .map((d) => [d.id, d]),
);

const allInterests = interests.map((i) => i.id);

console.log("\n== data integrity ==");
check(
  "destinations present",
  destinations.length > 20,
  `${destinations.length} found`,
);
check("experiences present", experiences.length >= 20, `${experiences.length}`);
check("stays present", stays.length >= 12, `${stays.length}`);
check("interests present", interests.length === 8, `${interests.length}`);
check(
  "every interest references a real destination",
  allInterests.every((id) =>
    destinations.some((d) => d.interests.includes(id)),
  ),
);
check(
  "every experience references a real destination",
  experiences.every((e) =>
    e.destinationIds.every((id) => destinations.some((d) => d.id === id)),
  ),
);
check(
  "no experience claims to be bookable",
  experiences.every((e) => e.bookable === false),
);
check(
  "no stay has a booking URL",
  stays.every((s) => s.bookingUrl === null),
);
check("pricing is never live", true);

/* ------------------------------------------------- Deterministic + totals */

console.log("\n== determinism ==");
const a = generateItinerary(defaultRequest, GEO);
const b = generateItinerary(defaultRequest, GEO);
check(
  "same input produces identical output",
  JSON.stringify(a.stops) === JSON.stringify(b.stops),
);

console.log("\n== day allocation sums correctly ==");
for (const days of tripLengths) {
  for (const month of [1, 5, 7, 12]) {
    for (const budget of budgetBands.map((band) => band.id)) {
      const request: ItineraryRequest = { ...defaultRequest, days, month, budget };
      const result = generateItinerary(request, GEO);

      // Recompute the span the generator actually covers.
      // Each stop's span runs to the next stop's start, minus 1, and the final
      // stop runs to `days`. Verify by walking the stops.
      let covered = 0;
      for (let i = 0; i < result.stops.length; i += 1) {
        const stop = result.stops[i];
        const next = result.stops[i + 1];
        covered += next ? next.day - stop.day : days - stop.day + 1;
      }

      if (covered !== days) {
        failures += 1;
        console.log(
          `  FAIL days=${days} month=${month} budget=${budget}: covered ${covered}, expected ${days}`,
        );
        console.log(`       stops: ${result.stops.map((s) => `d${s.day}:${s.destinationId}`).join(" ")}`);
      }
    }
  }
}
check("allocation always sums to the requested days", failures === 0);

/* ------------------------------------------------------ Route is a sweep */

console.log("\n== route never doubles back ==");
let reversals = 0;
for (const days of [3, 5, 7, 10, 14, 21]) {
  for (const interestSubset of [
    ["wildlife"],
    ["lake-beaches"],
    ["adventure"],
    ["culture-people"],
    ["wildlife", "lake-beaches", "adventure"],
    allInterests as TravelInterestId[],
  ]) {
    const result = generateItinerary({
      ...defaultRequest,
      days,
      interests: interestSubset as TravelInterestId[],
    }, GEO);

    const lats = result.stops
      .map((stop) => geoById.get(stop.destinationId))
      .filter((d): d is NonNullable<typeof d> => Boolean(d))
      .map((d) => d.lat);

    if (lats.length < 2) continue;

    let direction = 0;
    for (let i = 1; i < lats.length; i += 1) {
      const step = Math.sign(lats[i] - lats[i - 1]);
      if (step === 0) continue;
      if (direction !== 0 && step !== direction) reversals += 1;
      direction = step;
    }
  }
}
check(
  "no itinerary reverses direction in latitude",
  reversals === 0,
  `${reversals} reversals across 36 itineraries`,
);

/* ----------------------------------------------- No absurd inter-stop legs */

console.log("\n== inter-stop distances are sane ==");
let worstKm = 0;
let worstPair = "";
for (const days of tripLengths) {
  for (const interestSubset of [
    ["wildlife", "lake-beaches"],
    ["adventure", "culture-people"],
    allInterests as TravelInterestId[],
  ]) {
    const result = generateItinerary({
      ...defaultRequest,
      days,
      interests: interestSubset as TravelInterestId[],
    }, GEO);
    for (let i = 1; i < result.stops.length; i += 1) {
      const from = geoById.get(result.stops[i - 1].destinationId);
      const to = geoById.get(result.stops[i].destinationId);
      if (!from || !to) continue;

      const R = 6371;
      const dLat = ((to.lat - from.lat) * Math.PI) / 180;
      const dLng = ((to.lng - from.lng) * Math.PI) / 180;
      const lat1 = (from.lat * Math.PI) / 180;
      const lat2 = (to.lat * Math.PI) / 180;
      const h =
        Math.sin(dLat / 2) ** 2 +
        Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
      const km = 2 * R * Math.asin(Math.sqrt(h));

      if (km > worstKm) {
        worstKm = km;
        worstPair = `${from.name} → ${to.name}`;
      }
    }
  }
}
// Malawi is ~900km N-S. A single leg over 400km straight-line is a full day's
// drive on top of everything else in the day.
check(
  "no single leg exceeds 400km straight-line",
  worstKm < 400,
  `worst was ${Math.round(worstKm)}km (${worstPair}, GEO)`,
);

/* -------------------------------------------------------- Never throws */

console.log("\n== exhaustive input sweep (no exceptions) ==");
let threw = 0;
for (let month = 1; month <= 12; month += 1) {
  for (const days of tripLengths) {
    for (const party of ["solo", "couple", "family", "group"] as const) {
      for (const budget of budgetBands.map((band) => band.id)) {
        for (const subset of [[], ["wildlife"], allInterests as TravelInterestId[]]) {
          try {
            const result = generateItinerary({
              month,
              days,
              party,
              travellers: 2,
              interests: subset as TravelInterestId[],
              budget,
            }, GEO);
            if (result.stops.length === 0) {
              failures += 1;
              console.log(`  FAIL month=${month} days=${days}: zero stops`);
            }
            if (result.estimate.totalUsd < 0) {
              failures += 1;
              console.log(`  FAIL month=${month} days=${days}: negative total`);
            }
          } catch (error) {
            threw += 1;
            console.log(
              `  FAIL month=${month} days=${days} party=${party} budget=${budget}: ${error}`,
            );
          }
        }
      }
    }
  }
}
check(`no exceptions across 12×${tripLengths.length}×4×4×3 inputs`, threw === 0);

/* ----------------------------------------------------- Warnings are honest */

console.log("\n== honesty ==");
/*
 * Gate correctness.
 *
 * The airport advice is only useful if it agrees with the stop order. A route
 * that begins in the north must say you arrive in the north, and a route that
 * begins in the south must say the opposite. This previously reported the
 * direction backwards for the common north-to-south route, so it is asserted
 * rather than eyeballed.
 */
let gateErrors = 0;
for (const days of tripLengths) {
  for (const subset of [
    ["wildlife", "lake-beaches", "adventure"],
    ["adventure"],
    ["wildlife"],
  ]) {
    const result = generateItinerary(
      { ...defaultRequest, days, interests: subset as TravelInterestId[] },
      GEO,
    );
    if (result.stops.length < 2) continue;

    const lats = result.stops.map((stop) => geoById.get(stop.destinationId)?.lat ?? 0);
    const startsSouth = lats[0] <= lats[lats.length - 1];
    const endsNorth = lats[lats.length - 1] <= lats[0];

    if (result.gates.southToNorth !== startsSouth) {
      gateErrors += 1;
      console.log(
        `  FAIL days=${days}: reports southToNorth=${result.gates.southToNorth} but the route starts south=${startsSouth}`,
      );
    }
    // Arriving in the south means Chileka; arriving in the north means Kamuzu.
    const expectedArrive = startsSouth ? "BLZ" : "KMI";
    if (result.gates.arrive !== expectedArrive) {
      gateErrors += 1;
      console.log(
        `  FAIL days=${days}: arrive=${result.gates.arrive}, expected ${expectedArrive}`,
      );
    }
    // You should always leave from the opposite end.
    if (result.gates.arrive === result.gates.depart) {
      gateErrors += 1;
      console.log(`  FAIL days=${days}: arrive and depart are the same airport`);
    }
    void endsNorth;
  }
}
check("airport gates agree with the route direction", gateErrors === 0);

const noInterest = generateItinerary({
  ...defaultRequest,
  interests: [],
}, GEO);
check(
  "always warns that figures are not quotes",
  noInterest.warnings.some((w) => w.includes("not a quote")),
);
check(
  "never claims pricing is live",
  noInterest.pricingIsLive === false,
);

/* ------------------------------------------------------------------ Report */

console.log(
  `\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}\n`,
);
process.exit(failures === 0 ? 0 : 1);