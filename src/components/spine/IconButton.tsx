import clsx from "clsx";
import { Icon, type IconName } from "@/components/spine/Icon";

// Circular icon-only button (design/NID-CONTEXT.md §7.2, node 271:6117).
//  • Medium 32×32 with a 24px glyph · Small 24×24 with a 16px glyph
//  • radius-full (a circle at these sizes), 4px padding all round
//  • no fill by default; hover fills accent/quaternary
//  • glyph colour is icon/quaternary via currentColor — the glyph never
//    hard-codes a fill (CLAUDE.md § Icons), so `color` here governs it.
// A real <button>: the header uses it for the search and menu toggles, so it
// carries the toggle a11y props. `label` is required — the button has no text.
export interface IconButtonProps {
  icon: IconName;
  label: string;
  size?: "medium" | "small";
  onClick?: () => void;
  /** Toggle wiring for the overlays it opens. */
  expanded?: boolean;
  controls?: string;
  className?: string;
}

export function IconButton({
  icon,
  label,
  size = "medium",
  onClick,
  expanded,
  controls,
  className,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      aria-controls={controls}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full p-1 text-icon-quaternary",
        "transition-colors duration-150 ease-in-out hover:bg-accent-quaternary",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong",
        size === "medium" ? "size-8" : "size-6",
        className,
      )}
    >
      <Icon name={icon} className={size === "medium" ? "size-6" : "size-4"} />
    </button>
  );
}
