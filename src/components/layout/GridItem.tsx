import clsx from "clsx";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

// Responsive column spans. Replaces the broken
// `grid-column: span min(2, var(--nid-grid-columns))` idiom — `span` requires
// an integer literal, `min()` there is dropped by every browser and every span
// silently becomes 1. A span never exceeds the available columns, and columns
// drop right-to-left; nothing is ever reordered.
//
// Each named span is a base utility plus BREAKPOINT-SCOPED overrides, never two
// unscoped utilities from the same family, so the media range decides the
// winner and not the emit order.
const SPAN = {
  1: "col-span-1",
  2: "col-span-full tablet:col-span-2",
  // No `laptop:` step needed: at 3 columns, col-span-full (`1 / -1`) already IS
  // three columns.
  3: "col-span-full desktop:col-span-3",
  4: "col-span-full",
  /** Full row below laptop, 1 column at 3 columns and up — a reshape, not a
   *  clamp. Home's position statement and the sub-page link stack. */
  "full-then-1": "col-span-full laptop:col-span-1",
  /** 1 column everywhere except at THREE columns, where it takes the whole row.
   *  For a block that is last of four: at 3 columns the other three fill row
   *  one and this lands alone on row two, where one column leaves two thirds
   *  of it empty. */
  "full-at-laptop": "col-span-1 laptop:col-span-full desktop:col-span-1",
  /** The page hero: full row below laptop, 2 of 3 columns, 3 of 4
   *  (NID-CONTEXT.md §5.3). */
  hero: "col-span-full laptop:col-span-2 desktop:col-span-3",
} as const;

// Explicit column start, for a cell that must be NAMED rather than reached by
// flow. Auto-placement is unaffected at 1 and 2 columns, where there is no rail.
//   1          -> column 1 at 3 columns and up
//   2          -> column 2 at 3 columns and up
//   2-laptop   -> column 2 at 3 columns only (auto at 4, where the card fits)
//   2-desktop  -> column 2 at 4 columns only
const START = {
  1: "laptop:col-start-1",
  2: "laptop:col-start-2",
  "2-laptop": "laptop:col-start-2 desktop:col-start-auto",
  "2-desktop": "desktop:col-start-2",
} as const;

// Placement for utility slots, the page back-nav, and rails. A row can only be
// named inside a `subgrid` item, whose rows are its own.
//
//   utility       -> a SECTION's links: last column of the title row at 4
//                    columns, column 2 at 3 (under the cards they belong to,
//                    not alone in the rail — STAGE-0-NOTES §37, §42). Which ROW
//                    is left to auto-placement, and that is what lets one rule
//                    serve sections whose second row differs. Pinning the row
//                    instead would drop News's link on top of a card: grid
//                    overlaps explicitly-placed items, it does not push them.
//   page-utility  -> the PAGE's own slot, back-nav or filter. Last column of
//                    row 1 at 3 and 4 columns (CLAUDE.md § Layout). Needs no
//                    subgrid — the page title is the grid's first child, so row
//                    1 genuinely is row 1. `-col-start-2` is the last column at
//                    either count: line -2 is line 4 of five, and line 3 of four.
//   rail          -> column 1 of a section's second row, for the decorative
//                    tile under a section title. Desktop only, like the tile.
const PLACE = {
  utility: "laptop:col-start-2 desktop:-col-start-2 desktop:row-start-1",
  "page-utility": "laptop:-col-start-2 laptop:row-start-1",
  rail: "desktop:col-start-1 desktop:row-start-2",
} as const;

export type GridSpan = keyof typeof SPAN;
export type GridStart = keyof typeof START;
export type GridPlace = keyof typeof PLACE;

export function GridItem({
  span = 1,
  start,
  place,
  subgrid = false,
  className,
  as: Tag = "div",
  children,
  ...rest
}: {
  span?: GridSpan;
  start?: GridStart;
  place?: GridPlace;
  /** Lay this item's children on the page's own column tracks
   *  (`grid-template-columns: subgrid`) while giving it rows of its own — so a
   *  cell can be pinned to "row 1" of a section, and a card can align its parts
   *  to real columns. Still the one grid: no margin, no gutter, no second column
   *  definition. Composes with `span`, which decides how many tracks are
   *  inherited. Only the column axis is subgridded, so the row gap is restated;
   *  the column gap is inherited. */
  subgrid?: boolean;
  className?: string;
  as?: ElementType;
  children?: ReactNode;
  // Everything else reaches the element. Without this a GridItem rendered
  // `as="nav"` silently loses its accessible name — the attribute is accepted
  // by the type checker and then dropped, so the landmark ships unlabelled.
} & Omit<ComponentPropsWithoutRef<"div">, "className" | "children">) {
  return (
    <Tag
      className={clsx(
        SPAN[span],
        subgrid && "grid grid-cols-subgrid gap-y-rowgutter",
        start && START[start],
        place && PLACE[place],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
