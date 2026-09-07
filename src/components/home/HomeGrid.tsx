import { getTranslations } from "next-intl/server";
import { PageGrid } from "@/components/layout/PageGrid";
import { GridItem, type GridSpan } from "@/components/layout/GridItem";
import { HOME_TILES, type HomeTile, type Translate } from "@/lib/home-content";
import { StatementTile } from "@/components/home/tiles/StatementTile";
import { HeroTile } from "@/components/home/tiles/HeroTile";
import { LinkListTile } from "@/components/home/tiles/LinkListTile";
import { ListTile } from "@/components/home/tiles/ListTile";
import { FeatureTile } from "@/components/home/tiles/FeatureTile";
import { PortraitTile } from "@/components/home/tiles/PortraitTile";
import { PatternTile } from "@/components/home/tiles/PatternTile";
import { MediaCardTile } from "@/components/home/tiles/MediaCardTile";
import { QuoteTile } from "@/components/home/tiles/QuoteTile";
import { RosterTile } from "@/components/home/tiles/RosterTile";
import { SpineTile } from "@/components/home/tiles/SpineTile";
import { HomeFooter } from "@/components/home/HomeFooter";
import { BrandStrip } from "@/components/spine/BrandStrip";

function renderTile(tile: HomeTile, t: Translate) {
  switch (tile.kind) {
    case "statement":
      return <StatementTile tile={tile} t={t} />;
    case "hero":
      return <HeroTile tile={tile} />;
    case "linkList":
      return <LinkListTile tile={tile} t={t} />;
    case "calendar":
    case "news":
      return <ListTile tile={tile} t={t} />;
    case "feature":
      return <FeatureTile tile={tile} t={t} />;
    case "portrait":
      return <PortraitTile tile={tile} t={t} />;
    case "pattern":
      return <PatternTile tile={tile} />;
    case "mediaCard":
      return <MediaCardTile tile={tile} t={t} />;
    case "quote":
      return <QuoteTile tile={tile} t={t} />;
    case "roster":
      return <RosterTile tile={tile} t={t} />;
    case "spine":
      return <SpineTile tile={tile} t={t} />;
    default:
      return null;
  }
}

// The single-grid assembler. The whole page is ONE PageGrid (CLAUDE.md
// § Layout); every tile is a direct GridItem child, one column wide, except the
// two that open the page. The position statement is a full-width band below
// 1024 and a single square above it — a reshape the boards make at 1024, not a
// clamp. The hero always spans two tiles: the whole row at 1 and 2 columns, two
// of three or four above. Every tile is shown at every breakpoint; nothing is
// hidden and nothing is reordered (docs/STAGE-0-NOTES.md §20, §22).
const SPAN_BY_KIND: Partial<Record<HomeTile["kind"], GridSpan>> = {
  statement: "full-then-1",
  hero: 2,
};

// The hero is alone in its row at 2 columns, so nothing else can set its height
// there. `@container` makes its GridItem the reference `h-grid-row-2` measures
// against — it is a containment context, not a column class, so it stays out of
// GridItem's SPAN table.
const CLASS_BY_KIND: Partial<Record<HomeTile["kind"], string>> = {
  hero: "@container",
};
export async function HomeGrid() {
  const raw = await getTranslations("Home");
  const t: Translate = (key) => raw(key);

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      {/* Craft band, full-bleed directly under the header — it sits outside the
          PageGrid shell on purpose: it runs edge to edge, so putting it in a
          GridItem would inset it by the shell margin. */}
      <BrandStrip className="mb-12" />
      <PageGrid>
        {HOME_TILES.map((tile) => (
          <GridItem
            key={tile.id}
            span={SPAN_BY_KIND[tile.kind] ?? 1}
            className={CLASS_BY_KIND[tile.kind]}
          >
            {renderTile(tile, t)}
          </GridItem>
        ))}
        <HomeFooter t={t} />
      </PageGrid>
      {/* The band closes the page as well as opens it (export root: one strip
          above the grid, one below) — but not identically: the opening strip is
          the export's "Only Pattern" variant, the closing one leads with the
          NID wordmark. */}
      <BrandStrip className="mt-12" logo />
    </main>
  );
}
