"use client";

import { useSyncExternalStore } from "react";
import { GridItem } from "@/components/layout/GridItem";
import { Cta } from "@/components/spine/Cta";
import { usePathname } from "@/i18n/navigation";
import { routeTitle } from "@/lib/nav-content";
import { noPreviousRoute, normalise, previousRoute, subscribe } from "@/lib/nav-trail";

/**
 * Back navigation link rendered in the page utility slot.
 * Resolves previous route dynamically from client session storage.
 */
export function BackNav({
  fallback,
}: {
  /** Where the link goes when there is no previous page, or one the site
   *  cannot name (a direct visit, a new tab, an outside referrer). Events use
   *  News & Events, their parent: there is no /events route (STAGE-0-NOTES
   *  §68, §85). Without it, no previous page renders no link, as §45 decided. */
  fallback?: string;
} = {}) {
  const here = normalise(usePathname());
  const known = useSyncExternalStore(subscribe, () => previousRoute(here), noPreviousRoute);
  // Not worked out yet: render nothing, so the static HTML carries no label
  // and the first frame never shows the fallback before the real link.
  if (known === null) return null;

  let route: string | undefined = known ? normalise(known) : undefined;
  let label = route ? routeTitle(route) : undefined;
  if ((!route || !label) && fallback) {
    route = normalise(fallback);
    label = routeTitle(route);
  }
  if (!route || !label) return null;

  return (
    <GridItem span="full-then-1" place="page-utility">
      <Cta variant="primary" icon="arrow-left" label={label} href={route} />
    </GridItem>
  );
}
