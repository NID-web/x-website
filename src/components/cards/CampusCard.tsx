import clsx from "clsx";
import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
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
          "relative mt-auto flex p-6 backdrop-blur-[2px]",
          arch === "left" && "justify-end",
        )}
      >
        {href ? (
          <Link href={href} className="no-underline after:absolute after:inset-0">
            {name}
          </Link>
        ) : (
          name
        )}
      </div>
    </Tile>
  );
}
