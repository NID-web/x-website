import clsx from "clsx";

// PLACEHOLDER wordmark. The real asset is the bilingual NID lockup exported from
// Figma (§7.3, 213×30) as an inline SVG whose vectors bind to `icon/primary` via
// fill="currentColor" so it inverts in dark mode. Until that export lands (Figma
// MCP was rate-limited), this is a typographic stand-in in the same colour token
// — swapping it for the SVG is a one-file change with no caller impact.
//
//  • variant="full"    → desktop bilingual lockup, colour icon/primary
//  • variant="compact" → mobile mark "NID", colour accent/strong
export function Wordmark({
  variant = "full",
  className,
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  if (variant === "compact") {
    return (
      <span
        className={clsx(
          "font-primary text-h4 font-bold leading-none tracking-tight text-accent-strong",
          className,
        )}
      >
        NID
      </span>
    );
  }

  return (
    <span
      className={clsx("inline-flex items-baseline gap-2 text-icon-primary", className)}
    >
      <span className="font-primary text-h4 font-bold leading-none tracking-tight">NID</span>
      <span className="font-primary text-caption uppercase leading-tight tracking-wide">
        National Institute
        <br />
        of Design
      </span>
    </span>
  );
}
