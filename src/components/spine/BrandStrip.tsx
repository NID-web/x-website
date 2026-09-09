import clsx from "clsx";
import { Wordmark } from "@/components/spine/Wordmark";

/**
 * Decorative craft brand strip.
 * Features an SVG pattern repeat of the craft quadrant, with an optional NID wordmark logo.
 */
export function BrandStrip({
  className,
  logo = false,
  flush = false,
}: {
  className?: string;
  logo?: boolean;
  /** Draw the band with no page spacing of its own. */
  flush?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "flex items-center",
        !flush && (logo ? "mt-[calc(1.5*var(--nid-grid-row-gap))]" : "mb-gutter"),
        logo && "gap-6 pb-2 pl-6",
        className,
      )}
    >
      {logo && (
        <Wordmark ariaHidden tone="accent-secondary" className="shrink-0" />
      )}
      <svg
        className="block h-12 w-full min-w-0 flex-1"
        preserveAspectRatio="xMinYMid slice"
      >
        <defs>
          <g id="nid-brand-quadrant">
            <rect x="4" y="4" width="2" height="2" fill="var(--nid-accent-tertiary)" />
            <rect x="18" y="4" width="2" height="2" fill="var(--nid-accent-tertiary)" />
            <rect x="16" y="6" width="2" height="2" fill="var(--nid-accent-tertiary)" />
            <rect x="20" y="6" width="2" height="2" fill="var(--nid-accent-quaternary)" />
            <rect x="8" y="8" width="2" height="2" fill="var(--nid-accent-quaternary)" />
            <rect x="14" y="8" width="2" height="2" fill="var(--nid-accent-tertiary)" />
            <rect x="22" y="8" width="2" height="2" fill="var(--nid-accent-quaternary)" />
            <rect x="8" y="14" width="2" height="2" fill="var(--nid-accent-tertiary)" />
            <rect x="16" y="14" width="2" height="2" fill="var(--nid-accent-pentenary)" />
            <rect x="23" y="14" width="1" height="2" fill="var(--nid-accent-tertiary)" />
            <rect x="6" y="16" width="2" height="2" fill="var(--nid-accent-tertiary)" />
            <rect x="14" y="16" width="2" height="2" fill="var(--nid-accent-pentenary)" />
            <rect x="18" y="16" width="2" height="2" fill="var(--nid-accent-pentenary)" />
            <rect x="4" y="18" width="2" height="2" fill="var(--nid-accent-tertiary)" />
            <rect x="16" y="18" width="2" height="2" fill="var(--nid-accent-pentenary)" />
            <rect x="20" y="18" width="2" height="2" fill="var(--nid-accent-tertiary)" />
            <rect x="6" y="20" width="2" height="2" fill="var(--nid-accent-quaternary)" />
            <rect x="18" y="20" width="2" height="2" fill="var(--nid-accent-tertiary)" />
            <rect x="22" y="20" width="2" height="2" fill="var(--nid-accent-tertiary)" />
            <rect x="8" y="22" width="2" height="2" fill="var(--nid-accent-quaternary)" />
            <rect x="20" y="22" width="2" height="2" fill="var(--nid-accent-tertiary)" />
            <rect x="14" y="23" width="2" height="1" fill="var(--nid-accent-tertiary)" />
          </g>
          <pattern
            id="nid-brand-strip"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <use href="#nid-brand-quadrant" />
            <use href="#nid-brand-quadrant" transform="translate(24 0) rotate(90 12 12)" />
            <use
              href="#nid-brand-quadrant"
              transform="translate(24 24) rotate(180 12 12)"
            />
            <use href="#nid-brand-quadrant" transform="translate(0 24) rotate(-90 12 12)" />
          </pattern>
        </defs>
        <rect width="100%" height="48" fill="url(#nid-brand-strip)" />
      </svg>
    </div>
  );
}
