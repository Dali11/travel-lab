/**
 * Shared domain types for Travel Lab.
 *
 * These describe the shape the product is moving towards: Discovery →
 * Planning → Booking → Experience. Everything in `lib/data` is typed against
 * them, so the static editorial dataset and a future database or booking API
 * can be swapped without touching presentation components.
 */

export type DestinationKind =
  | "lake"
  | "mountain"
  | "park"
  | "city"
  | "island"
  | "reserve"
  | "plateau"
  | "river"
  | "cultural";

/** Things you can do, independent of where you do them. */
export type ExperienceCategory =
  | "wildlife"
  | "water"
  | "adventure"
  | "culture"
  | "food"
  | "romance"
  | "family"
  | "luxury"
  | "wellness";

export type TravelInterestId =
  | "wildlife"
  | "lake-beaches"
  | "adventure"
  | "culture-people"
  | "food"
  | "romance"
  | "family"
  | "luxury";

export type TravelInterest = {
  id: TravelInterestId;
  label: string;
  tagline: string;
  /** Key into the photo manifest (data/photos.json). */
  photo: string;
  /** Destinations that match this interest, by destination id. */
  destinationIds: string[];
  /** Accent used for the card's glow, so cards read as distinct places. */
  accent: string;
};

export type Destination = {
  id: string;
  slug: string;
  name: string;
  region: string;
  kind: DestinationKind;
  /** Short line used on cards: "Lake · Beach · Diving". */
  essence: string;
  summary: string;
  /** Editorial body copy for the destination page. */
  story: string;
  /** Practical notes — how to actually get there and what to expect. */
  practical: string[];
  /** Verified coordinates. Null when we have no verified source. */
  lat: number | null;
  lng: number | null;
  /** Where the coordinate came from. Kept so we never present a guess as fact. */
  coordinateSource: string | null;
  elevationM: number | null;
  rating: number;
  /** Best months to visit, as month numbers. */
  bestMonths: number[];
  interests: TravelInterestId[];
  /** Map legend category. */
  mapLayer: "destinations" | "wildlife" | "hiking" | "beaches";
  /**
   * Key into the verified photo manifest (data/photos.json). Optional: a
   * destination with no verified photograph still renders, as a colour field.
   */
  photo?: string;
};

export type Experience = {
  id: string;
  slug: string;
  title: string;
  category: ExperienceCategory;
  summary: string;
  detail: string;
  photo: string;
  /** Where this typically happens. */
  destinationIds: string[];
  /** Rough duration, used by the itinerary builder. */
  durationHours: number;
  /** Indicative price band. Never presented as a bookable quote. */
  priceFromUsd: number;
  /** True once a real booking integration exists. */
  bookable: boolean;
};

export type AccommodationCategory =
  | "Hotel"
  | "Lodge"
  | "Lake House"
  | "Guesthouse"
  | "Eco Stay"
  | "Luxury";

export type Stay = {
  id: string;
  slug: string;
  name: string;
  location: string;
  category: AccommodationCategory;
  pricePerNightUsd: number;
  /** Out of 50, matching the existing hotels.rating column convention. */
  rating: number;
  blurb: string;
  photo: string;
  /**
   * Destinations this property serves, by destination id.
   *
   * Explicit rather than inferred from the `location` string: substring matching
   * "lake" against a location reliably attached the wrong lodge to the wrong
   * place, and a wrong overnight on a route is the single most expensive bug
   * this product can have.
   */
  destinationIds: string[];
  /** What makes it worth staying, for the detail view. */
  highlights: string[];
  interests: TravelInterestId[];
  /** Populated when a real booking engine is connected. Never fabricated. */
  bookingUrl: string | null;
};

export type FlightRoute = {
  id: string;
  fromCity: string;
  fromAirport: string;
  toAirport: string;
  airline: string;
  airlineCode: string;
  /** Non-stop when genuinely non-stop; "1 stop" etc. otherwise. */
  stops: string;
  /** Scheduled block time in minutes. Planning figure, not a live schedule. */
  durationMinutes: number;
  /** Miles on the great-circle route, for context on the map. */
  note?: string;
};

export type Airport = {
  code: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  note: string;
};

/* ---------------------------------------------------------------- Itinerary */

export type TripParty = "solo" | "couple" | "family" | "group";

export type BudgetBand = {
  id: string;
  label: string;
  /** Inclusive USD per person, per day, excluding international flights. */
  minUsd: number;
  maxUsd: number;
  description: string;
};

export type ItineraryRequest = {
  /** Month number 1-12. */
  month: number;
  days: number;
  party: TripParty;
  travellers: number;
  interests: TravelInterestId[];
  budget: BudgetBand["id"];
};

export type ItineraryStop = {
  day: number;
  destinationId: string;
  destinationName: string;
  headline: string;
  /** One or two experiences slotted into this day. */
  experienceIds: string[];
  /** Suggested overnight, if we have a stay at that destination. */
  stayId: string | null;
  /** Why the day looks like this — shown so the plan is explainable. */
  reason: string;
};

export type Itinerary = {
  request: ItineraryRequest;
  stops: ItineraryStop[];
  /**
   * Which airport to fly into and out of.
   *
   * Solved from the direction of the route: if the run goes south to north you
   * land at Chileka and leave from Kamuzu, and the reverse if it goes the other
   * way. This is the single most useful piece of advice the generator can give,
   * because getting it backwards costs a four-hour drive at the wrong end of
   * the trip.
   */
  gates: {
    arrive: "KMI" | "BLZ";
    depart: "KMI" | "BLZ";
    /** True when the route runs south to north. */
    southToNorth: boolean;
  };
  /** Honest estimate. Explicitly a planning figure, not a quote. */
  estimate: {
    accommodationUsd: number;
    experiencesUsd: number;
    transportUsd: number;
    totalUsd: number;
    perPersonPerDayUsd: number;
  };
  /** Set once a live pricing source is connected. */
  pricingIsLive: false;
  warnings: string[];
};

/* ------------------------------------------------------------------ Filters */

export type MapFilterId =
  | "destinations"
  | "hotels"
  | "experiences"
  | "wildlife"
  | "hiking"
  | "beaches"
  | "restaurants"
  | "airports"
  | "routes";