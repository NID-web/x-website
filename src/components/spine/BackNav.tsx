"use client";

import { useSyncExternalStore } from "react";
import { GridItem } from "@/components/layout/GridItem";
import { Cta } from "@/components/spine/Cta";
import { usePathname } from "@/i18n/navigation";
import { routeTitle } from "@/lib/nav-content";
import { noPreviousRoute, normalise, previousRoute, subscribe } from "@/lib/nav-trail";

// The page's back link, in the page's utility slot beside the title — the last
// column of row 1 at 3 and 4 columns, and a row of its own below that (GridItem
// `page-utility`). It emits its own GridItem into the page's one grid, the way
// Title does, so a page drops it in and says nothing about placement.
//
// It goes on every editorial page and points at THE PAGE THE VISITOR CAME FROM,
// not at the parent in the site tree. Those are usually the same page and
// sometimes are not: reaching News & Events from Home's "All news" tile gives
// "Home", where the tree would always have said "About NID". (`derived.backNav`
// is the tree answer and is now unused by the front end — it is still in the
// backend contract, which is not ours to edit.)
//
// Which is why it cannot be server-rendered. Where a visitor came from is not
// knowable at build time, and the site is statically exported (no headers(), so
// no Referer either) — so the slot is EMPTY in the HTML and fills in after
// hydration. That is the accepted cost of naming the real previous page.
//
// It renders NOTHING wherever there is nowhere to go back to: a direct load, a
// new tab, an external referrer. Absent, not empty — an empty utility cell
// would hold row 1 open for nothing.
//
// The label NAMES ITS DESTINATION ("About NID"), never "Back" (CLAUDE.md
// § Content) — so a page this site cannot NAME is a page it will not link to.
// `routeTitle` covers the menu; anything outside it renders nothing rather than
// a nameless arrow. The trail itself lives in src/lib/nav-trail.ts, recorded by
// NavTrail on every page.
export function BackNav() {
  const here = normalise(usePathname());
  const route = useSyncExternalStore(subscribe, () => previousRoute(here), noPreviousRoute);

  const label = route ? routeTitle(route) : undefined;
  if (!route || !label) return null;

  return (
    <GridItem span="full-then-1" place="page-utility">
      {/* The arrow carries the direction and LEADS the label, which `Cta`
          derives from `icon === "arrow-left"` rather than from a prop
          (NID-CONTEXT.md §7.1, docs/STAGE-0-NOTES.md §40). */}
      <Cta variant="primary" icon="arrow-left" label={label} href={route} />
    </GridItem>
  );
}
