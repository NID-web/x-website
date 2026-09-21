import { GridItem } from "@/components/layout/GridItem";
import { Title } from "@/components/spine/Title";
import { Cta } from "@/components/spine/Cta";
import { LinkStack, startOf } from "@/components/sections/parts";
import type { Section } from "@/lib/content-model";
import { ctaProps } from "@/lib/content/links";

type LinksSectionData = Extract<Section, { type: "links" }>;

/**
 * Section rendering links across the content columns.
 */
export function LinksSection({
  section,
  layout = "flow",
}: {
  section: LinksSectionData;
  /** `flow`: one link per column across the content field (the News archive,
   *  4123:240894). `two-up`: a two-column stack in columns 2–3, column 4 left
   *  empty — Ahmedabad's Centre links (4132:246478), SiblingBand's figure. */
  layout?: "flow" | "two-up";
}) {
  const links = section.items.flatMap((item) => {
    const cta = ctaProps(item);
    return cta ? [{ id: item.id, cta }] : [];
  });

  if (layout === "two-up") {
    return (
      <>
        <Title variant="section">{section.title}</Title>
        <GridItem span={2} start={2}>
          <LinkStack links={section.items} twoUp="tablet-up" />
        </GridItem>
      </>
    );
  }

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
