import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import createNextIntlPlugin from "next-intl/plugin";
import { PAGE_TIMEOUT_S, onceAcrossBuild } from "./src/lib/api/build-cache";
import { routing } from "./src/i18n/routing";
import { KMC } from "./src/lib/kmc";

const withNextIntl = createNextIntlPlugin();

// The CMS media hosts. next/image throws at render on a remote host it was not
// told about, so this list and the allowlist in src/lib/api/media.ts must agree
// exactly — they do, because this is the only place either is worked out: the
// hosts derived here are injected as CMS_MEDIA_HOSTS and media.ts reads them back.
//
// They are DERIVED FROM THE RESPONSE rather than configured. The API and its
// files need not share an origin (a local backend answered on :3000 and served
// its media from :8080; the deployed one uses one host for both), and no env
// var the site owner maintains can know that — the document does. So the config probes the home document once and collects
// the distinct hosts of the media URLs inside it. A probe that fails costs
// nothing but reach: the list narrows to the CMS_API_URL host, those images are
// rejected with a `[cms]` reason, and the page falls back to its static assets.
const cmsUrl = process.env.CMS_API_URL?.trim()
  ? new URL(process.env.CMS_API_URL.trim().replace(/\/+$/, ""))
  : null;

const MEDIA_URL = /"url"\s*:\s*"(https?:\/\/[^"]+)"/g;

async function deriveMediaHosts(): Promise<string[]> {
  if (!cmsUrl) return [];
  const hosts = new Set<string>([cmsUrl.host]);
  try {
    // The config loads in the build's main process and again in its workers;
    // the build cache (STAGE-0-NOTES §71) makes that one request per build.
    const probe = `${cmsUrl.href.replace(/\/$/, "")}/public/content/home`;
    const res = await onceAcrossBuild(`GET ${probe}`, async () => {
      const r = await fetch(probe, {
        signal: AbortSignal.timeout(10_000),
        // This one request is the config's own, not a page's: it must not land in
        // Next's build-time fetch cache and be served back to the next build.
        cache: "no-store",
      });
      return { status: r.status, body: await r.text() };
    });
    if (res.status >= 200 && res.status < 300) {
      const body = res.body;
      for (const match of body.matchAll(MEDIA_URL)) {
        const url = match[1];
        if (!url) continue;
        try {
          hosts.add(new URL(url).host);
        } catch {
          // a malformed url in the document is the document's problem
        }
      }
    }
  } catch {
    console.warn(`[cms] media hosts: no response from ${cmsUrl.host}, allowing it alone`);
  }
  return [...hosts];
}

const isLoopback = (host: string) =>
  host.startsWith("localhost") || host.startsWith("127.") || host.startsWith("[::1]");

