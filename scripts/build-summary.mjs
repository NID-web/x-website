#!/usr/bin/env node
// Runs after `next build` (package.json "build"): one block that says which of
// the three outcomes this build is (src/lib/api/build-mode.ts) and what the CMS
// actually gave it, so a Vercel log shows a good build from a shrunken one at a
// glance. The build has already enforced the floors; this reports, and exits
// non-zero only if the report itself shows a LIVE build that should not exist.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NEXT = path.join(ROOT, ".next");
const REPORT = path.join(NEXT, "cms-build-report.jsonl");

const events = existsSync(REPORT)
  ? readFileSync(REPORT, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
  : [];
const manifest = JSON.parse(readFileSync(path.join(NEXT, "prerender-manifest.json"), "utf8"));

const first = events[0];
const mode = first?.mode ?? "fixture";
const required = Boolean(first?.required);

// Last word per key: every worker reports what it saw, and they agree.
const byKey = (type, key) => new Map(events.filter((e) => e.t === type).map((e) => [e[key], e]));
const docs = byKey("doc", "path");
const floors = byKey("floor", "what");
const gates = byKey("gate", "page");
const routes = byKey("routes", "route");

// Prerendered routes, grouped by the dynamic route they came from.
const pages = Object.entries(manifest.routes).filter(([p]) => p.startsWith("/en"));
const bySrc = new Map();
for (const [, r] of pages) {
  if (r.srcRoute && r.srcRoute.includes("[slug]")) bySrc.set(r.srcRoute, (bySrc.get(r.srcRoute) ?? 0) + 1);
}

// Redirects prerendered as 308s (a fixture slug the CMS serves under its own).
const redirects = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".meta")) {
      const meta = JSON.parse(readFileSync(p, "utf8"));
      if (meta.status === 308) redirects.push(`${path.relative(path.join(NEXT, "server/app"), p).replace(/\.meta$/, "")} → ${meta.headers?.location}`);
    }
  }
})(path.join(NEXT, "server", "app"));

const failedDocs = [...docs.values()].filter((d) => !d.ok);
const shortFloors = [...floors.values()].filter((f) => f.got < f.expected);
const withheld = [...gates.values()].reduce((n, g) => n + g.unlinked + g.dropped, 0);
const bad = mode === "live" && (failedDocs.length || shortFloors.length);

