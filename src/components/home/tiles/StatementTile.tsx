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
    // Full width and natural height below 1024 (the 768 and 390 boards draw it
    // as a band across the row); a one-column square at 3 columns and up. The
    // page surface never clips, so the square is a floor, not a cap.
    <Tile as="section" surface="page" square="laptop" padding={false}>
      <p className="font-primary text-statement text-text-primary text-balance">
        {withAccentPeriods(t(tile.textKey))}
      </p>
    </Tile>
  );
}
