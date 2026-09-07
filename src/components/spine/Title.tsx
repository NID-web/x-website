import type { ReactNode } from "react";
import { GridItem } from "@/components/layout/GridItem";
import { GradientWash } from "@/components/home/parts";

// Title (design/NID-CONTEXT.md §7.5, node 617:28704). `page` is the H1 across
// columns 1–2 with a gradient shape behind it, desktop only — the 1024, 768 and
// 390 boards draw the bare title. `section` is the label-rail heading in column
// 1, a full-width band below 3 columns (§8.1).
//
// TODO(review): About (a primary page) draws the equilateral polygon
// 4932:576887 and News & Events (secondary) the corner triangle 4932:576889.
// With one example each the wash is an explicit prop; if the system means
// primary → polygon and secondary → corner it should be read off page.template
// instead. Both emit
// their own GridItem into the page's one grid.
export function Title({
  variant,
  wash = "polygon",
  id,
  children,
}: {
  variant: "page" | "section";
  wash?: "polygon" | "corner";
  /** Names the heading so a landmark beside it can be labelled by reference
   *  rather than by repeating the string (the sibling band's nav). */
  id?: string;
  children: ReactNode;
}) {
  if (variant === "page") {
    return (
      <GridItem span={2} className="relative tablet:flex tablet:min-h-[150px] tablet:items-center">
        <GradientWash
          shape={wash}
          className="absolute top-0 left-0 hidden h-full w-auto desktop:block"
        />
        <h1 id={id} className="relative font-primary text-h1 text-text-tertiary">
          {children}
        </h1>
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
