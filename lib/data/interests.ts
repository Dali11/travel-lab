import type { TravelInterest } from "../types";

/**
 * The eight ways people come to Malawi.
 *
 * These are the entry point to the whole product. Each one is a doorway into a
 * set of destinations and experiences rather than a category page, which is the
 * difference between a directory and a travel product.
 *
 * `photo` keys resolve against data/photos.json via `resolvePhoto()` in
 * lib/photos.ts, so the image manifest can be swapped for a CDN or CMS later
 * without editing this file.
 */
export const interests: TravelInterest[] = [
  {
    id: "wildlife",
    label: "Wildlife",
    tagline: "Elephant herds, antelope and big skies",
    photo: "wildlife-elephant",
    destinationIds: [
      "liwonde-national-park",
      "nyika-national-park",
      "kasungu-national-park",
      "teza-national-park",
      "lake-malawi-national-park",
      "liwonde",
    ],
    accent: "#2F5D43",
  },
  {
    id: "lake-beaches",
    label: "Lake & Beaches",
    tagline: "Clear water, white sand, no waves",
    photo: "cape-maclear",
    destinationIds: [
      "cape-maclear",
      "lake-malawi-national-park",
      "nkhata-bay",
      "likoma",
      "chizumulu",
      "monkey-bay",
      "mangochi",
    ],
    accent: "#0B6E7A",
  },
  {
    id: "adventure",
    label: "Adventure",
    tagline: "Summits, gorges and cold rivers",
    photo: "mount-mulanje",
    destinationIds: [
      "mount-mulanje",
      "zomba-plateau",
      "mount-walale",
      "likoma",
      "viphya",
      "malangalanga",
    ],
    accent: "#A9603C",
  },
  {
    id: "culture-people",
    label: "Culture & People",
    tagline: "The reason people keep coming back",
    photo: "traditional-dance",
    destinationIds: [
      "mua-mission",
      "livingstonia",
      "ntchisi",
      "nkhata-bay",
      "lilongwe",
      "blantyre",
    ],
    accent: "#E2703A",
  },
  {
    id: "food",
    label: "Food",
    tagline: "Nsima, fish and the market",
    photo: "malawian-food-nsima",
    destinationIds: ["blantyre", "lilongwe", "nkhata-bay", "mangochi", "zomba"],
    accent: "#D98A3C",
  },
  {
    id: "romance",
    label: "Romance",
    tagline: "Sunsets with no crowd",
    photo: "fisherfolk-lake",
    destinationIds: [
      "cape-maclear",
      "likoma",
      "nkhata-bay",
      "lenje-estate",
      "malangalanga",
    ],
    accent: "#C96A6A",
  },
  {
    id: "family",
    label: "Family",
    tagline: "Safe, gentle and enormous fun",
    photo: "village-children",
    destinationIds: [
      "lake-malawi-national-park",
      "mua-mission",
      "lilongwe",
      "malangalanga",
      "kumbali-island",
      "banaba",
    ],
    accent: "#4E8C7A",
  },
  {
    id: "luxury",
    label: "Luxury",
    tagline: "A handful of places worth splashing on",
    photo: "eco-lodge",
    destinationIds: ["cape-maclear", "likoma", "nkwazi", "blantyre", "lilongwe"],
    accent: "#3B5A6B",
  },
];

export const interestById = new Map(interests.map((interest) => [interest.id, interest]));