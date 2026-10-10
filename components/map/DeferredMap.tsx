"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { MapFeatureCollectionData } from "./MalawiMap";
import type { Feature, LineString } from "geojson";

/**
 * Defers loading the Mapbox bundle until the map is close to the viewport.
 *
 * `next/dynamic` with `ssr: false` gets Mapbox out of the initial payload. This
 * gets it off the critical path too: on a long homepage the map sits several
 * screens down, and there is no reason to fetch ~800kB of WebGL while the hero
 * is still painting.
 *
 * The placeholder is the same height as the real thing, so nothing reflows when
 * the map swaps in.
 */

const LazyMap = dynamic(() => import("./MalawiMap"), {
  ssr: false,
  loading: () => <MapPlaceholder height={620} />,
});

function MapPlaceholder({ height }: { height: number }) {
  return (
    <div
      className="w-full rounded-3xl bg-lake-deep grid place-items-center"
      style={{ height }}
      aria-hidden="true"
    >
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-ember rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-[12px] text-white/45 tracking-wide">Preparing the map</p>
      </div>
    </div>
  );
}

type DeferredMapProps = {
  geojson: MapFeatureCollectionData;
  bbox: { sw: [number, number]; ne: [number, number] };
  height?: number;
  className?: string;
  /** Optional itinerary route to draw as a dashed line across the map, in stop order. */
  route?: Feature<LineString> | null;
  /** Fires when the user picks a destination (clicks a marker). */
  onSelectDestination?: (id: string, coords: [number, number]) => void;
};

export default function DeferredMap({
  geojson,
  bbox,
  height = 620,
  className = "",
  route,
  onSelectDestination,
}: DeferredMapProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // Begin fetching well before it arrives, so it is usually ready on arrival.
      { rootMargin: "600px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={wrapperRef} className={className}>
      {visible ? (
        <LazyMap
          geojson={geojson}
          bbox={bbox}
          height={height}
          route={route}
          onSelectDestination={onSelectDestination}
        />
      ) : (
        <MapPlaceholder height={height} />
      )}
    </div>
  );
}