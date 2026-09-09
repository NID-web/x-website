import clsx from "clsx";
import { Tile } from "@/components/home/Tile";
import { FlipMediaCard } from "@/components/home/tiles/FlipMediaCard";
import { Overline } from "@/components/home/parts";
import { TileImage } from "@/components/home/TileImage";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";
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

  // The two-faced workshop card is its own CLIENT component, so translate here
  // and hand plain strings across the boundary — a `t` function is not
  // serialisable, and the other media cards stay server-rendered this way.
  if (tile.flip) {
    return (
      <FlipMediaCard
        media={tile.media}
        overline={tile.overlineKey ? t(tile.overlineKey) : undefined}
        title={t(tile.titleKey)}
        date={tile.date}
        body={t(tile.flip.bodyKey)}
        ctaLabel={t(tile.flip.cta.labelKey)}
        ctaHref={tile.flip.cta.href}
        ctaExternal={tile.flip.cta.external}
        showDetailsLabel={t("cta.showDetails")}
        showCoverLabel={t("cta.showCover")}
      />
    );
  }

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
        {/* The TITLE is the link and `after:inset-0` stretches its target over
            the whole tile, so the accessible name is the place rather than an
            arrow, while the click target stays the entire card — PortraitTile
            and ListTile's reasoning. The arrow below is decorative. */}
        {isOverlay && tile.href ? (
          <Link
            href={tile.href}
            className="text-inherit no-underline after:absolute after:inset-0 after:content-['']"
          >
            {t(tile.titleKey)}
          </Link>
        ) : (
          t(tile.titleKey)
        )}
      </h4>
      {isOverlay && tile.href && (
        // The arrow's slot opens from nothing on hover, as PortraitTile's does
        // (STAGE-0-NOTES §48): the rest variant has no arrow, so reserving the
        // room would spend it at rest and leave nothing to open. `focus-within`
        // as well as `hover`, because a keyboard reaches the link first and a
        // touch device never hovers at all.
        <div className="h-0 overflow-hidden motion-safe:transition-[height] motion-safe:duration-400 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:h-8 group-focus-within/tile:h-8">
          <Icon
            name="arrow-up-right"
            className={clsx("mt-1 size-6", onPhoto ? "text-white" : "text-text-on-accent")}
          />
        </div>
      )}
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
            <Overline shortRule hoverDark={Boolean(tile.href)}>
              {t(tile.overlineKey)}
            </Overline>
          </div>
        )}
        <div className="flex w-full items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h4
              className={clsx(
                "font-primary text-h5 text-text-primary",
                tile.href &&
                  "transition-colors duration-150 ease-in-out group-hover/tile:text-text-secondary",
              )}
            >
              {/* Title is the link, `after:inset-0` makes the whole tile the
                  target, arrow below is decorative — PortraitTile's reasoning,
                  and the same shape FlipMediaCard's front face uses. */}
              {tile.href ? (
                <Link
                  href={tile.href}
                  className="text-inherit no-underline after:absolute after:inset-0 after:content-['']"
                >
                  {t(tile.titleKey)}
                </Link>
              ) : (
                t(tile.titleKey)
              )}
            </h4>
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
        {tile.href && (
          // The visit arrow, left, in a slot that opens from nothing on hover —
          // the same row FlipMediaCard's front face draws, without the flip
          // control, since this card has no back face. icon/quaternary is the
          // fill the export gives this glyph.
          <div className="h-0 overflow-hidden motion-safe:transition-[height] motion-safe:duration-400 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:h-8 group-focus-within/tile:h-8">
            <Icon name="arrow-up-right" className="size-6 text-icon-quaternary" />
          </div>
        )}
        <span
          aria-hidden="true"
          className={clsx(
            "block border-b-2 border-border-subtle",
            tile.bylineAvatar ? "h-8" : "h-2",
            tile.href &&
              "transition-colors duration-150 ease-in-out group-hover/tile:border-icon-tertiary",
          )}
        />
      </div>
    </Tile>
  );
}