// pathname is "/**", not "/media/**": the files sit at /home/..., /logos/... and
// the server root, and a narrower pattern silently rejects most of them.
function remotePatternsFor(mediaHosts: string[]) {
  return mediaHosts.map((host) => {
    const url = new URL(`//${host}`, cmsUrl?.href ?? "http://x");
    return {
      protocol: (isLoopback(host)
        ? "http"
        : (cmsUrl?.protocol.replace(":", "") ?? "https")) as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/**",
    };
  });
}

// The build's mode, decided once, before anything renders (src/lib/api/build-mode.ts
// has the three outcomes). FIXTURE is legitimate and deliberate — screenshots,
// offline work — so it gets a banner nobody can miss rather than one line among
// hundreds; on a deploy that must ship the CMS it is refused before a page is built.
function announceMode(phase: string) {
  if (phase !== PHASE_PRODUCTION_BUILD || process.env.NID_CMS_MODE_ANNOUNCED) return;
  process.env.NID_CMS_MODE_ANNOUNCED = "1";
  const required = process.env.CMS_REQUIRED === "true" || process.env.VERCEL_ENV === "production";
  if (!cmsUrl) {
    if (required) {
      const why = process.env.VERCEL_ENV === "production" ? "VERCEL_ENV=production" : "CMS_REQUIRED=true";
      throw new Error(
        `[cms] BUILD REFUSED — CMS_API_URL is not set, and this build requires the CMS (${why}). ` +
          `Without it every page is a fixture: no CMS copy, 2 of the news articles, most news ` +
          `links withheld. Set CMS_API_URL in the environment for this deploy (Vercel: Project ` +
          `Settings → Environment Variables → Production).`,
      );
    }
    const rule = "=".repeat(78);
    console.warn(
      [
        rule,
        "  FIXTURE BUILD — CMS_API_URL is not set.",
        "  Every page is its fixture: no CMS content, 2 article routes, news links withheld.",
        "  Right for screenshots and offline work. NOT a build to deploy.",
        rule,
      ].join("\n"),
    );
    return;
  }
  console.info(`[cms] LIVE build — ${cmsUrl.host}${required ? " (CMS required)" : ""}`);
}

// KMC is a separate project on nid.edu, and this site will never build /kmc
// (STAGE-0-NOTES §85): /kmc/* opens its page there, redirected before the proxy
// adds a locale, so each is one hop. 307: a decision of 4 Oct 2026 that could
// still move (KMC may get its own domain), and a 308 is cached by browsers for
// good. Nothing else redirects: /events is not a route at all, and event
// articles live at /about/news-events/[slug].
const LOCALE = `:locale(${routing.locales.join("|")})`;
const KMC_TARGETS: [string, string][] = [
  ["/kmc", KMC.landing],
  ["/kmc/e-resources", KMC.eResources],
  ["/kmc/database", KMC.database],
  ["/kmc/guidelines", KMC.guidelines],
  // Design Classics, Services and any other path: the landing, after the
  // specific ones above (first match wins).
  ["/kmc/:rest*", KMC.landing],
];
const REDIRECTS = KMC_TARGETS.flatMap(([source, destination]) => [
  { source, destination, permanent: false },
  { source: `/${LOCALE}${source}`, destination, permanent: false },
]);

// An async default export rather than a top-level `await`: Next loads
// next.config.ts through require() on some of its own paths, and a
// module-level await makes that throw ("require() cannot be used on an ESM
// graph with top-level await") before the build starts.
export default async function config(phase: string): Promise<NextConfig> {
  announceMode(phase);
  const mediaHosts = await deriveMediaHosts();
  const remotePatterns = remotePatternsFor(mediaHosts);
  // Next 16 blocks image optimisation for local IPs by default and answers
  // 400 "url parameter is not allowed" — which looks exactly like a missing
  // remotePattern but is not (next/image docs, Local IP Restriction). Turned on
  // ONLY while a derived media host is loopback, so it can never be in force
  // against a deployed CMS.
  const dangerouslyAllowLocalIP = mediaHosts.some(isLoopback);

  // Opt-in, local only (DEVELOPER-MANUAL troubleshooting): on a network with
  // DNS64/NAT64 the CMS host resolves to 64:ff9b::…, which /_next/image refuses
  // as a private address, so every CMS image fails and HideOnImageError hides
  // the hero. Unoptimized images are fetched by the browser straight from the
  // CMS instead. Never set on Vercel: it turns resizing off for every image.
  // Not dangerouslyAllowLocalIP, which would open the optimizer to any private
  // address rather than skip it.
  const unoptimized = process.env.NEXT_IMAGE_UNOPTIMIZED === "1";

  return withNextIntl({
    // Read back by src/lib/api/media.ts. Hostnames, not secrets.
    env: { CMS_MEDIA_HOSTS: mediaHosts.join(",") },
    images: { remotePatterns, dangerouslyAllowLocalIP, ...(unoptimized ? { unoptimized } : {}) },
    // STAGE-0-NOTES §70, §91: during a build the CMS rate-limits (HTTP 429,
    // Retry-After 60s) and client.ts waits it out, so a page can take minutes.
    // A page that passes this is restarted in another worker while its first
    // render runs on, and the two writes can corrupt the file (§90's guard
    // catches it). 900s, shared with build-cache.ts's lock take-over, which
    // must match it — why, and why 900, is on PAGE_TIMEOUT_S. Read by the
    // export worker in seconds (checked in next 16.3.2's export/worker.js; the
    // bundled docs omit it).
    staticPageGenerationTimeout: PAGE_TIMEOUT_S,
    redirects: async () => REDIRECTS,
  });
}
