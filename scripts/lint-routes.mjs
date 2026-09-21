#!/usr/bin/env node
// Fails when BUILT_ROUTES in src/lib/content/links.ts and the page.tsx files
// under src/app/[locale] disagree, in either direction. The list is the route
// gate's only source of truth: a page added without its entry would stay
// unlinked everywhere, and an entry left behind by a removed page would ship
// links to a 404.
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(ROOT, "src", "app", "[locale]");
const LINKS = path.join(ROOT, "src", "lib", "content", "links.ts");

function pages(dir, segments = [], out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      // Route groups `(x)` add no segment; private `_x` folders are not routes.
      if (entry.startsWith("_")) continue;
      pages(full, /^\(.*\)$/.test(entry) ? segments : [...segments, entry], out);
    } else if (/^page\.(tsx|ts|jsx|js)$/.test(entry)) {
      out.push("/" + segments.join("/"));
    }
  }
  return out;
}

const source = readFileSync(LINKS, "utf8");
const block = /export const BUILT_ROUTES = \[([\s\S]*?)\] as const;/.exec(source);
if (!block) {
  console.error("lint-routes: BUILT_ROUTES not found in src/lib/content/links.ts");
  process.exit(1);
}
const listed = [...block[1].matchAll(/"([^"]*)"/g)].map((m) => m[1]);
const real = pages(APP);

const unlisted = real.filter((r) => !listed.includes(r));
const stale = listed.filter((r) => !real.includes(r));
const dupes = listed.filter((r, i) => listed.indexOf(r) !== i);
if (unlisted.length || stale.length || dupes.length) {
  console.error("lint-routes: BUILT_ROUTES (src/lib/content/links.ts) disagrees with src/app/[locale]:");
  for (const r of unlisted) console.error(`  has a page.tsx, missing from BUILT_ROUTES: ${r}`);
  for (const r of stale) console.error(`  in BUILT_ROUTES, no page.tsx: ${r}`);
  for (const r of dupes) console.error(`  listed twice: ${r}`);
  process.exit(1);
}
console.log(`lint-routes: BUILT_ROUTES matches the ${real.length} routes under src/app/[locale]`);
