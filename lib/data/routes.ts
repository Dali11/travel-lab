import type { FlightRoute } from "../types";

/**
 * Getting to Malawi — route data.
 *
 * ============================================================================
 * THIS IS NOT LIVE FLIGHT DATA AND IS NOT PRESENTED AS ANY.
 * ============================================================================
 *
 * There is no free, self-serve flight fare API with usable coverage of
 * Malawian routes. Amadeus Self-Service has been decommissioned; Kiwi Tequila
 * is closed to new developers; aviationstack, AirLabs and FlightAware return
 * status and schedules but no fares in any tier. The remaining live options are
 * paid metasearch scrapes or per-search booking APIs.
 *
 * What follows is therefore a ROUTE SHAPE: who flies the corridor, who connects
 * where, roughly how long it takes. Block times are typical scheduled figures,
 * not today's schedule. Fares are deliberately absent — a stale fare shown on a
 * travel site is worse than no fare, because people book on it.
 *
 * `lib/flights.ts` still holds the deeper editorial on codeshares and fare
 * traps. When a real pricing source is connected, add `source` and
 * `fetchedAt` to FlightRoute in lib/types.ts and light up the live path.
 */

export type RouteCorridor = {
  id: string;
  originCity: string;
  originCountry: string;
  /** The gateway everything funnels through. */
  via: string;
  summary: string;
  /** What this corridor actually feels like as a journey. */
  character: string;
};

export const corridors: RouteCorridor[] = [
  {
    id: "africa-lilongwe",
    originCity: "Johannesburg",
    originCountry: "South Africa",
    via: "Direct to Lilongwe",
    summary: "The busiest corridor into Malawi, with real competition on fares.",
    character:
      "The one route where more than one airline is genuinely selling the same flight, which is why fares here respond to booking lead time in the normal way. A short hop, roughly an hour and a half, and it fills up fast in July and August.",
  },
  {
    id: "nairobi-lilongwe",
    originCity: "Nairobi",
    originCountry: "Kenya",
    via: "Direct to Lilongwe",
    summary: "The deepest scheduled service of anything serving Malawi.",
    character:
      "Kenya Airways and Ethiopian both run this, and Malawian Airlines codeshares on a large share of it. If you are coming from anywhere outside southern or eastern Africa, this is usually where your connection happens rather than in Europe.",
  },
  {
    id: "europe-lilongwe",
    originCity: "London",
    originCountry: "United Kingdom",
    via: "Doha, Dubai or Addis Ababa",
    summary: "Long-haul means connecting. There is no direct UK–Malawi service.",
    character:
      "Three gateways dominate: Doha on Qatar, Dubai on Emirates, and Addis Ababa on Ethiopian, which is the strongest of the three because it also has a domestic leg into Lilongwe. Book Addis or Nairobi rather than Doha or Dubai if you want to minimise total journey time.",
  },
  {
    id: "regional-lilongwe",
    originCity: "Dar es Salaam",
    originCountry: "Tanzania",
    via: "Lilongwe, often via Johannesburg or Nairobi",
    summary: "Thin regional capacity. Check carefully whether 'direct' really is.",
    character:
      "Lilongwe to Lusaka, Dar es Salaam or Harare can look cheap as a nonstop and turn out to be a code-share with a connection anyway. Treat any ticket sold as direct on these routes as worth verifying before you commit.",
  },
  {
    id: "blantyre-south",
    originCity: "Cape Town",
    originCountry: "South Africa",
    via: "Direct to Blantyre (Chileka)",
    summary: "The southern gateway, closer to Liwonde and the Zomba Plateau.",
    character:
      "Far fewer international departures than Kamuzu, and the frequency is the difference between the two airports. If your itinerary is in the south — Liwonde, Zomba, Cape Maclear — flying to Chileka can save you three hours of driving.",
  },
];

