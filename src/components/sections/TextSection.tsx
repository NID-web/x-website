import { GridItem } from "@/components/layout/GridItem";
import { TileImage } from "@/components/home/TileImage";
import { PatternTile } from "@/components/home/tiles/PatternTile";
import { ClampedProse } from "@/components/spine/ClampedProse";
import { ImagePlaceholder } from "@/components/spine/ImagePlaceholder";
import { Title } from "@/components/spine/Title";
import { ContactList, LinkStack } from "@/components/sections/parts";
import type { Section } from "@/lib/content-model";

type TextSectionData = Extract<Section, { type: "text" }>;

/**
 * Text section with title, body paragraphs, optional image, links, and contact info.
 */
export function TextSection({
  section,
  clamp,
  imagePlaceholder = false,
  patternSeed = 0,
}: {
  section: TextSectionData;
  /** Render the body behind a "See more" disclosure. Nothing in the model says
   *  a body is clamped, so the page names the section — the same shape §40 uses
   *  for lead prominence. Both labels go the day the model carries the field. */
  clamp?: { seeMore: string; seeLess: string };
  /** Draw the board's flat placeholder where the section image will go, for a
   *  page whose boards have one but whose asset has not been supplied. Off by
   *  default: a section with no image and no placeholder asked for draws
   *  nothing, which is what most pages want. */
  imagePlaceholder?: boolean;
  /** Which craft field the rail tile draws. Index into PatternTile FIELDS:
   *  0 = PatternField1, 1 = PatternField2, 2 = PatternField3. The boards pick
   *  one per section and the model has no field for it, so the page names it
   *  (§40s precedent). design/assets/patterns/home-patterns.json records which
   *  Figma layer each field came from, and the numbering does NOT line up:
   *  PatternField1 is Patternimate-2, PatternField2 is Patternimate-3,
   *  PatternField3 is Patternimate-1. Read that table before setting one. */
  patternSeed?: number;
}) {
  // Section bodies are Body/Large/Regular (20/30), not Body/Base: both Charter
  // bodies say so on the board (4118:205433, 4118:205439) and it is the first
  // page to render a text section, so nothing was relying on the old 16/28. The
  // COLOUR stays text/primary — the board sets the visible body text/secondary
  // and the hidden full text text/primary, so it contradicts itself, and body
  // copy takes the legible one.
  const rail = section.links.length > 0 || section.contacts.length > 0;
  const imageRow = Boolean(section.image) || imagePlaceholder;
  return (
    <>
      <Title variant="section">{section.title}</Title>
      {section.body &&
        (clamp ? (
          <GridItem span={2} start={2} className="font-body text-body-lg text-text-primary">
            <ClampedProse
              text={section.body}
              clamp="always-9"
              seeMore={clamp.seeMore}
              seeLess={clamp.seeLess}
            />
          </GridItem>
        ) : (
          <GridItem span={2} start={2} className="flex flex-col gap-4">
            {section.body.split(/\n{2,}/).map((paragraph, i) => (
              <p key={i} className="font-body text-body-lg text-text-primary">
                {paragraph}
              </p>
            ))}
          </GridItem>
        ))}
      {rail && (
        <GridItem span={1} className="flex flex-col gap-6">
          {section.links.length > 0 && <LinkStack links={section.links} />}
          {section.contacts.length > 0 && <ContactList contacts={section.contacts} />}
        </GridItem>
      )}
      {imageRow && (
        <>
          {/* The board pairs a section image with a pattern tile in the rail
              beside it (4906:365778 / 4906:362880). Reached by flow with an
              explicit column-1 start, NOT `place="rail"` — that names row 2 of a
              SUBGRID, and a text section is a run of siblings on the page grid,
              where row 2 is the page's row 2, not the section's. */}
          <GridItem span="full-then-1" start={1}>
            <PatternTile seed={patternSeed} band />
          </GridItem>
          <GridItem span={2} start={2} as="figure">
            {section.image ? (
              <TileImage
                media={section.image}
                className="relative aspect-[684/330] w-full"
                sizes="(min-width: 668px) 684px, 96vw"
              />
            ) : (
              // 684 × 330 on the board (4140:246793, 4140:246794) — the only
              // source for a section image ratio, since §5.1 specs the width
              // (684) and no height. Square corners: §8.6 gives the 64px
              // radius to a secondary hero and to nothing else.
              <ImagePlaceholder className="aspect-[684/330]" />
            )}
            {section.image?.caption && (
              <figcaption className="mt-2 font-body text-caption text-text-tertiary">
                {section.image.caption}
              </figcaption>
            )}
          </GridItem>
        </>
      )}
    </>
  );
}
