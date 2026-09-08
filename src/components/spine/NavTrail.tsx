"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { advance, normalise } from "@/lib/nav-trail";

// Records every page the visitor lands on, so the back-nav on the NEXT page can
// name this one. Renders nothing.
//
// It is mounted in the locale layout, not per page, because it has to run on
// pages that show no back link themselves — Home above all, which is where most
// visitors come from and which has no title row to put a link in.
export function NavTrail() {
  const pathname = usePathname();
  useEffect(() => {
    advance(normalise(pathname));
  }, [pathname]);
  return null;
}
