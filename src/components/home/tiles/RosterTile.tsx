import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import { Cta } from "@/components/spine/Cta";
import type { HomeTile, Translate } from "@/lib/home-content";

type RosterTileData = Extract<HomeTile, { kind: "roster" }>;

// "Faculty Stalwarts" — a row of overlapping circular portraits over a heading,
// body and a "Learn more" CTA. The ring separates the overlapping avatars using
// the page surface, so it stays correct across themes.
export function RosterTile({ tile, t }: { tile: RosterTileData; t: Translate }) {
  return (
    <Tile
      as="section"
      surface="page"
      padding={false}
      footer={
        tile.cta ? (
          <Cta
            label={t(tile.cta.labelKey)}
            href={tile.cta.href}
            external={tile.cta.external}
          />
        ) : undefined
      }
    >
      <div className="flex -space-x-3">
        {tile.avatars.map((avatar) => (
          <TileImage
            key={avatar.id}
            media={avatar}
            className="relative size-10 shrink-0 rounded-full ring-2 ring-surface-page"
            sizes="40px"
          />
        ))}
      </div>
      <h4 className="mt-4 font-primary text-h5 text-text-primary">{t(tile.headingKey)}</h4>
      {tile.bodyKey && (
        <p className="mt-2 font-body text-caption text-text-secondary">{t(tile.bodyKey)}</p>
      )}
    </Tile>
  );
}
