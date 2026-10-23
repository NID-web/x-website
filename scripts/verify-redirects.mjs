#!/usr/bin/env node
// Runs after `next build` (package.json "build"): every redirect this site
// makes to one of its own pages must land on a page the build made, in every
// locale it built, and no fallback may shadow an explicit rule (STAGE-0-NOTES
// §105). A renamed or removed route otherwise leaves an old nid.edu URL
// redirecting to a 404, and nothing else would notice.
//
// LIVE: a missing destination fails the build, naming the rule. FIXTURE: listed
// only — a FIXTURE build makes few of the CMS-driven pages (the disciplines),
// and is not deployable. Redirects off-site (KMC, §85) are not checked.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NEXT = path.join(ROOT, ".next");
const REPORT = path.join(NEXT, "cms-build-report.jsonl");

const events = existsSync(REPORT)
  ? readFileSync(REPORT, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
  : [];
const mode = events[0]?.mode ?? "fixture";

const redirects = JSON.parse(readFileSync(path.join(NEXT, "routes-manifest.json"), "utf8")).redirects.filter(
  (r) => !r.internal,
);
const built = new Set(Object.keys(JSON.parse(readFileSync(path.join(NEXT, "prerender-manifest.json"), "utf8")).routes));

// The locales the build made: those src/i18n/routing.ts names whose home page
// the build has. (A route's first segment is not one: /_not-found is a route.)
const routing = readFileSync(path.join(ROOT, "src", "i18n", "routing.ts"), "utf8");
const configured = [...(/locales:\s*\[([^\]]*)\]/.exec(routing)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const locales = configured.filter((l) => built.has(`/${l}`));
if (!locales.length) {
  console.error(`verify-redirects: no built locale found (routing.ts names ${configured.join(", ") || "none"})`);
  process.exit(1);
}

const problems = [];
const unbuilt = [];
let checked = 0;

for (const [i, rule] of redirects.entries()) {
  if (!rule.destination.startsWith("/")) continue;
  // A destination with a :locale names one page per locale the source accepts:
  // check it in every locale the build made.
  const targets = rule.destination.includes(":locale")
    ? locales.map((l) => rule.destination.replace(":locale", l))
    : [rule.destination];
  for (const target of targets) {
    if (/:\w/.test(target)) {
      problems.push(`${rule.source} → ${rule.destination}: an unresolved parameter in the destination`);
      continue;
    }
    checked++;
    if (!built.has(target)) (mode === "live" ? problems : unbuilt).push(`${rule.source} → ${target}`);
  }

  // A fallback (`…/:rest*`) shadows every rule of its prefix listed after it:
  // first match wins.
  const fallback = /^(.*)\/:rest\*/.exec(rule.source)?.[1];
  if (fallback) {
    for (const later of redirects.slice(i + 1)) {
      if (later.source.startsWith(`${fallback}/`) && !later.source.includes(":rest*")) {
        problems.push(`${rule.source} is listed before ${later.source}, which it shadows`);
      }
    }
  }
}

const ours = redirects.filter((r) => r.destination.startsWith("/")).length;
console.log(
  `verify-redirects: ${redirects.length} redirects (${ours} to this site's pages, ${redirects.length - ours} off-site); ` +
    `${checked} destinations checked in ${locales.length} locale${locales.length === 1 ? "" : "s"} (${locales.join(", ")})`,
);
if (unbuilt.length) {
  console.log(`verify-redirects: FIXTURE build — ${unbuilt.length} destinations not built here (CMS-driven pages), not checked:`);
  for (const u of unbuilt) console.log(`  ${u}`);
}
if (problems.length) {
  console.error(`verify-redirects: ${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
