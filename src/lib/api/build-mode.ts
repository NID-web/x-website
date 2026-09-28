// The build's three outcomes, and the only place they are decided.
//
//   FIXTURE  CMS_API_URL unset. Every page is its fixture — screenshots, offline
//            work. next.config.ts prints a banner, and refuses the build when
//            CMS_REQUIRED=true or VERCEL_ENV=production.
//   LIVE     CMS_API_URL set, and every document arrived with at least what
//            cms-floors.ts expects.
//   FAIL     Anything else in a build: a document that did not arrive, or one
//            that arrived short (a 200 with no sections throws nothing, which is
//            exactly why the floors exist).
//
// A build used to have a fourth outcome — CMS set, half of it missing, exit 0 —
// and it shipped a fraction of the site with the evidence buried in warnings.
// `next dev` keeps warning and falling back: a flaky CMS must not stop local work.
import { appendFileSync } from "node:fs";
import path from "node:path";

export const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";

export type CmsMode = "fixture" | "live";

export const cmsMode = (): CmsMode => (process.env.CMS_API_URL?.trim() ? "live" : "fixture");

/** A deploy may not ship fixtures: CMS_REQUIRED=true, or Vercel production. */
export const cmsRequired = () =>
  process.env.CMS_REQUIRED === "true" || process.env.VERCEL_ENV === "production";

/** Any CMS shortfall ends the build. */
export const strictBuild = () => IS_BUILD && cmsMode() === "live";

/** Read by scripts/build-summary.mjs after `next build`. One JSON object per
 *  line, appended by every build worker; .next/ is emptied at build start. */
export const BUILD_REPORT = path.join(process.cwd(), ".next", "cms-build-report.jsonl");

export function report(event: Record<string, unknown>) {
  if (!IS_BUILD) return;
  const line = { ...event, mode: cmsMode(), urlSet: cmsMode() === "live", required: cmsRequired() };
  try {
    appendFileSync(BUILD_REPORT, JSON.stringify(line) + "\n");
  } catch {
    // The summary is evidence, not a gate; a failed write costs the summary.
  }
}

/** At least `expected` of something a CMS response sizes (cms-floors.ts). In a
 *  LIVE build a shortfall ends it; in FIXTURE there is nothing to count; under
 *  `next dev` it warns. */
export function assertFloor(what: string, expected: number, got: number, source: string) {
  if (cmsMode() === "fixture") return;
  report({ t: "floor", what, expected, got, source });
  if (got >= expected) return;
  const message =
    `[cms] FLOOR NOT MET — ${what}: expected at least ${expected}, got ${got} (from ${source}). ` +
    `The CMS answered, but with less than this site is built to show; shipping it would ` +
    `silently drop pages or links. Check the CMS content. If the drop is intended, lower ` +
    `the floor in src/lib/content/cms-floors.ts — a decision, not a fix.`;
  if (strictBuild()) throw new Error(message);
  console.warn(message);
}
