import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import { Cta } from "@/components/spine/Cta";
import type { HomeTile, Translate } from "@/lib/home-content";

type QuoteTileData = Extract<HomeTile, { kind: "quote" }>;

// "Director's Note" — an italic serif pull-quote in teal, with a small avatar
// and the attribution CTA pinned to the bottom.
export function QuoteTile({ tile, t }: { tile: QuoteTileData; t: Translate }) {
  return (
    <Tile
      as="figure"
      surface="page"
      padding={false}
      footer={
        <div className="flex items-center gap-2.5">
          {tile.avatar && (
            <TileImage
              media={tile.avatar}
              className="relative size-8 shrink-0 rounded-full"
              sizes="32px"
            />
          )}
          <Cta
            label={t(tile.attribution.labelKey)}
            href={tile.attribution.href}
            external={tile.attribution.external}
          />
        </div>
      }
    >
      <blockquote className="font-secondary text-display-quote italic text-accent-primary">
        {t(tile.quoteKey)}
      </blockquote>
    </Tile>
  );
}
