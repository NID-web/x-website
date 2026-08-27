import clsx from "clsx";
import { Tile } from "@/components/home/Tile";
import { Overline } from "@/components/home/parts";
import { TileImage } from "@/components/home/TileImage";
import { Cta } from "@/components/spine/Cta";
import { Link } from "@/i18n/navigation";
import type { HomeTile, Translate } from "@/lib/home-content";

type ListTileData = Extract<HomeTile, { kind: "calendar" | "news" }>;

const rowSeparator = "mt-3 border-t border-border-faint pt-3";

// Two list tiles share one shape: teal overline → hairline-separated rows →
// bottom-pinned "All news" CTA. The calendar row is {label, date}; the news row
// adds a square thumbnail and links its headline.
export function ListTile({ tile, t }: { tile: ListTileData; t: Translate }) {
  const cta = tile.cta;
  return (
    <Tile
      as="section"
      surface="page"
      padding={false}
      footer={
        cta ? <Cta label={t(cta.labelKey)} href={cta.href} external={cta.external} /> : undefined
      }
    >
      <Overline>{t(tile.overlineKey)}</Overline>

      <ul className="mt-4 flex flex-col">
        {tile.kind === "calendar"
          ? tile.rows.map((row, i) => (
              <li key={row.labelKey} className={i > 0 ? rowSeparator : undefined}>
                <p className="font-primary text-label text-text-primary">{t(row.labelKey)}</p>
                <p className="mt-0.5 font-body text-caption text-text-tertiary">{row.date}</p>
              </li>
            ))
          : tile.rows.map((row, i) => (
              <li
                key={row.headlineKey}
                className={clsx("flex gap-3", i > 0 && rowSeparator)}
              >
                <TileImage
                  media={row.thumbnail}
                  className="relative size-16 shrink-0 rounded-md"
                  sizes="64px"
                />
                <div className="min-w-0">
                  <Link
                    href={row.href}
                    className="line-clamp-2 font-primary text-label text-text-primary no-underline transition-colors duration-150 ease-in-out hover:text-accent-primary"
                  >
                    {t(row.headlineKey)}
                  </Link>
                  <p className="mt-0.5 font-body text-caption text-text-tertiary">{row.date}</p>
                </div>
              </li>
            ))}
      </ul>
    </Tile>
  );
}
