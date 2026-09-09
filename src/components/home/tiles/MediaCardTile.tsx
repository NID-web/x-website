import clsx from "clsx";
import { Tile } from "@/components/home/Tile";
import { Overline } from "@/components/home/parts";
import { TileImage } from "@/components/home/TileImage";
import type { HomeTile, Translate } from "@/lib/home-content";

type MediaCardTileData = Extract<HomeTile, { kind: "mediaCard" }>;

/**
 * Media card tile supporting overlay, below, and inverse layouts.
 */
export function MediaCardTile({ tile, t }: { tile: MediaCardTileData; t: Translate }) {
  const isInverse = tile.surface === "inverse";
  const isOverlay = tile.labelPlacement === "overlay";
  const onDark = isInverse || isOverlay;
  const onPhoto = isOverlay && tile.media;

  const label = (
    <div className="flex flex-col gap-1 p-6">
      {tile.overlineKey && (
        <span
          className={clsx(
            "font-primary text-overline uppercase",
            onPhoto ? "text-white" : onDark ? "text-text-on-accent" : "text-text-tertiary",
          )}
        >
          {t(tile.overlineKey)}
        </span>
      )}
      <h4
        className={clsx(
          // Overlay titles are Heading/3 (27/35) in the design, not Heading/5.
          isOverlay ? "font-primary text-h3" : "font-primary text-h5",
          onPhoto ? "text-white" : onDark ? "text-text-on-accent" : "text-text-primary",
        )}
      >
        {t(tile.titleKey)}
      </h4>
      {tile.date && (
        <p
          className={clsx(
            "font-body text-caption",
            onPhoto ? "text-white" : onDark ? "text-text-on-accent" : "text-text-tertiary",
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
    const isArch = tile.shape === "arch";
    const scrim = tile.scrim ?? true;
    return (
      <Tile
        as="article"
        surface="raised"
        padding={false}
        radius={false}
        className={isArch ? "rounded-r-arch" : undefined}
        interactive
      >
        <TileImage media={tile.media} className="absolute inset-0 h-full w-full" />
        {scrim && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-b from-transparent from-45% to-[color-mix(in_srgb,var(--nid-white)_17%,var(--nid-black))]/70"
          />
        )}
        <div className="relative mt-auto backdrop-blur-[1px]">{label}</div>
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
    <Tile as="article" surface="page" padding={false}>
      {tile.media && (
        <TileImage media={tile.media} className="relative min-h-40 w-full flex-1" />
      )}
      <div className="flex flex-1 flex-col justify-between">
        {tile.overlineKey && (
          <div className="pt-2">
            <Overline shortRule>{t(tile.overlineKey)}</Overline>
          </div>
        )}
        <div className="flex w-full items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h4 className="font-primary text-h5 text-text-primary">{t(tile.titleKey)}</h4>
            {tile.date && (
              <p className="font-primary text-label text-text-tertiary">{tile.date}</p>
            )}
            {tile.bylineKey && (
              <p className="font-primary text-label text-text-quaternary">
                {t(tile.bylineKey)}
              </p>
            )}
          </div>
          {tile.bylineAvatar && (
            <TileImage
              media={tile.bylineAvatar}
              className="relative size-14 shrink-0 rounded-full border border-border-strong"
              sizes="56px"
            />
          )}
        </div>
        <span
          aria-hidden="true"
          className={clsx(
            "block border-b-2 border-border-subtle",
            tile.bylineAvatar ? "h-8" : "h-2",
          )}
        />
      </div>
    </Tile>
  );
}
