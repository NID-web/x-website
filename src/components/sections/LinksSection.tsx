import { GridItem } from "@/components/layout/GridItem";
import { Title } from "@/components/spine/Title";
import { Cta } from "@/components/spine/Cta";
import { startOf } from "@/components/sections/parts";
import type { Section } from "@/lib/content-model";
import { ctaProps } from "@/lib/content/links";

type LinksSectionData = Extract<Section, { type: "links" }>;

/**
 * Section rendering links across the content columns.
 */
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
