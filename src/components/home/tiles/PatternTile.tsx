import { PatternField1, PatternField2, PatternField3 } from "@/components/home/patterns";
import type { HomeTile } from "@/lib/home-content";

type PatternTileData = Extract<HomeTile, { kind: "pattern" }>;

// The craft pattern fields that punctuate the bento (design/NID-CONTEXT.md §13).
// Three distinct motifs, selected by the tile's seed — the export uses a
// different one in each of its three slots rather than repeating one.
//
// Purely decorative (aria-hidden, inside the field itself), so the decorative
// accent ramp is fine here. The GridItem wrapping this is `hidden laptop:block`
// — it drops entirely at tablet and below, which is a drop, not a reorder
// (CLAUDE.md § Layout).
const FIELDS = [PatternField1, PatternField2, PatternField3];

export function PatternTile({ tile }: { tile: PatternTileData }) {
  const Field = FIELDS[(tile.seed ?? 0) % FIELDS.length] ?? PatternField1;
  return (
    <div className="relative overflow-hidden tablet:aspect-square">
      <Field className="block size-full" />
    </div>
  );
}
