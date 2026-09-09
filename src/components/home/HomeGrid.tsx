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
import { Footer } from "@/components/spine/Footer";
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
      return <PatternTile seed={tile.seed} />;
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

const SPAN_BY_KIND: Partial<Record<HomeTile["kind"], GridSpan>> = {
  statement: "full-then-1",
  hero: 2,
};

export async function HomeGrid() {
  const raw = await getTranslations("Home");
  const t: Translate = (key) => raw(key);

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      {/* Craft band, full-bleed directly under the header — outside the
          PageGrid shell on purpose: it runs edge to edge, so a GridItem would
          inset it by the shell margin. Its clearance is two grid row-gaps, not a
          flat 48px: those are the same number at 3 and 4 columns, but the row gap
          steps down to 20 and 16 below that while 48 did not, so a flat value
          grew to 2.4x and 3x the page's own rhythm and read as a void
          (docs/STAGE-0-NOTES.md §30). */}
      <BrandStrip />
      <PageGrid>
        {HOME_TILES.map((tile) => (
          <GridItem key={tile.id} span={SPAN_BY_KIND[tile.kind] ?? 1}>
            {renderTile(tile, t)}
          </GridItem>
        ))}
        <Footer collaborations="row" />
      </PageGrid>
      {/* The band closes the page as well as opens it — but not identically:
          the opening strip is the export's "Only Pattern" variant, the closing
          one leads with the NID wordmark. */}
      <BrandStrip logo />
    </main>
  );
}
