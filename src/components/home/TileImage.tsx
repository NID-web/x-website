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
export function TileImage({
  media,
  className,
  sizes = "(min-width: 1280px) 24vw, (min-width: 768px) 48vw, 96vw",
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
      />
    </span>
  );
}
