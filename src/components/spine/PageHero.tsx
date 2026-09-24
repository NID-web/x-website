// A secondary page's hero in row 2: columns 2–4, then 2–3, then full width
// (NID-CONTEXT §5.3), with the 64px top-left radius §8.6 gives a secondary hero.
// The first hero renders; the model draws more than one as a slider, and the
// Slideshow (4862:584301) is not built. Without an asset it draws the boards'
// flat placeholder at the same crop, so nothing moves when one lands.
import { GridItem } from "@/components/layout/GridItem";
import { TileImage } from "@/components/home/TileImage";
import { ImagePlaceholder } from "@/components/spine/ImagePlaceholder";
import type { MediaAsset } from "@/lib/content-model";

const HERO_CROP =
  "aspect-[4/3] rounded-tl-hero tablet:aspect-video laptop:aspect-[2/1] desktop:aspect-[2.2/1]";

export function PageHero({
  hero,
  placeholder = true,
}: {
  hero: MediaAsset[];
  /** False on an article: there the boards' flat box is a stand-in for a photo
   *  that will exist, not a designed empty state, and on a live news story it
   *  reads as a broken image — so no asset, no hero (STAGE-0-NOTES §59). */
  placeholder?: boolean;
}) {
  const first = hero[0];
  if (!first && !placeholder) return null;
  return (
    <GridItem span="hero">
      {first ? (
        <TileImage
          media={first}
          priority
          className={`relative w-full ${HERO_CROP}`}
          sizes="(min-width: 1280px) 1038px, (min-width: 1024px) 64vw, 96vw"
        />
      ) : (
        <ImagePlaceholder className={HERO_CROP} />
      )}
    </GridItem>
  );
}
