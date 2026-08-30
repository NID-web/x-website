import clsx from "clsx";

// The recurring gradient hairline motif — a thin rule that fades along the
// brand accent ramp. Purely decorative (aria-hidden), so decorative accent
// tokens are fine here; nothing meaningful rides on it (CLAUDE.md § Colour).
export function GradientRule({
  className,
  tone = "brand",
}: {
  className?: string;
  tone?: "brand" | "fade";
}) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "block h-px w-full",
        tone === "brand"
          ? "bg-linear-to-r from-accent-secondary via-accent-quaternary to-accent-pentenary"
          : "bg-linear-to-r from-accent-primary to-transparent",
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
}: {
  children: React.ReactNode;
  withRule?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap font-primary text-overline uppercase text-text-tertiary">
        {children}
      </span>
      {withRule && <GradientRule className="shrink" />}
    </div>
  );
}

// Neutral stand-in for a photograph until the real Figma export lands under
// public/home/. Carries the alt text so the intended content is legible in
// layout review; swapped for <img>/next-image in the assets pass.
export function ImagePlaceholder({
  alt,
  className,
}: {
  alt: string;
  className?: string;
}) {
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

// The diagonal gradient wash on the "Study at NID" tile.
//
// From the Figma Make export (design/reference/home-figma-make/): a triangle
// covering the top-right half of a 330×330 tile — `M330 0H0L330 330V0Z` — filled
// with a 7-stop linear gradient at 20% opacity. The export bakes the stops as
// hexes; every one of them resolves to a semantic accent token, so they are
// named here instead and the wash re-themes with the page.
//
// preserveAspectRatio="none" lets the triangle stretch with the tile rather than
// staying square. Decorative, so aria-hidden and the decorative ramp is fine.
export function GradientWash({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 330 330"
      preserveAspectRatio="none"
      className={clsx("pointer-events-none absolute inset-0 size-full", className)}
    >
      <defs>
        <linearGradient
          id="nid-study-wash"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="165"
          x2="325.315"
          y2="204.038"
        >
          <stop stopColor="var(--nid-accent-tertiary)" />
          <stop offset="0.206731" stopColor="var(--nid-accent-subtle)" />
          <stop offset="0.46" stopColor="var(--nid-accent-primary)" />
          <stop offset="0.6" stopColor="var(--nid-accent-secondary)" />
          <stop offset="0.73" stopColor="var(--nid-accent-tertiary)" />
          <stop offset="0.87" stopColor="var(--nid-accent-quaternary)" />
          <stop offset="1" stopColor="var(--nid-accent-pentenary)" />
        </linearGradient>
      </defs>
      <path d="M330 0H0L330 330V0Z" fill="url(#nid-study-wash)" fillOpacity="0.2" />
    </svg>
  );
}
