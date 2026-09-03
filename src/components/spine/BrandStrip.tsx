import clsx from "clsx";
import { NidWordmark } from "@/components/spine/NidWordmark";

// The NID brand strip (design/NID-CONTEXT.md §13) — the decorative craft band
// that sits directly under the header and again above the page foot.
//
// Reconstructed from the Figma Make export at design/reference/home-figma-make/.
// There the band is 30 repeated 48px "Tile"s, each holding four 24px
// "cross-garden-tile" quadrants — 120 nodes and ~3,300 lines of absolutely
// positioned <div>s. All 120 quadrants are byte-identical, so this draws the
// one 22-rect quadrant once and lets an SVG <pattern> repeat it. That also makes
// the strip fluid: the export is pinned to w-[1440px], this fills any width.
//
// The quadrant occupies x/y 4–24 of its 24px box, and the four placements below
// compose the 48px tile as a clean pinwheel: 0°, 90°, 180°, −90°. The last one
// is written `-rotate-90` in the export — read it carefully, matching just the
// digits gives 90 and yields a lopsided motif instead of a 4-fold symmetric one.
//
// Colours are the three decorative accent tokens, so the band re-themes with the
// page and inverts with appearance. Decorative and aria-hidden, so the
// decorative ramp is allowed here (CLAUDE.md § Colour).
//
// The export ships two variants. `device="Only Pattern"` is the band alone and
// opens the page; the default `device="Desktop"` leads with the NID wordmark and
// closes it. Hence `logo` — set it on the closing strip only.
export function BrandStrip({
  className,
  logo = false,
}: {
  className?: string;
  logo?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={clsx("flex items-center", logo && "gap-6 pb-2 pl-6", className)}
    >
      {logo && (
        // accent/secondary — the token the export's literal fill resolves to.
        <NidWordmark className="h-[29.583px] w-[213px] shrink-0 text-accent-secondary" />
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
