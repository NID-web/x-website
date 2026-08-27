import clsx from "clsx";

// PLACEHOLDER motif. The real assets are the `Motif/<Theme>` symbols (Figma
// 3225:*); this is a small decorative emblem drawn from accent tokens instead.
// It is aria-hidden and purely decorative, so the decorative accent ramp is
// allowed here (CLAUDE.md § Colour). Because it reads only accent/* tokens, a
// scoped wrapper re-colours it to another theme while the rest of the page stays
// in the active theme — which is what the dropdown rows need (§3.5). Scoping
// needs BOTH data-theme and data-appearance on the wrapper (the semantic layer
// is keyed by appearance — see ThemePanel), not data-theme alone. Swap this for
// the real motif with no caller change.
export function ThemeMotif({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "relative inline-flex size-8 shrink-0 overflow-hidden rounded-md bg-accent-subtle",
        className,
      )}
    >
      <span className="absolute inset-0 bg-linear-to-br from-accent-secondary to-accent-primary" />
      <span className="absolute inset-[30%] rounded-full bg-accent-strong" />
    </span>
  );
}
