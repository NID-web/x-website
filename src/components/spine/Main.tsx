import type { ComponentProps } from "react";
import clsx from "clsx";

/** The skip link's target (SkipLink). One per page, like the landmark itself. */
export const MAIN_ID = "main-content";

/**
 * The page's <main>, carrying the id the skip link jumps to. Every page under
 * the locale layout renders its main content through this, never a bare
 * <main>, or the skip link lands nowhere on that page.
 *
 * tabIndex -1 so following the link moves focus here, not only the scroll
 * position: a browser that does not move its sequential-focus starting point
 * to a fragment target would otherwise send the next Tab back to the header.
 * Never a tab stop itself. No focus ring: it is a landmark, not a control, and
 * a ring around the whole page says nothing.
 */
export function Main({ className, ...props }: ComponentProps<"main">) {
  return (
    <main
      id={MAIN_ID}
      tabIndex={-1}
      className={clsx("focus:outline-none", className)}
      {...props}
    />
  );
}
