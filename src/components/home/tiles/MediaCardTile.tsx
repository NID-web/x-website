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
        {/* Title block and portrait sit side by side (export: Frame23 — the text
            column is flex-1 min-w-0, the portrait a fixed 56px). The portrait is
            what narrows the column, so the title wraps as the design does. */}
        <div className="flex w-full items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h4 className="font-primary text-h5 text-text-primary">{t(tile.titleKey)}</h4>
            {tile.date && (
              <p className="font-primary text-label text-text-tertiary">{tile.date}</p>
            )}
            {/* text/quaternary, not secondary: the export puts the date on the
                tertiary step but the byline one step lighter, on quaternary —
                the same teal as the overline. That step is below AA by design
                (CLAUDE.md § Colour), which is fine for a decorative overline
                but worth a second look here, since a person's name is content. */}
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
        {/* The closing rule's box is 32px on the portrait card and 8px on the
            date-only ones (export: Frame16 vs Frame15) — the taller portrait row
            is given more air beneath it by `justify-between`. */}
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
