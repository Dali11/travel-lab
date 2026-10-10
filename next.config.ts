import type { NextConfig } from "next";

/**
 * Remote image hosts.
 *
 * `next/image` requires an allowlist before it will optimise a remote URL. The
 * photograph manifest (data/photos.json) currently resolves to Wikimedia
 * Commons and Unsplash; Vercel Blob is still permitted for operator uploads.
 *
 * If the manifest is later moved to a CMS or CDN, add that hostname here and
 * nothing else in the app needs to change — components/travel/Photo.tsx is the
 * only place that renders a remote image, and it validates against the same
 * list.
 */
const remotePatterns = [
  { protocol: "https" as const, hostname: "images.unsplash.com" },
  { protocol: "https" as const, hostname: "*.public.blob.vercel-storage.com" },
  { protocol: "https" as const, hostname: "br-morning-resonance-b9ys3mbr.storage.c-7.eu-central-1.aws.neon.tech" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    // WebP everywhere. Every photograph on this site is a large landscape
    // image, so AVIF would be nice but WebP is the safe floor across browsers.
    formats: ["image/webp"],
    // Limit image optimisation widths to reduce bandwidth and processing.
    // The largest configured width is 1600px.
    deviceSizes: [640, 750, 1080, 1200, 1600],
    imageSizes: [64, 96, 128, 256, 384],
  },
};

export default nextConfig;