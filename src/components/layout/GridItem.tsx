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
// `full-then-1` is Home's position statement, the one shape the numbers cannot
// express: it runs the full row below 1024 and shrinks to ONE column at 3
// columns and up — a reshape, not a clamp. Written as a base utility plus one
// breakpoint-scoped override, the same shape as SPAN[2], so the winner is
// decided by media range and never by the emit order of two unscoped utilities
// from the same family.
const SPAN = {
  1: "col-span-1",
  2: "col-span-full tablet:col-span-2",
  3: "col-span-full desktop:col-span-3",
  4: "col-span-full",
  "full-then-1": "col-span-full laptop:col-span-1",
} as const;

export type GridSpan = keyof typeof SPAN;

export function GridItem({
  span = 1,
  className,
  as: Tag = "div",
  children,
}: {
  span?: GridSpan;
  className?: string;
  as?: ElementType;
  children?: ReactNode;
}) {
  return <Tag className={clsx(SPAN[span], className)}>{children}</Tag>;
}
