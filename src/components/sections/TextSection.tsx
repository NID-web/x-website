import { GridItem } from "@/components/layout/GridItem";
import { TileImage } from "@/components/home/TileImage";
import { Title } from "@/components/spine/Title";
import { ContactList, LinkStack } from "@/components/sections/parts";
import type { Section } from "@/lib/content-model";

type TextSectionData = Extract<Section, { type: "text" }>;

/**
 * Text section with title, body paragraphs, optional image, links, and contact info.
 */
export function TextSection({ section }: { section: TextSectionData }) {
  const rail = section.links.length > 0 || section.contacts.length > 0;
  return (
    <>
      <Title variant="section">{section.title}</Title>
      {section.body && (
        <GridItem span={2} start={2} className="flex flex-col gap-4">
          {section.body.split(/\n{2,}/).map((paragraph, i) => (
            <p key={i} className="font-body text-body text-text-primary">
              {paragraph}
            </p>
          ))}
        </GridItem>
      )}
      {rail && (
        <GridItem span={1} className="flex flex-col gap-6">
          {section.links.length > 0 && <LinkStack links={section.links} />}
          {section.contacts.length > 0 && <ContactList contacts={section.contacts} />}
        </GridItem>
      )}
      {section.image && (
        <GridItem span={2} start={2} as="figure">
          <TileImage
            media={section.image}
            className="relative aspect-[2/1] w-full"
            sizes="(min-width: 668px) 684px, 96vw"
          />
          {section.image.caption && (
            <figcaption className="mt-2 font-body text-caption text-text-tertiary">
              {section.image.caption}
            </figcaption>
          )}
        </GridItem>
      )}
    </>
  );
}
