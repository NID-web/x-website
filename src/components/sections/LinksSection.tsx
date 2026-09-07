import { GridItem } from "@/components/layout/GridItem";
import { Title } from "@/components/spine/Title";
import { Cta } from "@/components/spine/Cta";
import { startOf } from "@/components/sections/parts";
import type { Section } from "@/lib/content-model";
import { ctaProps } from "@/lib/content/links";

type LinksSectionData = Extract<Section, { type: "links" }>;

// type=links (NID-CONTEXT.md §8.2): destinations across the content field, one
// to a column — the News & Events archive row draws 2025 / 2024 / Older in
// columns 2, 3 and 4 (4123:240894). A link the model cannot resolve to an href
// renders nothing, so the cells are built from the resolved list and never from
// the raw index.
export function LinksSection({ section }: { section: LinksSectionData }) {
  const links = section.items.flatMap((item) => {
    const cta = ctaProps(item);
    return cta ? [{ id: item.id, cta }] : [];
  });

  return (
    <>
      <Title variant="section">{section.title}</Title>
      {links.map((link, i) => (
        <GridItem key={link.id} span={1} start={startOf(i)}>
          <Cta variant="primary" {...link.cta} />
        </GridItem>
      ))}
    </>
  );
}
