// The one place a public/ image path becomes a MediaAsset. Every fixture and
// static content file builds its assets here.
import type { MediaAsset } from "@/lib/content-model";

export function mediaAsset(
  file: `/${string}`,
  alt: string,
  width: number,
  height: number,
): MediaAsset {
  return { id: file, file, alt, width, height };
}
