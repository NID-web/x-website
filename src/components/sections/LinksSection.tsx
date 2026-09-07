import { GridItem } from "@/components/layout/GridItem";
import { Title } from "@/components/spine/Title";
import { LinkStack } from "@/components/sections/parts";
import type { Section } from "@/lib/content-model";

type LinksSectionData = Extract<Section, { type: "links" }>;

// type=links (NID-CONTEXT.md §8.2): a list of destinations beside the title,
// on the 330 line, two-up where the row allows it.
export function LinksSection({ section }: { section: LinksSectionData }) {
  return (
    <>
      <Title variant="section">{section.title}</Title>
      <GridItem span={2} start={2}>
        <LinkStack links={section.items} twoUpAtTablet />
      </GridItem>
    </>
  );
}
