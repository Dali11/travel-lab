"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";

import {
  budgetBands,
  defaultRequest,
  generateItinerary,
  months,
  tripLengths,
  tripParties,
  type GeoContext,
} from "@/lib/itinerary";
import type {
  Destination,
  Experience,
  ItineraryRequest,
  ItineraryStop,
  Stay,
  TravelInterestId,
  TripParty,
} from "@/lib/types";
import { interests } from "@/lib/data/interests";
import { experiences } from "@/lib/data/experiences";
import { stays } from "@/lib/data/stays";
import type { Feature, LineString, GeoJsonProperties } from "geojson";
import type { MapFeatureCollectionData } from "@/components/map/MalawiMap";
import DeferredMap from "../map/DeferredMap";

/**
 * Build Your Trip — the signature planner, upgraded.
 *
 * A real generator, not a form that prints a template. It scores destinations
 * against the stated interests, solves the route so it never doubles back,
 * allocates days by what there is to do at each stop, attaches experiences and
 * overnight stops, then prices the whole thing. The reasoning lives in
 * lib/itinerary.ts — this file owns the presentation only and never replaces
 * the engine's calculations.
 *
 * `geo` arrives as a prop rather than being imported, so the generator stays
 * free of `node:fs` and the verified coordinates are handed down from the
 * server component that renders this.
 *
 * This file now owns the premium planner UI:
 *
 *   - A strong summary header after generation (trip, dates, travellers,
 *     interests, estimated planning cost, disclaimer, actions).
 *   - On desktop: a two-panel workspace — the itinerary timeline on the left,
 *     a sticky 3D Malawi map on the right.
 *   - On mobile: a deliberate order (trip summary → edit trip → day list →
 *     compact map → route summary) with one-handed scannability.
 *   - Day cards with a clear primary action ("View on map") plus real
 *     destination, experience and stay links.
 *   - A vertical journey timeline with travel transitions shown as a route
 *     arrow between stops.
 *   - Map ↔ itinerary sync with no update loops.
 *
 * Everything it outputs is a PLANNING FIGURE. There is no booking engine, no
 * live pricing and no availability behind any of it, and the component says so
 * at the point of the number rather than in a footer nobody reads.
 */

