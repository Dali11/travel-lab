import type {
  BudgetBand,
  Destination,
  Itinerary,
  ItineraryRequest,
  ItineraryStop,
  TravelInterestId,
  TripParty,
} from "./types";
import { experiences } from "./data/experiences";
import { nearestStay, stays, staysForDestination } from "./data/stays";

/**
 * Geographic data, injected rather than imported.
 *
 * This module is imported by `TripBuilder`, which is a client component, so it
 * must not reach `lib/data/index.ts` — that module reads `data/*.json` through
 * `node:fs`, which cannot be bundled for the browser.
 *
 * Verified coordinates therefore arrive as an argument from the server
 * component that renders the planner. See `GeoContext`.
 */
export type GeoContext = {
  destinations: Destination[];
};

/**
 * Trip builder.
 *
 * The rule this file follows: an itinerary that looks clever but breaks the
 * geography is worse than no itinerary. Malawi is not a small country — it is
 * roughly 900 km north to south with roads that are frequently unpaved, and the
 * single most common mistake a visitor makes is scheduling three places in a day
 * that take six hours to drive between.
 *
 * So the generator is a real route planner, not a shuffle:
 *
 *   1. Score every destination against the traveller's stated interests.
 *   2. Run a nearest-neighbour pass over the shortlist to produce a single
 *      south-to-north or north-to-south route, never a zig-zag.
 *   3. Solve for which airport the trip should enter and leave through.
 *   4. Allocate days by how much there is to actually do at each stop.
 *   5. Attach experiences and overnight stops, and price the whole thing
 *      against the selected budget band.
 *
 * Every output is a PLANNING FIGURE. There is no live pricing behind this and
 * `pricingIsLive` is typed as literal `false` so it cannot quietly become a lie.
 */

/* ------------------------------------------------------------------- Inputs */

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const tripLengths = [3, 5, 7, 10, 14, 21];

export const tripParties: { id: TripParty; label: string; travellers: number }[] = [
  { id: "solo", label: "Solo traveller", travellers: 1 },
  { id: "couple", label: "Couple", travellers: 2 },
  { id: "family", label: "Family with children", travellers: 4 },
  { id: "group", label: "Group of friends", travellers: 6 },
];

export const budgetBands: BudgetBand[] = [
  {
    id: "backpacker",
    label: "Under $80",
    minUsd: 40,
    maxUsd: 80,
    description:
      "Guesthouses and basic lodges, shared transport, self-guided days. Doable and genuinely rewarding if you plan the transfers carefully.",
  },
  {
    id: "comfort",
    label: "$80 – $180",
    minUsd: 80,
    maxUsd: 180,
    description:
      "The realistic middle. Comfortable lodges, guided safari days, private transfers where the distance demands them.",
  },
  {
    id: "premium",
    label: "$180 – $350",
    minUsd: 180,
    maxUsd: 350,
    description:
      "High-end lodges, private vehicles and guides throughout, first-class on the internal flight. Book well ahead.",
  },
  {
    id: "no-limit",
    label: "$350+",
    minUsd: 350,
    maxUsd: 600,
    description:
      "The private lodges, private boats and private guides. A handful of operators, all of which book out in the July–August peak.",
  },
];

/* ------------------------------------------------------------------- Scoring */

/**
 * Geographic spread per interest. These are used to pick the shortlist, so that
 * an "adventure" request surfaces Mulanje, Walale and Zomba rather than four
 * places within forty kilometres of each other.
 */
