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

// `square` and `stretch` each name a media range, and a tile is never both in
// the same range, so both classes can be emitted together (the hero is square
// below laptop and a stretch follower at laptop and up). `true` means "every
// breakpoint" — pairing `square` and `stretch` at that width would be a
// contradiction, so don't.
const SQUARE: Record<string, string> = {
  always: "aspect-square",
  laptop: "laptop:aspect-square",
  "max-laptop": "max-laptop:aspect-square",
  "max-tablet": "max-tablet:aspect-square",
};
const STRETCH: Record<string, string> = {
  always: "h-full",
  laptop: "laptop:h-full",
};
const range = (v: boolean | "laptop" | "max-laptop" | "max-tablet" | undefined) =>
  v === true ? "always" : v === false || v === undefined ? undefined : v;

export interface TileProps {
  as?: ElementType;
  surface?: TileSurface;
  /** The 1:1 box, at EVERY breakpoint including phones — all four Figma boards
   *  draw every tile square, the 390 one included (docs/STAGE-0-NOTES.md §20).
   *  `"laptop"` / `"max-laptop"` / `"max-tablet"` narrow it to one side of a
   *  breakpoint: the position statement is square only at 3 columns and up, the
   *  hero only at 1 column (it is a 2-wide banner at every wider count). */
  square?: boolean | "laptop" | "max-laptop" | "max-tablet";
  /** Tiles that should fill the row height set by their square neighbours
   *  rather than set it (the span-2 hero, at laptop and up). */
  stretch?: boolean | "laptop";
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
  const squareRange = range(square);
  const stretchRange = range(stretch);
  return (
    <Tag
      // The hook src/app/globals.css hangs --nid-type-scale off: inside a tile,
      // type follows the rendered column rather than the four fixed breakpoint
      // steps (docs/STAGE-0-NOTES.md §24).
      data-nid-tile
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
        // A square tile gets its height from its width — and, on a page
        // surface (overflow visible), grows past it when its content is taller,
        // which is what sets the row. A stretch tile fills the row height its
        // neighbours set instead of setting it.
        squareRange && SQUARE[squareRange],
        stretchRange && STRETCH[stretchRange],
        interactive && "transition-colors duration-150 ease-in-out hover:bg-surface-hover",
        className,
      )}
    >
      {children}
      {footer != null && <div className="mt-auto pt-4">{footer}</div>}
    </Tag>
  );
}
