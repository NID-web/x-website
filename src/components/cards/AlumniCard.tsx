import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import { PatternFieldAlumni, PatternScatterAlumni } from "@/components/home/patterns";
import type { Page } from "@/lib/content-model";

// Notable Alumni card (4683:397311). At 4 columns it is the square from the
// board: the craft bed and the bandhani scatter across the top half, the
// portrait in the scatter, name / three-line bio / hairline below. The 1024,
// 768 and 390 boards swap it for the `Person` component (4296:269589): a 144px
// luminosity-blended portrait over name and bio, natural height, no bed and no
// rule. One DOM, two shapes, so nothing is duplicated for assistive tech.
//
// The bottom block is PortraitTile's name + bio + rule in structure, but every
// text style in it changes below desktop, so it is not shared.
//
// The item is a Page until the cards union carries Person: title is the name,
// intro the bio, hero[0] the portrait.
export function AlumniCard({ item }: { item: Page }) {
  const photo = item.hero[0];
  return (
    <Tile
      as="article"
      surface="page"
      padding={false}
      square="desktop"
      className="max-desktop:gap-4 max-desktop:py-3"
    >
      <div className="flex desktop:flex-1 desktop:items-center">
        <PatternFieldAlumni className="hidden aspect-square w-1/2 shrink-0 desktop:block" />
        <div className="relative flex shrink-0 items-center justify-center desktop:aspect-square desktop:w-1/2">
          <PatternScatterAlumni className="absolute inset-0 hidden size-full desktop:block" />
          {photo && (
            <TileImage
              media={photo}
              className="relative aspect-square size-36 rounded-full mix-blend-luminosity desktop:size-auto desktop:w-4/5 desktop:mix-blend-normal"
              sizes="144px"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col desktop:flex-1 desktop:justify-between">
        <div className="flex flex-col gap-0.5 desktop:flex-1 desktop:justify-center desktop:gap-2">
          <h3 className="font-primary text-h6 text-text-secondary desktop:text-h5 desktop:text-text-tertiary">
            {item.title}
          </h3>
          {item.intro && (
            <p className="font-primary text-micro text-text-secondary desktop:line-clamp-3 desktop:text-label desktop:text-text-tertiary">
              {item.intro}
            </p>
          )}
        </div>
        <span aria-hidden="true" className="hidden h-2 border-b-2 border-border-subtle desktop:block" />
      </div>
    </Tile>
  );
}
