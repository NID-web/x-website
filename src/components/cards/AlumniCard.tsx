import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import { PatternFieldAlumni, PatternScatterAlumni } from "@/components/home/patterns";
import type { Page } from "@/lib/content-model";

/**
 * Notable Alumni card displaying craft patterns, a circular portrait, and bio.
 */
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
        <span aria-hidden="true" className="block h-2 border-b-2 border-border-subtle" />
      </div>
    </Tile>
  );
}
