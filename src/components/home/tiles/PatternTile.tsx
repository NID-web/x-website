import clsx from "clsx";
import type { HomeTile } from "@/lib/home-content";

type PatternTileData = Extract<HomeTile, { kind: "pattern" }>;

// Purely decorative filler that balances the bento on wide canvases. Carries no
// meaning (aria-hidden), so decorative accent tokens are fine. The GridItem
// that wraps it is `hidden laptop:block` — it drops entirely at tablet/mobile
// (a dropped decorative tile is not a reorder; CLAUDE.md § Layout).
const TONES = [
  "text-accent-secondary",
  "text-accent-tertiary",
  "text-accent-quaternary",
  "text-accent-pentenary",
];

export function PatternTile({ tile }: { tile: PatternTileData }) {
  const seed = tile.seed ?? 0;
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden tablet:aspect-square"
    >
      <div className="grid h-full w-full grid-cols-6 place-items-center gap-2 p-1">
        {Array.from({ length: 36 }).map((_, i) => (
          <span
            key={i}
            className={clsx(
              "block size-2 rotate-45 border border-current",
              TONES[(i + seed) % TONES.length],
            )}
          />
        ))}
      </div>
    </div>
  );
}
