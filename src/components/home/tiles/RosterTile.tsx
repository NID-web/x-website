import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import { Cta } from "@/components/spine/Cta";
import type { HomeTile, Translate } from "@/lib/home-content";

type RosterTileData = Extract<HomeTile, { kind: "roster" }>;

/**
 * "Faculty Stalwarts" — row of overlapping circular portraits over heading, body, and CTA.
 */
export function RosterTile({ tile, t }: { tile: RosterTileData; t: Translate }) {
  return (
    <Tile as="section" surface="page" padding={false} className="group items-center gap-4">
      <div className="flex w-full flex-1 flex-col items-center justify-end gap-4">
        {/* Hovering the tile spreads the row: the export's hover variant drops
            the overlap from 40px to 26px. Motion, not colour, so it is gated on
            motion-safe (CLAUDE.md § Icons and motion) — under reduced motion the
            row simply stays as it is rather than snapping. 400ms on a
            decelerating curve, not the 150ms ease-in-out used for colour: 70px
            of travel in 150ms reads as a jump.
            The hover overlap is 30px, NOT the export's 26: at 26 the hovered row
            is 326px, which does not fit the 1024 board's own 309.33px column, so
            the design overflowed at its own artboard. 30 puts it at 306 and it
            clears every column at every width. Portraits and their overlap both
            scale with the tile (STAGE-0-NOTES §27). */}
        <div className="pointer-events-none flex -space-x-[calc(40px*var(--nid-tile-scale))] motion-safe:group-hover:-space-x-[calc(30px*var(--nid-tile-scale))]">
          {tile.avatars.map((avatar) => (
            <TileImage
              key={avatar.id}
              media={avatar}
              className="relative size-[calc(76px*var(--nid-tile-scale))] shrink-0 rounded-full shadow-avatar ring-[1.5px] ring-surface-page motion-safe:transition-[margin] motion-safe:duration-400 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
              sizes="105px"
            />
          ))}
        </div>
        <h4 className="w-full text-center font-primary text-h3 text-text-primary">
          {t(tile.headingKey)}
        </h4>
        {tile.bodyKey && (
          <p className="w-full text-center font-primary text-label text-text-tertiary">
            {t(tile.bodyKey)}
          </p>
        )}
      </div>
      {tile.cta && (
        <Cta
          label={t(tile.cta.labelKey)}
          href={tile.cta.href}
          external={tile.cta.external}
          hoverLabel={false}
          className="min-h-8 border-b-2 border-border-subtle px-2 py-1 hover:border-border-default"
        />
      )}
    </Tile>
  );
}
