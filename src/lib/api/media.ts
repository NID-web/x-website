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
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import type { MediaAsset } from "@/lib/content-model";
import { IS_BUILD, report } from "@/lib/api/build-mode";
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

const HEAD_TIMEOUT_MS = 10_000;

function head(url: URL): Promise<number> {
  const request = url.protocol === "http:" ? httpRequest : httpsRequest;
  return new Promise((resolve) => {
    const req = request(url, { method: "HEAD", signal: AbortSignal.timeout(HEAD_TIMEOUT_MS) }, (res) => {
      res.resume();
      resolve(res.statusCode ?? 0);
    });
    // A network failure reads as "not there": the caller draws its placeholder.
    req.on("error", () => resolve(0));
    req.end();
  });
}

// One HEAD per URL per build, kept per worker process like cmsFetch's documents
// (client.ts): every page that asks about the same file shares the answer.
const headMemo = new Map<string, Promise<boolean>>();

/** Whether a CMS media file actually serves, checked once per build. For slots
 *  whose absence has a designed state — the archive rows' placeholder square —
 *  so that a record whose file 404s shows that state rather than a broken image.
 *  Six live thumbnails 404 (28 Sep 2026). A flake costs one placeholder, never a
 *  page, which is why this is NOT a gate on anything whose absence removes a slot.
 *
 *  TODO(review): article heroes have the same hole — a hero with alt text whose
 *  file 404s is only caught client-side by HideOnImageError, so without
 *  JavaScript it still draws its box (ARTICLE-API-STATUS decision 3). Not wired
 *  in here on purpose. */
export function mediaExists(asset: MediaAsset): Promise<boolean> {
  let url: URL;
  try {
    url = new URL(asset.file);
  } catch {
    return Promise.resolve(true); // a local public/ path: in the repo, so it exists
  }
  const key = url.href;
  let pending = IS_BUILD ? headMemo.get(key) : undefined;
  if (!pending) {
    pending = head(url).then((status) => {
      const ok = status >= 200 && status < 300;
      report({ t: "head", url: key, ok, status });
      return ok;
    });
    if (IS_BUILD) headMemo.set(key, pending);
  }
  return pending;
}
