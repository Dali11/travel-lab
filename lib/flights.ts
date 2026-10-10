/**
 * Flights to and from Malawi — curated route data.
 *
 * Why this is a guide and not a live search box: as of 2026 there is no free
 * self-serve fare API with usable coverage of Malawian routes. Amadeus
 * Self-Service has been decommissioned and Kiwi Tequila is closed to new
 * developers, so the remaining options are paid metasearch scrapes or a
 * booking API that charges per search — a bad fit for a site whose users browse
 * far more than they book.
 *
 * Instead of a search box that returns nothing, this is the useful layer:
 * who actually flies these routes, what to expect, and where to check a live
 * price. Affiliate deeplinks carry the monetisation.
 *
 * Airline and route details change. Verify before relying on them commercially.
 */

export type Airline = {
  name: string;
  code: string;
  hub: string;
  serves: string[];
  note: string;
  /** Set where a public affiliate programme exists. */
  affiliate?: {
    program: string;
    url: string;
    commission?: string;
  };
};

export const airlines: Airline[] = [
  {
    name: "Malawian Airlines",
    code: "MK",
    hub: "Lilongwe (KMI), Blantyre (BLZ)",
    serves: ["Lilongwe", "Blantyre", "Nairobi", "Johannesburg", "Durban"],
    note:
      "The national carrier. Codeshares with Ethiopian Airlines on a large share of its network, which is often the cheapest way to reach Nairobi and Addis Ababa.",
  },
  {
    name: "Ethiopian Airlines",
    code: "ET",
    hub: "Addis Ababa (ADD)",
    serves: ["Lilongwe", "Nairobi", "Johannesburg", "Dubai", "Lusaka"],
    note:
      "The main international gateway. Runs the deepest schedule of anything serving Malawi and has an affiliate programme paying per completed booking — the practical way this site earns.",
    affiliate: {
      program: "CJ Affiliate",
      url: "https://www.ethiopianairlines.com/",
      commission: "around 1.3% per booking",
    },
  },
  {
    name: "Kenya Airways",
    code: "KQ",
    hub: "Nairobi (NBO)",
    serves: ["Lilongwe", "Johannesburg", "London"],
    note: "Frequent daily service between Lilongwe and Nairobi, with onward connections across Africa.",
  },
  {
    name: "Airtel / regional carriers",
    code: "—",
    hub: "Lilongwe (KMI)",
    serves: ["Johannesburg", "Lusaka", "Dar es Salaam", "Harare"],
    note:
      "Regional capacity on the Lilongwe axis is thinner and fares vary sharply with season and day of week. Treat anything sold as a direct on these routes as worth checking against a connection through Johannesburg or Nairobi.",
  },
  {
    name: "Qatar Airways / Turkish Airlines",
    code: "QR / TK",
    hub: "Doha (DOH), Istanbul (IST)",
    serves: ["Lilongwe via connection"],
    note:
      "Long-haul travellers usually connect rather than fly direct. Both sell Malawi as an onward destination and both run affiliate programmes.",
  },
];

export type Airport = {
  code: string;
  name: string;
  city: string;
  note: string;
};

export const airports: Airport[] = [
  {
    code: "KMI",
    name: "Kamuzu International Airport",
    city: "Lilongwe",
    note:
      "The main international gateway and where most itineraries connect. Forty minutes from Lilongwe city.",
  },
  {
    code: "BLZ",
    name: "Chileka International Airport",
    city: "Blantyre",
    note:
      "The southern gateway and much closer to Liwonde and the Zomba Plateau. Fewer international departures than Kamuzu.",
  },
];

export type FareTip = { title: string; detail: string };

export const fareTips: FareTip[] = [
  {
    title: "Book the Lilongwe axis early",
    detail:
      "Kamuzu–Johannesburg and Kamuzu–Nairobi are the two routes with real competition. Fares respond to booking lead time in the normal way.",
  },
  {
    title: "Check the regional hops carefully",
    detail:
      "Lilongwe to Lusaka, Dar es Salaam or Harare can look cheap as a direct and turn out to be a code-share with a connection anyway. Verify whether the ticket is genuinely direct.",
  },
  {
    title: "July and August are expensive",
    detail:
      "Both Malawian school holidays and international summer holidays land in the same two months. If you have flexibility, late May, June or September costs noticeably less.",
  },
  {
    title: "Codeshare flights price differently",
    detail:
      "A flight sold as Malawian Airlines but operated by Ethiopian can carry a different fare rules set. Baggage allowances in particular are frequently set by the marketing carrier.",
  },
];

/** Where to check a live price. No affiliate links are fabricated here. */
export const priceCheckers = [
  { name: "Google Flights", url: "https://www.google.com/travel/flights" },
  { name: "Skyscanner", url: "https://www.skyscanner.net/" },
  { name: "Ethiopian Airlines", url: "https://www.ethiopianairlines.com/" },
  { name: "Kenya Airways", url: "https://www.kenya-airways.com/" },
];