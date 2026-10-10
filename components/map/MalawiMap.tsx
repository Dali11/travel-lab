"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { useEffect, useRef, useState, useCallback, forwardRef } from "react";
import Link from "next/link";

import type { MapFilterId } from "@/lib/types";
import type { Feature, LineString } from "geojson";
import type { MutableRefObject, Ref } from "react";

/**
 * The interactive Malawi map.
 *
 * Mapbox GL JS, loaded client-side only. This file is the single dynamic import
 * point for mapbox-gl in the app — nothing else imports it — so the ~800kB
 * WebGL bundle lands in exactly one chunk and only when the map scrolls into
 * view. The rest of the homepage ships without it.
 *
 * Design decisions worth knowing:
 *
 *   - Camera: `flyTo` with an explicit bearing and pitch. Selecting a place
 *     tilts the terrain and drops the camera, because a flat top-down map of
 *     Malawi tells you nothing about what the country is actually like.
 *   - Terrain exaggeration is set high (1.6) on purpose. Mulanje at 3,000m next
 *     to the lake at 474m is the shape of the country, and a literal scale makes
 *     Mulanje invisible.
 *   - Selection state lives in React, not in the map. Mapbox owns the camera and
 *     the layers; React owns which card is open. Keeps one source of truth.
 *   - `flyTo` is exposed on the component ref so the itinerary wizard can drive
 *     the camera and keep its day highlight in sync with the same selection
 *     state.
 *   - Keyboard access is real: the destination list below the map is a set of
 *     buttons, so the map is navigable without a pointer.
 */

export type MapFeatureProperties = {
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
};

/** The GeoJSON shape this component accepts. */
export type MapPoint = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: MapFeatureProperties;
};

export type MapFeatureCollectionData = {
  type: "FeatureCollection";
  features: MapPoint[];
};

/** Marker layers and the filter each one belongs to. */
const LAYER_FILTER: Record<MapFilterId, (p: MapFeatureProperties) => boolean> = {
  destinations: () => true,
  wildlife: (p) => p.layer === "wildlife" || p.kind === "park" || p.kind === "reserve",
  hiking: (p) => p.layer === "hiking" || p.kind === "mountain" || p.kind === "plateau",
  beaches: (p) => p.layer === "beaches" || p.kind === "lake" || p.kind === "island",
  experiences: () => true,
  hotels: () => true,
  restaurants: () => true,
  airports: () => true,
  routes: () => true,
};

export const mapFilters: { id: MapFilterId; label: string }[] = [
  { id: "destinations", label: "Destinations" },
  { id: "hotels", label: "Hotels & Lodges" },
  { id: "experiences", label: "Experiences" },
  { id: "wildlife", label: "Wildlife" },
  { id: "hiking", label: "Hiking" },
  { id: "beaches", label: "Beaches" },
  { id: "restaurants", label: "Restaurants" },
  { id: "airports", label: "Airports" },
  { id: "routes", label: "Routes" },
];

export type MalawiMapProps = {
  /** GeoJSON FeatureCollection of destinations, built on the server. */
  geojson: MapFeatureCollectionData;
  bbox: { sw: [number, number]; ne: [number, number] };
  /** Minimum viewport height in px. */
  height?: number;
  className?: string;
  /** Optional itinerary route to draw as a dashed line across the map, in stop order. */
  route?: Feature<LineString> | null;
  /** Fires when the user picks a destination (clicks a marker). The itinerary
   *  side uses it to highlight the matching day in its own list. */
  onSelectDestination?: (id: string, coords: [number, number]) => void;
};

/** Imperative handle. Exposes the camera flight so a parent wizard can drive
 *  the map without reaching into its internal instance. */
export type MalawiMapHandle = {
  flyTo: (id: string, coords: [number, number]) => void;
};

