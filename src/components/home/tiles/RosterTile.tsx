import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import { Cta } from "@/components/spine/Cta";
import type { HomeTile, Translate } from "@/lib/home-content";

type RosterTileData = Extract<HomeTile, { kind: "roster" }>;

// "Faculty Stalwarts" — a centred row of overlapping circular portraits over a
// heading, body and CTA. Everything is centred and bottom-aligned in the space
// above the CTA (export `History`, Variant3: `justify-end` on a flex-1 block).
//
// Each portrait carries a 1.5px surface/page ring, so the overlap reads as
// separation in every theme, plus a soft lift.
export function RosterTile({ tile, t }: { tile: RosterTileData; t: Translate }) {
  return (
    <Tile as="section" surface="page" padding={false} className="group items-center gap-4">
      <div className="flex w-full flex-1 flex-col items-center justify-end gap-4">
        {/* Hovering the tile spreads the row: the export's hover variant drops the
            overlap from 40px to 26px. Motion, not colour, so it is gated on
            motion-safe (CLAUDE.md § Icons and motion) — under reduced motion the
            row simply stays as it is rather than snapping.

            400ms on a decelerating curve rather than the 150ms ease-in-out used
            for colour: 70px of travel done in 150ms reads as a jump, and an
            ease-in start makes it worse by front-loading the movement. */}
        <div className="pointer-events-none flex -space-x-10 motion-safe:group-hover:-space-x-[26px]">
          {tile.avatars.map((avatar) => (
            <TileImage
              key={avatar.id}
              media={avatar}
              className="relative size-19 shrink-0 rounded-full shadow-avatar ring-[1.5px] ring-surface-page motion-safe:transition-[margin] motion-safe:duration-400 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
              sizes="76px"
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