const W = 78;
// A media HEAD's key is its full URL; the origin adds nothing at this width.
const short = (p) => p.replace(/^https?:\/\/[^/]+/, "").slice(0, 52);
const line = (s = "") => console.log(`│ ${s}`);
console.log(`┌${"─".repeat(W)}`);
if (mode === "fixture") {
  line("MODE       FIXTURE — CMS_API_URL not set. Fixtures only. NOT a deployable build.");
} else {
  line(`MODE       ${bad ? "LIVE — BUT SHORT (see below)" : "LIVE"} — CMS_API_URL set${required ? ", CMS required" : ""}`);
}
line(`PAGES      ${pages.length} prerendered`);
for (const [src, n] of bySrc) {
  const r = routes.get(src.replace(/^\/\[locale\]/, ""));
  const floor = floors.get("article feed (routable items in news-events)");
  line(
    `           ${src.replace(/^\/\[locale\]/, "")}: ${n} routes` +
      (r ? ` (${r.fromFeed} from the CMS feed, ${r.fromLists ?? 0} from the list endpoints only, ${r.fixtureOnly} fixture-only)` : "") +
      (floor ? `  floor ${floor.expected} feed items ${floor.got >= floor.expected ? "✓" : "✗"}` : ""),
  );
}
line(`REDIRECTS  ${redirects.length ? redirects.join("; ") : "none"}`);
if (mode === "live") {
  line(`DOCUMENTS  ${docs.size} fetched, ${failedDocs.length} failed`);
  // build-cache.ts: one fetch per URL across every process of the build. The
  // wrapper (with-cms-cache.mjs) appends its ledger here; without it (a bare
  // `next build`) the cache is off and duplicates are possible.
  const fetched = events.filter((e) => e.t === "fetch");
  const cached = events.filter((e) => e.t === "cached");
  line(
    fetched.length
      ? `CACHE      fetched ${fetched.length}, distinct ${new Set(fetched.map((e) => e.key)).size}, served from cache ${cached.length}`
      : "CACHE      off (next build ran without scripts/with-cms-cache.mjs)",
  );
  // client.ts waits out a 429 during a build; every worker reports its own.
  const retries = events.filter((e) => e.t === "retry");
  const waited = retries.reduce((n, e) => n + e.waitedMs, 0) / 1000;
  line(`RATE LIMIT ${retries.length} 429s retried, ${waited}s waited`);
  // A timeout, a reset or a 502/503/504 is retried too (§84). A failure that
  // outlasts its attempts ends a LIVE build before this runs, so "failed" is
  // non-zero only in a build that was allowed to fall back.
  const transient = events.filter((e) => e.t === "transient");
  const transientFailed = events.filter((e) => e.t === "transient-failed");
  line(`TIMEOUTS   ${transient.length} retried, ${transientFailed.length} failed (timeouts, resets, 502/503/504)`);
  for (const e of [...transient, ...transientFailed]) {
    line(`   ${e.t === "transient" ? "↻" : "✗"} ${short(e.path).padEnd(52)} ${e.reason}, attempt ${e.attempt ?? e.attempts}`);
  }
  // Each URL's answering attempt, waits excluded, from the process that fetched.
  const slowest = [...byKey("timing", "path").values()].sort((a, b) => b.ms - a.ms).slice(0, 5);
  line(`SLOWEST    ${slowest.length ? "" : "none recorded"}`);
  for (const e of slowest) line(`   ${short(e.path).padEnd(52)} ${(e.ms / 1000).toFixed(1)}s${e.attempts > 1 ? `, attempt ${e.attempts}` : ""}`);
  for (const d of [...docs.values()].sort((a, b) => a.path.localeCompare(b.path))) {
    const size = d.ok
      ? [d.sections !== undefined && `${d.sections} sections`, d.items !== undefined && `${d.items} items`].filter(Boolean).join(", ")
      : `FAILED: ${d.reason}`;
    line(`   ${d.ok ? " " : "✗"} ${d.path.slice(0, 52).padEnd(52)} ${size}`);
  }
  // One HEAD per media file a slot checks (media.ts mediaExists), per build.
  const heads = byKey("head", "url");
  const missing = [...heads.values()].filter((h) => !h.ok);
  const unchecked = [...heads.values()].filter((h) => h.unchecked);
  line(
    `MEDIA      ${heads.size} files checked (HEAD), ${missing.length} missing` +
      (unchecked.length ? `, ${unchecked.length} unchecked (not a first-party host, kept)` : ""),
  );
  for (const h of missing) line(`   ✗ ${h.url.slice(0, 60)} ${h.status || "no response"}`);
  line(`FLOORS     ${floors.size} checked, ${shortFloors.length} short`);
  for (const f of shortFloors) line(`   ✗ ${f.what}: expected ≥ ${f.expected}, got ${f.got}`);
}
// The header menu's source (getSiteChrome.ts). A CMS menu replaces the static
// one whole, and its missing sections are not filled in from it (§85).
const menu = events.findLast((e) => e.t === "menu");
if (menu) {
  line(
    `MENU       ${menu.source === "cms" ? "CMS" : "static"}, ${menu.sections} sections` +
      (menu.lacks.length ? `; lacks ${menu.lacks.join(", ")} (CMS NavItem has no URL field)` : ""),
  );
}
line(`GATE       ${withheld} links withheld by the route gate across ${gates.size} pages`);
const worst = [...gates.values()].filter((g) => g.unlinked + g.dropped).sort((a, b) => b.unlinked + b.dropped - (a.unlinked + a.dropped)).slice(0, 4);
if (worst.length) line(`           most: ${worst.map((g) => `${g.page} ${g.unlinked + g.dropped}`).join(" · ")}`);
console.log(`└${"─".repeat(W)}`);

process.exit(bad ? 1 : 0);
