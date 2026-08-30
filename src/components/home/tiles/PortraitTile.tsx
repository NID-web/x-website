import { Tile } from "@/components/home/Tile";
import { Overline } from "@/components/home/parts";
import { PatternFieldAlumni } from "@/components/home/patterns";
import { TileImage } from "@/components/home/TileImage";
import type { HomeTile, Translate } from "@/lib/home-content";

type PortraitTileData = Extract<HomeTile, { kind: "portrait" }>;

// "Notable Alumni" / "Pride of NID" — overline, a circular portrait, then name
// and bio. Tiles with `patternBed` get the craft field behind the portrait: in
// the design it runs across the portrait row and the portrait sits over its
// right-hand end.
export function PortraitTile({ tile, t }: { tile: PortraitTileData; t: Translate }) {
  return (
    <Tile as="section" surface="page" padding={false}>
      {tile.overlineKey && <Overline>{t(tile.overlineKey)}</Overline>}
      <div className="relative mt-3 flex justify-end">
        {tile.patternBed && (
          // The field needs a sized box: an <svg> is a replaced element, so
          // absolute insets alone do NOT stretch it — left to itself it falls
          // back to the intrinsic 300×150 and spills past the row.
          <div className="pointer-events-none absolute inset-y-0 left-0 right-10">
            <PatternFieldAlumni className="block size-full" />
          </div>
        )}
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
