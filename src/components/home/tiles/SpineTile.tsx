import { Tile } from "@/components/home/Tile";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";
import type { HomeTile, Translate } from "@/lib/home-content";

type SpineTileData = Extract<HomeTile, { kind: "spine" }>;

/**
 * "Knowledge Management Centre" — a shelf of vertical book spines above a heading.
 */
export function SpineTile({ tile, t }: { tile: SpineTileData; t: Translate }) {
  const heading = t(tile.headingKey);

  return (
    <Tile as="section" surface="page" padding={false}>
      {/* No gap between spines: each carries its own left hairline, so a gap
          would double the gutter the rules are meant to be. */}
      <div className="flex flex-1 items-stretch overflow-hidden">
        {tile.spines.map((spine) => (
          // Each spine lights on its OWN hover — surface/raised behind it and the
          // title stepping quaternary -> secondary (Figma 271:6157, Book Default
          // vs Variant2). Per-spine, not per-tile, so `group/spine` rather than
          // the tile's `group/tile`.
          <span
            key={spine}
            className="group/spine flex w-[calc(28px*var(--nid-tile-scale))] shrink-0 flex-col items-center border-l border-border-subtle pt-1 transition-colors duration-150 ease-in-out hover:bg-surface-raised"
          >
            <span className="min-h-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-primary text-micro text-text-quaternary transition-colors duration-150 ease-in-out group-hover/spine:text-text-secondary [writing-mode:vertical-rl]">
              {spine}
            </span>
          </span>
        ))}
      </div>

      <h3 className="mt-4 font-primary text-h3 text-text-primary">
        {/* Deliberately NOT the `after:inset-0` whole-tile target the other
            linked tiles use. That overlay would sit on top of the shelf and
            swallow the pointer, so no spine would ever reach its own :hover —
            the two requirements are mutually exclusive, and the board asks for
            the per-spine highlight. The heading and the arrow are the link. */}
        {tile.href ? (
          <Link href={tile.href} className="text-inherit no-underline">
            {heading}
          </Link>
        ) : (
          heading
        )}
      </h3>

      {tile.href && (
        // The visit arrow, left, in a slot that opens from nothing — the same
        // row the media cards draw (STAGE-0-NOTES §48's pattern).
        <div className="h-0 overflow-hidden motion-safe:transition-[height] motion-safe:duration-400 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:h-8 group-focus-within/tile:h-8">
          <Icon name="arrow-up-right" className="size-6 text-icon-quaternary" />
        </div>
      )}

      {/* Same 32px closing rule the media cards carry. */}
      <span
        aria-hidden="true"
        className={
          tile.href
            ? "mt-4 block h-8 border-b-2 border-border-subtle transition-colors duration-150 ease-in-out group-hover/tile:border-icon-tertiary"
            : "mt-4 block h-8 border-b-2 border-border-subtle"
        }
      />
    </Tile>
  );
}
