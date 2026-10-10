"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * An image that degrades instead of leaving a hole.
 *
 * The photographs come from a third-party CDN, and that CDN will occasionally
 * time out, rate-limit, or serve a thumbnail that does not exist. Without this,
 * a failed image leaves an empty frame with the copy on top of it, which reads
 * as a broken website rather than a slow network.
 *
 * So on error we hide the <Image> and let the parent's fallback show through.
 * The parent renders the colour field underneath, so this is only ever a
 * one-line state change — no layout shift, no reflow.
 *
 * Kept as its own tiny client component so `Photo` itself stays a server
 * component: pages that render no images cost no JavaScript at all.
 */
export function ResilientImage({
  src,
  alt,
  sizes,
  priority,
  className,
  onFailure,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Called when the image fails, so the parent can track it if it wants to. */
  onFailure?: () => void;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={src.includes(".storage.c-7.eu-central-1.aws.neon.tech/")}
      onError={() => {
        setFailed(true);
        onFailure?.();
      }}
      className={`object-cover ${className ?? ""}`}
    />
  );
}