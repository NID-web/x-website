import clsx from "clsx";
import type { ElementType, ReactNode } from "react";

// The base square primitive every home tile wraps. It owns only the shell —
// surface, radius, padding, the square box, the bottom-pinned CTA slot and the
// sanctioned colour-only hover (150ms, no transform; mirrors ThemePanel.tsx).
// Type styles and content belong to the tile components, never here.
export type TileSurface = "page" | "raised" | "inverse" | "accent";

// Only layer-2 semantic tokens (CLAUDE.md § Colour). `inverse` is the one
// sanctioned dark pairing and inverts correctly in dark mode; accent surfaces
// are decorative beds only — nothing meaningful is placed on them.
const SURFACE: Record<TileSurface, string> = {
  page: "bg-surface-page text-text-primary",
  raised: "bg-surface-raised text-text-primary",
  inverse: "bg-surface-inverse text-text-on-accent",
  accent: "bg-accent-subtle text-text-primary",
};

export interface TileProps {
  as?: ElementType;
  surface?: TileSurface;
  /** Keep the 1:1 box at tablet and up; relax to natural height at 1 column so a
   *  full-bleed square text tile doesn't swallow the phone fold. */
  square?: boolean;
  /** Non-square tiles that should fill the row height set by their square
   *  neighbours (the span-2 hero). Ignored when `square`. */
  stretch?: boolean;
  /** 24px inset (`--spacing` is 4px). Flush text tiles sitting on the page pass
   *  `padding={false}` and align to the grid column. */
  padding?: boolean;
  /** Card tiles carry the 24px pill radius. The row-1 hero passes `false` — its
   *  Figma card sets `border-radius: inherit` with nothing to inherit from, i.e.
   *  square corners. No effect on a `page` surface, which has no visible card. */
  radius?: boolean;
  interactive?: boolean;
  /** Bottom-pinned slot (e.g. a CTA), pushed down with `mt-auto`. */
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Tile({
  as: Tag = "article",
  surface = "raised",
  square = true,
  stretch = false,
  padding = true,
  radius = true,
  interactive = false,
  footer,
  className,
  children,
}: TileProps) {
  return (
    <Tag
      className={clsx(
        "relative flex flex-col",
        // A page-surface tile has no visible card — no radius, and no clipping
        // (its content, e.g. the tall statement, may exceed the square cell).
        // `rounded-pill` and `rounded-none` are the same utility family, so
        // which one wins would come down to Tailwind's emit order, not class
        // order — hence a branch here rather than an override from the caller.
        surface !== "page" && (radius ? "overflow-hidden rounded-pill" : "overflow-hidden"),
        padding && "p-6",
        SURFACE[surface],
        // Square tiles get their height from their width at tablet+. A stretch
        // tile (the span-2 hero) fills the row height set by its neighbours;
        // everything else takes its natural height.
        square ? "tablet:aspect-square" : stretch ? "h-full" : undefined,
        interactive && "transition-colors duration-150 ease-in-out hover:bg-surface-hover",
        className,
      )}
    >
      {children}
      {footer != null && <div className="mt-auto pt-4">{footer}</div>}
    </Tag>
  );
}
