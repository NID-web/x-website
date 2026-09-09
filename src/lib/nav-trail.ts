/**
 * Where the visitor came from — the one record behind the back-nav.
 *
 * Kept per TAB in sessionStorage rather than read off document.referrer: the
 * referrer is set by the DOCUMENT load and does not move when next/link
 * soft-navigates, so it would name the page a visitor entered the site on for
 * the rest of the session. It is still the fallback for the first page of a
 * session, the one case a per-tab store cannot have seen. Per-tab is also what
 * makes "opened in a new tab" correctly have no previous page.
 *
 * RECORDING AND RENDERING ARE SEPARATE, and that separation is the point:
 * `NavTrail` records on EVERY page, `BackNav` renders only where a link shows.
 * Fold them together and a page with no back link — Home — never records its
 * own visit, so the next page thinks nobody came from anywhere. (It did once:
 * arriving at News & Events from Home's "All news" tile drew no link at all,
 * because "/" had never been written down.)
 */
import { routing } from "@/i18n/routing";

const KEY = "nid:back-nav";

/** `{ prev, current }` — the route before this one, and this one. */
type Trail = { prev: string | null; current: string };

function read(): Trail | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const { prev, current } = value as Trail;
    if (typeof current !== "string") return null;
    return { prev: typeof prev === "string" ? prev : null, current };
  } catch {
    // Blocked storage, a private window, malformed JSON — the link is a
    // convenience and its absence is a valid state, so none of it is an error.
    return null;
  }
}

function write(trail: Trail) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(trail));
  } catch {
    // As above: nothing to recover, and nothing worth surfacing.
  }
}

/**
 * The route the app knows a URL by: same-origin only, with the GitHub Pages
 * basePath, the locale segment and any trailing slash taken back off, so it
 * matches what `usePathname` reports and what `routeTitle` is keyed by. The
 * Pages export sets trailingSlash, so "/en/about/" and "/en/about" are one
 * route and must not become two entries in the trail.
 */
function toRoute(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin) return null;

  let path = url.pathname;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (base && path.startsWith(base)) path = path.slice(base.length);

  for (const locale of routing.locales) {
    if (path === `/${locale}`) return "/";
    if (path.startsWith(`/${locale}/`)) {
      path = path.slice(locale.length + 1);
      break;
    }
  }

  path = path.replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

/** The route a hard navigation came from, when it was this site and not this
 *  same page. Only consulted for the first page of a session. */
function fromReferrer(here: string): string | null {
  const route = document.referrer ? toRoute(document.referrer) : null;
  return route && route !== here ? route : null;
}

// sessionStorage is an external store, so it is READ through
// useSyncExternalStore rather than copied into state from an effect: the server
// snapshot is null, which is what the static HTML must contain, and the client
// picks up the real value on hydration with no setState-in-effect.
//
// The snapshot is STAMPED with the route it was computed for, and a caller
// ignores one stamped for any other. Without that, a soft navigation would
// render one frame of the PREVIOUS page's back link — the store still holds it
// when the new page first renders, and the effect that advances the trail has
// not run yet.
const store: { route: string | null; back: string | null } = { route: null, back: null };
const listeners = new Set<() => void>();

export function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/** Where the visitor came from, but only if that was worked out for `here`. */
export function previousRoute(here: string): string | null {
  return store.route === here ? store.back : null;
}

/** The server renders no back link — see the module comment. */
export function noPreviousRoute(): null {
  return null;
}

/** Record that the visitor is now on `here`, and work out where they came
 *  from. A reload or a remount of the SAME route must not make a page its own
 *  previous page — only an actual move advances the trail. */
export function advance(here: string) {
  const stored = read();
  const trail: Trail = !stored
    ? { prev: fromReferrer(here), current: here }
    : stored.current === here
      ? stored
      : { prev: stored.current, current: here };

  write(trail);

  if (store.route === here && store.back === trail.prev) return;
  store.route = here;
  store.back = trail.prev;
  for (const onChange of listeners) onChange();
}

/**
 * The route form everything downstream is keyed by: no trailing slash, and "/"
 * for the locale root, which `usePathname` reports as "".
 *
 * The trailing slash is not cosmetic. The Pages export sets `trailingSlash`, so
 * there `usePathname` returns "/about/" while every authored href — and so
 * every ROUTE_TITLE key — is "/about". Left alone, the trail records a prev of
 * "/about/", `routeTitle` finds no name for it and BackNav renders nothing: the
 * back link was missing on the whole deployed site, while dev (no trailing
 * slash) looked fine. `toRoute` already strips it for the referrer; this is the
 * same normalisation for the router's own pathname (docs/STAGE-0-NOTES.md §49).
 */
export function normalise(pathname: string): string {
  const path = pathname.replace(/\/+$/, "");
  return path === "" ? "/" : path;
}
