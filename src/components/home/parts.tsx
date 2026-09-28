import clsx from "clsx";

export function GradientRule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "block w-full min-w-0 bg-overline-rule",
        "opacity-45 transition-opacity duration-150 ease-in-out group-hover/tile:opacity-100",
        className,
      )}
    />
  );
}

/**
 * Overline label component with trailing gradient rule.
 */
export function Overline({
  children,
  withRule = true,
  shortRule = false,
  dark = false,
  hoverDark = false,
  wrap = false,
  capTrim = false,
}: {
  children: React.ReactNode;
  withRule?: boolean;
  shortRule?: boolean;
  /** text/tertiary instead of text/quaternary — for an overline that carries
   *  information (an award's name), since quaternary is below AA by design. */
  dark?: boolean;
  hoverDark?: boolean;
  /** Let a long label wrap. Off by default: a tile's overline is one line. */
  wrap?: boolean;
  /** Trim the line box to cap height and baseline, as the award row's overline
   *  is drawn: its 12px line box on an ~8px cap made each row 4px taller than
   *  the board (100 vs 96). Browsers without `text-box` keep the full box. */
  capTrim?: boolean;
}) {
  return (
    <div className="flex items-stretch gap-2">
      <span
        className={clsx(
          !wrap && "whitespace-nowrap",
          "font-primary text-overline uppercase",
          capTrim && "[text-box:trim-both_cap_alphabetic]",
          dark ? "text-text-tertiary" : "text-text-quaternary",
          hoverDark &&
            "transition-colors duration-150 ease-in-out group-hover/tile:text-text-primary",
        )}
      >
        {children}
      </span>
      {withRule && <GradientRule className={clsx("flex-1", shortRule && "mt-0.5")} />}
    </div>
  );
}

/**
 * Image placeholder for missing or loading photo assets.
 */
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

/**
 * Seven-stop accent gradient wash overlay.
 */
const WASH = {
  id: "nid-study-wash",
  viewBox: "0 0 330 330",
  path: "M330 0H0L330 330V0Z",
  line: { x1: 0, y1: 165, x2: 325.315, y2: 204.038 },
} as const;

export function GradientWash({ className }: { className?: string }) {
  const { id, viewBox, path, line } = WASH;
  return (
    <svg
      aria-hidden="true"
      viewBox={viewBox}
      preserveAspectRatio="none"
      className={clsx("pointer-events-none absolute inset-0 size-full", className)}
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
