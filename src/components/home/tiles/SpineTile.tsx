import { Tile } from "@/components/home/Tile";
import type { HomeTile, Translate } from "@/lib/home-content";

type SpineTileData = Extract<HomeTile, { kind: "spine" }>;

// "Knowledge Management Centre" — a row of book spines (vertical labels) above
// the heading, evoking a library shelf.
export function SpineTile({ tile, t }: { tile: SpineTileData; t: Translate }) {
  return (
    <Tile as="section" surface="page" padding={false}>
      <div className="flex flex-1 items-stretch gap-px overflow-hidden">
        {tile.spines.map((spine) => (
          <span
            key={spine}
            className="whitespace-nowrap border-l border-border-subtle pl-1 font-body text-micro text-text-tertiary [writing-mode:vertical-rl]"
          >
            {spine}
          </span>
        ))}
      </div>
      <h3 className="mt-4 font-primary text-h3 text-text-primary">{t(tile.headingKey)}</h3>
    </Tile>
  );
}
