import clsx from "clsx";
import { Tile } from "@/components/home/Tile";
import { Overline } from "@/components/home/parts";
import {
  PatternFieldAlumni,
  PatternScatterAlumni,
  PatternScatterPride,
} from "@/components/home/patterns";
import { TileImage } from "@/components/home/TileImage";
import type { HomeTile, Translate } from "@/lib/home-content";

type PortraitTileData = Extract<HomeTile, { kind: "portrait" }>;

// Both portrait tiles share the left-hand motif; only the scatter under the
// portrait differs. Pride's is denser (64 cells to Alumni's 80, but packed into
// a ring) and drawn on a different three accents.
const SCATTER = {
  alumni: PatternScatterAlumni,
  pride: PatternScatterPride,
} as const;

export function PortraitTile({ tile, t }: { tile: PortraitTileData; t: Translate }) {
  const Scatter = tile.bed ? SCATTER[tile.bed] : null;
  return (
    <Tile as="section" surface="page" padding={false}>
      <div className="flex flex-1 items-center">
        {tile.bed && <PatternFieldAlumni className="aspect-square w-1/2 shrink-0" />}
        <div
          className={clsx(
            "relative flex aspect-square w-1/2 shrink-0 items-center justify-center",
            !tile.bed && "ml-auto",
          )}
        >
          {Scatter && <Scatter className="absolute inset-0 size-full" />}
          <TileImage
            media={tile.photo}
            className="relative aspect-square w-4/5 rounded-full"
            sizes="(min-width: 1280px) 132px, 25vw"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between">
        {tile.overlineKey && (
          <div className="pt-2">
            <Overline shortRule>{t(tile.overlineKey)}</Overline>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <h4 className="font-primary text-h5 text-text-primary">{t(tile.nameKey)}</h4>
          {tile.bioKey && (
            <p className="font-primary text-label text-text-tertiary">{t(tile.bioKey)}</p>
          )}
        </div>
        {/* The tile closes on a rule, as the list tiles do. */}
        <span aria-hidden="true" className="block h-2 border-b-2 border-border-subtle" />
      </div>
    </Tile>
  );
}