/** Route shapes. Typical block times, not a live schedule. */
export const routeShapes: FlightRoute[] = [
  {
    id: "jnb-kmi",
    fromCity: "Johannesburg",
    fromAirport: "OR Tambo (JNB)",
    toAirport: "Kamuzu (KMI)",
    airline: "Malawian Airlines",
    airlineCode: "MK",
    stops: "Non-stop",
    durationMinutes: 95,
  },
  {
    id: "nbo-kmi",
    fromCity: "Nairobi",
    fromAirport: "JKIA (NBO)",
    toAirport: "Kamuzu (KMI)",
    airline: "Kenya Airways",
    airlineCode: "KQ",
    stops: "Non-stop",
    durationMinutes: 100,
  },
  {
    id: "add-kmi",
    fromCity: "Addis Ababa",
    fromAirport: "Bole (ADD)",
    toAirport: "Kamuzu (KMI)",
    airline: "Ethiopian Airlines",
    airlineCode: "ET",
    stops: "Non-stop",
    durationMinutes: 340,
  },
  {
    id: "doh-kmi",
    fromCity: "Doha",
    fromAirport: "Hamad (DOH)",
    toAirport: "Kamuzu (KMI)",
    airline: "Qatar Airways",
    airlineCode: "QR",
    stops: "1 stop via ADD",
    durationMinutes: 640,
  },
  {
    id: "lhr-add-kmi",
    fromCity: "London",
    fromAirport: "Heathrow (LHR)",
    toAirport: "Kamuzu (KMI)",
    airline: "Ethiopian Airlines",
    airlineCode: "ET",
    stops: "1 stop via ADD",
    durationMinutes: 800,
    note: "The shortest total journey time from Europe on a single ticket.",
  },
  {
    id: "cpt-blz",
    fromCity: "Cape Town",
    fromAirport: "Cape Town (CPT)",
    toAirport: "Chileka (BLZ)",
    airline: "Airlink",
    airlineCode: "4Z",
    stops: "Non-stop",
    durationMinutes: 210,
  },
  {
    id: "lun-kmi",
    fromCity: "Lusaka",
    fromAirport: "Kenneth Kaunda (LUN)",
    toAirport: "Kamuzu (KMI)",
    airline: "Regional / codeshare",
    airlineCode: "—",
    stops: "Verify — often a connection",
    durationMinutes: 210,
  },
];

export type AirportGate = {
  code: string;
  name: string;
  city: string;
  /** Key into the verified coordinate set (data/destinations.json). */
  geoKey: string;
  note: string;
  gatewayFor: string[];
};

export const airportGates: AirportGate[] = [
  {
    code: "KMI",
    name: "Kamuzu International Airport",
    city: "Lilongwe",
    geoKey: "kamuzu-international-airport",
    note:
      "The main international gateway and where nearly every itinerary connects. Forty minutes from Lilongwe city.",
    gatewayFor: ["Everything in the north", "Liwonde", "Kasungu", "Mulanje", "Lake Malawi islands"],
  },
  {
    code: "BLZ",
    name: "Chileka International Airport",
    city: "Blantyre",
    geoKey: "chileka-international-airport",
    note:
      "The southern gateway, much closer to Liwonde and the Zomba Plateau. Fewer international departures than Kamuzu.",
    gatewayFor: ["Cape Maclear", "Liwonde National Park", "Zomba Plateau", "Mua Mission"],
  },
] as AirportGate[];

/** Where to check a live price. No affiliate links are fabricated here. */
export const priceCheckers = [
  { name: "Google Flights", url: "https://www.google.com/travel/flights" },
  { name: "Skyscanner", url: "https://www.skyscanner.net/" },
  { name: "Ethiopian Airlines", url: "https://www.ethiopianairlines.com/" },
  { name: "Kenya Airways", url: "https://www.kenya-airways.com/" },
  { name: "Malawian Airlines", url: "https://www.malawian-airlines.com/" },
];

/** Honest answer to "where do I actually fly to", shown wherever routes appear. */
export const flightDisclosure =
  "Route shapes below are typical scheduled corridors, not a live search. Travel Lab has no fare feed connected, so nothing here is a price you can book. Check a live price with one of the sources listed — they will quote today's actual fares.";

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
};