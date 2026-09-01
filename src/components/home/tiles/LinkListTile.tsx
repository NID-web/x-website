import { Tile } from "@/components/home/Tile";
import { GradientWash, Overline } from "@/components/home/parts";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";
import type { HomeTile, Translate } from "@/lib/home-content";

type LinkListTileData = Extract<HomeTile, { kind: "linkList" }>;

// "Study at NID" — a heading over a list of links, each a bold label with the
// arrow in its own icon slot (never in the string, CLAUDE.md § Content), a
// subtle underline, and a teal meta line.
export function LinkListTile({ tile, t }: { tile: LinkListTileData; t: Translate }) {
  return (
    <Tile
      as="section"
      surface="page"
      padding={false}
      square={false}
      stretch
      className="justify-center"
    >
      {tile.gradient && <GradientWash />}
      {tile.overlineKey && <Overline>{t(tile.overlineKey)}</Overline>}
      {tile.headingKey && (
        <h3 className="relative font-primary text-h3 text-text-tertiary">
          {t(tile.headingKey)}
        </h3>
      )}
      <ul className="relative mt-3 flex flex-col gap-3">
        {tile.links.map((link) => (
          <li key={link.labelKey} className="group">
            <Link
              href={link.href}
              className="inline-flex items-center gap-2.5 font-primary text-h6 uppercase text-text-secondary no-underline transition-colors duration-150 ease-in-out group-hover:text-text-primary"
            >
              {t(link.labelKey)}
              {/* icon/quaternary — primary/350, the export's arrow fill, and a
                  deliberately sub-AA token (CLAUDE.md § Colour). Legitimate
                  here: the arrow is aria-hidden and repeats the affordance the
                  label already carries. Hover takes it to icon/secondary. */}
              <Icon
                name="arrow-up-right"
                className="size-4 shrink-0 text-icon-quaternary transition-colors duration-150 ease-in-out group-hover:text-icon-secondary"
              />
            </Link>
            {/* The CTA's underline, not the brand hairline the other tiles use.
                The export draws it on the CTA box as a 2px `border-b` in
                primary/150 — i.e. border/subtle — darkening to primary/400,
                i.e. border/default, on hover. Both are border tokens, so this
                is a rule rather than a decorative accent. */}
            <span
              aria-hidden="true"
              className="block h-0.5 max-w-28 bg-border-subtle transition-colors duration-150 ease-in-out group-hover:bg-border-default"
            />
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
