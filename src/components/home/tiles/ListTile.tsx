import clsx from "clsx";
import { Tile } from "@/components/home/Tile";
import { Overline } from "@/components/home/parts";
import { TileImage } from "@/components/home/TileImage";
import { Cta } from "@/components/spine/Cta";
import { Link } from "@/i18n/navigation";
import type { HomeTile, Translate } from "@/lib/home-content";

type ListTileData = Extract<HomeTile, { kind: "calendar" | "news" }>;

const rowSeparator = "border-t border-border-subtle pt-3";
const calendarRowSeparator = `mt-2 ${rowSeparator}`;

const lastRowRule = "border-b border-border-subtle";
const calendarLastRowRule = `pb-2 ${lastRowRule}`;

export function ListTile({ tile, t }: { tile: ListTileData; t: Translate }) {
  const cta = tile.cta;
  return (
    <Tile
      as="section"
      surface="page"
      padding={false}

      className={tile.kind === "calendar" ? "border-b-2 border-border-subtle" : undefined}
      footer={
        cta ? (
          <div className="flex items-end gap-2">
            <Cta
              label={t(cta.labelKey)}
              href={cta.href}
              external={cta.external}
              className="min-h-8 border-b-2 border-border-subtle px-2 py-1"
            />
            <span
              aria-hidden="true"
              className="min-w-0 flex-1 self-stretch border-b-2 border-border-subtle"
            />
          </div>
        ) : undefined
      }
    >
      <Overline>{t(tile.overlineKey)}</Overline>

      <ul className="mt-4 flex flex-col">
        {tile.kind === "calendar"
          ? tile.rows.map((row, i) => (
              <li
                key={row.labelKey}
                className={clsx(
                  i > 0 && calendarRowSeparator,
                  i === tile.rows.length - 1 && calendarLastRowRule,
                )}
              >
                <p className="font-primary text-label text-text-primary">
                  {t(row.labelKey)}
                </p>
                <p className="mt-0.5 font-primary text-label text-text-tertiary">
                  {row.date}
                </p>
              </li>
            ))
          : tile.rows.map((row, i) => (
              <li
                key={row.headlineKey}
                className={clsx(
                  "flex gap-3",
                  i > 0 && rowSeparator,
                  i === tile.rows.length - 1 && lastRowRule,
                )}
              >
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
                <div className="min-w-0">
                  <Link
                    href={row.href}
                    className="line-clamp-2 font-primary text-label text-text-primary no-underline transition-colors duration-150 ease-in-out hover:text-accent-primary"
                  >
                    {t(row.headlineKey)}
                  </Link>
                  <p className="mt-0.5 font-primary text-micro text-text-tertiary">
                    {row.date}
                  </p>
                </div>
              </li>
            ))}
      </ul>
    </Tile>
  );
}
