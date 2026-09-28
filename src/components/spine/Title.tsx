import clsx from "clsx";
import type { ReactNode } from "react";
import { GridItem, type GridStart } from "@/components/layout/GridItem";

/**
 * Page title (H1) or section heading (H2) component.
 */
export function Title({
  variant,
  id,
  subtitle,
  anchored = false,
  start,
  children,
}: {
  variant: "page" | "section";
  /** Optional italic sub-line beneath an H1. */
  subtitle?: string;
  /** Heading element ID for landmark labelling. */
  id?: string;
  /** A section heading that is a link target (a year anchor): it lands 24px below
   *  the sticky header (50px, 60px from tablet) instead of under it. */
  anchored?: boolean;
  /** A section title that must open a row: with a page utility slot pinned to
   *  row 1's last column, an unpinned first title flows into the free cell
   *  between the page title and the slot. */
  start?: GridStart;
  children: ReactNode;
}) {
  if (variant === "page") {
    return (
      <GridItem
        span={2}
        className="tablet:flex tablet:min-h-[150px] tablet:flex-col tablet:justify-center tablet:gap-1"
      >
        <h1 id={id} className="font-primary text-h1 text-text-tertiary">
          {children}
        </h1>
        {subtitle && (
          <p className="font-secondary text-display-quote italic text-text-secondary">
            {subtitle}
          </p>
        )}
      </GridItem>
    );
  }
  return (
    <GridItem span="full-then-1" start={start}>
      <h2
        id={id}
        className={clsx(
          "font-primary text-h2 text-text-tertiary",
          anchored && "scroll-mt-[74px] tablet:scroll-mt-[84px]",
        )}
      >
        {children}
      </h2>
    </GridItem>
  );
}
