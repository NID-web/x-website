import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import type { HomeTile } from "@/lib/home-content";

type HeroTileData = Extract<HomeTile, { kind: "hero" }>;

// The 2-column hero image. The one card tile with square corners — the Figma
// card sets `border-radius: inherit` with nothing to inherit from. Not square
// either (`square={false}` → h-full): it stretches to the height set by its
// square neighbours in row 1. Above the fold, so the image is eager
// (`priority`) and gets a wider `sizes` hint, since it spans 2 cells.
export function HeroTile({ tile }: { tile: HeroTileData }) {
  return (
    <Tile
      as="figure"
      surface="raised"
      square={false}
      stretch
      padding={false}
      radius={false}
    >
      <TileImage
        media={tile.media}
        className="relative h-full min-h-56 w-full"
        sizes="(min-width: 1280px) 48vw, (min-width: 768px) 64vw, 96vw"
        priority
      />
    </Tile>
  );
}
