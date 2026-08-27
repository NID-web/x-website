import { Tile } from "@/components/home/Tile";
import type { HomeTile, Translate } from "@/lib/home-content";

type StatementTileData = Extract<HomeTile, { kind: "statement" }>;

// The statement's signature treatment: every period in the accent colour.
// accent/primary is the only accent that clears 3:1, so it is the only one safe
// for a mark that carries the brand voice (CLAUDE.md § Colour).
function withAccentPeriods(text: string) {
  return text.split(/(\.)/).map((part, i) =>
    part === "." ? (
      <span key={i} className="text-accent-primary">
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
      <p className="font-primary text-h1 text-text-primary text-balance">
        {withAccentPeriods(t(tile.textKey))}
      </p>
    </Tile>
  );
}
