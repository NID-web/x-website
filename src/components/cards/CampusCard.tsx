import clsx from "clsx";
import { Tile } from "@/components/home/Tile";
import { PHOTO_SCRIM, PHOTO_TEXT, TileImage } from "@/components/home/TileImage";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";
import type { Page } from "@/lib/content-model";
import { cardHref } from "@/lib/content/links";

/**
 * Campus card featuring an arched photograph and overlay title.
 */
export type ArchSide = "top" | "left" | "right";

const ARCH: Record<ArchSide, string> = {
  top: "rounded-t-arch",
  left: "rounded-l-arch",
  right: "rounded-r-arch",
};

export function CampusCard({ item, arch }: { item: Page; arch: ArchSide }) {
  const image = item.hero[0];
  // Unlinked, not dropped, when the campus page is not built (links.ts).
  const href = cardHref(item);
  // With no photo the card is the flat accent/subtle box and needs no scrim:
  // text/primary on it clears 9.79:1 in all twenty states. A photo that 404s
  // is not knowable here, so it keeps the scrim (PHOTO_SCRIM's bound covers it).
  const text = image ? PHOTO_TEXT : "text-text-primary";
  const name = <span className={clsx("font-primary text-h3", text)}>{item.title}</span>;
  return (
    <Tile as="article" surface="raised" padding={false} radius={false} className={ARCH[arch]}>
      {image ? (
        <TileImage
          media={image}
          className="absolute inset-0 size-full"
          sizes="(min-width: 1280px) 24vw, (min-width: 668px) 48vw, 96vw"
        />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 block size-full bg-accent-subtle" />
      )}
      <div
        className={clsx(
          "relative mt-auto flex flex-col p-6 backdrop-blur-[2px]",
          image && PHOTO_SCRIM,
          arch === "left" && "items-end",
        )}
      >
        {href ? (
          <Link href={href} className="no-underline after:absolute after:inset-0">
            {name}
          </Link>
        ) : (
          name
        )}
        {href && (
          // The card was a whole-tile link with no hover feedback at all — the
          // only one left in the app. This is the arrow the HOME campuses tile
          // draws (MediaCardTile's overlay branch): the same arch, the same
          // overlay title on a photo, so the same affordance. Slot opens
          // from nothing, `focus-within` for keyboard and touch.
          <div className="h-0 overflow-hidden motion-safe:transition-[height] motion-safe:duration-400 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:h-8 group-focus-within/tile:h-8">
            <Icon name="arrow-up-right" className={clsx("mt-1 size-6", image ? "text-icon-on-accent" : "text-icon-primary")} />
          </div>
        )}
      </div>
    </Tile>
  );
}
