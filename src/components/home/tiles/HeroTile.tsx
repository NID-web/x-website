import { getTranslations } from "next-intl/server";
import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import { VideoPlayer } from "@/components/home/VideoPlayer";
import type { HomeTile } from "@/lib/home-content";

type HeroTileData = Extract<HomeTile, { kind: "hero" }>;

/**
 * Home hero tile displaying an eager still image or looped video player across responsive grid spans.
 */
export async function HeroTile({ tile }: { tile: HeroTileData }) {
  const t = await getTranslations("Home");
  const still = (
    <TileImage
      media={tile.media}
      className="relative h-full w-full"
      sizes="(min-width: 1280px) 48vw, (min-width: 1024px) 64vw, 96vw"
      priority
    />
  );

  return (
    <Tile
      as="figure"
      surface="raised"
      square="max-tablet"
      stretch="laptop"
      className="tablet:max-laptop:h-grid-column"
      padding={false}
      radius={false}
    >
      {tile.video ? (
        <VideoPlayer
          video={tile.video}
          playLabel={t("video.play", { title: tile.video.title })}
          pauseLabel={t("video.pause", { title: tile.video.title })}
        >
          {still}
        </VideoPlayer>
      ) : (
        still
      )}
    </Tile>
  );
}
