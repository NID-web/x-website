import clsx from "clsx";
import { Tile } from "@/components/home/Tile";
import { Overline } from "@/components/home/parts";
import { TileImage } from "@/components/home/TileImage";
import { Cta } from "@/components/spine/Cta";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";
import type { HomeTile, Translate } from "@/lib/home-content";

type ListTileData = Extract<HomeTile, { kind: "calendar" | "news" }>;

// Each row carries its own bottom rule. It used to be a top rule on every row
// after the first plus a bottom rule on the last, which draws in all the same
// places — but it put the rule under row N inside row N+1, so a row could not
// colour its own rule on hover.
//
// The <li> boxes do move, because the 8px that was `mt-2` on the next row is
// now `pb-2` on this one and padding is inside the box where margin was not.
// Nothing visible moves: measured at 1440 and 768, the first calendar rule
// still lands at y78-79 with the next row's text at y91, the last at y268, and
// both tiles are still exactly the column height (330 / 350).
const rowRule = "border-b border-border-subtle";
const rowGap = "pt-3"; // space above the rule that precedes this row
const calendarRowRule = `pb-2 ${rowRule}`;

// A linked row lights its own rule and reveals its arrow. Colour only, 150ms,
// no transform (CLAUDE.md § Icons and motion). The arrow always occupies its
// slot and fades in, so nothing reflows on hover.
const linkedRow = "group transition-colors duration-150 ease-in-out hover:border-border-default";
const rowArrow =
  "size-4 shrink-0 text-icon-quaternary opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100";

export function ListTile({ tile, t }: { tile: ListTileData; t: Translate }) {
  const cta = tile.cta;
  return (
    <Tile
      as="section"
      surface="page"
      padding={false}

      // A calendar with no CTA closes itself with a rule on the tile's own
      // bottom edge. With one, the CTA row already ends in a rule of the same
      // weight, so the tile's would sit directly under it as a second line —
      // which is why News, which has always had a CTA, never carried this.
      className={
        tile.kind === "calendar" && !cta ? "border-b-2 border-border-subtle" : undefined
      }
      footer={
        cta ? (
          <div className="flex items-end gap-2">
            {/* `peer`, not `group`: the underline and the rule beside it are one
                continuous line, so both move to border/default together — but
                only when the CTA itself is hovered. A group on the wrapper would
                fire on the decorative rule's dead space too, and would collide
                with the group Cta already sets on its own link for the arrow. */}
            <Cta
              label={t(cta.labelKey)}
              href={cta.href}
              external={cta.external}
              className="peer min-h-8 border-b-2 border-border-subtle px-2 py-1 hover:border-border-default"
            />
            <span
              aria-hidden="true"
              className="min-w-0 flex-1 self-stretch border-b-2 border-border-subtle transition-colors duration-150 ease-in-out peer-hover:border-border-default"
            />
          </div>
        ) : undefined
      }
    >
      <Overline>{t(tile.overlineKey)}</Overline>

      <ul className="mt-4 flex flex-col">
        {tile.kind === "calendar"
          ? tile.rows.map((row, i) => {
              const body = (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block font-primary text-label text-text-primary">
                      {t(row.labelKey)}
                    </span>
                    <span className="mt-0.5 block font-primary text-label text-text-tertiary">
                      {row.date}
                    </span>
                  </span>
                  {row.href && <Icon name="arrow-up-right" className={rowArrow} />}
                </>
              );
              return (
                <li
                  key={row.labelKey}
                  className={clsx(
                    calendarRowRule,
                    i > 0 && rowGap,
                    row.href && linkedRow,
                  )}
                >
                  {row.href ? (
                    <Link
                      href={row.href}
                      className="flex items-start gap-2 no-underline"
                    >
                      {body}
                    </Link>
                  ) : (
                    <span className="flex items-start gap-2">{body}</span>
                  )}
                </li>
              );
            })
          : tile.rows.map((row, i) => (
              <li
                key={row.headlineKey}
                className={clsx(rowRule, linkedRow, i > 0 && rowGap)}
              >
                {/* The whole row is the link, not just the headline: the arrow
                    sits at the row's right edge and the rule under it responds,
                    so the row is one target rather than a link with two
                    decorations that are not part of it. */}
                <Link href={row.href} className="flex gap-3 no-underline">
                {/* 64px at the artboard, scaled with the tile like everything
                    else in it (docs/STAGE-0-NOTES.md §27). Fixed, these three
                    thumbnails gave the tile a 293.5px floor that overflowed its
                    own column between 1280 and 1292. `sizes` names the upper
                    end of the range rather than the artboard value. */}
                <TileImage
                  media={row.thumbnail}
                  className="relative size-[calc(64px*var(--nid-tile-scale))] shrink-0"
                  sizes="90px"
                />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block font-primary text-label text-text-primary transition-colors duration-150 ease-in-out group-hover:text-accent-primary">
                    {t(row.headlineKey)}
                  </span>
                  <span className="mt-0.5 block font-primary text-micro text-text-tertiary">
                    {row.date}
                  </span>
                </span>
                <Icon name="arrow-up-right" className={rowArrow} />
                </Link>
              </li>
            ))}
      </ul>
    </Tile>
  );
}
