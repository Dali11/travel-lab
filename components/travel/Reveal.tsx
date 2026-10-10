"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Scroll reveal.
 *
 * Deliberately the smallest thing that works: an IntersectionObserver that
 * toggles one class. No animation library, no per-element motion state, and no
 * motion at all for anyone who has asked for reduced motion.
 *
 * The important part is the ORDER. Content is server-rendered fully visible, and
 * the hidden state is applied in a layout effect — before the browser paints —
 * only when JavaScript is actually running and motion is allowed. That gives:
 *
 *   - no flash, because useLayoutEffect runs before first paint
 *   - a complete, readable page if hydration fails or JS is blocked, which on a
 *     content site means the whole site rather than a hero and an empty page
 *   - no wasted work for anyone who prefers reduced motion
 *
 * Starting the element hidden in the markup would be simpler and would blank
 * the page for anyone whose JS did not run.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Stagger, in milliseconds. Kept under 400ms — longer reads as lag. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const node = ref.current;
    if (!node) return;

    // Only arm the hidden state once we know we can also un-hide it.
    setArmed(true);

    // Anything already on screen at mount reveals immediately, so the hero
    // region is never waiting on an observer that has already fired.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      // Start the reveal slightly before the element reaches the fold, so the
      // motion is already underway when the eye arrives.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hidden = armed && !shown;

  return (
    <Tag
      ref={ref as never}
      className={
        hidden
          ? `opacity-0 translate-y-6 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${className}`
          : `opacity-100 translate-y-0 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`
      }
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/**
 * Counts a number up when it scrolls into view.
 *
 * The rendered value is the REAL number from the server, and the animation
 * counts up to it rather than from nothing. An earlier version started at zero,
 * which meant that anyone whose observer never fired — or who arrived with JS
 * disabled — was shown "$0 estimated total". A budget figure reading zero is
 * worse than no animation at all.
 *
 * So: server renders the true value; on mount, if motion is allowed and the
 * element is in view, it counts from 0 to that value. Reduced motion and
 * no-JS both leave the correct number on screen.
 */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  durationMs = 900,
  className = "",
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);
  const done = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || done.current) return;

    // Re-target when the underlying figure changes (regenerating a trip).
    done.current = false;
    setValue(to);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      done.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        done.current = true;

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / durationMs);
          // easeOutExpo — fast start, gentle settle. Reads as premium, not bouncy.
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setValue(Math.round(to * eased));
          if (progress < 1) requestAnimationFrame(tick);
          else setValue(to); // land exactly on the real number
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [to, durationMs]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}