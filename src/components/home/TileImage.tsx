import Image from "next/image";
import clsx from "clsx";
import type { MediaAsset } from "@/lib/content-model";

// next/image in `fill` mode over a sized box — the shape every tile gives it via
// className (square thumb, circle avatar, full-bleed cover). `fill` needs a
// positioned parent, so every caller's className must set the position
// (`relative` for a normal box, `absolute inset-0` for a full-bleed overlay) —
// left out of the base so `absolute` never races `relative` on class order. The
// accent-subtle backer shows while a photo loads; set `backer={false}` for a
// transparent logo strip, where that tint would read as a coloured box.
//
// `focal` drives object-position (NID-CONTEXT.md §8.6). It matters because one
// asset is cropped to several ratios across the breakpoints, so the subject a
// centred crop keeps at one width can leave the frame at another; the model
// stores it normalised 0–1 and calls it not-optional for any off-centre
// subject. Centre is the fallback, which is what object-position already
// defaults to.
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
