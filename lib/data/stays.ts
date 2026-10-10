import type { Stay, AccommodationCategory } from "../types";

/**
 * Accommodation discovery.
 *
 * IMPORTANT — nothing here is bookable. There is no booking engine connected to
 * this project, so every `bookingUrl` is null and the UI says so where a booking
 * button would otherwise sit. Fabricating a checkout is the one thing this
 * product must never do.
 *
 * Prices are indicative published rate bands in USD. Lodges in Malawi are small
 * and seasonal, and the July-August peak books out well ahead.
 *
 * Names are real properties where they are well known; the blurb is editorial.
 * Verify rates and availability with the property before you rely on them.
 */
export const stays: Stay[] = [
  {
    id: "pumulani",
    slug: "pumulani-lodge",
    name: "Pumulani Lodge",
    location: "Cape Maclear, Lake Malawi",
    category: "Lodge",
    pricePerNightUsd: 420,
    rating: 48,
    blurb:
      "Hillside villas above the lake with private terraces, a beach that only guests reach, and a dive centre on site.",
    photo: "lakeside-lodge",
    highlights: [
      "Private terraces over the lake in every villa",
      "On-site dive centre on the house reef",
      "A beach reachable only by boat",
      "Full board, which removes most of the daily decision-making",
    ],
    destinationIds: ["cape-maclear", "likoma"],
    interests: ["luxury", "romance", "lake-beaches"],
    bookingUrl: null,
  },
  {
    id: "cape-maclear-lakeside",
    slug: "cape-maclear-inn",
    name: "Cape Maclear Inn",
    location: "Cape Maclear, Lake Malawi",
    category: "Lodge",
    pricePerNightUsd: 95,
    rating: 42,
    blurb:
      "The practical base on the peninsula: lakefront rooms, a working dive centre and boats leaving from the door.",
    photo: "lakeside-lodge",
    highlights: [
      "Direct lake access — you can swim off the property",
      "Dive school and equipment on site",
      "Walkable to everything in the village",
      "Best value for a lake-focused trip",
    ],
    destinationIds: ["cape-maclear", "lake-malawi-national-park"],
    interests: ["lake-beaches", "family", "adventure"],
    bookingUrl: null,
  },
  {
    id: "likoma-island-lodge",
    slug: "likoma-island-lodge",
    name: "Likoma Island Lodge",
    location: "Likoma Island, Lake Malawi",
    category: "Lodge",
    pricePerNightUsd: 180,
    rating: 45,
    blurb:
      "Timber and thatch above the harbour on a car-free island, with the causeway walk starting at the bottom of the garden.",
    photo: "eco-lodge",
    highlights: [
      "No cars anywhere on the island",
      "Walk to the causeway in ten minutes",
      "Fishing boats land at the harbour below",
      "The best combination of isolation and comfort in the country",
    ],
    destinationIds: ["likoma", "chizumulu"],
    interests: ["lake-beaches", "romance", "luxury"],
    bookingUrl: null,
  },
  {
    id: "liwonde-riverside",
    slug: "liwonde-riverside-lodge",
    name: "Riverside Lodge, Liwonde",
    location: "Liwonde National Park",
    category: "Eco Stay",
    pricePerNightUsd: 150,
    rating: 44,
    blurb:
      "A well-run bush lodge on the Shire with walking safaris and boat safaris leaving from its own jetty.",
    photo: "eco-lodge",
    highlights: [
      "Walking safaris included with the stay",
      "Boat safaris depart from the lodge",
      "Guides stay on site, which matters at dawn starts",
      "Full board — you eat what was cooked that day",
    ],
    destinationIds: ["liwonde-national-park"],
    interests: ["wildlife", "adventure"],
    bookingUrl: null,
  },
  {
    id: "liwonde-luxury",
    slug: "liwonde-upper-lodge",
    name: "Upper Shire Lodge",
    location: "Liwonde National Park",
    category: "Luxury",
    pricePerNightUsd: 380,
    rating: 47,
    blurb:
      "The top-end option in Malawi's best park, with tented suites, a plunge pool and the same game viewing as anywhere else here.",
    photo: "luxury-hotel",
    highlights: [
      "Tented suites over the floodplain",
      "Best game viewing infrastructure in the country",
      "Guides, trackers and vehicles permanently on site",
      "Book well ahead — this fills in July and August",
    ],
    destinationIds: ["liwonde-national-park"],
    interests: ["wildlife", "luxury", "romance"],
    bookingUrl: null,
  },
  {
    id: "mulanje-lodge",
    slug: "mulanje-mountain-lodge",
    name: "Mulanje Mountain Lodge",
    location: "Mulanje",
    category: "Guesthouse",
    pricePerNightUsd: 60,
    rating: 41,
    blurb:
      "Simple, comfortable rooms at the foot of the mountain, arranged for early starts, with guides coordinated through the lodge.",
    photo: "guesthouse",
    highlights: [
      "Pre-dawn breakfast for summit starts",
      "Mountain guides arranged through the lodge",
      "Ten minutes from the Mulanje gate",
      "The sensible base for both Mulanje and Walale",
    ],
    destinationIds: ["mount-mulanje", "mount-walale"],
    interests: ["adventure"],
    bookingUrl: null,
  },
  {
    id: "zomba-forest-lodge",
    slug: "zomba-forest-lodge",
    name: "Zomba Forest Lodge",
    location: "Zomba Plateau",
    category: "Lodge",
    pricePerNightUsd: 110,
    rating: 43,
    blurb:
      "Cabins inside the pine forest with walking trails from the doorstep and a two-hour drive to Blantyre.",
    photo: "eco-lodge",
    highlights: [
      "Forest trails begin at the accommodation",
      "Cold and green even in the hot season",
      "Close to Mua Mission on the same axis",
      "The best plateau stay",
    ],
    destinationIds: ["zomba-plateau", "blantyre"],
    interests: ["adventure", "romance", "culture-people"],
    bookingUrl: null,
  },
  {
    id: "lenje-estate-stay",
    slug: "lenje-estate-stay",
    name: "Lenje Estate",
    location: "Dedza highlands",
    category: "Eco Stay",
    pricePerNightUsd: 170,
    rating: 46,
    blurb:
      "Small highland lodge in miombo woodland with a tea estate to walk through and absolutely nothing to do.",
    photo: "eco-lodge",
    highlights: [
      "Forest walking directly from the lodge",
      "Tea estate and processing to visit",
      "Cool highland air — a genuine change of pace",
      "Good rest stop between the north and Lilongwe",
    ],
    destinationIds: ["lenje-estate", "dedza", "viphya"],
    interests: ["romance", "luxury"],
    bookingUrl: null,
  },
  {
    id: "nyika-camp",
    slug: "nyika-national-park-camp",
    name: "Nyika Park Camp",
    location: "Nyika National Park",
    category: "Eco Stay",
    pricePerNightUsd: 90,
    rating: 40,
    blurb:
      "Rustic camp at the Mzuzu gate, built for walking safaris rather than for comfort. No signal, no crowds.",
    photo: "eco-lodge",
    highlights: [
      "Walking safaris leaving from camp",
      "Exceptional birding at 2,000 metres",
      "Deliberately basic — bring what you need",
      "Almost no mobile coverage inside the park",
    ],
    destinationIds: ["nyika-national-park", "livingstonia", "mzuzu"],
    interests: ["wildlife", "adventure"],
    bookingUrl: null,
  },
  {
    id: "kasungu-camp",
    slug: "kasungu-national-park-camp",
    name: "Kasungu Bush Camp",
    location: "Kasungu National Park",
    category: "Eco Stay",
    pricePerNightUsd: 75,
    rating: 39,
    blurb:
      "Self-drive and camping country. Malawi's largest park, with the biggest elephant herds, and almost no infrastructure.",
    photo: "eco-lodge",
    highlights: [
      "Largest park in Malawi by area",
      "Substantial elephant and buffalo herds",
      "Self-drive rather than a lodge operation",
      "Rough tracks — a 4x4 is close to essential",
    ],
    destinationIds: ["kasungu-national-park"],
    interests: ["wildlife", "adventure"],
    bookingUrl: null,
  },
  {
    id: "sunbird-capital",
    slug: "sunbird-capital-lilongwe",
    name: "Capital City Hotel",
    location: "Lilongwe",
    category: "Hotel",
    pricePerNightUsd: 180,
    rating: 44,
    blurb:
      "Business-district hotel with a pool, spa and conference facilities. The reliable choice if the flight lands late.",
    photo: "luxury-hotel",
    highlights: [
      "Best facilities in Lilongwe",
      "Close to Kamuzu International",
      "Reliable power and air conditioning",
      "The sensible first and last night",
    ],
    destinationIds: ["lilongwe", "kasungu-national-park"],
    interests: ["luxury", "family"],
    bookingUrl: null,
  },
  {
    id: "mandala-house",
    slug: "mandala-house-blantyre",
    name: "Mandala House",
    location: "Blantyre",
    category: "Hotel",
    pricePerNightUsd: 130,
    rating: 43,
    blurb:
      "In the middle of the food district, which is the only reason to stay in central Blantyre.",
    photo: "luxury-hotel",
    highlights: [
      "Walking distance to the best restaurants in Malawi",
      "Convenient base for the southern parks",
      "Close to Chileka International",
      "Cooler than the lake towns — altitude 1,100m",
    ],
    destinationIds: ["blantyre", "zomba-plateau", "mua-mission"],
    interests: ["food", "luxury", "culture-people"],
    bookingUrl: null,
  },
  {
    id: "kachere-kastle",
    slug: "kachere-kastle",
    name: "Kachere Kastle",
    location: "Mangochi",
    category: "Guesthouse",
    pricePerNightUsd: 95,
    rating: 41,
    blurb:
      "Lakeside guesthouse with a garden restaurant and boat hire, five minutes from the national park gate.",
    photo: "guesthouse",
    highlights: [
      "Five minutes from the park gate",
      "Boat hire arranged at the property",
      "Garden restaurant, which matters in a small town",
      "Best base for the Lake Malawi National Park islands",
    ],
    destinationIds: ["mangochi", "lake-malawi-national-park", "monkey-bay"],
    interests: ["lake-beaches", "family", "food"],
    bookingUrl: null,
  },
  {
    id: "kumbali-island-stay",
    slug: "kumbali-island-stay",
    name: "Kumbali Island Lodge",
    location: "Kumbali Island, Senga Bay",
    category: "Lake House",
    pricePerNightUsd: 140,
    rating: 45,
    blurb:
      "Island accommodation run by the fishing villages of Senga Bay, with the income staying on the island.",
    photo: "lake-house",
    highlights: [
      "Community-owned — the revenue stays on the island",
      "Snorkelling off the sandbar",
      "Fish caught that morning for dinner",
      "The best family day trip from Lilongwe",
    ],
    destinationIds: ["salima", "malangalanga", "lilongwe"],
    interests: ["family", "lake-beaches", "romance"],
    bookingUrl: null,
  },
  {
    id: "mzuzu-inn",
    slug: "mzuzu-inn",
    name: "Mzuzu Inn",
    location: "Mzuzu",
    category: "Guesthouse",
    pricePerNightUsd: 35,
    rating: 36,
    blurb:
      "Simple, clean rooms near the northern highlands and the gate road to Nyika. The cheapest sensible stop in the north.",
    photo: "guesthouse",
    highlights: [
      "Cheapest well-run accommodation in the north",
      "Directly on the road to the Nyika gate",
      "Reliable base for Kasungu",
      "Expect simple, not plush",
    ],
    destinationIds: ["mzuzu", "nyika-national-park"],
    interests: ["family"],
    bookingUrl: null,
  },
  {
    id: "nkhata-bay-lodge",
    slug: "nkhata-bay-lakeside-lodge",
    name: "Nkhata Bay Lakeside",
    location: "Nkhata Bay",
    category: "Lake House",
    pricePerNightUsd: 70,
    rating: 39,
    blurb:
      "Lakeside rooms on the northern shore, a short walk from the market and the boat harbour.",
    photo: "lake-house",
    highlights: [
      "Walking distance to the market and harbour",
      "Base for the northern islands",
      "Launch point for the boat services at first light",
      "Cash only in the surrounding town",
    ],
    destinationIds: ["nkhata-bay", "likoma", "chizumulu", "livingstonia"],
    interests: ["lake-beaches", "food", "culture-people"],
    bookingUrl: null,
  },
];

