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
    // Full width on tablet and mobile; single-column square on laptop and desktop.
    <Tile as="section" surface="page" square="laptop" padding={false}>
      {/* The home page's one <h1>: every page has exactly one (STAGE-0-NOTES
          §107). Styled by text-statement alone, as the <p> it replaced. */}
      <h1 className="font-primary text-statement text-text-primary text-balance">
        {withAccentPeriods(t(tile.textKey))}
      </h1>
    </Tile>
  );
}
