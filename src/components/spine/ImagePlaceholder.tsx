import clsx from "clsx";

/**
 * Flat stand-in for an image the CMS has not supplied yet, drawn exactly as the
 * boards draw one: a single `accent/subtle` field, no label, no icon
 * (4118:205429 the hero, 4140:246793 / 4140:246794 the section images).
 *
 * `aria-hidden` because it carries nothing — a screen reader announcing an
 * empty box is worse than silence. It is scaffolding: the day the asset lands
 * the caller renders `TileImage` instead and nothing around it moves.
 */
export function ImagePlaceholder({ className }: { className?: string }) {
  return <div aria-hidden="true" className={clsx("w-full bg-accent-subtle", className)} />;
}