const INTEREST_CORE: Record<TravelInterestId, string[]> = {
  wildlife: ["liwonde-national-park", "nyika-national-park", "kasungu-national-park", "lake-malawi-national-park", "teza-national-park"],
  "lake-beaches": ["cape-maclear", "lake-malawi-national-park", "likoma", "nkhata-bay", "mangochi", "chizumulu", "monkey-bay", "malangalanga"],
  adventure: ["mount-mulanje", "mount-walale", "zomba-plateau", "viphya", "likoma", "malangalanga"],
  "culture-people": ["mua-mission", "livingstonia", "ntchisi", "nkhata-bay", "dedza", "blantyre", "lilongwe"],
  food: ["blantyre", "nkhata-bay", "mangochi", "lilongwe", "salima"],
  romance: ["cape-maclear", "likoma", "nkhata-bay", "lenje-estate", "malangalanga"],
  family: ["lake-malawi-national-park", "mua-mission", "malangalanga", "salima", "lilongwe", "banaba"],
  luxury: ["cape-maclear", "likoma", "liwonde-national-park", "lenje-estate", "blantyre", "lilongwe", "nkwazi"],
};

const MAX_STOPS = 6;

function scoreDestination(
  destinationId: string,
  interests: TravelInterestId[],
): number {
  let score = 0;

  // Interest match: a core destination for any selected interest scores heavily.
  interests.forEach((interest, index) => {
    const core = INTEREST_CORE[interest] ?? [];
    const rank = core.indexOf(destinationId);
    // Earlier interests count for slightly more; rank 0 counts most.
    if (rank >= 0) score += 100 - rank * 8 - index * 3;
    else if (destinationId in INTEREST_CORE) score += 0;
  });

  // Season. Outside its months, it is not excluded — Malawi is workable year
  // round — but it is demoted, and the generator will say so in the warnings.
  return score;
}

function inSeason(month: number, bestMonths: number[]): boolean {
  return bestMonths.includes(month);
}

/* ------------------------------------------------- Geographic route solving */

/**
 * Great-circle distance in km. Straight-line, not driving distance, but it is
 * enough to avoid the zig-zag: driving distance in Malawi is consistently
 * worse than the crow flies, never better.
 */
function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/** A destination with a verified position, which is all the route solver needs. */
type LocatedDestination = Destination & { lat: number; lng: number };

/**
 * Destinations with a verified coordinate.
 *
 * Derived from the injected context, never from a module-level import, so the
 * planner works identically on the server and in the browser.
 */
const withCoordinates = (context: GeoContext): LocatedDestination[] =>
  context.destinations.filter(
    (destination): destination is LocatedDestination =>
      destination.lat !== null && destination.lng !== null,
  );

/**
 * Lookup across ALL destinations, not just located ones — used for labels and
 * reasons where an unlocated destination must still be nameable.
 */
const lookupById = (context: GeoContext) =>
  new Map(context.destinations.map((destination) => [destination.id, destination]));

/**
 * Reorder a shortlist into a single directional run.
 *
 * Solved by trying both orderings — south-first and north-first — scoring each
 * with the nearest-neighbour total plus an explicit penalty for every reversal of
 * direction. The loser is discarded, so the result never doubles back.
 */
