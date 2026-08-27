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
