import clsx from "clsx";
import type { ElementType, ReactNode } from "react";

// Replaces the broken `grid-column: span min(2, var(--nid-grid-columns))`
// idiom (grid-column: span requires an integer literal; min() there is
// dropped by every browser and every span silently becomes 1). A span never
// exceeds the available columns, and columns drop right-to-left — nothing
// is ever reordered.
//
//        mobile·1col  tablet·2col  laptop·3col  desktop·4col
//   1          1            1            1            1
//   2        full            2            2            2
//   3        full         full         full (=3)       3
//   4        full         full         full         full
//
// col-span-full is `grid-column: 1 / -1`, so it is always exactly the row.
// A 3-span needs no laptop: class because full width *is* three columns there.
//
// Two named spans cover the shapes the numbers cannot express. `full-then-1` is
// Home's position statement and the sub-page link stack: the full row below
// 1024, ONE column at 3 columns and up — a reshape, not a clamp. `hero` is the
// page hero: the full row below 1024, two of three columns, three of four
// (NID-CONTEXT.md §5.3). Each is a base utility plus breakpoint-scoped
// overrides, the same shape as SPAN[2], so the winner is decided by media
// range and never by the emit order of two unscoped utilities from the same
// family.
const SPAN = {
  1: "col-span-1",
  2: "col-span-full tablet:col-span-2",
  3: "col-span-full desktop:col-span-3",
  4: "col-span-full",
  "full-then-1": "col-span-full laptop:col-span-1",
  hero: "col-span-full laptop:col-span-2 desktop:col-span-3",
} as const;

// Where a column must be named rather than reached by flow. Row 1 holds only
// the page title and the utility slot, so what follows the title opens row 2
// (`1`); the intro's rail cell is empty (`2`); and a card that wraps at 3
// columns stays in the field, as the 1024 board draws it, rather than
// dropping into the rail. Auto-placement is unaffected at 1 and 2 columns,
// where there is no rail.
//   1          → column 1 at 3 columns and up
//   2          → column 2 at 3 columns and up
//   2-laptop   → column 2 at 3 columns only (auto at 4, where the card fits)
//   2-desktop  → column 2 at 4 columns only
const START = {
  1: "laptop:col-start-1",
  2: "laptop:col-start-2",
  "2-laptop": "laptop:col-start-2 desktop:col-start-auto",
  "2-desktop": "desktop:col-start-2",
} as const;

// A section's utility slot — its links, placed the way CLAUDE.md places the
// page's: the last column of the title row at 4 columns, the rail on the row
// beneath at 3 (the title row's last column is the lead card's there), and
// flow — last, after the cards — below that. A row can only be named inside a
// `subgrid` item, whose rows are its own.
const PLACE = {
  utility: "laptop:col-start-1 laptop:row-start-2 desktop:-col-start-2 desktop:row-start-1",
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
}: {
  span?: GridSpan;
  start?: GridStart;
  place?: GridPlace;
  /** A full-row item whose children are laid on the page's own column tracks
   *  (`grid-template-columns: subgrid`) but on rows of its own — so a cell can
   *  be pinned to "row 1" of the section. Still the one grid: no margin, no
   *  gutter, no second column definition. Only the column axis is subgridded,
   *  so the row gap is restated. */
  subgrid?: boolean;
  className?: string;
  as?: ElementType;
  children?: ReactNode;
}) {
  return (
    <Tag
      className={clsx(
        subgrid ? "col-span-full grid grid-cols-subgrid gap-y-rowgutter" : SPAN[span],
        start && START[start],
        place && PLACE[place],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
