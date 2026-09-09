import { GridItem } from "@/components/layout/GridItem";
import { Title } from "@/components/spine/Title";
import { PatternTile } from "@/components/home/tiles/PatternTile";
import { AlumniCard } from "@/components/cards/AlumniCard";
import { CampusCard, type ArchSide } from "@/components/cards/CampusCard";
import { NewsCard } from "@/components/cards/NewsCard";
import { LinkStack, startBelowLead, startOf } from "@/components/sections/parts";
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
}: {
  section: CardsSectionData;
  /** Presentation variant for the first news item. */
  lead?: "wide" | "feature";
}) {
  const items = section.items.filter((item): item is Page => "parent" in item);
  const kind = items[0] ? cardKind(items[0]) : undefined;
  const links = section.links.length > 0 && <LinkStack links={section.links} />;
  const lead = kind === "news" ? items[0] : undefined;
  const rest = kind === "news" ? items.slice(1) : items;

  const feature = leadVariant === "feature";

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
        <GridItem span={1} place="rail" className="hidden desktop:block">
          <PatternTile seed={0} />
        </GridItem>
      )}
      {rest.map((item, i) => (
        <GridItem
          key={item.id}
          span={1}
          start={kind === "news" ? startBelowLead(i) : startOf(i)}
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
