import type { ReactNode } from "react";
import { GridItem } from "@/components/layout/GridItem";

// Title (design/NID-CONTEXT.md §7.5, node 617:28704). `page` is the H1 across
// columns 1–2. `section` is the label-rail heading in column 1, a full-width
// band below 3 columns (§8.1). Both emit their own GridItem into the page's
// one grid.
//
// The page title carried a gradient shape behind it, desktop only — the
// equilateral polygon 4932:576887 on About and the corner triangle 4932:576889
// on News & Events. Removed on the design owner's call; the `min-h-[150px]` is
// kept because it is the title block's own height, not the wash's.
export function Title({
  variant,
  id,
  subtitle,
  children,
}: {
  variant: "page" | "section";
  /** The serif italic sub-line under an H1 (Our Themes, 4800:582270). It sits
   *  INSIDE the title block rather than in the content field, which is where
   *  About puts its standfirst.
   *  TODO(review): two questions for the designer. Is the placement a
   *  primary/secondary template difference, or should About's standfirst move
   *  up here too? And the board sets this on text/quaternary, which is
   *  deliberately sub-AA and decorative-only — drawn here on text/secondary
   *  because it is a sentence of content; confirm. */
  subtitle?: string;
  /** Names the heading so a landmark beside it can be labelled by reference
   *  rather than by repeating the string (the sibling band's nav). */
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
          // The board sets this on text/quaternary, which CLAUDE.md documents
          // as deliberately below WCAG AA and decorative-only. This is a
          // sentence of content, so it is drawn one step darker.
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
