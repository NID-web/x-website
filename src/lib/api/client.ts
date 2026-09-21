// The one door to the CMS API. Server-only by construction: every caller is a
// Server Component or generateMetadata, run at build time in Node — so browser
// CORS never applies, and the site stays static (no `NEXT_PUBLIC_` variable, no
// client fetch).
//
// A CMS that is down, slow or wrong must never fail a build by default: every
// failure becomes one `[cms]` warning and a null, and the caller keeps its
// static content. CMS_REQUIRED=true turns the same failures into throws, for a
// CI that wants to be strict.
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { cache } from "react";

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
// 100 requests a minute per IP.
export const cmsFetch = cache(async function cmsFetch<T>(
  path: `/${string}`,
  guard: (v: unknown) => v is T,
): Promise<T | null> {
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
  return guard(body) ? body : fail(path, "response does not match the expected shape");
});
