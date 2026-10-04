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
import { onceAcrossBuild } from "@/lib/api/build-cache";
import { floorsFor } from "@/lib/content/cms-floors";

/** Per attempt, documents and media HEADs alike. Successes never come near it:
 *  p99 1.9s alone, 8.6s at worst with 24 requests in flight (STAGE-0-NOTES
 *  §84). What it catches are hangs, which a longer wait would only delay. */
export const CMS_TIMEOUT_MS = 10_000;

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
    const floors = floorsFor(path);
    throw new Error(
      `[cms] FETCH FAILED — ${path}: ${reason}. ` +
        (floors.length
          ? `Floors this document is counted against, left unchecked: ${floors.join(", ")}. `
          : `No floor counts this document by name; it fails the build all the same. `) +
        `CMS_API_URL is set, so this is a LIVE build, ` +
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
function get(url: URL): Promise<{ status: number; body: string; retryAfter?: string }> {
  const request = url.protocol === "http:" ? httpRequest : httpsRequest;
  return new Promise((resolve, reject) => {
    const req = request(
      url,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(CMS_TIMEOUT_MS),
      },
      (res) => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", (chunk: string) => (body += chunk));
        const retryAfter = res.headers["retry-after"];
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body, ...(retryAfter ? { retryAfter } : {}) }));
        res.on("error", reject);
      },
    );
    req.on("error", reject);
    req.end();
  });
}

// ── Build only: one limiter, 429s waited out, transient failures retried ─────
// The per-worker memo below still leaves a build over the API's 100 requests a
// minute once a page reads records one request each (the programme pages'
// disciplines, STAGE-0-NOTES §70): measured 72 fetches and five HTTP 429s, and a
// LIVE build fails on the first. So during a build every CMS request — every
// document and list here, and media.ts's HEADs — takes one of MAX_IN_FLIGHT
// slots per worker, and a 429 is waited out (Retry-After, else 2s, 4s, 8s…) up
// to MAX_ATTEMPTS. When attempts run out the fetch fails like any other, and a
// LIVE build still stops (§65). `next dev` and FIXTURE builds neither queue nor
// wait: dev never retries, and FIXTURE never fetches.
//
// A timeout, a dropped connection or a 502/503/504 is transient too (§84): five
// requests sent together after a 60s Retry-After were held past 10s, and each
// answered in under a second when asked again — yet one such hang failed the
// build, and a failed deploy leaves production on the build before. It gets
// TRANSIENT_ATTEMPTS, backing off 2s then 4s with jitter so retries that failed
// together do not return together. Only a success is cached (build-cache.ts),
// and the last failure still ends a LIVE build.
const MAX_IN_FLIGHT = 4;
const MAX_ATTEMPTS = 5;
const TRANSIENT_ATTEMPTS = 3;
const TRANSIENT_BACKOFF_MS = 2000;
const TRANSIENT_STATUS = new Set([502, 503, 504]);
let inFlight = 0;
const waiting: Array<() => void> = [];

/** Runs `task` in one of this worker's CMS request slots during a build; runs
 *  it straight away otherwise. A freed slot passes directly to the next waiter,
 *  so a newcomer cannot slip in between and push past the limit. */
export async function withCmsSlot<T>(task: () => Promise<T>): Promise<T> {
  if (!IS_BUILD) return task();
  if (inFlight < MAX_IN_FLIGHT) inFlight++;
  else await new Promise<void>((resolve) => waiting.push(resolve));
  try {
    return await task();
  } finally {
    const next = waiting.shift();
    if (next) next();
    else inFlight--;
  }
}

/** Retry-After as milliseconds: delta-seconds or an HTTP date. */
function retryAfterMs(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const at = Date.parse(value);
  return Number.isNaN(at) ? undefined : Math.max(0, at - Date.now());
}

/** A request that failed in a way worth repeating, after its last attempt. */
export class TransientFailure extends Error {
  override name = "TransientFailure";
}

/** Why an attempt is worth repeating, or null when its outcome is the answer. */
function transientReason(outcome: { status: number } | Error): string | null {
  if (!(outcome instanceof Error))
    return TRANSIENT_STATUS.has(outcome.status) ? `HTTP ${outcome.status}` : null;
  const code = (outcome as NodeJS.ErrnoException).code;
  if (outcome.name === "AbortError" || code === "ETIMEDOUT")
    return `no response in ${CMS_TIMEOUT_MS / 1000}s`;
  if (code === "ECONNRESET" || code === "EPIPE") return `connection reset (${code})`;
  return null;
}

/** A CMS request with 429s waited out and transient failures retried during a
 *  build — documents here, media HEADs in media.ts. Run it inside withCmsSlot:
 *  the slot is held through every wait, since releasing it would let the queue
 *  fire straight back into the limit. Returns the last response, with how many
 *  attempts and ms it took; throws TransientFailure when the last of
 *  TRANSIENT_ATTEMPTS fails too. Outside a build, one attempt, as it was. */
export async function retrying<T extends { status: number; retryAfter?: string }>(
  request: () => Promise<T>,
  path: string,
): Promise<T & { attempt: number; waited: number }> {
  let waited = 0;
  let limited = 0;
  let transient = 0;
  for (let attempt = 1; ; attempt++) {
    const started = Date.now();
    let outcome: T | Error;
    try {
      outcome = await request();
    } catch (err) {
      outcome = err instanceof Error ? err : new Error(String(err));
    }
    const ms = Date.now() - started;
    const reason = transientReason(outcome);
    if (!IS_BUILD) {
      if (outcome instanceof Error) throw outcome;
      return { ...outcome, attempt, waited };
    }
    if (reason) {
      transient++;
      if (transient >= TRANSIENT_ATTEMPTS) {
        report({ t: "transient-failed", path, reason, attempts: transient });
        throw new TransientFailure(`${reason}, ${transient} attempts`);
      }
      const wait = Math.round(TRANSIENT_BACKOFF_MS * 2 ** (transient - 1) * (0.5 + Math.random()));
      report({ t: "transient", path, reason, attempt: transient, waitedMs: wait });
      waited += wait;
      await new Promise((resolve) => setTimeout(resolve, wait));
      continue;
    }
    if (outcome instanceof Error) throw outcome;
    if (outcome.status === 429 && ++limited < MAX_ATTEMPTS) {
      const wait = retryAfterMs(outcome.retryAfter) ?? 2000 * 2 ** (limited - 1);
      report({ t: "retry", path, attempt: limited, waitedMs: wait });
      waited += wait;
      await new Promise((resolve) => setTimeout(resolve, wait));
      continue;
    }
    // The answering attempt's own time, waits excluded: the build summary's
    // slowest URLs. Reported by the process that fetched, once per URL.
    report({ t: "timing", path, ms, attempts: attempt });
    return { ...outcome, attempt, waited };
  }
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

  const url = new URL(`${base.href.replace(/\/$/, "")}${path}`);
  // One fetch per URL for the whole build (build-cache.ts); the slot and the
  // 429 retry belong to the process that fetches, not to those that wait.
  let res: { status: number; body: string; attempt?: number; waited?: number };
  try {
    res = await onceAcrossBuild(`GET ${url.href}`, () => withCmsSlot(() => retrying(() => get(url), path)));
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return fail(path, `no response in ${CMS_TIMEOUT_MS / 1000}s`);
    }
    return fail(path, err instanceof Error ? err.message : String(err));
  }
  if (res.status === 429 && (res.attempt ?? 1) > 1) {
    return fail(path, `HTTP 429 after ${res.attempt} attempts, ${(res.waited ?? 0) / 1000}s waited (${url.href})`);
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
