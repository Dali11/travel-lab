import Link from "next/link";

/**
 * Layout and motion primitives shared across the whole site.
 *
 * These are server components on purpose. The only thing here that runs on the
 * client is `Reveal`, and it is a two-line intersection observer rather than a
 * scroll-animation library, which keeps the homepage from shipping Framer Motion
 * for a fade-up.
 */

/** Consistent page gutter. Cinematic on desktop, thumb-friendly on mobile. */
export const shell = "px-5 sm:px-8 lg:px-12";

/** Section vertical rhythm. Immersive full-bleed sections, generous air. */
export const sectionY = "py-20 sm:py-28 lg:py-36";

export function Eyebrow({
  children,
  tone = "ember",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "ember" | "light" | "lake";
  className?: string;
}) {
  const colour =
    tone === "light" ? "text-white/70" : tone === "lake" ? "text-lake" : "text-ember";
  return (
    <span className={`eyebrow ${colour} ${className}`}>
      {children}
    </span>
  );
}

/**
 * Section heading. Serif display at a scale that reads as editorial rather than
 * as a dashboard.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = "dark",
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={`${align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-3xl"} ${className}`}
    >
      {eyebrow && (
        <Eyebrow tone={tone === "light" ? "light" : "ember"} className="block mb-4">
          {eyebrow}
        </Eyebrow>
      )}
      <h2
        className={`font-display text-[clamp(2rem,5.2vw,3.9rem)] font-semibold leading-[1.03] tracking-[-0.02em] text-balance ${
          tone === "light" ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={`mt-6 text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-pretty ${
            tone === "light" ? "text-white/70" : "text-muted"
          }`}
        >
          {intro}
        </p>
      )}
    </div>
  );
}

/** Pill navigation link. The only button-like shape used for navigation. */
export function PillLink({
  href,
  children,
  variant = "outline",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost" | "light";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold transition-all duration-300";
  const styles = {
    solid: "bg-ember text-white hover:bg-[#c85f2e] hover:-translate-y-0.5",
    outline: "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-cream",
    ghost: "border border-white/25 text-white hover:bg-white/10",
    light: "bg-white text-ink hover:bg-cream hover:-translate-y-0.5",
  }[variant];

  const external = href.startsWith("http");
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer nofollow"
        className={`${base} ${styles} ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

/** Section label used above immersive media blocks. */
export function SectionRule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-5">
      <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/40">
        {label}
      </span>
      <span className="h-px flex-1 bg-ink/12" />
    </div>
  );
}

export function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  const full = Math.round(rating);
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((index) => (
        <svg
          key={index}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={index <= full ? "text-ember" : "text-ink/20"}
          fill="currentColor"
        >
          <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
        </svg>
      ))}
    </span>
  );
}