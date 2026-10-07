import { GridItem } from "@/components/layout/GridItem";
import { Title } from "@/components/spine/Title";
import { Cta } from "@/components/spine/Cta";
import { ContactList, LinkStack, startOf } from "@/components/sections/parts";
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
   *  empty — Ahmedabad's Centre links (4132:246478), SiblingBand's figure.
   *  `documents`: a list of documents — one full-width row per item in columns
   *  2–3, the section's contacts in column 4 (Academic Notifications, §76; the
   *  pattern for Tenders, RTI, Careers). Both column-2–3 layouts draw the
   *  section's contacts in column 4; `flow` fills column 4 with links. */
  layout?: "flow" | "two-up" | "documents";
}) {
  const links = section.items.flatMap((item) => {
    const cta = ctaProps(item);
    return cta ? [{ id: item.id, cta }] : [];
  });

  if (layout === "documents") {
    // Two return shapes, as two-up: `contacts && …` left a `false` child in the
    // RSC payload of every list with no contacts (NID Act, §87).
    return section.contacts.length > 0 ? (
      <>
        <Title variant="section">{section.title}</Title>
        <GridItem span={2} start={2}>
          <LinkStack links={section.items} />
        </GridItem>
        {/* Column 4 at four columns, as a text section's: the cell the rows
            leave free on the title row; stacked after them narrower. */}
        <GridItem span={1}>
          <ContactList contacts={section.contacts} />
        </GridItem>
      </>
    ) : (
      <>
        <Title variant="section">{section.title}</Title>
        <GridItem span={2} start={2}>
          <LinkStack links={section.items} />
        </GridItem>
      </>
    );
  }

  if (layout === "two-up") {
    // Two return shapes, not a `contacts && …` child: an empty slot would still
    // reach the RSC payload and change every two-up page (Ahmedabad) that has no
    // contacts (§76).
    return section.contacts.length > 0 ? (
      <>
        <Title variant="section">{section.title}</Title>
        <GridItem span={2} start={2}>
          <LinkStack links={section.items} twoUp="tablet-up" />
        </GridItem>
        <GridItem span={1}>
          <ContactList contacts={section.contacts} />
        </GridItem>
      </>
    ) : (
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
