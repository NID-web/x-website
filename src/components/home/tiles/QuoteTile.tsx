import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import { Cta } from "@/components/spine/Cta";
import type { HomeTile, Translate } from "@/lib/home-content";

type QuoteTileData = Extract<HomeTile, { kind: "quote" }>;

/**
 * Pull-quote tile with attribution and avatar.
 */
export function QuoteTile({ tile, t }: { tile: QuoteTileData; t: Translate }) {
  return (
    <Tile as="figure" surface="page" padding={false}>
      <blockquote className="flex flex-1 flex-col justify-end font-secondary text-display-quote italic text-text-quaternary">
        {t(tile.quoteKey)}
      </blockquote>
      <div className="mt-4 flex items-center gap-2">
        {tile.avatar && (
          <TileImage
            media={tile.avatar}
            className="relative size-12 shrink-0 rounded-full"
            sizes="48px"
          />
        )}
        <Cta
          label={t(tile.attribution.labelKey)}
          href={tile.attribution.href}
          external={tile.attribution.external}
          icon="none"
          className="min-h-8 border-b-2 border-border-subtle px-2 py-1"
        />
      </div>
    </Tile>
  );
}
