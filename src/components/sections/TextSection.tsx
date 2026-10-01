import { GridItem } from "@/components/layout/GridItem";
import { TileImage } from "@/components/home/TileImage";
import { PatternTile } from "@/components/home/tiles/PatternTile";
import { HideOnImageError } from "@/components/spine/HideOnImageError";
import { ImagePlaceholder } from "@/components/spine/ImagePlaceholder";
import { Cta } from "@/components/spine/Cta";
import { Prose } from "@/components/spine/Prose";
import { Title } from "@/components/spine/Title";
import {
  ContactList,
  LinkStack,
  SectionBody,
  type BodyClamp,
} from "@/components/sections/parts";
import type { Section } from "@/lib/content-model";
import { subtitleOf } from "@/lib/content/editorial";
import { ctaProps } from "@/lib/content/links";

type TextSectionData = Extract<Section, { type: "text" }>;

/**
 * Text section with title, body paragraphs, optional image, links, and contact info.
 */
export function TextSection({
  section,
  clamp,
  imagePlaceholder = false,
  pattern = true,
  patternSeed = 0,
  filledLinks = false,
  split = false,
  utilityLinks = false,
}: {
  section: TextSectionData;
  /** Render the body behind a "See more" disclosure. Nothing in the model says
   *  a body is clamped, so the page names the section — the same shape §40 uses
   *  for lead prominence. Both labels go the day the model carries the field.
   *  `lines` is the board's visible height in lines; nine when omitted. */
  clamp?: BodyClamp;
  /** Draw the board's flat placeholder where the section image will go, for a
   *  page whose boards have one but whose asset has not been supplied. Off by
   *  default: a section with no image and no placeholder asked for draws
   *  nothing, which is what most pages want. */
  imagePlaceholder?: boolean;
  /** Draw the craft tile in the rail beside the section image. On by default,
   *  which is what Charter's board draws; History's instances none. */
  pattern?: boolean;
  /** Which craft field the rail tile draws. Index into PatternTile FIELDS:
   *  0 = PatternField1, 1 = PatternField2, 2 = PatternField3. The boards pick
   *  one per section and the model has no field for it, so the page names it
   *  (§40s precedent). design/assets/patterns/home-patterns.json records which
   *  Figma layer each field came from, and the numbering does NOT line up:
   *  PatternField1 is Patternimate-2, PatternField2 is Patternimate-3,
   *  PatternField3 is Patternimate-1. Read that table before setting one. */
  patternSeed?: number;
  /** The section's links as filled buttons — the programme page's Apply
   *  section (the events rail's button, §68). */
  filledLinks?: boolean;
  /** Sub-title and prose in column 2, the photo beside them in columns 3–4
   *  (column 3 at three columns; stacked below that) — the discipline board's
   *  Resources (STAGE-0-NOTES §72). */
  split?: boolean;
  /** Place the links column by the utility rule (GridItem's `flow-utility`)
   *  rather than the next free cell — the primary template's sections, where
   *  free flow put /study's "Read more" beside its photo at 3 columns (§73). */
  utilityLinks?: boolean;
}) {
  if (split) {
    const subtitle = subtitleOf(section);
    return (
      <>
        {section.title && <Title variant="section">{section.title}</Title>}
        <GridItem span="full-then-1" start={2} className="flex flex-col gap-4">
          {subtitle && <h3 className="font-primary text-h5 text-text-tertiary">{subtitle}</h3>}
          {section.body && (
            <Prose text={section.body} blockClassName="font-body text-body-lg text-text-primary" spacing="gap" />
          )}
        </GridItem>
        {section.image && (
          <HideOnImageError>
            <GridItem span="full-then-1" className="desktop:col-span-2" as="figure">
              {/* 684 × 430 on the board. */}
              <TileImage
                media={section.image}
                className="relative aspect-[684/430] w-full"
                sizes="(min-width: 1280px) 684px, (min-width: 1024px) 32vw, 96vw"
              />
            </GridItem>
          </HideOnImageError>
        )}
      </>
    );
  }
  // Filled buttons are drawn only for links that resolve: an Apply link with
  // no URL leaves no empty cell in column 4.
  const links = filledLinks ? section.links.filter((link) => ctaProps(link)) : section.links;
  const rail = links.length > 0 || section.contacts.length > 0;
  const imageRow = Boolean(section.image) || imagePlaceholder;
  const image = (
    <>
      {/* The board pairs a section image with a pattern tile in the rail
        beside it (4906:365778 / 4906:362880). Reached by flow with an
        explicit column-1 start, NOT `place="rail"` — that names row 2 of a
        SUBGRID, and a text section is a run of siblings on the page grid,
        where row 2 is the page's row 2, not the section's. */}
      {pattern && (
        <GridItem span="full-then-1" start={1}>
          <PatternTile seed={patternSeed} band />
        </GridItem>
      )}
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
  );
  return (
    <>
      {/* An untitled body (a news item's `detail.body`, §59; Director's
          Message's essay) keeps columns 2–3 and leaves column 1 empty rather
          than holding an empty h2 — decided by the Director's Message board,
          STAGE-0-NOTES §60. */}
      {section.title && <Title variant="section">{section.title}</Title>}
      {section.body && <SectionBody body={section.body} clamp={clamp} />}
      {rail && (
        <GridItem span={1} place={utilityLinks ? "flow-utility" : undefined} className="flex flex-col gap-6">
          {links.length > 0 &&
            (filledLinks ? (
              links.map((link) => {
                const cta = ctaProps(link);
                return cta && <Cta key={link.id} variant="filled" {...cta} />;
              })
            ) : (
              <LinkStack links={links} />
            ))}
          {section.contacts.length > 0 && <ContactList contacts={section.contacts} />}
        </GridItem>
      )}
      {imageRow &&
        (imagePlaceholder ? (
          image
        ) : (
          // No placeholder: a section image that 404s renders nothing, the
          // same as one that never arrived (STAGE-0-NOTES §59).
          <HideOnImageError>{image}</HideOnImageError>
        ))}
    </>
  );
}
