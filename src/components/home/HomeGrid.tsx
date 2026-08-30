import { getTranslations } from "next-intl/server";
import { PageGrid } from "@/components/layout/PageGrid";
import { GridItem } from "@/components/layout/GridItem";
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
// § Layout); every tile is a direct GridItem child. Only the hero spans 2
// columns; pattern tiles drop below laptop.
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
            span={tile.kind === "hero" ? 2 : 1}
            className={tile.kind === "pattern" ? "hidden laptop:block" : undefined}
          >
            {renderTile(tile, t)}
          </GridItem>
        ))}
        <HomeFooter t={t} />
      </PageGrid>
      {/* The band closes the page as well as opens it (export root: one strip
          above the grid, one below). */}
      <BrandStrip className="mt-12" />
    </main>
  );
}
