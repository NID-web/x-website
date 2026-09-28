// The one door to the CMS API. Server-only by construction: every caller is a
// Server Component or generateMetadata, run at build time in Node — so browser
// CORS never applies, and the site stays static (no `NEXT_PUBLIC_` variable, no
// client fetch).
//
// Under `next dev` a CMS that is down, slow or wrong costs nothing: every
// failure becomes one `[cms]` warning and a null, and the caller keeps its
// static content. In a LIVE build (CMS_API_URL set) the same failure ends the
// build — a fallback there ships a fraction of the site with exit 0
// (build-mode.ts). CMS_REQUIRED=true also throws under `next dev`.
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { cache } from "react";
import { IS_BUILD, report, strictBuild } from "@/lib/api/build-mode";

const TIMEOUT_MS = 10_000;

/** CMS_API_URL parsed, or null for the "no CMS" mode. Routes sit at the root
 *  (`/public/...`), so the value carries no `/api` segment. */
export function cmsBaseUrl(): URL | null {
  const raw = process.env.CMS_API_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw.replace(/\/+$/, ""));
  } catch {
    return fail("CMS_API_URL", `not a URL: ${raw}`);
  }
}

function fail(path: string, reason: string): null {
  report({ t: "doc", path, ok: false, reason });
  if (strictBuild()) {
    throw new Error(
      `[cms] FETCH FAILED — ${path}: ${reason}. CMS_API_URL is set, so this is a LIVE build, ` +
        `and a LIVE build does not ship pages that silently fell back to fixtures. ` +
        `Retry, or check the CMS. To build without the CMS on purpose, unset CMS_API_URL.`,
    );
  }
  const message = `[cms] ${path}: ${reason}`;
  if (process.env.CMS_REQUIRED === "true") throw new Error(message);
  console.warn(message);
  return null;
}

/** GET a URL and return status + body text. Deliberately not `fetch`: Next
 *  patches the global fetch, and during `next build` it writes every GET
 *  response to .next/cache/fetch-cache with a one-year lifetime and serves it
 *  back to the next build — measured: a hand-edited cache entry reached the
 *  built page with no request made. CI restores .next/cache between deploys, so
 *  CMS edits would never ship. `cache: "no-store"` avoids that but makes the
 *  route dynamic, and the worker ignores experimental.isrFlushToDisk. A plain
 *  Node request is invisible to Next: no data cache, and the route stays static. */
function get(url: URL): Promise<{ status: number; body: string }> {
  const request = url.protocol === "http:" ? httpRequest : httpsRequest;
  return new Promise((resolve, reject) => {
    const req = request(
      url,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(TIMEOUT_MS) },
      (res) => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", (chunk: string) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
        res.on("error", reject);
      },
    );
    req.on("error", reject);
    req.end();
  });
}

// cache(): generateMetadata and the page both ask for the same document, and a
// build must make one request per path, not one per caller — the API allows
// 100 requests a minute per IP. React's cache() lasts ONE render, though, so on
// its own every page re-fetched the chrome: measured 24 requests each for
// site-config, contact-details, collaborations and home?locale=en, 125 in one
// build, and the requests past the limit timed out. During a build the result
// is also kept per worker process for the whole build (a build is a fresh
// process); `next dev` keeps only the per-render cache, so edits still show.
const buildMemo = new Map<string, Promise<unknown>>();

export const cmsFetch = cache(async function cmsFetch<T>(
  path: `/${string}`,
  guard: (v: unknown) => v is T,
): Promise<T | null> {
  if (!IS_BUILD) return fetchDocument(path, guard);
  let pending = buildMemo.get(path) as Promise<T | null> | undefined;
  if (!pending) {
    pending = fetchDocument(path, guard);
    buildMemo.set(path, pending);
  }
  return pending;
});

/** Sections and STRUCTURED items in a response, for the build summary. */
function counts(body: unknown) {
  if (typeof body !== "object" || body === null) return {};
  const b = body as { sections?: Array<{ items?: unknown[] | null }>; items?: unknown[] };
  if (Array.isArray(b.sections)) {
    return {
      sections: b.sections.length,
      items: b.sections.reduce((n, s) => n + (Array.isArray(s.items) ? s.items.length : 0), 0),
    };
  }
  return Array.isArray(b.items) ? { items: b.items.length } : {};
}

async function fetchDocument<T>(path: `/${string}`, guard: (v: unknown) => v is T): Promise<T | null> {
  const base = cmsBaseUrl();
  if (!base) return null;

  let res: { status: number; body: string };
  try {
    res = await get(new URL(`${base.href.replace(/\/$/, "")}${path}`));
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return fail(path, `no response in ${TIMEOUT_MS / 1000}s`);
    }
    return fail(path, err instanceof Error ? err.message : String(err));
  }
  if (res.status < 200 || res.status >= 300) return fail(path, `HTTP ${res.status}`);

  let body: unknown;
  try {
    body = JSON.parse(res.body);
  } catch {
    return fail(path, "response is not JSON");
  }
  if (!guard(body)) return fail(path, "response does not match the expected shape");
  report({ t: "doc", path, ok: true, ...counts(body) });
  return body;
}
