import { Fragment } from "react";
import { GridItem } from "@/components/layout/GridItem";
import { Title } from "@/components/spine/Title";
import { PatternTile } from "@/components/home/tiles/PatternTile";
import { AlumniCard } from "@/components/cards/AlumniCard";
import { CampusCard, type ArchSide } from "@/components/cards/CampusCard";
import { NewsCard } from "@/components/cards/NewsCard";
import { ThumbCard } from "@/components/cards/ThumbCard";
import {
  ContactList,
  LinkStack,
  SectionBody,
  startIn,
  type BodyClamp,
  type CardField,
} from "@/components/sections/parts";
import type { Page, Section } from "@/lib/content-model";
import { cardKind } from "@/lib/content/pages";

type CardsSectionData = Extract<Section, { type: "cards" }>;

const ARCHES: ArchSide[] = ["top", "left", "right"];

/**
 * Section rendering collections of cards (News, Campus, Alumni, Thumb).
 * Uses subgrid to align cards and utility links with the page grid tracks.
 */
export function CardsSection({
  section,
  lead: leadVariant = "wide",
  patternSeed = 0,
  clamp,
  thumbs = "two-up",
  thumbMeta = true,
}: {
  section: CardsSectionData;
  /** Presentation variant for the first news item. */
  lead?: "wide" | "feature";
  /** The rail tile's field, beside a news lead; see TextSection's note. */
  patternSeed?: number;
  /** For a section body, as TextSection's. */
  clamp?: BodyClamp;
  /** Thumb cards in columns 2–3 with column 4 empty (the campus boards), or
   *  three across in columns 2–4 (Programmes). The model has no field for it,
   *  so the page names it (§40's precedent, STAGE-0-NOTES §69). */
  thumbs?: "two-up" | "three-up";
  /** False: Thumb cards draw their title alone, no meta line (§78). */
  thumbMeta?: boolean;
}) {
  const items = section.items.filter((item): item is Page => "parent" in item);
  const kind = items[0] ? cardKind(items[0]) : undefined;
  const links = section.links.length > 0 && <LinkStack links={section.links} />;
  const body = section.body && <SectionBody body={section.body} clamp={clamp} />;
  const lead = kind === "news" ? items[0] : undefined;
  const rest = kind === "news" ? items.slice(1) : items;

  const feature = leadVariant === "feature";

  // What row 1 leaves open beside the title. A wide lead is SPAN[2] (two
  // tracks at both ranges); a feature lead is SPAN.hero (two at laptop, three
  // at desktop). Either is ONE grid row — the feature is 684px tall at 1440,
  // not two row tracks — so the rail tile sits in row 2 at both. The links'
  // utility slot takes row 1's last column at desktop only; at laptop it is
  // last in source order and displaces nothing.
  const field: CardField = lead
    ? {
        open: { laptop: 0, desktop: 3 - (feature ? 3 : 2) - (links ? 1 : 0) },
        // The rail tile holds column 1 of row 2, so row 2 needs no pin. Laptop
        // pins it anyway, as startBelowLead always did — redundant but
        // harmless, and it keeps every existing section's classes unchanged.
        pinFrom: { laptop: 2, desktop: 3 },
      }
    : {
        open: { laptop: 2, desktop: links ? 2 : 3 },
        pinFrom: { laptop: 2, desktop: 2 },
      };

  return (
    <GridItem as="section" span={4} subgrid>
      <Title variant="section">{section.title}</Title>
      {/* A lead-in above the cards (Ahmedabad's Disciplines, 4119:227463). No
          other cards section carries a body, so none changes. */}
      {/* The section's contacts, with its links if it has any, in the utility
          slot: column 4 of the title row at 4 columns, column 2 under the body
          at 3, after the body below that — Research at NID (§78). Before the
          cards in source order, so at 3 columns flow puts it above them. A
          section without contacts renders exactly the element it always did
          (an extra empty slot still reaches the RSC payload, §76), and keeps
          its links cell at the end. */}
      {section.contacts.length > 0
        ? [
            <Fragment key="body">{body}</Fragment>,
            <GridItem key="contacts" span={1} place="utility" className="flex flex-col gap-6">
              {links}
              <ContactList contacts={section.contacts} />
            </GridItem>,
          ]
        : body}
      {lead &&
        (feature ? (
          <GridItem span="hero" subgrid>
            <NewsCard item={lead} variant="feature" />
          </GridItem>
        ) : (
          <GridItem span={2}>
            <NewsCard item={lead} variant="wide" />
          </GridItem>
        ))}
      {kind === "news" && (
        <GridItem span="full-then-1" place="rail">
          <PatternTile seed={patternSeed} band />
        </GridItem>
      )}
      {rest.map((item, i) => (
        <GridItem
          key={item.id}
          span={1}
          // Two-up thumbs sit in columns 2–3 at 3 and 4 columns, column 4 left
          // empty (the campus boards) — not the three-across field startIn
          // draws — so every other card pins column 2, on the title row or
          // below a body. Three-up thumbs ARE that field.
          start={kind === "thumb" && thumbs === "two-up" ? (i % 2 === 0 ? 2 : undefined) : startIn(i, field)}
        >
          {kind === "news" ? (
            <NewsCard item={item} variant="square" />
          ) : kind === "campus" ? (
            <CampusCard item={item} arch={ARCHES[i % ARCHES.length] ?? "top"} />
          ) : kind === "alumni" ? (
            <AlumniCard item={item} />
          ) : kind === "thumb" ? (
            <ThumbCard item={item} meta={thumbMeta} />
          ) : null}
        </GridItem>
      ))}
      {links && section.contacts.length === 0 && (
        <GridItem span={1} place="utility">
          {kind === "news" ? links : <PatternTile seed={1} cta={links} />}
        </GridItem>
      )}
    </GridItem>
  );
}
