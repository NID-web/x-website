import Image from "next/image";
import clsx from "clsx";
import type { MediaAsset } from "@/lib/content-model";

/**
 * Responsive image wrapper around next/image in fill mode.
 * Supports focal-point object position, contain/cover fits, and optional background tint.
 */
export function TileImage({
  media,
  className,
  sizes = "(min-width: 1280px) 24vw, (min-width: 668px) 48vw, 96vw",
  fit = "cover",
  priority = false,
  backer = true,
}: {
  media: MediaAsset;
  className?: string;
  sizes?: string;
  fit?: "cover" | "contain";
  priority?: boolean;
  backer?: boolean;
}) {
  return (
    <span className={clsx("block overflow-hidden", backer && "bg-accent-subtle", className)}>
      <Image
        src={media.file}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={fit === "cover" ? "object-cover" : "object-contain"}
        style={{
          objectPosition: `${(media.focal?.x ?? 0.5) * 100}% ${(media.focal?.y ?? 0.5) * 100}%`,
        }}
      />
    </span>
  );
}
