import { GridItem, type GridStart } from "@/components/layout/GridItem";
import { Title } from "@/components/spine/Title";
import { PatternTile } from "@/components/home/tiles/PatternTile";
import { AlumniCard } from "@/components/cards/AlumniCard";
import { CampusCard, type ArchSide } from "@/components/cards/CampusCard";
import { NewsCard } from "@/components/cards/NewsCard";
import { LinkStack } from "@/components/sections/parts";
import type { Page, Section } from "@/lib/content-model";
import { cardKind } from "@/lib/content/pages";

type CardsSectionData = Extract<Section, { type: "cards" }>;

const ARCHES: ArchSide[] = ["top", "left", "right"];

// Which one-column card, past the first, opens a new row of the content field:
// every second at 3 columns, every third at 4. The 1024 board keeps a wrapping
// card in column 2, never the rail.
function startOf(index: number): GridStart | undefined {
  if (index === 0) return undefined;
  const laptop = index % 2 === 0;
  const desktop = index % 3 === 0;
  if (laptop && desktop) return 2;
  if (laptop) return "2-laptop";
  if (desktop) return "2-desktop";
  return undefined;
}

// type=cards (NID-CONTEXT.md §8.2). The card is chosen by what the items are
// children of (cardKind). Items arrive in the order the response gives them and
// are never re-sorted here — grouping is the server's (CLAUDE.md § Content).
//
// The links cell follows the model's placement rule — column 4 at 4 columns,
// the rail at 3, stacked below — by source order alone. On the About board the
// news links sit beside the lead card and the student-awards links sit inside
// a pattern tile (4912:367990); below 4 columns that tile is just its link.
export function CardsSection({ section }: { section: CardsSectionData }) {
  const items = section.items.filter((item): item is Page => "parent" in item);
  // TODO(review): Discipline and Programme items render as Thumb (§7.6), which
  // is Stage 2; until then a cards section of those renders its title only.
  const kind = items[0] ? cardKind(items[0]) : undefined;
  const links = section.links.length > 0 && <LinkStack links={section.links} />;

  if (kind === "news") {
    const [lead, ...rest] = items;
    return (
      <>
        <Title variant="section">{section.title}</Title>
        {lead && (
          <GridItem span={2}>
            <NewsCard item={lead} variant="wide" />
          </GridItem>
        )}
        {links && <GridItem span={1}>{links}</GridItem>}
        {/* The rail's decorative tile on the second row (4912:366884) — the
            1024 board puts the links there instead, so it is 4-column only. */}
        <GridItem span={1} className="hidden desktop:block">
          <PatternTile seed={0} />
        </GridItem>
        {rest.map((item) => (
          <GridItem key={item.id} span={1}>
            <NewsCard item={item} variant="square" />
          </GridItem>
        ))}
      </>
    );
  }

  return (
    <>
      <Title variant="section">{section.title}</Title>
      {items.map((item, i) => (
        <GridItem key={item.id} span={1} start={startOf(i)}>
          {kind === "campus" ? (
            <CampusCard item={item} arch={ARCHES[i % ARCHES.length] ?? "top"} />
          ) : kind === "alumni" ? (
            <AlumniCard item={item} />
          ) : null}
        </GridItem>
      ))}
      {links && (
        <GridItem span={1}>
          <PatternTile seed={1} cta={links} />
        </GridItem>
      )}
    </>
  );
}
