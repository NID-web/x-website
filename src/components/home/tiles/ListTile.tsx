import clsx from "clsx";
import { Tile } from "@/components/home/Tile";
import { Overline } from "@/components/home/parts";
import { TileImage } from "@/components/home/TileImage";
import { Cta } from "@/components/spine/Cta";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";
import type { HomeTile, Translate } from "@/lib/home-content";

type ListTileData = Extract<HomeTile, { kind: "calendar" | "news" }>;

const rowRule = "border-b border-border-subtle";
const rowGap = "pt-3";
const calendarRowRule = `pb-2 ${rowRule}`;

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
      className={
        tile.kind === "calendar" && !cta ? "border-b-2 border-border-subtle" : undefined
      }
      footer={
        cta ? (
          <div className="flex items-end gap-2">
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
                <Link href={row.href} className="flex gap-3 no-underline">
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
