import clsx from "clsx";
import { Tile } from "@/components/home/Tile";
import { Overline } from "@/components/home/parts";
import { TileImage } from "@/components/home/TileImage";
import type { HomeTile, Translate } from "@/lib/home-content";

type MediaCardTileData = Extract<HomeTile, { kind: "mediaCard" }>;

// Three shapes over one structure:
//  • overlay  — photo fills the tile, label sits over a scrim at the bottom
//  • below    — photo on the top half, overline / title / closing rule beneath
//               (Drawing Dialogues, Young Designers)
//  • inverse  — no photo; the Call-for-Papers surface (surface/inverse is the
//               only sanctioned dark pairing and inverts correctly, CLAUDE.md).
export function MediaCardTile({ tile, t }: { tile: MediaCardTileData; t: Translate }) {
  const isInverse = tile.surface === "inverse";
  const isOverlay = tile.labelPlacement === "overlay";
  const onDark = isInverse || isOverlay;
  // A photograph does not invert with appearance, so label text over one is
  // plain white — `text/on-accent` flips to near-black in dark, which would
  // have put dark text on an unchanged photo. surface/inverse DOES invert, so
  // the Call-for-Papers style card keeps the semantic token.
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
        radius={!isArch}
        className={isArch ? "rounded-r-arch" : undefined}
        interactive
      >
        <TileImage media={tile.media} className="absolute inset-0 h-full w-full" />
        {scrim && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-text-primary/80 to-transparent"
          />
        )}
        {/* Without a scrim the design floats the label on a 2px backdrop blur —
            just enough to settle the type on the photograph. */}
        <div className={clsx("relative mt-auto", !scrim && "backdrop-blur-[2px]")}>
          {label}
        </div>
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

  // `below` is the portrait tile's skeleton with a photo where the craft band
  // goes (export: `DrawingDialogues`, `YoungDesigners`): two equal halves, the
  // lower one spread overline / text / closing rule with justify-between. Page
  // surface and no padding — the photo is full-bleed and the text aligns to the
  // grid column, so there is no card to give a radius or an inset to.
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
        <div className="flex flex-col gap-0.5">
          <h4 className="font-primary text-h5 text-text-primary">{t(tile.titleKey)}</h4>
          {tile.date && (
            <p className="font-primary text-label text-text-tertiary">{tile.date}</p>
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
              <span className="font-primary text-label text-text-secondary">
                {t(tile.bylineKey)}
              </span>
            </div>
          )}
        </div>
        <span aria-hidden="true" className="block h-2 border-b-2 border-border-subtle" />
      </div>
    </Tile>
  );
}
