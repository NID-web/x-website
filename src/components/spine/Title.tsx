import type { ReactNode } from "react";
import { GridItem } from "@/components/layout/GridItem";

/**
 * Page title (H1) or section heading (H2) component.
 */
export function Title({
  variant,
  id,
  subtitle,
  children,
}: {
  variant: "page" | "section";
  /** Optional italic sub-line beneath an H1. */
  subtitle?: string;
  /** Heading element ID for landmark labelling. */
  id?: string;
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
    <GridItem span="full-then-1">
      <h2 id={id} className="font-primary text-h2 text-text-tertiary">
        {children}
      </h2>
    </GridItem>
  );
}
