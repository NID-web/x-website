import type { Ref } from "react";
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
  /** Glyph colour. `quaternary` is §7.2's default; the main menu's close
      button is an icon/primary instance (Figma 679:45558). A `className`
      cannot do this — two colour utilities tie on specificity and the
      stylesheet order, not the class order, decides. */
  tone?: "quaternary" | "primary";
  onClick?: () => void;
  /** Toggle wiring for the overlays it opens. */
  expanded?: boolean;
  controls?: string;
  className?: string;
  /** React 19 passes `ref` as an ordinary prop — the main menu focuses its
      close button on open. */
  ref?: Ref<HTMLButtonElement>;
}

export function IconButton({
  icon,
  label,
  size = "medium",
  tone = "quaternary",
  onClick,
  expanded,
  controls,
  className,
  ref,
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      aria-controls={controls}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full p-1",
        tone === "primary" ? "text-icon-primary" : "text-icon-quaternary",
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
