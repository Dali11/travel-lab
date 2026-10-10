import fs from "node:fs";
import path from "node:path";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import type { Destination, Airport } from "../types";
import { editorialDestinations } from "./destinations";
import { experiences } from "./experiences";
import { stays } from "./stays";
import { interests } from "./interests";
import { airportGates } from "./routes";

/**
 * Data merge layer.
 *
 * Two sources, deliberately kept apart:
 *
 *   - `lib/data/*.ts`  — editorial. Written by a human. Story, summary,
 *                        practical notes, ratings. Knows nothing about geography.
 *   - `data/*.json`    — verified facts. Coordinates from Wikipedia, Wikidata
 *                        and GeoNames, each with the source URL it came from.
 *                        Photographs, each verified to return HTTP 200 with its
 *                        licence recorded.
 *
 * This module joins them. If a coordinate was never verified, the destination
 * still exists everywhere except the map — it is dropped from the GeoJSON rather
 * than being placed at a plausible-looking guess. A marker in the wrong place is
 * worse than no marker.
 *
 * Everything here is static and importable from server components. There is no
 * fetch, so nothing here costs a round trip at request time.
 */

/* ---------------------------------------------------------------- Geo data */

export type VerifiedGeo = {
  id: string;
  name?: string;
  lat: number;
  lng: number;
  elevationM?: number | null;
  source: string;
  bbox?: { sw: [number, number]; ne: [number, number] };
};

type GeoFile = {
  _bbox?: { sw: [number, number]; ne: [number, number] };
  _airports?: VerifiedGeo[];
} & Record<string, VerifiedGeo>;