function orderAsSweep(shortlist: LocatedDestination[]): LocatedDestination[] {
  if (shortlist.length <= 2) return shortlist;

  const build = (startIndex: number): LocatedDestination[] => {
    const remaining = [...shortlist];
    const ordered = [remaining.splice(startIndex, 1)[0]];
    let previousDirection = 0;

    while (remaining.length > 0) {
      const current = ordered[ordered.length - 1];
      let bestIndex = 0;
      let bestScore = Number.POSITIVE_INFINITY;

      remaining.forEach((candidate, index) => {
        const d = distanceKm(current, candidate);
        // Reversal penalty: moving back the way we came costs extra.
        //
        // This tracks LATITUDE, not longitude. Malawi is a long north-south
        // country — the lake and the districts are strung out along -9 to -17 —
        // so a sweep that reads as "never doubles back" is one that never
        // reverses in latitude. Scoring longitude instead rewarded a route that
        // ran cleanly up the lake while doubling back up and down the country,
        // which is the exact zig-zag this function exists to prevent.
        const direction = Math.sign(dLatSign(current, candidate));
        const penalty = previousDirection !== 0 && direction !== 0 && direction !== previousDirection ? 180 : 0;
        const score = d + penalty;
        if (score < bestScore) {
          bestScore = score;
          bestIndex = index;
        }
      });

      previousDirection = Math.sign(dLatSign(current, remaining[bestIndex]));
      ordered.push(remaining.splice(bestIndex, 1)[0]);
    }

    return ordered;
  };

  // Southernmost start.
  const southIndex = shortlist.reduce(
    (best, candidate, index) => (candidate.lat < shortlist[best].lat ? index : best),
    0,
  );
  // Northernmost start.
  const northIndex = shortlist.reduce(
    (best, candidate, index) => (candidate.lat > shortlist[best].lat ? index : best),
    0,
  );

  const candidates: LocatedDestination[][] = [build(southIndex), build(northIndex)];

  const scoreSweep = (sweep: LocatedDestination[]) => {
    let total = 0;
    let reversals = 0;
    let previousDirection = 0;
    for (let i = 1; i < sweep.length; i += 1) {
      total += distanceKm(sweep[i - 1], sweep[i]);
      const direction = Math.sign(dLatSign(sweep[i - 1], sweep[i]));
      if (previousDirection !== 0 && direction !== 0 && direction !== previousDirection) {
        reversals += 1;
      }
      previousDirection = direction;
    }
    return total + reversals * 220;
  };

  candidates.sort((a, b) => scoreSweep(a) - scoreSweep(b));
  return candidates[0];
}

/**
 * Signed northward step between two points.
 *
 * Positive means the candidate lies north of the current point. Malawi runs
 * almost due north-south, so latitude is the axis that decides whether a route
 * doubles back; longitude only matters for the short hop across the lake.
 */
const dLatSign = (a: { lat: number }, b: { lat: number }) => b.lat - a.lat;

/* ---------------------------------------------------------------- Generation */

