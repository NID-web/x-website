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
import { CMS_TIMEOUT_MS, cmsBaseUrl, retrying, withCmsSlot } from "@/lib/api/client";
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

/** HEAD a URL: the status, Retry-After and Location. Rejects when there was no
 *  answer (network error, timeout), so `retrying` can tell a hang from an answer. */
function head(url: URL): Promise<{ status: number; retryAfter?: string; location?: string; error?: string }> {
  const request = url.protocol === "http:" ? httpRequest : httpsRequest;
  return new Promise((resolve, reject) => {
    const req = request(url, { method: "HEAD", signal: AbortSignal.timeout(CMS_TIMEOUT_MS) }, (res) => {
      res.resume();
      const retryAfter = res.headers["retry-after"];
      const location = res.headers.location;
      resolve({ status: res.statusCode ?? 0, ...(retryAfter ? { retryAfter } : {}), ...(location ? { location } : {}) });
    });
    req.on("error", reject);
    req.end();
  });
}

/** Redirects a file check follows before judging the answer (§89): a host
 *  moving a file (nid.edu → www.nid.edu) must not fail a deploy. */
const MAX_HOPS = 3;

/** HEAD with up to MAX_HOPS redirects, each hop through the same retry. The
 *  final answer is judged; `hops` names the URLs it passed through. */
async function headFollowing(url: URL, key: string) {
  const hops: string[] = [];
  let at = url;
  for (;;) {
    const res = await retrying(() => head(at), key);
    if (res.status >= 300 && res.status < 400 && res.location && hops.length < MAX_HOPS) {
      at = new URL(res.location, at);
      hops.push(at.href);
      continue;
    }
    return { ...res, hops };
  }
}

/** Hosts whose answer may fail a LIVE build: NID's own and the CMS's (§89). A
 *  file on any other host (admissions.nid.edu, industryinterface.nid.edu) is
 *  still checked and still dropped on a real 404/410, but an answer that says
 *  nothing — a hang, a 5xx, a 403 — keeps the row, logged as unchecked: no
 *  deploy depends on a third party answering a HEAD. */
const firstParty = (url: URL) => ["www.nid.edu", "nid.edu", ...mediaHosts()].includes(url.host);

/** No answer, as status 0 and the reason: never evidence the file is gone. */
const unanswered = (err: unknown) => ({
  status: 0,
  error: err instanceof Error && err.name === "AbortError" ? `no response in ${CMS_TIMEOUT_MS / 1000}s` : String(err instanceof Error ? err.message : err),
});

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
  return fileServes(asset.file);
}

/** mediaExists for any file URL — a CMS-linked download (getPage, §76). The
 *  same one HEAD per build, the same "only 404 or 410 is missing" rule. */
export function fileServes(href: string): Promise<boolean> {
  let url: URL;
  try {
    url = new URL(href);
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
    // The redirect hops ride in the stored body, so a cached answer logs them
    // too; a direct answer stores "" as it always has.
    pending = onceAcrossBuild(`HEAD ${key}`, () =>
      withCmsSlot(() => headFollowing(url, key))
        .catch(unanswered)
        .then((res) => ({ ...res, body: "hops" in res && res.hops.length ? JSON.stringify(res.hops) : "" })),
    ).then((res: { status: number; body: string; error?: string; attempt?: number; waited?: number }) => {
      if (res.body) {
        const hops = JSON.parse(res.body) as string[];
        console.info(`[cms] HEAD ${key}: ${hops.length} redirect${hops.length === 1 ? "" : "s"} → ${hops.join(" → ")} (HTTP ${res.status})`);
      }
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
      if (!firstParty(url)) {
        report({ t: "head", url: key, ok: true, unchecked: true, status: res.status, reason });
        console.info(`[cms] HEAD ${key}: unchecked (${reason}) — not a first-party host, the link is kept`);
        return true;
      }
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
