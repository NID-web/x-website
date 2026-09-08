import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import { PatternFieldAlumni, PatternScatterAlumni } from "@/components/home/patterns";
import type { Page } from "@/lib/content-model";

// Notable Alumni card (4683:397311) — structurally Home's PortraitTile: the
// craft bed and the bandhani scatter across the top half, the portrait in the
// scatter, name / three-line bio / hairline below. One shape at EVERY width,
// with no `desktop:` gating, exactly as PortraitTile draws it.
//
// It used to swap below 4 columns for the `Person` component the 1024 / 768 /
// 390 boards draw (4296:269589) — a 144px luminosity-blended portrait, no bed,
// no scatter, no rule, unclamped bio. That made the same tile read as two
// different things either side of 1280; it is one tile, so it is one shape
// (docs/STAGE-0-NOTES.md §39).
//
// The item is a Page until the cards union carries Person: title is the name,
// intro the bio, hero[0] the portrait.
export function AlumniCard({ item }: { item: Page }) {
  const photo = item.hero[0];
  return (
    <Tile as="article" surface="page" padding={false}>
      <div className="flex flex-1 items-center">
        <PatternFieldAlumni className="aspect-square w-1/2 shrink-0" />
        <div className="relative flex aspect-square w-1/2 shrink-0 items-center justify-center">
          <PatternScatterAlumni className="absolute inset-0 size-full" />
          {photo && (
            <TileImage
              media={photo}
              className="relative aspect-square w-4/5 rounded-full"
              // The portrait is four fifths of half the tile, so ~132px at 1440
              // (330 wide), ~124 at 1024, ~140 at 768 and ~143 at 390 — one
              // fixed hint above the phone, a viewport fraction on it.
              sizes="(min-width: 668px) 160px, 40vw"
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-1 flex-col justify-center gap-2">
          <h3 className="font-primary text-h5 text-text-tertiary">{item.title}</h3>
          {item.intro && (
            <p className="line-clamp-3 font-primary text-label text-text-tertiary">
              {item.intro}
            </p>
          )}
        </div>
        {/* The tile closes on a rule, as PortraitTile and the list tiles do. */}
        <span aria-hidden="true" className="block h-2 border-b-2 border-border-subtle" />
      </div>
    </Tile>
  );
}