function readJson<T>(relative: string): T | null {
  try {
    // Scoped to a literal subfolder, which is what Turbopack needs to statically
    // analyse a filesystem call in a server component. Passing `process.cwd()`
    // plus a free-form relative path works at runtime but defeats the bundler's
    // tracing and warns on every build.
    const file = path.join(process.cwd(), "data", path.basename(relative));
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch (error) {
    // A malformed manifest must never take the site down. The UI degrades to
    // "no coordinates available" rather than a 500.
    console.warn(`[travel-lab] could not read ${relative}:`, error);
    return null;
  }
}

const geoFile = readJson<GeoFile>("data/destinations.json");
const photoFile = readJson<{ [id: string]: PhotoEntry }>("data/photos.json");

export type PhotoEntry = {
  url: string;
  credit: string;
  license: string;
  attributionUrl?: string;
};

/** Malawi's bounding box, verified. Falls back to the published national extent. */
export const malawiBbox: { sw: [number, number]; ne: [number, number] } =
  geoFile?._bbox ?? {
    sw: [-17.133, 32.667],
    ne: [-8.6, 35.917],
  };

/** Verified airports, for the map's airport layer. */
export const verifiedAirports: Airport[] = (geoFile?._airports ?? []).map((entry) => ({
  code: entry.id.toUpperCase().includes("KAMUZU")
    ? "KMI"
    : entry.id.toUpperCase().includes("CHILEKA")
      ? "BLZ"
      : entry.id.toUpperCase(),
  name: entry.name ?? entry.id,
  city: entry.id.includes("kamuzu") ? "Lilongwe" : "Blantyre",
  lat: entry.lat,
  lng: entry.lng,
  note:
    airportGates.find((gate) => gate.geoKey === entry.id)?.note ??
    "Airport coordinates verified from the source listed in data/destinations.json.",
}));

/* ------------------------------------------------------- Merge destinations */

export const destinations: Destination[] = editorialDestinations.map((editorial) => {
  const geo = geoFile?.[editorial.id];
  return {
    ...editorial,
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
    coordinateSource: geo?.source ?? null,
    elevationM: geo?.elevationM ?? null,
  };
});

export const destinationById = new Map(destinations.map((d) => [d.id, d]));
export const destinationBySlug = new Map(destinations.map((d) => [d.slug, d]));

/** Only destinations with a verified position. This is what the map renders. */
export const geoDestinations = destinations.filter(
  (destination): destination is Destination & { lat: number; lng: number } =>
    destination.lat !== null && destination.lng !== null,
);

/** Where `photoFor` looked and did not find anything, so components can show the
 *  designed colour field instead of a broken image. */
export const missingPhotoKeys: string[] = (() => {
  const wanted = [
    ...destinations.map((d) => d.photo),
    ...experiences.map((e) => e.photo),
    ...stays.map((s) => s.photo),
  ].filter((key): key is string => typeof key === "string" && key.length > 0);

  const unique = [...new Set(wanted)];
  return unique.filter((key) => !photoFile?.[key]);
})();

/** Destinations that exist editorially but have no verified coordinate. */
export const unlocatedDestinations = destinations.filter(
  (destination) => destination.lat === null,
);

/* ------------------------------------------------------------------ Photos */

/**
 * The full photograph manifest, keyed by id.
 *
 * Exported so the footer can render the CC attribution line that the licences
 * require. Empty when `data/photos.json` is absent, in which case every image on
 * the site falls back to a designed colour field and there is nothing to credit.
 */
export const photoManifest: Record<string, PhotoEntry> = photoFile ?? {};

export function photoFor(key: string | undefined): PhotoEntry | null {
  if (!key) return null;
  return photoManifest[key] ?? null;
}

/**
 * Photo for a destination.
 *
 * Prefers the destination's own verified photograph, then the first
 * destination-free category image that exists, then nothing — in which case the
 * component renders a designed colour field rather than a broken image.
 */
export function photoForDestination(destination: Destination): PhotoEntry | null {
  if (destination.photo) return photoFor(destination.photo);
  return null;
}

const photoCoverageKeys: string[] = [
  ...destinations.map((d) => d.photo),
  ...experiences.map((e) => e.photo),
  ...stays.map((s) => s.photo),
].filter((key): key is string => typeof key === "string" && key.length > 0);

/** How much of the site actually has photography behind it. */
export const photoCoverage = {
  total: destinations.length + experiences.length + stays.length,
  resolved: photoCoverageKeys.filter((key) => Boolean(photoFile?.[key])).length,
};

/* --------------------------------------------------------------- GeoJSON */

/**
 * Malawi destinations as a Mapbox-ready FeatureCollection.
 *
 * Built on demand rather than cached to a file so it stays in step with the
 * editorial data automatically.
 */
export type DestinationFeatureCollection = FeatureCollection<
  Point,
  {
    id: string;
    name: string;
    region: string;
    kind: string;
    essence: string;
    summary: string;
    rating: number;
    slug: string;
    layer: string;
    interests: string[];
    photo: string | null;
  }
>;

export function destinationsGeoJSON(
  filter?: (destination: Destination & { lat: number; lng: number }) => boolean,
): DestinationFeatureCollection {
  const pool = filter ? geoDestinations.filter(filter) : geoDestinations;

  return {
    type: "FeatureCollection",
    features: pool.map((destination) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [destination.lng, destination.lat] },
      properties: {
        id: destination.id,
        name: destination.name,
        region: destination.region,
        kind: destination.kind,
        essence: destination.essence,
        summary: destination.summary,
        rating: destination.rating,
        slug: destination.slug,
        layer: destination.mapLayer,
        interests: destination.interests,
        photo: photoForDestination(destination)?.url ?? null,
      },
    })),
  };
}

/**
 * The route a generated itinerary implies, as a LineString.
 *
 * This is what draws the line on the map between stops, and it is drawn in the
 * itinerary's stop order — so it visibly never doubles back, because the route
 * solver in lib/itinerary.ts will not produce a route that does.
 */
export function routeGeoJSON(destinationIds: string[]): Feature<LineString> | null {
  const coords = destinationIds
    .map((id) => destinationById.get(id))
    .filter((d): d is Destination & { lat: number; lng: number } => Boolean(d && d.lat !== null))
    .map((d) => [d.lng, d.lat]);

  if (coords.length < 2) return null;

  return {
    type: "Feature",
    geometry: { type: "LineString", coordinates: coords },
    properties: {},
  };
}

/* ------------------------------------------------------------- Lookups ---- */

export { experiences, experiencesForDestination } from "./experiences";
export { stays, stayCategories, staysForDestination, nearestStay } from "./stays";
export { interests, interestById } from "./interests";
export { cultureStories, cultureTopics } from "./culture";

/** Interest ids referenced anywhere in the editorial data but never defined. */
export const interestIds = interests.map((interest) => interest.id);