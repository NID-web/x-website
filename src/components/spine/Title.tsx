import type { ReactNode } from "react";
import { GridItem } from "@/components/layout/GridItem";
import { GradientWash } from "@/components/home/parts";

// Title (design/NID-CONTEXT.md §7.5, node 617:28704). `page` is the H1 across
// columns 1–2 with the gradient polygon behind it (4932:576887; desktop only —
// the 1024, 768 and 390 boards draw the bare title). `section` is the
// label-rail heading in column 1, a full-width band below 3 columns (§8.1). Both emit
// their own GridItem into the page's one grid.
export function Title({
  variant,
  children,
}: {
  variant: "page" | "section";
  children: ReactNode;
}) {
  if (variant === "page") {
    return (
      <GridItem span={2} className="relative tablet:flex tablet:min-h-[150px] tablet:items-center">
        <GradientWash
          shape="polygon"
          className="absolute top-0 left-0 hidden h-full w-auto desktop:block"
        />
        <h1 className="relative font-primary text-h1 text-text-tertiary">{children}</h1>
      </GridItem>
    );
  }
  return (
    <GridItem span="full-then-1">
      <h2 className="font-primary text-h2 text-text-tertiary">{children}</h2>
    </GridItem>
  );
}