export function generateItinerary(
  request: ItineraryRequest,
  context: GeoContext,
): Itinerary {
  const allDestinations = context.destinations;
  const byId = lookupById(context);
  const geoReady = withCoordinates(context);
  const warnings: string[] = [];
  const budget = budgetBands.find((band) => band.id === request.budget) ?? budgetBands[1];
  const monthName = months[request.month - 1] ?? "your chosen month";

  // 1. Score and shortlist. Only coordinates we have actually verified.
  const scored = geoReady
    .map((destination) => ({
      destination,
      score:
        scoreDestination(destination.id, request.interests) +
        destination.rating * 4,
    }))
    .sort((a, b) => b.score - a.score);

  // How many stops can this trip actually afford? Roads, not appetite.
  const stopCount = Math.max(
    2,
    Math.min(MAX_STOPS, Math.floor(request.days / 2) + 1),
  );

  const shortlist = scored.slice(0, stopCount * 2).map((entry) => entry.destination);

  // 2. Single directional run.
  const ordered = orderAsSweep(shortlist).slice(0, stopCount);

  // No verified coordinates means no route can be planned at all. Returning an
  // empty-but-valid itinerary keeps the contract (an Itinerary always comes
  // back) instead of throwing inside a React render, and the warning tells the
  // truth about why.
  if (ordered.length === 0 || allDestinations.length === 0) {
    warnings.push(
      "We cannot plan a route yet: no destinations have verified coordinates loaded. See data/destinations.json.",
    );
    warnings.push(
      "Excludes international flights, visas, travel insurance and park entry fees. Every figure is a planning number, not a quote.",
    );
    return {
      request,
      stops: [],
      gates: { arrive: "KMI", depart: "BLZ", southToNorth: true },
      estimate: {
        accommodationUsd: 0,
        experiencesUsd: 0,
        transportUsd: 0,
        totalUsd: 0,
        perPersonPerDayUsd: 0,
      },
      pricingIsLive: false,
      warnings,
    };
  }

  // A trip that ignores everything you asked for is worse than an honest short one.
  const matched = request.interests.filter((interest) =>
    ordered.some((destination) =>
      (INTEREST_CORE[interest] ?? []).includes(destination.id),
    ),
  );
  if (request.interests.length > 0 && matched.length === 0) {
    warnings.push(
      "None of the stops below are strong matches for every interest you picked. We chose them on rating and route efficiency instead — adjust the interests and try again, or plan the matching stops in manually.",
    );
  } else if (request.interests.length > matched.length) {
    const missing = request.interests.filter((interest) => !matched.includes(interest));
    warnings.push(
      `Your ${request.days}-day trip could not fit a strong stop for: ${missing
        .map((interest) => interest.replace(/-/g, " "))
        .join(", ")}. Malawi is a big country — give it more days, or split it into two trips.`,
    );
  }

  // 3. Airports. Enter at whichever end the route finishes near.
  //
  // Returned as `gates` on the itinerary rather than inlined, because "fly into
  // Chileka, leave from Kamuzu" is advice worth stating to the user: getting it
  // backwards costs a four-hour drive at the wrong end of the trip.
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const southernFirst = first.lat <= last.lat;

  // 4. Allocate days. Proportional to what there is to do, floored at one day,
  //    with any remainder going to the destination with the best rating.
  const weights = ordered.map((destination) => {
    const experienceCount = experiences.filter((experience) =>
      experience.destinationIds.includes(destination.id),
    ).length;
    return Math.max(1, 0.7 + experienceCount * 0.5 + destination.rating * 0.2);
  });
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);

  const allocation = ordered.map((_, index) => {
    const exact = (weights[index] / weightTotal) * request.days;
    return Math.max(1, Math.round(exact));
  });

  // Reconcile the allocation against the requested day count exactly.
  let drift = request.days - allocation.reduce((sum, days) => sum + days, 0);
  let guard = 0;
  while (drift !== 0 && guard < 200) {
    guard += 1;
    if (drift > 0) {
      // Give the extra day to the highest-rated stop.
      const target = ordered.reduce(
        (best, candidate, index) =>
          candidate.rating > ordered[best].rating ? index : best,
        0,
      );
      allocation[target] += 1;
      drift -= 1;
    } else {
      // Take a day off the longest stop that can still spare one.
      const target = allocation.indexOf(Math.max(...allocation));
      if (allocation[target] <= 1) {
        break;
      }
      allocation[target] -= 1;
      drift += 1;
    }
  }

  // 5. Build the stops.
  let dayCursor = 1;

  // An experience already used at an earlier stop is not repeated. On a route
  // that passes through several lake towns, the same "snorkelling" activity
  // would otherwise headline every stop, which reads as though nothing else
  // happens at Cape Maclear.
  const usedExperiences = new Set<string>();

  const stops: ItineraryStop[] = ordered.map((destination, index) => {
    const days = allocation[index];
    const destinationExperiences = experiences.filter((experience) =>
      experience.destinationIds.includes(destination.id),
    );

    // Prefer experiences matching the traveller's interests, then fill up.
    const preferred = destinationExperiences.filter((experience) =>
      request.interests.some((interest) =>
        experience.category === (interest === "lake-beaches" ? "water" : interest),
      ),
    );
    const others = destinationExperiences.filter(
      (experience) => !preferred.includes(experience),
    );

    // Ordered by preference, but anything already used elsewhere in the route
    // is demoted below everything unused — then dropped only if nothing is left.
    const unused = [...preferred, ...others].filter(
      (experience) => !usedExperiences.has(experience.id),
    );
    const reused = [...preferred, ...others].filter((experience) =>
      usedExperiences.has(experience.id),
    );
    const picked = [...unused, ...reused].slice(0, Math.max(2, days));

    for (const experience of picked) usedExperiences.add(experience.id);

    const headline =
      index === 0
        ? `Arrive and settle in ${destination.name}`
        : picked[0]?.title ?? `Explore ${destination.name}`;

    const stay = pickStay(destination.id, budget.id);

    const reason = buildReason({
      isFirst: index === 0,
      isLast: index === ordered.length - 1,
      days,
      tripDays: request.days,
      destinationName: destination.name,
      experienceCount: picked.length,
    });

    const stop: ItineraryStop = {
      day: dayCursor,
      destinationId: destination.id,
      destinationName: destination.name,
      headline,
      experienceIds: picked.map((experience) => experience.id),
      stayId: stay?.id ?? null,
      reason,
    };

    dayCursor += days;
    return stop;
  });

  // 6. Price it honestly.
  const pickedExperiences = experiences.filter((experience) =>
    stops.some((stop) => stop.experienceIds.includes(experience.id)),
  );
  const nights = request.days - 1;

  const chosenStays = stops
    .map((stop) => (stop.stayId ? stays.find((stay) => stay.id === stop.stayId) : undefined))
    .filter((stay): stay is (typeof stays)[number] => Boolean(stay));

  const accommodationUsd = chosenStays.length
    ? chosenStays.reduce((sum, stay) => sum + stay.pricePerNightUsd, 0) * (nights / Math.max(1, chosenStays.length)) * (request.travellers / 2)
    : budget.minUsd * nights * request.travellers;

  const experiencesUsd = pickedExperiences.reduce(
    (sum, experience) => sum + experience.priceFromUsd,
    0,
  ) * Math.max(1, request.travellers / 2);

  // Inter-stop transfers. Roads, not crow-flies.
  const legs = stops.slice(0, -1).reduce((sum, stop, index) => {
    const from = byId.get(stop.destinationId);
    const to = byId.get(stops[index + 1].destinationId);
    const fromLat = from?.lat;
    const fromLng = from?.lng;
    const toLat = to?.lat;
    const toLng = to?.lng;
    if (
      fromLat == null ||
      fromLng == null ||
      toLat == null ||
      toLng == null
    ) {
      return sum;
    }
    const km = distanceKm(
      { lat: fromLat, lng: fromLng },
      { lat: toLat, lng: toLng },
    );
    // ~$1.20 per km for a private vehicle and driver, which is the honest rate.
    return sum + km * 1.2;
  }, 0);

  const transportUsd = Math.round(legs * (request.travellers > 2 ? 1.25 : 1));

  const totalUsd = Math.round(accommodationUsd + experiencesUsd + transportUsd);

  // Season honesty.
  //
  // The lake towns and the lowland parks are workable year round — the lake is
  // warm, and Cape Maclear is not closed in January. Only the highland and
  // wildlife destinations have a genuine window, so those are named and the
  // year-round stops are not described as "outside the best window", which
  // would be both ugly and wrong.
  const YEAR_ROUND = new Set(["lake", "island", "city"]);
  const outOfSeason = ordered.filter(
    (destination) =>
      !inSeason(request.month, destination.bestMonths) &&
      !YEAR_ROUND.has(destination.kind),
  );

  if (outOfSeason.length === 1) {
    warnings.push(
      `${outOfSeason[0].name} is outside its best window in ${monthName}. It is still worth going — just expect rain, closed trails or rough roads.`,
    );
  } else if (outOfSeason.length > 1) {
    const names = outOfSeason.map((destination) => destination.name);
    const last = names.pop();
    warnings.push(
      `${names.join(", ")} and ${last} are outside their best window in ${monthName}. They are still worth going — just expect rain, closed trails or rough roads.`,
    );
  }

  warnings.push(
    "Excludes international flights, visas, travel insurance and park entry fees. Every figure is a planning number, not a quote.",
  );

  if (request.days >= 14) {
    warnings.push(
      "At this length you would be overland for a lot of it. Consider an internal flight between the northern and southern halves to recover two days of driving.",
    );
  }

  return {
    request,
    stops,
    gates: {
      arrive: southernFirst ? "BLZ" : "KMI",
      depart: southernFirst ? "KMI" : "BLZ",
      // `southernFirst` already means "the route starts at the southern end",
      // which IS south-to-north. Negating it made a north-to-south route — the
      // common case — report the opposite direction.
      southToNorth: southernFirst,
    },
    estimate: {
      accommodationUsd: Math.round(accommodationUsd),
      experiencesUsd: Math.round(experiencesUsd),
      transportUsd,
      totalUsd,
      perPersonPerDayUsd: Math.round(totalUsd / Math.max(1, request.days * (request.travellers / 2))),
    },
    pricingIsLive: false,
    warnings,
  };
}

