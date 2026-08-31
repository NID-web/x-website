import { Tile } from "@/components/home/Tile";
import { GradientRule, GradientWash, Overline } from "@/components/home/parts";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";
import type { HomeTile, Translate } from "@/lib/home-content";

type LinkListTileData = Extract<HomeTile, { kind: "linkList" }>;

// "Study at NID" — a heading over a list of links, each a bold label with the
// arrow in its own icon slot (never in the string, CLAUDE.md § Content), a
// gradient underline, and a teal meta line.
export function LinkListTile({ tile, t }: { tile: LinkListTileData; t: Translate }) {
  return (
    <Tile
      as="section"
      surface="page"
      padding={false}
      square={false}
      stretch
      className="pt-5"
    >
      {tile.gradient && <GradientWash />}
      {tile.overlineKey && <Overline>{t(tile.overlineKey)}</Overline>}
      {tile.headingKey && (
        <h3 className="relative font-primary text-h3 text-text-tertiary">
          {t(tile.headingKey)}
        </h3>
      )}
      <ul className="relative mt-5 flex flex-col gap-4">
        {tile.links.map((link) => (
          <li key={link.labelKey}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1.5 font-primary text-h6 uppercase text-text-secondary no-underline transition-colors duration-150 ease-in-out hover:text-text-primary"
            >
              {t(link.labelKey)}
              <Icon name="arrow-up-right" className="size-4 shrink-0 text-accent-primary" />
            </Link>
            <GradientRule tone="fade" className="mt-1.5 max-w-28" />
            {link.metaKey && (
              <p className="mt-1.5 font-primary text-micro text-text-tertiary">
                {t(link.metaKey)}
              </p>
            )}
          </li>
        ))}
      </ul>
    </Tile>
  );
}
