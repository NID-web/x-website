import type { ReactNode } from "react";
import { GridItem } from "@/components/layout/GridItem";
import { Title } from "@/components/spine/Title";

/**
 * A titled list of LinkedRows: the h2 in column 1 and the `<ul>` in the rows'
 * span — columns 2–4, then 2–3, then full width below the h2. The archive
 * renders one per year, the award gallery one.
 *
 * The h2 pins column 1: with the page's back link pinned to row 1's last column,
 * an unpinned first title flows into the free cell beside the page title
 * (STAGE-0-NOTES §66).
 */
export function RowGroup({
  title,
  id,
  anchored = false,
  children,
}: {
  title: string;
  /** The h2's id, which also labels the list. */
  id: string;
  /** The h2 is a link target (the listing links each archive year). */
  anchored?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <Title variant="section" id={id} anchored={anchored} start={1}>
        {title}
      </Title>
      {/* span="hero" reuses the GEOMETRY — full, then 2 of 3 columns, then
          3 of 4 — not the meaning. These rows are not a hero; no other span has
          this shape, and adding a duplicate would not change a pixel. */}
      <GridItem as="ul" span="hero" start={2} aria-labelledby={id} className="flex flex-col gap-6">
        {children}
      </GridItem>
    </>
  );
}
