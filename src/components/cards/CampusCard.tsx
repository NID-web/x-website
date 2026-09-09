import clsx from "clsx";
import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";
import type { Page } from "@/lib/content-model";
import { pagePath } from "@/lib/content/pages";

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
  const href = pagePath(item);
  const name = (
    <span className="font-primary text-h3 text-white">{item.title}</span>
  );
  return (
    <Tile as="article" surface="raised" padding={false} radius={false} className={ARCH[arch]}>
      {image && (
        <TileImage
          media={image}
          className="absolute inset-0 size-full"
          sizes="(min-width: 1280px) 24vw, (min-width: 668px) 48vw, 96vw"
        />
      )}
      <div
        className={clsx(
          "relative mt-auto flex flex-col p-6 backdrop-blur-[2px]",
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
          // white overlay title on a photo, so the same affordance. Slot opens
          // from nothing, `focus-within` for keyboard and touch.
          <div className="h-0 overflow-hidden motion-safe:transition-[height] motion-safe:duration-400 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:h-8 group-focus-within/tile:h-8">
            <Icon name="arrow-up-right" className="mt-1 size-6 text-white" />
          </div>
        )}
      </div>
    </Tile>
  );
}
