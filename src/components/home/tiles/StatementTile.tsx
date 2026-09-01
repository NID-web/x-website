import { Tile } from "@/components/home/Tile";
import type { HomeTile, Translate } from "@/lib/home-content";

type StatementTileData = Extract<HomeTile, { kind: "statement" }>;

function withAccentPeriods(text: string) {
  return text.split(/(\.)/).map((part, i) =>
    part === "." ? (
      <span key={i} className="text-accent-secondary">
        .
      </span>
    ) : (
      part
    ),
  );
}

export function StatementTile({ tile, t }: { tile: StatementTileData; t: Translate }) {
  return (
    <Tile as="section" surface="page" square={false} padding={false}>
      <p className="font-primary text-statement text-text-primary text-balance">
        {withAccentPeriods(t(tile.textKey))}
      </p>
    </Tile>
  );
}
