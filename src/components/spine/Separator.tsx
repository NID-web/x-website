import { GridItem } from "@/components/layout/GridItem";

/** Empty 24px full-width section separator row, hidden on mobile. */
export function Separator() {
  return <GridItem as="hr" span={4} className="hidden h-6 border-0 tablet:block" />;
}
