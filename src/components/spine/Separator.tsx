import { GridItem } from "@/components/layout/GridItem";

// Section separator (3847:87985): a 24px full-width row with no visible rule —
// the space between sections is this row plus the grid gap either side. The
// 768 board keeps it; the 390 board drops it (NID-CONTEXT.md §5.3), which is
// a drop of decorative content and so allowed.
export function Separator() {
  return <GridItem as="hr" span={4} className="hidden h-6 border-0 tablet:block" />;
}
