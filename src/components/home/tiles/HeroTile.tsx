import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import type { HomeTile } from "@/lib/home-content";

type HeroTileData = Extract<HomeTile, { kind: "hero" }>;

// The hero image. The one card tile with square corners — the Figma card sets
// `border-radius: inherit` with nothing to inherit from.
//
// Three shapes, one per column count, and it always occupies TWO tiles:
//   1 column  — the whole row, and a square (the 390 board's 358 square).
//   2 columns — the whole row, exactly ONE row tall, so it reads as the two
//               tiles it replaces. Nothing shares its row, so nothing else can
//               set that height: `h-grid-row-2` derives it from the GridItem's
//               own width (see globals.css). A design decision, not the board —
//               the 768 board draws a 350 square in one column.
//   3-4 cols  — two columns wide and a row FOLLOWER (h-full), taking the height
//               its square neighbours in row 1 set.
// It never needs a min-height: one of the three always gives it one. Above the
// fold, so the image is eager.
export function HeroTile({ tile }: { tile: HeroTileData }) {
  return (
    <Tile
      as="figure"
      surface="raised"
      square="max-tablet"
      stretch="laptop"
      className="tablet:max-laptop:h-grid-row-2"
      padding={false}
      radius={false}
    >
      <TileImage
        media={tile.media}
        className="relative h-full w-full"
        sizes="(min-width: 1280px) 48vw, (min-width: 1024px) 64vw, 96vw"
        priority
      />
    </Tile>
  );
}
