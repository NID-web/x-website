import clsx from "clsx";
import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import type { HomeTile, Translate } from "@/lib/home-content";

type MediaCardTileData = Extract<HomeTile, { kind: "mediaCard" }>;

// Three shapes over one structure:
//  • overlay  — photo fills the tile, label sits over a scrim at the bottom
//  • below    — photo on top, label beneath (Drawing Dialogues, Young Designers)
//  • inverse  — no photo; the Call-for-Papers surface (surface/inverse is the
//               only sanctioned dark pairing and inverts correctly, CLAUDE.md).
export function MediaCardTile({ tile, t }: { tile: MediaCardTileData; t: Translate }) {
  const isInverse = tile.surface === "inverse";
  const isOverlay = tile.labelPlacement === "overlay";
  const onDark = isInverse || isOverlay;

  const label = (
    <div className="flex flex-col gap-1 p-6">
      {tile.overlineKey && (
        <span
          className={clsx(
            "font-primary text-overline uppercase",
            onDark ? "text-text-on-accent" : "text-text-tertiary",
          )}
        >
          {t(tile.overlineKey)}
        </span>
      )}
      <h4
        className={clsx(
          "font-primary text-h5",
          onDark ? "text-text-on-accent" : "text-text-primary",
        )}
      >
        {t(tile.titleKey)}
      </h4>
      {tile.date && (
        <p
          className={clsx(
            "font-body text-caption",
            onDark ? "text-text-on-accent" : "text-text-tertiary",
          )}
        >
          {tile.date}
        </p>
      )}
      {tile.bylineKey && (
        <div className="mt-2 flex items-center gap-2">
          {tile.bylineAvatar && (
            <TileImage
              media={tile.bylineAvatar}
              className="relative size-6 shrink-0 rounded-full"
              sizes="24px"
            />
          )}
          <span className="font-body text-caption text-text-secondary">
            {t(tile.bylineKey)}
          </span>
        </div>
      )}
    </div>
  );

  if (isOverlay && tile.media) {
    return (
      <Tile as="article" surface="raised" padding={false} interactive>
        <TileImage media={tile.media} className="absolute inset-0 h-full w-full" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-text-primary/80 to-transparent"
        />
        <div className="relative mt-auto">{label}</div>
      </Tile>
    );
  }

  if (isInverse) {
    return (
      <Tile as="article" surface="inverse" padding={false}>
        <div className="mt-auto">{label}</div>
      </Tile>
    );
  }

  return (
    <Tile as="article" surface="raised" padding={false} interactive>
      {tile.media && (
        <TileImage media={tile.media} className="relative h-40 w-full shrink-0" />
      )}
      {label}
    </Tile>
  );
}
