import clsx from "clsx";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

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
  // One column, except at THREE columns, where it takes the whole row. For a
  // block that is last of four: at 4 columns the four share one row, at 2 the
  // pairs do, and at 1 a column is the row — but at 3 the other three fill row
  // one and this lands on a row of its own, where staying one column wide
  // leaves two thirds of it empty. Same three-step shape as `hero`, so the
  // media range decides and not the emit order of three col-span utilities.
  "full-at-laptop": "col-span-1 laptop:col-span-full desktop:col-span-1",
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
// page's: the last column of the title row at 4 columns, a row beneath at 3
// (the title row's last column is a card's there), and flow — last, after the
// cards — below that. A row can only be named inside a `subgrid` item, whose
// rows are its own.
//
// At 3 columns it is column 2, the start of the content field, for every
// section — the link sits under the cards it belongs to rather than alone in
// the rail (design owner's call, docs/STAGE-0-NOTES.md §37, §42).
//
// Which ROW that is is left to auto-placement, and that is what lets one rule
// serve sections whose second row differs. Student Awards' two cards both fit
// the title row, so column 2 is free on row 2 and the link lands there. News's
// lead card takes columns 2–3 of the title row and its two square cards take
// 2–3 of the row below, so the first free cell in column 2 is row 3. Pinning
// the row instead would put News's link on top of a card — grid overlaps
// explicitly-placed items, it does not push them.
//
// Two more name a row that is not a section's:
//   page-utility  → the PAGE's own slot, back-nav or filter. The last column of
//                   row 1 at 3 and 4 columns, leaving row 1 below that
//                   (CLAUDE.md § Layout). It needs no subgrid: the page title
//                   is the grid's first child, so row 1 genuinely is row 1.
//                   `-col-start-2` is the last column at either count — line -2
//                   is line 4 of five, and line 3 of four.
//   rail          → column 1 of a section's second row, for the decorative tile
//                   that sits under a section title. Desktop only, like the
//                   tile: below that the rail stays empty and the cards keep to
//                   the content field (§37).
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
   *  cell can be pinned to "row 1" of a section, and so a card can align its
   *  parts to real columns. Still the one grid: no margin, no gutter, no second
   *  column definition. It composes with `span`, which decides how many tracks
   *  are inherited. Only the column axis is subgridded, so the row gap is
   *  restated; the column gap is inherited. */
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
