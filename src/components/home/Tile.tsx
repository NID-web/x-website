import clsx from "clsx";
import type { ElementType, ReactNode } from "react";

/**
 * Base tile primitive that manages surface, radius, padding, aspect ratio, and hover state.
 */
export type TileSurface = "page" | "raised" | "inverse" | "accent";

const SURFACE: Record<TileSurface, string> = {
  page: "bg-surface-page text-text-primary",
  raised: "bg-surface-raised text-text-primary",
  inverse: "bg-surface-inverse text-text-on-accent",
  accent: "bg-accent-subtle text-text-primary",
};

const SQUARE: Record<string, string> = {
  always: "aspect-square",
  tablet: "tablet:aspect-square",
  laptop: "laptop:aspect-square",
  desktop: "desktop:aspect-square",
  "max-laptop": "max-laptop:aspect-square",
  "max-tablet": "max-tablet:aspect-square",
};
const STRETCH: Record<string, string> = {
  always: "h-full",
  laptop: "laptop:h-full",
};
type SquareRange = "tablet" | "laptop" | "desktop" | "max-laptop" | "max-tablet";
const range = (v: boolean | SquareRange | undefined) =>
  v === true ? "always" : v === false || v === undefined ? undefined : v;

export interface TileProps {
  as?: ElementType;
  surface?: TileSurface;
  /** Keep square aspect ratio (or restrict to breakpoint range). */
  square?: boolean | SquareRange;
  /** Fill the full height of the row. */
  stretch?: boolean | "laptop";
  /** Apply default 24px padding. */
  padding?: boolean;
  /** Apply rounded corners. */
  radius?: boolean;
  interactive?: boolean;
  /** Bottom-pinned slot (e.g. a CTA), pushed down with mt-auto. */
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
      data-nid-tile
      className={clsx(
        "group/tile relative flex flex-col",
        surface !== "page" && (radius ? "overflow-hidden rounded-pill" : "overflow-hidden"),
        padding && "p-6",
        SURFACE[surface],
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
