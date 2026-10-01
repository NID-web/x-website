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
import { IS_BUILD, report, strictBuild } from "@/lib/api/build-mode";
import { onceAcrossBuild } from "@/lib/api/build-cache";
import { cmsBaseUrl, retrying429, withCmsSlot } from "@/lib/api/client";
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

/** HEAD a URL: the status and Retry-After, or status 0 with the reason when
 *  there was no answer (network error, timeout). */
function head(url: URL): Promise<{ status: number; retryAfter?: string; error?: string }> {
  const request = url.protocol === "http:" ? httpRequest : httpsRequest;
  return new Promise((resolve) => {
    const req = request(url, { method: "HEAD", signal: AbortSignal.timeout(HEAD_TIMEOUT_MS) }, (res) => {
      res.resume();
      const retryAfter = res.headers["retry-after"];
      resolve({ status: res.statusCode ?? 0, ...(retryAfter ? { retryAfter } : {}) });
    });
    req.on("error", (err) =>
      resolve({ status: 0, error: err.name === "AbortError" ? `no response in ${HEAD_TIMEOUT_MS / 1000}s` : err.message }),
    );
    req.end();
  });
}

/** Only a real 404 or 410 says a file is missing. */
const GONE = new Set([404, 410]);

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
    // The build's one CMS limiter and 429 retry (client.ts). Only a 404 or 410
    // is "missing"; anything else once retries run out — a 429, a 5xx, no
    // answer — is not evidence the file is gone, so a LIVE build stops rather
    // than quietly drop an image that exists (§70). `next dev` keeps the image.
    // One HEAD per file for the whole build (build-cache.ts): a stored 404/410
    // reads exactly as a fresh one.
    pending = onceAcrossBuild(`HEAD ${key}`, () =>
      withCmsSlot(() => retrying429(() => head(url), key)).then((res) => ({ ...res, body: "" })),
    ).then((res: { status: number; error?: string; attempt?: number; waited?: number }) => {
      if (res.status >= 200 && res.status < 300) {
        report({ t: "head", url: key, ok: true, status: res.status });
        return true;
      }
      if (GONE.has(res.status)) {
        report({ t: "head", url: key, ok: false, status: res.status });
        return false;
      }
      const reason =
        res.error ??
        `HTTP ${res.status}${res.status === 429 ? ` after ${res.attempt ?? 1} attempts, ${(res.waited ?? 0) / 1000}s waited` : ""}`;
      report({ t: "head", url: key, ok: false, status: res.status, reason });
      const message = `[cms] MEDIA CHECK FAILED — ${key}: ${reason}. Only a 404 or 410 means a file is missing`;
      if (strictBuild()) throw new Error(`${message}; a LIVE build does not guess. Retry, or check the CMS.`);
      console.warn(`${message}; the image is kept.`);
      return true;
    });
    if (IS_BUILD) headMemo.set(key, pending);
  }
  return pending;
}
