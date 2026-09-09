import { Tile } from "@/components/home/Tile";
import type { HomeTile, Translate } from "@/lib/home-content";

type SpineTileData = Extract<HomeTile, { kind: "spine" }>;

/**
 * "Knowledge Management Centre" — a shelf of vertical book spines above a heading.
 */
export function SpineTile({ tile, t }: { tile: SpineTileData; t: Translate }) {
  return (
    <Tile as="section" surface="page" padding={false}>
      <div className="flex flex-1 items-stretch overflow-hidden">
        {tile.spines.map((spine) => (
          <span
            key={spine}
            className="flex w-[calc(28px*var(--nid-tile-scale))] shrink-0 flex-col items-center border-l border-border-subtle pt-1"
          >
            <span className="min-h-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-primary text-micro text-text-quaternary [writing-mode:vertical-rl]">
              {spine}
            </span>
          </span>
        ))}
      </div>
      <h3 className="mt-4 font-primary text-h3 text-text-primary">{t(tile.headingKey)}</h3>
      <span aria-hidden="true" className="mt-4 block h-8 border-b-2 border-border-subtle" />
    </Tile>
  );
}
