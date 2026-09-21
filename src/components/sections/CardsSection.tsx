import { GridItem } from "@/components/layout/GridItem";
import { Title } from "@/components/spine/Title";
import { PatternTile } from "@/components/home/tiles/PatternTile";
import { AlumniCard } from "@/components/cards/AlumniCard";
import { CampusCard, type ArchSide } from "@/components/cards/CampusCard";
import { NewsCard } from "@/components/cards/NewsCard";
import { LinkStack, startIn, type CardField } from "@/components/sections/parts";
import type { Page, Section } from "@/lib/content-model";
import { cardKind } from "@/lib/content/pages";

type CardsSectionData = Extract<Section, { type: "cards" }>;

const ARCHES: ArchSide[] = ["top", "left", "right"];

/**
 * Section rendering collections of cards (News, Campus, Alumni).
 * Uses subgrid to align cards and utility links with the page grid tracks.
 */
export function CardsSection({
  section,
  lead: leadVariant = "wide",
  patternSeed = 0,
}: {
  section: CardsSectionData;
  /** Presentation variant for the first news item. */
  lead?: "wide" | "feature";
  /** The rail tile's field, beside a news lead; see TextSection's note. */
  patternSeed?: number;
}) {
  const items = section.items.filter((item): item is Page => "parent" in item);
  const kind = items[0] ? cardKind(items[0]) : undefined;
  const links = section.links.length > 0 && <LinkStack links={section.links} />;
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
          start={startIn(i, field)}
        >
          {kind === "news" ? (
            <NewsCard item={item} variant="square" />
          ) : kind === "campus" ? (
            <CampusCard item={item} arch={ARCHES[i % ARCHES.length] ?? "top"} />
          ) : kind === "alumni" ? (
            <AlumniCard item={item} />
          ) : null}
        </GridItem>
      ))}
      {links && (
        <GridItem span={1} place="utility">
          {kind === "news" ? links : <PatternTile seed={1} cta={links} />}
        </GridItem>
      )}
    </GridItem>
  );
}
