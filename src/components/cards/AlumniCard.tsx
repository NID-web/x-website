import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import { PatternFieldAlumni, PatternScatterAlumni, PatternScatterPride } from "@/components/home/patterns";
import type { Page } from "@/lib/content-model";

// The two portrait beds the home tiles draw (PortraitTile's SCATTER): the field
// is shared, the scatter behind the portrait differs, Pride's denser.
const SCATTER = { alumni: PatternScatterAlumni, pride: PatternScatterPride } as const;

/**
 * Notable Alumni card displaying craft patterns, a circular portrait, and bio.
 * `bed="pride"` is the same card on the Pride of NID tile's scatter.
 */
export function AlumniCard({ item, bed = "alumni" }: { item: Page; bed?: keyof typeof SCATTER }) {
  const photo = item.hero[0];
  const Scatter = SCATTER[bed];
  return (
    <Tile as="article" surface="page" padding={false}>
      <div className="flex flex-1 items-center">
        <PatternFieldAlumni className="aspect-square w-1/2 shrink-0" />
        <div className="relative flex aspect-square w-1/2 shrink-0 items-center justify-center">
          <Scatter className="absolute inset-0 size-full" />
          {photo ? (
            <TileImage
              media={photo}
              className="relative aspect-square w-4/5 rounded-full"
              sizes="(min-width: 668px) 160px, 40vw"
            />
          ) : (
            <span
              aria-hidden="true"
              className="relative block aspect-square w-4/5 rounded-full bg-accent-subtle"
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
        <span aria-hidden="true" className="block h-2 border-b-2 border-border-subtle" />
      </div>
    </Tile>
  );
}
