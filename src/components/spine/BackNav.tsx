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
export function BackNav() {
  const here = normalise(usePathname());
  const route = useSyncExternalStore(subscribe, () => previousRoute(here), noPreviousRoute);

  const label = route ? routeTitle(route) : undefined;
  if (!route || !label) return null;

  return (
    <GridItem span="full-then-1" place="page-utility">
      <Cta variant="primary" icon="arrow-left" label={label} href={route} />
    </GridItem>
  );
}
