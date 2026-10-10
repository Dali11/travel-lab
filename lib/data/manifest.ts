import fs from "node:fs";
import path from "node:path";

/**
 * The photograph manifest, in isolation.
 *
 * Split out from `lib/data/index.ts` for one specific reason: that module also
 * reads `data/destinations.json`, and any component that needs only a
 * photograph lookup — `components/travel/Photo.tsx` in particular — must not
 * pull `node:fs` into the browser bundle. Doing so fails the Turbopack build
 * with "the chunking context does not support external modules (node:fs)".
 *
 * So this file reads exactly one manifest, and nothing else may import the
 * destination reader from a client component. If a client component needs
 * destination data, it must receive it as props from a server component.
 */

export type PhotoEntry = {
  url: string;
  credit: string;
  license: string;
  attributionUrl?: string;
};

function readManifest(): Record<string, PhotoEntry> {
  try {
    // Literal subfolder so Turbopack can statically trace the call.
    const file = path.join(process.cwd(), "data", "photos.json");
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, PhotoEntry>;
  } catch (error) {
    // A malformed manifest must never take the site down: the UI degrades to a
    // designed colour field rather than a 500.
    console.warn("[travel-lab] could not read data/photos.json:", error);
    return {};
  }
}

/** Every verified photograph, keyed by its `photo` key. Empty if absent. */
export const photoManifest: Record<string, PhotoEntry> = readManifest();

export function photoFor(key: string | undefined): PhotoEntry | null {
  if (!key) return null;
  return photoManifest[key] ?? null;
}