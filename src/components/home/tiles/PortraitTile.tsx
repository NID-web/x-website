import { Tile } from "@/components/home/Tile";
import { Overline } from "@/components/home/parts";
import { TileImage } from "@/components/home/TileImage";
import type { HomeTile, Translate } from "@/lib/home-content";

type PortraitTileData = Extract<HomeTile, { kind: "portrait" }>;

// "Notable Alumni" / "Pride of NID" — overline, a circular portrait, then name
// and bio. (The decorative pattern bed behind the portrait lands in the
// decoration pass.)
export function PortraitTile({ tile, t }: { tile: PortraitTileData; t: Translate }) {
  return (
    <Tile as="section" surface="page" padding={false}>
      {tile.overlineKey && <Overline>{t(tile.overlineKey)}</Overline>}
      <div className="mt-3 flex justify-end">
        <TileImage
          media={tile.photo}
          className="relative size-28 shrink-0 rounded-full"
          sizes="112px"
        />
      </div>
      <h4 className="mt-3 font-primary text-h6 uppercase text-text-primary">
        {t(tile.nameKey)}
      </h4>
      {tile.bioKey && (
        <p className="mt-1.5 font-body text-caption text-text-secondary">{t(tile.bioKey)}</p>
      )}
    </Tile>
  );
}