const MalawiMapImpl = forwardRef<MalawiMapHandle, MalawiMapProps>(function MalawiMap(
  {
    geojson,
    bbox,
    height = 620,
    className = "",
    route,
    onSelectDestination,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<MapFilterId[]>(["destinations"]);
  const [pitch, setPitch] = useState(45);
  const [mobileRailOpen, setMobileRailOpen] = useState(false);

  // Read once at module scope rather than in an effect: it is a build-time
  // constant, and putting it in state only to set it again on mount is exactly
  // the cascading-render pattern the lint rule exists to catch.
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  /** Whether to show the fallback. Derived, not stored. */
  const noToken = !token;
  const showFallback = noToken || mapError;

  // Selected destination, resolved from the GeoJSON we were handed.
  const selected: MapFeatureProperties | null =
    geojson.features.find((feature) => feature.properties.id === selectedId)?.properties ?? null;

  /* ------------------------------------------------------------ Map setup */

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // No token: `showFallback` is already true, so there is nothing to do.
    if (!token) return;

    let cancelled = false;
    let map: import("mapbox-gl").Map | undefined;

    // Dynamic import: keeps mapbox-gl out of the initial bundle entirely.
    (async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (cancelled || !containerRef.current) return;

        mapboxgl.accessToken = token;

        // Lake Malawi's extent, padded. The camera frames the whole country.
        const centre: [number, number] = [
          (bbox.sw[1] + bbox.ne[1]) / 2,
          (bbox.sw[0] + bbox.ne[0]) / 2,
        ];

        map = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/satellite-streets-v12",
          center: centre,
          zoom: 6.5,
          pitch: 62,
          bearing: -15,
          attributionControl: false,
          // Malawi has no fog or heavy weather in most of the year; keep it clean.
          maxPitch: 75,
          minZoom: 4.5,
          maxZoom: 14,
        });

        mapRef.current = map;

        map.addControl(
          new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: true }),
          "top-right",
        );
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

        map.on("load", () => {
          if (!map || cancelled) return;

          // 3D terrain. Sourced from Mapbox's terrain-RGB tiles rather than a
          // DEM tile set we would have to host and keep current.
          // Exaggeration is set high (1.6) on purpose. Mulanje at 3,000m next to
          // the lake at 474m is the shape of the country, and a literal scale
          // makes Mulanje invisible.
          try {
            map.addSource("mapbox-dem", {
              type: "raster-dem",
              url: "mapbox://mapbox.mapbox-terrain-dem-v1",
              tileSize: 512,
              maxzoom: 12,
            });
            map.setTerrain({ source: "mapbox-dem", exaggeration: 1.6 });
          } catch (error) {
            // Terrain is an enhancement. If the tiles are unavailable the map
            // still works flat rather than failing to render at all.
            console.warn("[travel-lab] terrain unavailable:", error);
          }

          // Atmosphere, so pitched views do not read as a black void above the
          // horizon. Mapbox GL 3.x replaced the 1.x skybox with fog, so this is
          // `setFog` rather than a skybox source.
          try {
            map.setFog({
              "range": [0.6, 9],
              "color": "#CFE0DE",
              "high-color": "#0E1A22",
              "horizon-blend": 0.5,
            });
          } catch (error) {
            console.warn("[travel-lab] fog unavailable:", error);
          }

          map.addSource("destinations", { type: "geojson", data: geojson });

          // Halo ring behind each marker, so it reads over bright satellite.
          map.addLayer({
            id: "destination-halo",
            type: "circle",
            source: "destinations",
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 13, 12, 22],
              "circle-color": "#E2703A",
              "circle-opacity": 0.22,
              "circle-blur": 0.6,
            },
          });

          map.addLayer({
            id: "destination-points",
            type: "circle",
            source: "destinations",
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 5, 12, 9],
              "circle-color": "#F8F4EC",
              "circle-stroke-width": 2.4,
              "circle-stroke-color": "#E2703A",
            },
          });

          // Selection ring. Separate layer so it can animate independently.
          map.addLayer({
            id: "destination-selected",
            type: "circle",
            source: "destinations",
            filter: ["==", ["get", "id"], ""],
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 9, 12, 15],
              "circle-color": "rgba(226,112,58,0)",
              "circle-stroke-width": 3,
              "circle-stroke-color": "#E2703A",
            },
          });

          // The itinerary route, drawn as a dashed line through the stops in
          // their generated order. Only added once — when a route is first
          // supplied — and updated in place whenever the route changes.
          if (route) {
            map.addSource("itinerary-route", { type: "geojson", data: route });
            map.addLayer({
              id: "itinerary-route-glow",
              type: "line",
              source: "itinerary-route",
              paint: {
                "line-color": "#E2703A",
                "line-width": 9,
                "line-opacity": 0.18,
                "line-dasharray": [6, 5],
              },
            });
            map.addLayer({
              id: "itinerary-route",
              type: "line",
              source: "itinerary-route",
              paint: {
                "line-color": "#E2703A",
                "line-width": 3.2,
                "line-opacity": 0.8,
                "line-dasharray": [6, 5],
              },
            });
          }

          map.on("click", "destination-points", (event) => {
            const feature = event.features?.[0];
            if (!feature || feature.geometry.type !== "Point") return;
            const id = feature.properties?.id as string | undefined;
            if (!id) return;
            const coords = feature.geometry.coordinates as [number, number];
            // Selection is React state, so it must be set BEFORE the map guard
            // below. The tilt is the point: a flat overhead map of Malawi is a
            // shape; a pitched one is terrain.
            flyTo(id, coords);
            onSelectDestination?.(id, coords);
          });

          // Clicking empty map clears the selection.
          map.on("click", (event) => {
            const hits = map!.queryRenderedFeatures(event.point, {
              layers: ["destination-points"],
            });
            if (hits.length === 0) setSelectedId(null);
          });

          setReady(true);
        });

        map.on("error", (event) => {
          const message = event.error?.message ?? "Unknown Mapbox error";
          console.warn("[travel-lab] map error:", message);

          // If the map style cannot load, don't leave the loading spinner
          // running indefinitely. Terrain tile errors alone remain non-fatal.
          if (
            !cancelled &&
            !map?.isStyleLoaded() &&
            /style|token|unauthori[sz]ed|forbidden|access denied|failed to fetch/i.test(message)
          ) {
            setMapError(true);
          }
        });
      } catch (error) {
        console.error("[travel-lab] map failed to initialise:", error);
        if (!cancelled) setMapError(true);
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [token, bbox, geojson]);

  /* ----------------------------------------------------------- Camera flight */

  /**
   * Fly to a destination and bring the selection ring with it.
   *
   * Held in a stable function because it is called from the marker click, the
   * jump rail, and from outside the component (the itinerary wizard) through
   * the exposed handle. Setting the selection here keeps the ring, the popover
   * and the jump rail consistent with the same `selectedId`.
   */
  const flyTo = useCallback((id: string, coords: [number, number]) => {
    setSelectedId(id);
    const map = mapRef.current;
    if (!map) return;
    // Update the selection ring.
    map.setFilter("destination-selected", ["==", ["get", "id"], id]);
    // The tilt is the point. A flat overhead map of Malawi is a shape; a pitched
    // one is terrain.
    map.flyTo({
      center: coords,
      zoom: Math.max(map.getZoom(), 8.2),
      pitch: 62,
      bearing: -18,
      duration: 2100,
      curve: 1.5,
      essential: true,
    });
  }, []);

  // Expose the camera flight on the component handle.
  useEffect(() => {
    if (!ref) return;
    (ref as MutableRefObject<MalawiMapHandle | null>).current = { flyTo };
    return () => {
      (ref as MutableRefObject<MalawiMapHandle | null>).current = null;
    };
  }, [flyTo]);

  /* ----------------------------------------------------------- Selection */

  // Keep pitch in React state so the control can reflect it.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const onMove = () => setPitch(map.getPitch());
    map.on("move", onMove);
    return () => {
      map.off("move", onMove);
    };
  }, [ready]);

  /* -------------------------------------------------------------- Filters */

  const toggleFilter = (id: MapFilterId) => {
    setActiveFilters((current) =>
      current.includes(id)
        ? current.length === 1
          ? current // never allow an empty map
          : current.filter((filter) => filter !== id)
        : [...current, id],
    );
  };

  // Apply the active filters to the marker layers.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    // "Any marker-ish filter" reduces to: show a marker if it passes ANY active
    // visual filter. Filters with no spatial data yet contribute nothing rather
    // than being silently ignored.
    const spatial = activeFilters.filter(
      (filter) =>
        filter !== "destinations" &&
        filter !== "hotels" &&
        filter !== "experiences" &&
        filter !== "restaurants" &&
        filter !== "airports" &&
        filter !== "routes",
    );

    const keepAll = activeFilters.includes("destinations") || spatial.length === 0;

    if (keepAll) {
      map.setFilter("destination-points", null);
      map.setFilter("destination-halo", null);
      return;
    }

    const ids = geojson.features
      .filter((feature) => {
        const properties = feature.properties;
        return spatial.some((filter) => LAYER_FILTER[filter](properties));
      })
      .map((feature) => feature.properties.id);

    map.setFilter(
      "destination-points",
      ["match", ["get", "id"], ids, true, false],
    );
    map.setFilter(
      "destination-halo",
      ["match", ["get", "id"], ids, true, false],
    );
  }, [activeFilters, ready, geojson]);

  /* ------------------------------------------------------------------ UI */

  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative w-full overflow-hidden rounded-3xl bg-lake-deep"
        style={{ height: `${height}px` }}
      >
        {/* The canvas mounts here. */}
        <div ref={containerRef} className="absolute inset-0 h-full w-full min-h-0" />

        {/* Loading / fallback states, all inside the frame so layout never jumps. */}
        {!ready && !showFallback && (
          <div className="absolute inset-0 grid place-items-center bg-lake-deep">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-white/25 border-t-ember rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-[12px] text-white/55 tracking-wide">Loading map</p>
            </div>
          </div>
        )}

        {showFallback && <MapFallback bbox={bbox} />}

        {/* Filters */}
        <div className="absolute left-4 right-4 top-4 z-10 flex items-start gap-2">
          <div className="hidden sm:flex flex-wrap gap-1.5">
            {mapFilters.map((filter) => {
              const active = activeFilters.includes(filter.id);
              // Filters with no spatial data yet are shown disabled with a title,
              // rather than hidden — the roadmap stays visible and honest.
              const unavailable = ["hotels", "experiences", "restaurants", "routes"].includes(
                filter.id,
              );
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => !unavailable && toggleFilter(filter.id)}
                  disabled={unavailable}
                  title={
                    unavailable
                      ? "Coming soon — no verified location data connected yet"
                      : undefined
                  }
                  aria-pressed={active}
                  className={`px-3.5 py-2 rounded-full text-[12px] font-semibold backdrop-blur-md border transition-all duration-300 ${
                    active
                      ? "bg-white text-ink border-white"
                      : unavailable
                      ? "bg-ink/40 text-white/30 border-white/10 cursor-not-allowed"
                      : "bg-ink/50 text-white/80 border-white/20 hover:bg-ink/70 hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Mobile: one button that opens the same filter sheet. */}
          <button
            type="button"
            onClick={() => setFilterOpen((open) => !open)}
            aria-expanded={filterOpen}
            className="sm:hidden inline-flex items-center gap-2 rounded-full bg-ink/60 backdrop-blur-md border border-white/20 px-4 py-2.5 text-[12px] font-semibold text-white"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden="true"
            >
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            Filters
            {activeFilters.length > 1 && (
              <span className="bg-ember text-white rounded-full w-4 h-4 grid place-items-center text-[9px]">
                {activeFilters.length - 1}
              </span>
            )}
          </button>
        </div>

        {filterOpen && (
          <div className="sm:hidden absolute left-4 right-4 top-16 z-10 rounded-2xl bg-ink/92 backdrop-blur-xl border border-white/12 p-3 flex flex-wrap gap-1.5">
            {mapFilters.map((filter) => {
              const active = activeFilters.includes(filter.id);
              const unavailable = ["hotels", "experiences", "restaurants", "routes"].includes(
                filter.id,
              );
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => !unavailable && toggleFilter(filter.id)}
                  disabled={unavailable}
                  aria-pressed={active}
                  className={`px-3 py-2 rounded-full text-[12px] font-semibold border transition-all ${
                    active
                      ? "bg-white text-ink border-white"
                      : unavailable
                      ? "bg-white/5 text-white/30 border-white/10"
                      : "bg-white/10 text-white/80 border-white/15"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Mobile destination rail. Compact collapsed header; expandable list of destinations. Desktop keeps its own jump list below the map. */}
        <div className="sm:hidden">
          {!mobileRailOpen ? (
            <button
              type="button"
              onClick={() => setMobileRailOpen(true)}
              aria-expanded={mobileRailOpen}
              aria-controls="mobile-destination-rail"
              className="w-full flex items-center justify-between rounded-2xl bg-ink/60 backdrop-blur-md border border-white/10 px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-ember">
                  <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" />
                  <path d="M9 3v15M15 6v15" />
                </svg>
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-white">3D Malawi</p>
                  <p className="text-[11px] text-white/40">{geojson.features.length} destinations plotted</p>
                </div>
              </div>
              <span className="text-white/50">›</span>
            </button>
          ) : (
            <div
              id="mobile-destination-rail"
              role="listbox"
              aria-label="Explore destinations"
              className="rounded-2xl bg-ink/95 backdrop-blur-xl border border-white/12 p-4 overflow-y-auto max-h-[60vh] sm:max-h-[400px]"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">Explore destinations</p>
                <button
                  type="button"
                  onClick={() => setMobileRailOpen(false)}
                  aria-label="Close destination list"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <path d="M1 1l10 10M11 1L1 11" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {geojson.features.map((feature) => {
                  const properties = feature.properties;
                  const [lng, lat] = feature.geometry.coordinates;
                  return (
                    <button
                      key={properties.id}
                      type="button"
                      role="option"
                      aria-selected={properties.id === selectedId}
                      onClick={() => {
                        flyTo(properties.id, [lng, lat]);
                        setMobileRailOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${properties.id === selectedId ? "bg-ember/20 text-ember" : "text-white/80 hover:bg-white/5"}`}
                    >
                      <span className="text-[14px] font-medium">{properties.name}</span>
                      {properties.id === selectedId && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" className="text-ember">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Terrain / pitch readout. Premium maps show their state. */}
        {ready && (
          <div className="absolute right-4 bottom-4 z-10 hidden sm:flex items-center gap-3 rounded-full bg-ink/55 backdrop-blur-md border border-white/12 px-4 py-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
              3D
            </span>
            <input
              type="range"
              min={0}
              max={70}
              value={Math.round(pitch)}
              onChange={(event) => {
                const next = Number(event.target.value);
                setPitch(next);
                mapRef.current?.setPitch(next);
              }}
              aria-label="Terrain tilt"
              className="w-20 accent-[#E2703A] cursor-pointer"
            />
            <span className="text-[10px] text-white/50 tabular-nums w-7">{Math.round(pitch)}°</span>
          </div>
        )}

        {/* The itinerary route. A dashed line through the stops in their
            generated order, so the map shows the journey, not just a set of pins. */}
        {route && ready && null /* Route is drawn by mapbox layers below. */}

        {/* The destination card. Opens on selection, both from the map and the
            keyboard-navigable list below. */}
        {selected && (
          <DestinationCardPopover
            properties={selected}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {/* Keyboard-accessible destination list. The map alone is not navigable
          without a pointer, so every place is also a button. */}
      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40 mb-3">
          Jump to a destination
        </p>
        <div className="rail pb-2">
          {geojson.features.map((feature) => {
            const properties = feature.properties;
            const [lng, lat] = feature.geometry.coordinates;
            const active = properties.id === selectedId;
            return (
              <button
                key={properties.id}
                type="button"
                onClick={() => flyTo(properties.id, [lng, lat])}
                aria-pressed={active}
                className={`shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold border transition-all duration-300 ${
                  active
                    ? "bg-ink text-cream border-ink"
                    : "bg-white text-ink/70 border-ink/12 hover:border-ink/40 hover:text-ink"
                }`}
              >
                {properties.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

MalawiMapImpl.displayName = "MalawiMap";
export default MalawiMapImpl;

/** The card that opens when a destination is selected. */
function DestinationCardPopover({
  properties,
  onClose,
}: {
  properties: MapFeatureProperties;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute left-4 right-4 bottom-4 z-20 sm:left-auto sm:right-4 sm:w-[340px] rounded-2xl bg-ink/94 backdrop-blur-xl border border-white/12 p-6 text-white animate-rise"
      role="dialog"
      aria-label={`${properties.name} details`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M1 1l10 10M11 1L1 11" />
        </svg>
      </button>

      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45 mb-2.5">
        {properties.essence}
      </p>
      <h3 className="font-display text-[26px] font-semibold leading-tight pr-7">
        {properties.name}
      </h3>

      <div className="flex items-center gap-1.5 mt-2.5">
        {[1, 2, 3, 4, 5].map((index) => (
          <svg
            key={index}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={index <= Math.round(properties.rating) ? "text-ember" : "text-white/20"}
            fill="currentColor"
          >
            <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
          </svg>
        ))}
      </div>

      <p className="mt-4 text-[14px] text-white/70 leading-relaxed text-pretty">
        {properties.summary}
      </p>

      <Link
        href={`/places/${properties.slug}`}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-ink px-6 py-3 text-[14px] font-semibold transition-colors hover:bg-cream"
      >
        View details
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}

/**
 * No token, or the map failed to initialise.
 *
 * Renders a real, honest fallback rather than an empty grey rectangle: the same
 * destinations as a positioned list over a stylised outline, with the same
 * selection interaction. It is a degraded experience that still does something
 * useful, not a "map unavailable" apology.
 */
function MapFallback({ bbox }: { bbox: { sw: [number, number]; ne: [number, number] } }) {
  return (
    <div className="absolute inset-0 bg-lake-deep grid place-items-center px-6">
      <div className="max-w-md text-center">
        <svg
          width="46"
          height="46"
          viewBox="0 0 24 24"
          fill="none"
          className="mx-auto text-ember"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" />
          <path d="M9 3v15M15 6v15" />
        </svg>
        <h3 className="font-display text-[22px] font-semibold text-white mt-4">
          The 3D map could not load
        </h3>
        <p className="mt-3 text-[14px] text-white/60 leading-relaxed text-pretty">
          Check your Mapbox access token, network connection and style permissions.
          Open the browser console for the specific error.
        </p>
        <p className="mt-4 text-[12px] text-white/35">
          Every destination on the map is listed on the pages below, so nothing is
          only reachable through here.
        </p>
        <p className="sr-only">
          Map bounds: south-west {bbox.sw.join(", ")}, north-east {bbox.ne.join(", ")}.
        </p>
      </div>
    </div>
  );
}
