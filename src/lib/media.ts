// The one place a public/ image path becomes a MediaAsset. Every fixture and
// static content file builds its assets here, so the GitHub Pages basePath
// prefix (docs/STAGE-0-NOTES.md §16) is applied in exactly one line — a raw
// src into public/ is not prefixed by Next the way _next/* and <Link> are.
import type { MediaAsset } from "@/lib/content-model";

const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function mediaAsset(
  file: `/${string}`,
  alt: string,
  width: number,
  height: number,
): MediaAsset {
  return { id: file, file: `${ASSET_BASE}${file}`, alt, width, height };
}

// The same prefix for a raw file path that is not an image — a <video src>,
// a download href. `mediaAsset` is the image-shaped door onto public/; this is
// the bare one. Both must exist: a path that skips it 404s on GitHub Pages,
// where the site is served under /x-website (the deployed hero video did
// exactly that — the <video> asked for /home/nid-film.mp4, which is not a
// route on that host).
export function assetPath(file: `/${string}`): string {
  return `${ASSET_BASE}${file}`;
}
