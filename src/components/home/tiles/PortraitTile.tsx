import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import { Tile } from "@/components/home/Tile";
import { Icon } from "@/components/spine/Icon";
import { Overline } from "@/components/home/parts";
import {
  PatternFieldAlumni,
  PatternScatterAlumni,
  PatternScatterPride,
} from "@/components/home/patterns";
import { TileImage } from "@/components/home/TileImage";
import type { HomeTile, Translate } from "@/lib/home-content";

type PortraitTileData = Extract<HomeTile, { kind: "portrait" }>;

// Both portrait tiles share the left-hand motif; only the scatter under the
// portrait differs. Pride's is denser (64 cells to Alumni's 80, but packed into
// a ring) and drawn on a different three accents.
const SCATTER = {
  alumni: PatternScatterAlumni,
  pride: PatternScatterPride,
} as const;

export function PortraitTile({ tile, t }: { tile: PortraitTileData; t: Translate }) {
  const Scatter = tile.bed ? SCATTER[tile.bed] : null;
  return (
    <Tile as="section" surface="page" padding={false}>
      <div className="flex flex-1 items-center">
        {tile.bed && <PatternFieldAlumni className="aspect-square w-1/2 shrink-0" />}
        <div
          className={clsx(
            "relative flex aspect-square w-1/2 shrink-0 items-center justify-center",
            !tile.bed && "ml-auto",
          )}
        >
          {Scatter && <Scatter className="absolute inset-0 size-full" />}
          <TileImage
            media={tile.photo}
            className="relative aspect-square w-4/5 rounded-full"
            sizes="(min-width: 1280px) 132px, 25vw"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {tile.overlineKey && (
          <div className="pt-2">
            <Overline shortRule hoverDark={Boolean(tile.href)}>
              {t(tile.overlineKey)}
            </Overline>
          </div>
        )}

        {/* Two spacers rather than `justify-between`, because the gap ABOVE the
            name is the thing that animates. At rest both grow equally and the
            name block sits centred between the overline and the rule, which is
            what the tile has always looked like. On hover the top one collapses
            and the name and bio rise to meet the overline, opening the room the
            arrow reads in. `flex-grow` is a number, so it interpolates —
            `justify-content` does not, which is why that could not carry this.

            `motion-safe:` gates the TRANSITION, not the state change, so under
            prefers-reduced-motion the tile still opens — instantly — rather
            than not opening at all. That differs from RosterTile, which
            suppresses its avatar fan outright, and the difference is what the
            two are for: the fan is a flourish nothing depends on, whereas this
            movement is what makes room for the arrow, and suppressing it would
            leave a linked tile with no visible affordance. Timing and easing
            are RosterTile's. */}
        <span
          aria-hidden="true"
          className={clsx(
            // `min-h-[10px]` is the floor the name rises TO, not a rest value:
            // at rest the spacer grows to about 32px. The two together are the
            // 22px rise the Figma variants measure (name ink y219 -> y197 in
            // the 330 tile); without a floor the name goes flush against the
            // overline and the two read as one block.
            "min-h-[10px] flex-1",
            tile.href &&
              "motion-safe:transition-[flex-grow] motion-safe:duration-400 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:grow-0",
          )}
        />
        <div className="flex flex-col gap-2">
          <h4 className="font-primary text-h5 text-text-primary">
            {tile.href ? (
              // The NAME is the link, and `after:inset-0` stretches its target
              // over the whole tile — so the accessible name is the person, not
              // "read more", and the click target is still the tile (the same
              // reasoning as ListTile's whole-row link). Tile is `relative`,
              // which is what the pseudo-element anchors to.
              <Link
                href={tile.href}
                className="no-underline after:absolute after:inset-0 after:content-['']"
              >
                {t(tile.nameKey)}
              </Link>
            ) : (
              t(tile.nameKey)
            )}
          </h4>
          {tile.bioKey && (
            <p className="font-primary text-label text-text-tertiary">{t(tile.bioKey)}</p>
          )}
        </div>
        <span aria-hidden="true" className="flex-1" />

        {/* The arrow's SLOT opens from nothing rather than being reserved, which
            is what ListTile's rows do — and the difference is deliberate. The
            Figma Default variant has no arrow AND sits its name 22px lower;
            reserving the slot would spend that 22px at rest and leave nothing
            to move. The rule below is pinned to the bottom of a fixed-height
            column, so the slot opens into the spacers above it and the rule
            never shifts.

            `size-8` and not `size-4`: the glyph occupies x7–x17 of a 24 box, so
            a 16px icon draws 8px of ink where the variant measures 15px. The
            negative margin puts that ink on the text's left edge rather than
            the box's, and the slot is taller than the icon because the icon
            sits at its top — growing the slot is what lifts the arrow to the
            variant's height off the rule. aria-hidden and redundant with the link, which is what
            allows the decorative icon ramp here. */}
        {tile.href && (
          <div className="h-0 overflow-hidden motion-safe:transition-[height] motion-safe:duration-400 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:h-11">
            <Icon
              name="arrow-up-right"
              className="-ml-2 size-8 shrink-0 text-icon-quaternary opacity-0 transition-opacity duration-150 ease-in-out group-hover/tile:opacity-100 motion-reduce:transition-none"
            />
          </div>
        )}

        {/* The tile closes on a rule, as the list tiles do — and on a linked
            tile it lights with the hover, the way ListTile's row rule does
            (the variant takes it from the palest teal to a mid one, i.e.
            border/subtle to border/default). */}
        <span
          aria-hidden="true"
          className={clsx(
            "block h-2 border-b-2 border-border-subtle",
            tile.href &&
              "transition-colors duration-150 ease-in-out group-hover/tile:border-border-primary",
          )}
        />
      </div>
    </Tile>
  );
}
