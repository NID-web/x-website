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
const SPAN = {
  1: "col-span-1",
  2: "col-span-full tablet:col-span-2",
  3: "col-span-full desktop:col-span-3",
  4: "col-span-full",
} as const;

export function GridItem({
  span = 1,
  className,
  as: Tag = "div",
  children,
}: {
  span?: 1 | 2 | 3 | 4;
  className?: string;
  as?: ElementType;
  children?: ReactNode;
}) {
  return <Tag className={clsx(SPAN[span], className)}>{children}</Tag>;
}