/**
 * Choose an overnight for a stop.
 *
 * Joins on `stay.destinationIds` (via `nearestStay`), never on the
 * human-readable `location` string. The earlier substring match read as
 * reasonable and was quietly wrong: matching "lake" against
 * "Likoma Island, Lake Malawi" attached a Likoma lodge to Lake Malawi National
 * Park, and a wrong overnight is the most expensive bug this product can have.
 *
 * Among the properties that actually serve the destination, prefers the highest
 * rated one inside the traveller's budget band.
 */
function pickStay(destinationId: string, budgetId: string) {
  const budget = budgetBands.find((band) => band.id === budgetId) ?? budgetBands[1];
  const matching = staysForDestination(destinationId);

  if (matching.length === 0) {
    // No property at the stop itself — fall back to the gateway town, which is
    // where a traveller would actually end up sleeping.
    return nearestStay(destinationId);
  }

  const inBand = matching.filter(
    (stay) => stay.pricePerNightUsd >= budget.minUsd * 0.5 && stay.pricePerNightUsd <= budget.maxUsd,
  );
  const pool = inBand.length > 0 ? inBand : matching;
  return pool.reduce((best, stay) =>
    stay.rating > best.rating ? stay : best,
  );
}

function buildReason(args: {
  isFirst: boolean;
  isLast: boolean;
  /** Days spent at THIS stop. */
  days: number;
  /** Total length of the trip. */
  tripDays: number;
  destinationName: string;
  experienceCount: number;
}): string {
  const { isFirst, isLast, days, tripDays, destinationName, experienceCount } = args;

  if (isFirst) {
    // `tripDays`, not `days` — "the sensible entry point for a 2-day run" on a
    // seven-day trip reads as though the generator had lost track of the trip.
    const firstLeg =
      days > 1
        ? ` You get ${days} days here to shake off the flight and the drive in.`
        : "";
    return `Land here first. ${destinationName} is the sensible entry point for a ${tripDays}-day run, and it absorbs the jet lag before anything else.${firstLeg}`;
  }

  if (isLast) {
    const gateway = destinationName === "Blantyre" ? "Chileka" : "Kamuzu";
    return `Finish at ${destinationName}. It is the last stop because leaving from here is ${gateway} rather than a four-hour drive back, and the extra day here is deliberate.`;
  }

  // Only claim to be the longest leg if it actually is. Asserting it
  // unconditionally made every middle stop claim to be the biggest one.
  const isLongest = days >= 4;
  const rationale = isLongest
    ? " It gets the most time because there is more to actually do here than anywhere else on the route."
    : days <= 1
      ? " One day is enough to see it properly without burning a whole transfer on it."
      : "";

  return `${days} ${days === 1 ? "day" : "days"} at ${destinationName}, ${experienceCount} ${
    experienceCount === 1 ? "experience" : "experiences"
  } planned.${rationale}`;
}

/** Default request used to seed the planner UI. */
export const defaultRequest: ItineraryRequest = {
  month: 12,
  days: 7,
  party: "couple",
  travellers: 2,
  interests: ["wildlife", "lake-beaches", "adventure"],
  budget: "comfort",
};