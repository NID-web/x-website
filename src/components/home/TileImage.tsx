import Image from "next/image";
import clsx from "clsx";
import type { MediaAsset } from "@/lib/content-model";

/**
 * The scrim behind text drawn over a photograph, sized to the text block: put
 * it on the block's own container, with PHOTO_TEXT on the text. It is the
 * VideoPlayer button's pair — surface/inverse under text/on-accent — so it
 * darkens in light and lightens in dark, like every scrim in the app.
 *
 * 75% is computed, not tuned. Over the worst photograph for each appearance
 * (pure white in light, pure black in dark) the minimum across all twenty
 * states is 5.96:1; 66% is the floor for 4.5:1, and the button's 60% only has
 * to clear an icon's 3:1. A photo that 404s leaves TileImage's accent/subtle
 * backer, which lies between those extremes, so the same bound holds. The
 * `before:` feather above the block is decoration and carries no text.
 */
export const PHOTO_SCRIM =
  "bg-surface-inverse/75 before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-8 before:bg-linear-to-t before:from-surface-inverse/75 before:to-transparent before:content-['']";
export const PHOTO_TEXT = "text-text-on-accent";

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
