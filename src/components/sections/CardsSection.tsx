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

// type=cards (NID-CONTEXT.md §8.2). The card is chosen by what the items are
// children of (cardKind). Items arrive in the order the response gives them and
// are never re-sorted here — grouping is the server's (CLAUDE.md § Content).
//
// The section is a subgrid so its links can be its utility slot: last in source
// order, pinned to the title row's last column at 4 columns and to column 2 of
// the first free row beneath at 3 (GridItem `place`, STAGE-0-NOTES §37, §42),
// and simply last below that, which is where the 768 and
// 390 boards draw them. On the About board the student-awards links sit inside
// a pattern tile (4912:367990), whose pattern rows used to be dropped below 4
// columns and are now drawn at every width (§38).
export function CardsSection({
  section,
  lead: leadVariant = "wide",
}: {
  section: CardsSectionData;
  /** How prominent the first news card is. The board gives the "Featured"
   *  section a three-column lead and the "2026" section a two-column one, and
   *  the model has no field that says which: `NewsArticle.featured` is the
   *  concept, and the cards union cannot carry a NewsArticle (see the
   *  TODO(review) on CARD_KIND_BY_PARENT in src/lib/content/pages.ts). Until it
   *  can, the page names the featured section and this prop goes away with it. */
  lead?: "wide" | "feature";
}) {
  const items = section.items.filter((item): item is Page => "parent" in item);
  // TODO(review): Discipline and Programme items render as Thumb (§7.6), which
  // is Stage 2; until then a cards section of those renders its title only.
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
          // The feature card aligns its own parts to the page's columns, so its
          // cell is a subgrid too: the photo takes two tracks at 4 columns and
          // one at 3, the text one throughout (4199:303897).
          <GridItem span="hero" subgrid>
            <NewsCard item={lead} variant="feature" />
          </GridItem>
        ) : (
          <GridItem span={2}>
            <NewsCard item={lead} variant="wide" />
          </GridItem>
        ))}
      {kind === "news" && (
        // The decorative tile under the section title (4912:366884, 4906:355640).
        // Pinned rather than flowed: with no links to take the title row's last
        // column it would otherwise land there, which is a card's cell on the
        // News boards.
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
        // At 3 columns every cards section's link sits in column 2, under the
        // cards it belongs to; `utility` finds the first free row there, which
        // is row 2 for a section whose cards fit the title row and row 3 for
        // News, whose second row is already both square cards (GridItem PLACE).
        <GridItem span={1} place="utility">
          {kind === "news" ? links : <PatternTile seed={1} cta={links} />}
        </GridItem>
      )}
    </GridItem>
  );
}