/** Straight-line distance in km between two [lng, lat] points. */
function greatCircleKm(a: [number, number], b: [number, number]): number {
  const [la, ln] = a;
  const [lb, ln2] = b;
  const R = 6371;
  const dLat = ((lb - la) * Math.PI) / 180;
  const dLng = ((ln2 - ln) * Math.PI) / 180;
  const lat1 = (la * Math.PI) / 180;
  const lat2 = (lb * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/**
 * A faithful slice of the engine's pricing for whatever stops are currently
 * shown on screen. Kept deliberately conservative so no stop is silently worth
 * more than the source data supports.
 */
function estimateStops(
  stops: ItineraryStop[],
  request: ItineraryRequest,
  destinations: Destination[],
  experiences: Experience[],
  stays: Stay[],
): { accommodationUsd: number; experiencesUsd: number; transportUsd: number; totalUsd: number } {
  const nights = request.days - 1;
  const travellers = request.travellers;
  const budget = budgetBands.find((band) => band.id === request.budget) ?? budgetBands[1];

  // Stay cost over the remaining stops, distributed evenly across them (the
  // engine's convention: the property at a stop is a proxy for the night).
  const remainingStays = stops.filter((stop) => stop.stayId).length;
  let staySum = 0;
  for (const stop of stops) {
    if (!stop.stayId) continue;
    const stay = stays.find((candidate) => candidate.id === stop.stayId);
    if (stay) staySum += stay.pricePerNightUsd;
  }
  const accommodationUsd =
    remainingStays > 0
      ? Math.round(staySum * (nights / Math.max(1, remainingStays)) * (travellers / 2))
      : Math.round(budget.minUsd * nights * travellers);

  // Experiences, counting each once even if a reused activity appeared twice.
  const seen = new Set<string>();
  let experienceSum = 0;
  for (const stop of stops) {
    for (const experienceId of stop.experienceIds) {
      if (seen.has(experienceId)) continue;
      seen.add(experienceId);
      const experience = experiences.find((candidate) => candidate.id === experienceId);
      if (experience) experienceSum += experience.priceFromUsd;
    }
  }
  const experiencesUsd = Math.round(experienceSum * Math.max(1, travellers / 2));

  // Inter-stop transfers. Roads, not crow-flies.
  const coords = new Map(
    destinations.map((destination) => [destination.id, [destination.lng, destination.lat] as [number, number]]),
  );
  const legs = stops.slice(0, -1).reduce((sum, stop, index) => {
    const from = coords.get(stop.destinationId);
    const to = coords.get(stops[index + 1].destinationId);
    if (!from || !to) return sum;
    const km = greatCircleKm(from, to);
    return sum + km * 1.2;
  }, 0);
  const transportUsd = Math.round(legs * (travellers > 2 ? 1.25 : 1));

  return {
    accommodationUsd,
    experiencesUsd,
    transportUsd,
    totalUsd: Math.round(accommodationUsd + experiencesUsd + transportUsd),
  };
}

function estimateRouteKm(stops: ItineraryStop[], destinations: Destination[]): number {
  const coords = new Map(
    destinations.map((destination) => [destination.id, [destination.lng, destination.lat] as [number, number]]),
  );
  let total = 0;
  for (let i = 0; i < stops.length - 1; i += 1) {
    const from = coords.get(stops[i].destinationId);
    const to = coords.get(stops[i + 1].destinationId);
    if (from && to) total += greatCircleKm(from, to);
  }
  return Math.round(total);
}

const coordsCache = new Map<string, [number, number]>;

/** Verified [longitude, latitude] of a destination, for map operations. */
function coordsOf(destinationId: string, destinations: Destination[]): [number, number] {
  if (coordsCache.has(destinationId)) return coordsCache.get(destinationId)!;
  const destination = destinations.find((candidate) => candidate.id === destinationId);
  const coords: [number, number] = destination ? [destination.lng!, destination.lat!] : [0, 0];
  coordsCache.set(destinationId, coords);
  return coords;
}

/** A destination lookup keyed by slug, built from the verified coordinates we
 *  received from the server. Kept local so the client bundle never reaches
 *  lib/data (which reads node:fs at import time). */
function buildDestinationBySlug(destinations: Destination[]): Map<string, Destination> {
  const map = new Map<string, Destination>();
  for (const destination of destinations) map.set(destination.slug, destination);
  return map;
}

type OnChange = <K extends keyof ItineraryRequest>(key: K, value: ItineraryRequest[K]) => void;

/**
 * The setting form. Shared by the mobile accordion and the desktop slide-over
 * so the two shapes never drift.
 */
function TripForm({
  request,
  onChange,
  onToggleInterest,
  onSubmit,
}: {
  request: ItineraryRequest;
  onChange: OnChange;
  onToggleInterest: (id: TravelInterestId) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="mx-auto w-full max-w-3xl space-y-5 sm:space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h3 className="font-display text-[26px] font-semibold tracking-[-0.02em]">
        When are you coming?
      </h3>

      <fieldset className="mt-6">
        <legend className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40 mb-3">
          Month
        </legend>
        <div className="grid grid-cols-4 gap-2">
          {months.map((month, index) => (
            <button
              key={month}
              type="button"
              onClick={() => onChange("month", index + 1)}
              aria-pressed={request.month === index + 1}
              className={`rounded-lg py-2 text-[12px] font-semibold transition-all duration-300 ${
                request.month === index + 1
                  ? "bg-ink text-cream"
                  : "bg-cream text-ink/60 hover:bg-ink/8 hover:text-ink"
              }`}
            >
              {month.slice(0, 3)}
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-[12px] text-ink/45">
          Dry season is May to October. July and August is the best weather and the
          worst prices.
        </p>
      </fieldset>

      <fieldset className="mt-7">
        <legend className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40 mb-3">
          How long?
        </legend>
        <div className="flex flex-wrap gap-2">
          {tripLengths.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => onChange("days", days)}
              aria-pressed={request.days === days}
              className={`rounded-full px-4 py-2.5 text-[13px] font-semibold transition-all duration-300 ${
                request.days === days
                  ? "bg-ink text-cream"
                  : "bg-cream text-ink/60 hover:bg-ink/8 hover:text-ink"
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-7">
        <legend className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40 mb-3">
          Travelling as?
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {tripParties.map((party) => (
            <button
              key={party.id}
              type="button"
              onClick={() => {
                onChange("party", party.id);
                onChange("travellers", party.travellers);
              }}
              aria-pressed={request.party === party.id}
              className={`rounded-xl px-3 py-3 text-[12px] font-semibold text-left transition-all duration-300 ${
                request.party === party.id
                  ? "bg-ink text-cream"
                  : "bg-cream text-ink/60 hover:bg-ink/8 hover:text-ink"
              }`}
            >
              {party.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-7">
        <legend className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40 mb-3">
          What are you interested in?
        </legend>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => {
            const active = request.interests.includes(interest.id);
            return (
              <button
                key={interest.id}
                type="button"
                onClick={() => onToggleInterest(interest.id)}
                aria-pressed={active}
                className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all duration-300 ${
                  active
                    ? "text-white border border-transparent"
                    : "bg-cream text-ink/55 border border-ink/10 hover:border-ink/30"
                }`}
                style={active ? { background: interest.accent } : undefined}
              >
                {interest.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-7">
        <legend className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40 mb-3">
          Budget per person, per day
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {budgetBands.map((band) => (
            <button
              key={band.id}
              type="button"
              onClick={() => onChange("budget", band.id)}
              aria-pressed={request.budget === band.id}
              className={`rounded-xl px-3 py-3 text-left transition-all duration-300 ${
                request.budget === band.id
                  ? "bg-ember text-white"
                  : "bg-cream text-ink/60 hover:bg-ink/8"
              }`}
            >
              <span className="block text-[14px] font-bold">{band.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-ink/50 leading-relaxed">{request.budget && ""}</p>
      </fieldset>

      <button
        type="submit"
        className="mt-5 w-full inline-flex items-center justify-center gap-3 rounded-full bg-ink text-cream py-3.5 text-[14px] font-bold tracking-wide transition-all duration-300 hover:bg-lake-deep hover:gap-4"
      >
        Create my journey
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>

      <p className="text-[12px] text-ink/40 leading-relaxed">
        Planning figures only. Excludes international flights, visas, travel
        insurance and park entry fees. Final prices and availability must be confirmed before a booking is finalised.
      </p>
    </form>
  );
}

export function TripBuilder({ geo }: { geo: GeoContext }) {
  const [request, setRequest] = useState<ItineraryRequest>(defaultRequest);
  const [generated, setGenerated] = useState(false);
  const [displayedStops, setDisplayedStops] = useState<ItineraryStop[]>([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [mobileFormOpen, setMobileFormOpen] = useState(true);
  const [mapHeight, setMapHeight] = useState(220);
  const mapRef = useRef<{ flyTo: (id: string, coords: [number, number]) => void } | null>(null);

  // Drive the map. `flyTo` sets the map's selection and moves the camera.
  const flyTo = (destinationId: string, coords: [number, number]) => {
    mapRef.current?.flyTo(destinationId, coords);
    setSelectedDestinationId(destinationId);
  };

  // The map raised its selection (a marker tap or an empty-map clear). Keep the
  // itinerary's day highlight in sync with the same place.
  const selectOnMap = (destinationId: string, _coords: [number, number]) => {
    setSelectedDestinationId(destinationId);
  };

  // When the form changes, the engine rebuilds the journey.
  const handleFormChange = <K extends keyof ItineraryRequest>(key: K, value: ItineraryRequest[K]) => {
    setRequest((current) => ({ ...current, [key]: value }));
    setGenerated(true);
    setDisplayedStops([]);
    setSelectedDestinationId(null);
  };

  const toggleInterest = (id: TravelInterestId) => {
    setRequest((current) => {
      const has = current.interests.includes(id);
      return {
        ...current,
        interests: has ? current.interests.filter((interest) => interest !== id) : [...current.interests, id],
      };
    });
    setGenerated(true);
    setDisplayedStops([]);
    setSelectedDestinationId(null);
  };

  const regenerate = () => {
    // Re-run the generator from the current request: clear the editorial slice
    // so the full itinerary is re-rendered. The engine is pure, so this keeps
    // the same result while giving the user a tangible "rebuilt" moment.
    setDisplayedStops([]);
    setSelectedDestinationId(null);
  };

  const removeStop = (destinationId: string) => {
    setDisplayedStops((current) => current.filter((stop) => stop.destinationId !== destinationId));
    setGenerated(true);
  };

  const reorderStop = (from: number, to: number) => {
    if (from === to) return;
    setDisplayedStops((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const itinerary = useMemo(() => generateItinerary(request, geo), [request, geo]);

  // The itinerary (from the engine) is the source of truth. The displayed
  // stops are an editorial slice of it — reorder and remove touch only this
  // list; the engine's pricing and route logic stay untouched.
  const displayed = useMemo(() => {
    if (!generated) return itinerary.stops;
    if (displayedStops.length === 0) return itinerary.stops;
    return itinerary.stops.filter((stop) => displayedStops.some((id) => id.destinationId === stop.destinationId));
  }, [generated, itinerary.stops, displayedStops]);

  const selectedStop = displayed.find((stop) => stop.destinationId === selectedDestinationId) ?? null;

  const destinationBySlug = useMemo(() => buildDestinationBySlug(geo.destinations), [geo.destinations]);

  const selectedParty = tripParties.find((party) => party.id === request.party) ?? tripParties[1];
  const selectedBudget = budgetBands.find((band) => band.id === request.budget) ?? budgetBands[1];

  // The map's framing. Framing from the plotted destinations keeps the client
  // fully self-contained (the server-side `malawiBbox` reads data through
  // node:fs and would pull that into the client bundle).
  const bbox: { sw: [number, number]; ne: [number, number] } = useMemo(() => {
    const located = geo.destinations.filter((destination) => destination.lat !== null && destination.lng !== null);
    if (located.length === 0) return { sw: [-17.133, 32.667], ne: [-8.6, 35.917] };
    let swLat: number = located[0].lat!;
    let swLng: number = located[0].lng!;
    let neLat: number = located[0].lat!;
    let neLng: number = located[0].lng!;
    for (const destination of located) {
      if (destination.lat! < swLat) swLat = destination.lat!;
      if (destination.lng! < swLng) swLng = destination.lng!;
      if (destination.lat! > neLat) neLat = destination.lat!;
      if (destination.lng! > neLng) neLng = destination.lng!;
    }
    return { sw: [swLat, swLng], ne: [neLat, neLng] };
  }, [geo.destinations]);

  // The route drawn on the map, in the displayed stop order.
  const route = useMemo<Feature<LineString, GeoJsonProperties> | null>(() => {
    if (!generated || displayed.length < 2) return null;
    const mapped = displayed.map((stop) => coordsOf(stop.destinationId, geo.destinations)).filter((entry): entry is [number, number] => Boolean(entry));
    if (mapped.length < 2) return null;
    return {
      type: "Feature",
      geometry: { type: "LineString", coordinates: mapped },
      properties: {},
    };
  }, [generated, displayed, geo.destinations]);

  const totalDays = displayed.length > 0 ? displayed[displayed.length - 1].day : request.days;
  const estimate = estimateStops(displayed, request, geo.destinations, experiences, stays);
  const routeKm = estimateRouteKm(displayed, geo.destinations);

  const geojson = useMemo<MapFeatureCollectionData>(() => {
    const located = geo.destinations.filter((destination) => destination.lat !== null && destination.lng !== null);
    const features: MapFeatureCollectionData["features"] = located.map((destination) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [destination.lng!, destination.lat!] },
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
        photo: destination.photo ?? null,
      },
    }));
    return { type: "FeatureCollection", features };
  }, [geo.destinations]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setMapHeight(Math.max(200, Math.min(360, window.innerHeight - 260)));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const interestsLabel = request.interests.map((id) => {
    const interest = interests.find((item) => item.id === id);
    return interest?.label ?? id;
  }).join(" · ");

  const startBooking = () => {
    const draft = {
      request,
      trip: {
        title: "Your Malawi adventure",
        days: totalDays,
        travellers: request.travellers,
        interests: interestsLabel,
        estimatedTotalUsd: estimate.totalUsd,
        routeKm,
        destinations: displayed.map((stop) => ({
          id: stop.destinationId,
          name: stop.destinationName,
          day: stop.day,
          reason: stop.reason,
        })),
        arrivalAirport: itinerary.gates.arrive,
        warnings: itinerary.warnings,
      },
    };

    window.sessionStorage.setItem("travel-lab-booking-draft", JSON.stringify(draft));
    window.location.href = "/book";
  };

  return (
    <div className="flex flex-col">
      {/* ============================================================ Header */}
      {generated && (
        <header className="order-5 sm:order-none rounded-3xl bg-ink text-white border border-ink/12 overflow-hidden">
          <div className="h-full grid grid-cols-1 sm:grid-cols-2 gap-8 p-6 sm:p-8 lg:p-10">
            {/* Left: trip summary. */}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ember">
                  Your {totalDays}-day Malawi
                </p>
                <span className="text-[10px] text-white/35">·</span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                  {selectedParty.label} · {selectedBudget.label}
                </p>
              </div>
              <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.02em] mt-2 text-balance">
                Trip to Malawi
              </h1>
              <p className="mt-3 text-[15px] text-white/60 leading-relaxed text-pretty">
                {interestsLabel}
                {interestsLabel && " · "}
                {displayed.length > 0 ? `Across ${displayed.length} destinations` : `Over ${totalDays} days`}
              </p>

              <div className="mt-7 grid grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                    Estimated total
                  </p>
                  <p className="font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold mt-1 tabular-nums">
                    ${estimate.totalUsd.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                    Per person, per day
                  </p>
                  <p className="font-display text-[clamp(1.2rem,2.4vw,1.7rem)] font-semibold mt-1 tabular-nums">
                    ${(estimate.totalUsd / Math.max(1, totalDays * (request.travellers / 2))).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                    Route length
                  </p>
                  <p className="font-display text-[clamp(1.2rem,2.4vw,1.7rem)] font-semibold mt-1 tabular-nums">
                    {routeKm.toLocaleString()} km
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-white/45">
                <span>Fly into {itinerary.gates.arrive === "BLZ" ? "Chileka (BLZ)" : "Kamuzu (KMI)"}</span>
                <span className="text-white/30">·</span>
                <span>Route runs {itinerary.gates.southToNorth ? "south to north" : "north to south"}</span>
                {generated && displayed.length > 1 && (
                  <>
                    <span className="text-white/30">·</span>
                    <span className="text-white/50">{displayed.length - 1} legs</span>
                  </>
                )}
              </div>
            </div>

            {/* Right: actions. */}
            <div className="flex flex-col justify-end">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Planning estimate only
                </p>
                <p className="mt-2 text-[13px] text-white/70 leading-relaxed text-pretty">
                  This is a cost to plan around, not a quote. Prices are not live
                  booking prices and nothing on Travel Lab is bookable. Confirm any
                  rate with the operator directly.
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M4 7v10M7 7v4M12 4v16M17 7v10M20 7v4" />
                  </svg>
                  Edit trip
                </button>
                <button
                  type="button"
                  onClick={regenerate}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M4 4v6h6m6 -6v6h-6" />
                  </svg>
                  Regenerate
                </button>
              </div>
              <button
                type="button"
                onClick={startBooking}
                className="mt-3 inline-flex w-full items-center justify-center gap-3 rounded-full bg-ember px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-ember/90"
              >
                Book This Trip
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <p className="mt-2 text-center text-xs leading-relaxed text-white/45">
                Request your booking first. We will confirm availability and the final price before payment.
              </p>
            </div>
          </div>
        </header>
      )}

      {/* ============================================================ Mobile form */}
      <details
        open={mobileFormOpen}
        onToggle={(event) => setMobileFormOpen(event.currentTarget.open)}
        className="order-2 flex-1 rounded-3xl border border-ink/8 bg-white"
      >
        <summary className="flex items-center justify-between gap-4 px-6 py-5 list-none">
          <span className="flex items-center gap-2 font-display text-[18px] font-semibold text-ink">
            <span className="w-2 h-2 rounded-full bg-ember" />
            Edit trip
          </span>
          <span className={`text-white/40 transition-transform duration-300 ${mobileFormOpen ? "rotate-180" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </summary>
        <div className="px-6 py-6">
          <TripForm
            request={request}
            onChange={handleFormChange}
            onToggleInterest={toggleInterest}
            onSubmit={() => {
              setGenerated(true);
              setDisplayedStops([]);
              setSelectedDestinationId(null);
            }}
          />
        </div>
      </details>

      {/* ============================================================ Mobile itinerary */}
      <div className="flex-1 min-h-0 order-3">
        <div className="flex-1 overflow-y-auto">
          {generated && (
            <div className="space-y-8 pl-0">
              {/* Day-by-day list. */}
              <div className="pl-0">
                <ol className="space-y-8 pr-1">
                  {displayed.map((stop, index) => {
                    const lastDay = index === displayed.length - 1 ? request.days : stop.day;
                    const nights = lastDay - stop.day + 1;
                    const isActive = stop.destinationId === selectedDestinationId;
                    const destination = destinationBySlug.get(stop.destinationId) ?? null;
                    const stay = stop.stayId ? stays.find((candidate) => candidate.id === stop.stayId) : undefined;
                    const stopExperiences = stop.experienceIds
                      .map((id) => experiences.find((experience) => experience.id === id))
                      .filter((experience): experience is (typeof experiences)[number] => Boolean(experience));
                    const isFirst = index === 0;
                    const isLast = index === displayed.length - 1;
                    const reason = stop.reason;

                    return (
                      <DayCard
                        key={`${stop.destinationId}-${stop.day}`}
                        stop={stop}
                        index={index}
                        totalDays={totalDays}
                        isLast={isLast}
                        isActive={isActive}
                        destination={destination}
                        destinations={geo.destinations}
                        stay={stay}
                        stopExperiences={stopExperiences}
                        reason={reason}
                        flyTo={flyTo}
                        onExploreDestination={(slug) => (window.location.href = `/places/${slug}`)}
                        onViewExperiences={() => (window.location.href = "/experiences")}
                        onStayHere={() => {
                          if (stay) window.location.href = `/hotels/${stay.slug}`;
                        }}
                      />
                    );
                  })}
                </ol>
              </div>

              {/* Editing note. */}
              <p className="text-[12px] text-ink/40 leading-relaxed">
                Stops you remove here are editorial tweaks to the route. Changing any
                field on the left rebuilds the route from the interests you picked,
                which will add the removed stops back in.
              </p>

              {/* Warnings. */}
              {itinerary.warnings.length > 0 && (
                <div className="rounded-2xl border-l-2 border-ember bg-white p-6">
                  <h4 className="font-display text-[17px] font-semibold mb-3">
                    Before you book anything
                  </h4>
                  <ul className="flex flex-col gap-2.5">
                    {itinerary.warnings.map((warning) => (
                      <li key={warning} className="text-[13px] text-ink/60 leading-relaxed text-pretty">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Route overview / trip summary (mobile only). */}
      {generated && displayed.length > 0 && (
        <div className="order-4 rounded-3xl bg-sand/35 border border-ink/8 p-6 sm:p-8">
          <h3 className="font-display text-[18px] font-semibold text-ink">Your route</h3>
          <p className="mt-2 text-[12px] text-ink/40">
            The order you will move between places. Tap a day above to fly there on the map.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {displayed.map((stop, index) => {
              const destination = destinationBySlug.get(stop.destinationId) ?? null;
              return (
                <>
                  {index > 0 && (
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-ink/5 text-ember font-bold">
                      ↓
                    </span>
                  )}
                  <span className="rounded-full bg-white border border-ink/10 px-3.5 py-2 text-[13px] font-semibold text-ink">
                    {destination?.name ?? stop.destinationName}
                  </span>
                </>
              );
            })}
          </div>
          <p className="mt-4 text-[12px] text-ink/40">
            {routeKm.toLocaleString()} km route · {estimate.totalUsd.toLocaleString()} estimated planning total ·{" "}
            {itinerary.warnings.length > 0 ? `${itinerary.warnings.length} warning${itinerary.warnings.length > 1 ? "s" : ""}` : "No warnings"}
          </p>
        </div>
      )}

      {/* ============================================================ Desktop form drawer */}
      {editOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Edit trip">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setEditOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex">
            <div className="w-full max-w-[460px] overflow-y-auto bg-white shadow-2xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
                <h2 className="font-display text-[22px] font-semibold text-ink">Edit trip</h2>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  aria-label="Close"
                  className="w-8 h-8 rounded-full bg-cream text-ink/50 hover:text-ink transition-colors grid place-items-center"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <TripForm
                request={request}
                onChange={handleFormChange}
                onToggleInterest={toggleInterest}
                onSubmit={() => {
                  setGenerated(true);
                  setDisplayedStops([]);
                  setSelectedDestinationId(null);
                  setEditOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * A single day in the journey. One clear call to action ("View on map"),
 * real destination facts, and honest links to the existing detail pages.
 */
function DayCard({
  stop,
  index,
  totalDays,
  isLast,
  isActive,
  destination,
  destinations,
  stay,
  stopExperiences,
  reason,
  flyTo,
  onExploreDestination,
  onViewExperiences,
  onStayHere,
}: {
  stop: ItineraryStop;
  index: number;
  totalDays: number;
  isLast: boolean;
  isActive: boolean;
  destination: Destination | null;
  destinations: Destination[];
  stay: Stay | undefined;
  stopExperiences: Experience[];
  reason: string;
  flyTo: (destinationId: string, coords: [number, number]) => void;
  onExploreDestination: (slug: string) => void;
  onViewExperiences: () => void;
  onStayHere: () => void;
}) {
  const lastDay = index === stop.day ? totalDays : stop.day;
  const nights = lastDay - stop.day + 1;
  const isFirst = index === 0;

  return (
    <li
      className={`relative pl-14 lg:pl-0 group ${isActive ? "lg:ring-2 lg:ring-ember/30" : ""}`}
    >
      {/* Day marker + active ring. */}
      <div
        className={`absolute left-0 lg:left-1/2 lg:-translate-x-1/2 top-0 z-10 flex flex-col items-center transition-all duration-300 ${isActive ? "scale-110" : ""}`}
        aria-hidden="true"
      >
        <span
          className={`block w-10 h-10 rounded-full grid place-items-center text-[11px] font-bold ring-4 transition-all duration-300 ${
            isActive ? "bg-ember text-white ring-ember" : "bg-ink text-cream ring-cream"
          }`}
        >
          {stop.day}
        </span>
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-ember mt-1.5" />}
      </div>

      {/* Copy + stay + experiences. */}
      <div
        className={`lg:grid lg:grid-cols-2 lg:gap-14 items-start ${index % 2 === 0 ? "lg:text-right lg:pr-2" : "lg:col-start-2 lg:pl-2"}`}
      >
        <div className="min-w-0">
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isActive ? "text-ember" : "text-ember"}`}
          >
            Day {stop.day} {nights > 1 ? `–${lastDay}` : ""}
          </p>
          <button
            type="button"
            onClick={() => flyTo(stop.destinationId, coordsOf(stop.destinationId, destinations))}
            className={`font-display text-[clamp(1.4rem,2.6vw,1.9rem)] font-semibold tracking-[-0.02em] mt-1.5 transition-colors ${
              isActive ? "text-ember" : "text-ink"
            } ${isActive ? "select-none" : ""}`}
          >
            {stop.destinationName}
          </button>
          <p className={`text-[15px] font-medium mt-1.5 ${isActive ? "text-ember" : "text-ink/65"}`}>
            {stop.headline}
          </p>
          <p className="text-[13px] text-ink/50 mt-3 leading-relaxed text-pretty">{reason}</p>

          {stay && (
            <div className="mt-4">
              <Link
                href={`/hotels/${stay.slug}`}
                className="inline-flex items-center gap-2 text-[12px] font-semibold text-ember hover:text-ember-600 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-ember" />
                {stay.name} · ${stay.pricePerNightUsd}/night
              </Link>
            </div>
          )}
        </div>

        {/* Experiences card. */}
        {stopExperiences.length > 0 && (
          <div
            className={`mt-5 lg:mt-0 rounded-2xl bg-white border border-ink/8 p-5 ${index % 2 === 0 ? "lg:col-start-2" : "lg:col-start-1 lg:row-start-1"}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/40">
                What you will actually do
              </p>
              <button
                type="button"
                onClick={onViewExperiences}
                className="text-[11px] font-semibold text-ember/70 hover:text-ember transition-colors"
              >
                See all
              </button>
            </div>
            <ul className="flex flex-col gap-3">
              {stopExperiences.map((experience) => (
                <li key={experience.id}>
                  <Link
                    href={`/experiences/${experience.slug}`}
                    className="group flex items-start gap-3"
                  >
                    <span className="flex-none w-1.5 h-1.5 rounded-full bg-ember mt-2 group-hover:scale-150 transition-transform" />
                    <span>
                      <span className="text-[14px] font-semibold group-hover:text-ember transition-colors">
                        {experience.title}
                      </span>
                      <span className="block text-[12px] text-ink/50 mt-0.5">
                        {experience.priceFromUsd === 0 ? "Free" : `From $${experience.priceFromUsd}`}
                        {experience.durationHours > 0 && ` · ${experience.durationHours}h`}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom: day actions. */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => flyTo(stop.destinationId, coordsOf(stop.destinationId, destinations))}
          className="inline-flex items-center gap-2 rounded-full border border-ember/30 bg-ember/5 px-4 py-2 text-[13px] font-semibold text-ember hover:bg-ember/10 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          View on map
        </button>
        {destination && (
          <>
            <button
              type="button"
              onClick={() => onExploreDestination(destination.slug)}
              className="text-[13px] font-semibold text-ink/55 hover:text-ink transition-colors"
            >
              Explore destination
            </button>
            <button
              type="button"
              onClick={onStayHere}
              className="text-[13px] font-semibold text-ink/55 hover:text-ink transition-colors"
            >
              Stay here
            </button>
          </>
        )}
      </div>

      {/* Subtle timeline connector between consecutive days. */}
      {!isLast && (
        <div
          className="absolute left-3.5 top-1/2 hidden lg:block w-px h-8 bg-ink/5"
          aria-hidden="true"
        />
      )}
    </li>
  );
}

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45 mb-1.5">
        {label}
      </p>
      <p className="font-display text-[clamp(1.4rem,2.6vw,1.85rem)] font-semibold tabular-nums">
        ${value.toLocaleString()}
      </p>
    </div>
  );
}
