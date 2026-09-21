// A CMS MediaRef becomes a MediaAsset here or not at all — a null means the
// caller keeps its static asset, never a half-built one.
//
// The host check is an allowlist, and it must agree with images.remotePatterns
// in next.config.ts: next/image throws at render on a remote host it was not
// told about, so an asset this lets through that the config does not allow
// would fail the build rather than fall back. They cannot drift, because both
// read the SAME derived list: next.config.ts works out the media hosts (the
// CMS_API_URL host plus whatever hosts the API's own media URLs use — a local
// backend once served its files from a second port) and injects them as
// CMS_MEDIA_HOSTS. Unset, only the CMS_API_URL host is allowed.
import type { MediaAsset } from "@/lib/content-model";
import { cmsBaseUrl } from "@/lib/api/client";
import type { MediaRef } from "@/lib/api/types";

export type MediaResult =
  | { asset: MediaAsset; notes: string[] }
  | { rejected: string };

export function mediaHosts(): string[] {
  const declared = (process.env.CMS_MEDIA_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  const base = cmsBaseUrl()?.host;
  return [...new Set([...declared, ...(base ? [base] : [])])];
}

export function toMediaAsset(
  ref: MediaRef | null | undefined,
  opts: {
    decorative?: boolean;
    /** Used as alt when the API sent none. Pass a CARD's title (the person,
     *  the partner) — never MediaRef.title, which is usually the filename, and
     *  never a page's title, which names the page rather than the picture. */
    altFallback?: string;
  } = {},
): MediaResult {
  if (!ref) return { rejected: "no media" };

  let url: URL;
  try {
    url = new URL(ref.url);
  } catch {
    return { rejected: `unparseable url ${ref.url}` };
  }
  // host, not hostname: a port is part of the origin, and hostname-only would
  // let localhost:9999 through on a localhost:8080 allowlist.
  const allowed = mediaHosts();
  if (!allowed.includes(url.host)) return { rejected: `host ${url.host}` };

  const notes: string[] = [];
  let alt = ref.altText?.trim() ?? "";
  // content-model.ts: alt is mandatory. A decorative image (a news thumbnail
  // beside its own headline) is the one case where "" is the correct alt.
  if (!alt && !opts.decorative) {
    const fallback = opts.altFallback?.trim();
    if (!fallback) return { rejected: "no altText" };
    alt = fallback;
    notes.push("alt from card title — api altText null");
  }

  const width = ref.widthPx ?? 0;
  const height = ref.heightPx ?? 0;
  if (!width || !height) notes.push("no dimensions");

  return {
    asset: {
      id: ref.id,
      file: url.href,
      alt: opts.decorative ? "" : alt,
      // 0/0 is safe for every Home tile — TileImage renders next/image in fill
      // mode and reads neither. The footer's logos do not: see getSiteChrome.
      width,
      height,
      ...(ref.credit?.trim() ? { credit: ref.credit.trim() } : {}),
      ...(ref.focalPoint ? { focal: { x: ref.focalPoint.x, y: ref.focalPoint.y } } : {}),
    },
    notes,
  };
}
