import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

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
    const res = await fetch(`${cmsUrl.href.replace(/\/$/, "")}/public/content/home`, {
      signal: AbortSignal.timeout(10_000),
      // This one request is the config's own, not a page's: it must not land in
      // Next's build-time fetch cache and be served back to the next build.
      cache: "no-store",
    });
    if (res.ok) {
      const body = await res.text();
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

// An async default export rather than a top-level `await`: Next loads
// next.config.ts through require() on some of its own paths, and a
// module-level await makes that throw ("require() cannot be used on an ESM
// graph with top-level await") before the build starts.
export default async function config(): Promise<NextConfig> {
  const mediaHosts = await deriveMediaHosts();
  const remotePatterns = remotePatternsFor(mediaHosts);
  // Next 16 blocks image optimisation for local IPs by default and answers
  // 400 "url parameter is not allowed" — which looks exactly like a missing
  // remotePattern but is not (next/image docs, Local IP Restriction). Turned on
  // ONLY while a derived media host is loopback, so it can never be in force
  // against a deployed CMS.
  const dangerouslyAllowLocalIP = mediaHosts.some(isLoopback);

  return withNextIntl({
    // Read back by src/lib/api/media.ts. Hostnames, not secrets.
    env: { CMS_MEDIA_HOSTS: mediaHosts.join(",") },
    images: { remotePatterns, dangerouslyAllowLocalIP },
  });
}
