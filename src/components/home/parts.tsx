import clsx from "clsx";

export function GradientRule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "block w-full min-w-0 bg-overline-rule",
        // The gradient is the full accent ramp — surface/page into primary,
        // secondary, tertiary, quaternary, pentenary — and those hues are
        // already exactly the Foundations board's. What the board does NOT do is
        // hold it at 45%: that is what greys the teal and turns the pentenary
        // stop from orange into pale tan. So tile hover changes no colour at
        // all, it just stops muting the ones that are there.
        //
        // Opacity, unlike background-image, transitions — so this also gets the
        // sanctioned 150ms rather than the instant swap a second gradient
        // needed (docs/STAGE-0-NOTES.md §31).
        "opacity-45 transition-opacity duration-150 ease-in-out",
        "group-hover/tile:opacity-100",
        className,
      )}
    />
  );
}

// The teal overline label with the gradient hairline trailing off to its right
// — the header motif shared by the calendar, news, portrait and footer tiles.
export function Overline({
  children,
  withRule = true,
  shortRule = false,
  dark = false,
}: {
  children: React.ReactNode;
  withRule?: boolean;
  /** Trim 2px off the top of the rule — the portrait and media-card tiles sit
   *  it slightly below the label's cap height rather than flush with it. A top
   *  margin rather than a height, so the rule stays bottom-aligned with the
   *  label and still tracks its height (see GradientRule). */
  shortRule?: boolean;
  dark?: boolean;
}) {
  return (
    <div className="flex items-stretch gap-2">
      <span
        className={clsx(
          "whitespace-nowrap font-primary text-overline uppercase",
          dark ? "text-text-tertiary" : "text-text-quaternary",
        )}
      >
        {children}
      </span>
      {withRule && <GradientRule className={clsx("flex-1", shortRule && "mt-0.5")} />}
    </div>
  );
}

// Neutral stand-in for a photograph until the real Figma export lands under
// public/home/. Carries the alt text so the intended content is legible in
// layout review; swapped for <img>/next-image in the assets pass.
export function ImagePlaceholder({ alt, className }: { alt: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={clsx(
        "flex items-end overflow-hidden bg-accent-muted p-2 text-text-on-accent",
        className,
      )}
    >
      <span className="line-clamp-2 font-primary text-micro uppercase opacity-60">
        {alt}
      </span>
    </div>
  );
}

// The seven-stop accent gradient at 20%, cut to one of two shapes: the right
// triangle that washes the Study tile (`wash`, 330 square) and the equilateral
// one behind the page title (`polygon`, 173 × 150 — the "Polygon 1" vector in
// 4932:576887). Same stops, same opacity; only the outline and the gradient's
// span differ, so one component with a shape rather than two.
const WASH_SHAPE = {
  wash: {
    id: "nid-study-wash",
    viewBox: "0 0 330 330",
    path: "M330 0H0L330 330V0Z",
    line: { x1: 0, y1: 165, x2: 325.315, y2: 204.038 },
  },
  polygon: {
    id: "nid-title-polygon",
    viewBox: "0 0 173.205 150",
    path: "M86.6025 0L173.205 150H0L86.6025 0Z",
    line: { x1: 0, y1: 75, x2: 169.942, y2: 98.5479 },
  },
} as const;

export function GradientWash({
  shape = "wash",
  className,
}: {
  shape?: keyof typeof WASH_SHAPE;
  className?: string;
}) {
  const { id, viewBox, path, line } = WASH_SHAPE[shape];
  return (
    <svg
      aria-hidden="true"
      viewBox={viewBox}
      preserveAspectRatio={shape === "wash" ? "none" : "xMinYMin meet"}
      className={clsx(
        "pointer-events-none",
        shape === "wash" && "absolute inset-0 size-full",
        className,
      )}
    >
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" {...line}>
          <stop stopColor="var(--nid-accent-tertiary)" />
          <stop offset="0.206731" stopColor="var(--nid-accent-subtle)" />
          <stop offset="0.46" stopColor="var(--nid-accent-primary)" />
          <stop offset="0.6" stopColor="var(--nid-accent-secondary)" />
          <stop offset="0.73" stopColor="var(--nid-accent-tertiary)" />
          <stop offset="0.87" stopColor="var(--nid-accent-quaternary)" />
          <stop offset="1" stopColor="var(--nid-accent-pentenary)" />
        </linearGradient>
      </defs>
      <path d={path} fill={`url(#${id})`} fillOpacity="0.2" />
    </svg>
  );
}