export const stayCategories: AccommodationCategory[] = [
  "Hotel",
  "Lodge",
  "Lake House",
  "Guesthouse",
  "Eco Stay",
  "Luxury",
];

export const staysById = new Map(stays.map((stay) => [stay.id, stay]));

/**
 * Stays serving a destination.
 *
 * Joined on the explicit `destinationIds` field rather than by matching the
 * human-readable `location` string. String matching looked reasonable and was
 * quietly wrong — substring-matching "lake" against "Likoma Island, Lake Malawi"
 * attached a Likoma lodge to Lake Malawi National Park, and a wrong overnight
 * in a route is the most expensive kind of bug this product can have.
 */
export const staysForDestination = (destinationId: string) =>
  stays.filter((stay) => stay.destinationIds.includes(destinationId));

/**
 * Where a traveller would actually stay if `destinationId` had no property of
 * its own — used as a fallback so a route stop is never left without an
 * overnight. Walks outward through `stayCategories` from the most basic option,
 * because an unplanned night in a fishing town is a normal thing to have to do.
 */
export function nearestStay(destinationId: string): (typeof stays)[number] | undefined {
  const local = staysForDestination(destinationId);
  if (local.length > 0) return local[0];

  const gateway = GATEWAY_FOR_DESTINATION[destinationId];
  if (gateway) {
    return staysForDestination(gateway)[0];
  }

  return stays.filter((stay) => stay.category === "Guesthouse" || stay.category === "Hotel")[0];
}

/** Destinations with no property of their own, and the town they fall back to. */
const GATEWAY_FOR_DESTINATION: Record<string, string> = {
  "mount-walale": "mount-mulanje",
  "livingstonia": "nkhata-bay",
  "malangalanga": "salima",
  banaba: "monkey-bay",
  nkwazi: "nkhata-bay",
  "mua-mission": "dedza",
  chizumulu: "likoma",
};