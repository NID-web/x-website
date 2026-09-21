// Applies the route gate (builtHref in links.ts) to a whole page before it
// renders, and counts what it withheld. Two treatments, deliberately different:
//
//   a LIST entry or CTA with no route is DROPPED — a call to action that does
//   nothing reads as broken;
//   a CARD, list ROW or whole-tile link keeps its place and renders unlinked —
//   the photo, title and date are still content.
//
// Cards themselves are gated where they render (cardHref), because a Page
// carries no href to strip; this file only counts them, with the same function.
import type { LabelValue, Link, PageResponse, Section } from "@/lib/content-model";
import type { HomeTile } from "@/lib/home-content";
import { builtHref, cardHref, contactCta, ctaProps } from "@/lib/content/links";
import { cardKind, pagePath } from "@/lib/content/pages";

export interface RouteAudit {
  unlinked: number;
  /** Unbuilt links kept as unlinked rows by the campus exemption. */
  unlinkedRows: number;
  dropped: number;
  /** Missing route (a record's collapsed to `<parent>/<slug>`) → distinct paths. */
  missing: Map<string, Set<string>>;
}

const newAudit = (): RouteAudit => ({ unlinked: 0, unlinkedRows: 0, dropped: 0, missing: new Map() });

function miss(audit: RouteAudit, path: string, record: boolean) {
  const key = record ? `${path.replace(/\/[^/]+$/, "")}/<slug>` : path;
  const set = audit.missing.get(key) ?? new Set<string>();
  set.add(path);
  audit.missing.set(key, set);
}

/** An internal route this link would navigate to, or undefined for anything
 *  the gate leaves alone (external, document, email, phone). */
const internalRoute = (cta: { href: string; external?: boolean } | null) =>
  cta && !cta.external && cta.href.startsWith("/") ? cta.href : undefined;

function keepLink(audit: RouteAudit, route: string | undefined) {
  if (!route || builtHref(route)) return true;
  audit.dropped++;
  miss(audit, route, false);
  return false;
}

const keepContentLink = (audit: RouteAudit) => (link: Link) =>
  keepLink(audit, internalRoute(ctaProps(link)));

const keepContact = (audit: RouteAudit) => (contact: LabelValue) =>
  keepLink(audit, internalRoute(contactCta(contact)));

const keepResolved = (audit: RouteAudit) => (link: { href: string }) =>
  keepLink(audit, link.href);

/** The exemption: an unbuilt link stays, counted as an unlinked row and logged
 *  with the backlog, and LinkStack draws it as plain text. */
const keepAsRow = (audit: RouteAudit) => (link: Link) => {
  const route = internalRoute(ctaProps(link));
  if (route && !builtHref(route)) {
    audit.unlinkedRows++;
    miss(audit, route, false);
  }
  return true;
};

export interface GateOptions {
  /** Sections whose links are RECORDS a page lists, not calls to action — the
   *  campus pages' detail-derived sections (PAGE_CONFIG[path].detail). There an
   *  unbuilt link keeps its place as an unlinked row, the treatment the header
   *  gives cards and rows. Everywhere else it is still dropped: the site-wide
   *  version was weighed and declined (STAGE-0-NOTES §58). */
  keepUnbuilt?: ReadonlySet<string>;
}

export function gatePage(
  response: PageResponse,
  { keepUnbuilt }: GateOptions = {},
): { response: PageResponse; audit: RouteAudit } {
  const audit = newAudit();
  const { page, derived } = response;

  const sections = page.sections.flatMap((section): Section[] => {
    const keep = keepUnbuilt?.has(section.id) ? keepAsRow(audit) : keepContentLink(audit);
    const links = section.links.filter(keep);
    // Section contacts too, not only the page's: TextSection renders them, and
    // a page may hand its own contacts to its first section (Campuses). Every
    // contact on the site passes this one gate, whichever slot it arrives in.
    const contacts = section.contacts.filter(keepContact(audit));
    if (section.type === "links") {
      const items = section.items.filter(keep);
      // An emptied list goes whole, here rather than in the renderer, so the
      // page does not draw a separator for a section that is not there.
      return items.length ? [{ ...section, items, links, contacts }] : [];
    }
    if (section.type === "cards") {
      for (const item of section.items) {
        // AlumniCard is a portrait with no destination at all; only cards that
        // link (news, campus) can be withheld.
        if (!("parent" in item) || cardKind(item) === "alumni" || cardHref(item)) continue;
        audit.unlinked++;
        const path = pagePath(item);
        if (path) miss(audit, path, true);
      }
    }
    return [{ ...section, links, contacts }];
  });

  const backNav = derived.backNav && builtHref(derived.backNav.href) ? derived.backNav : null;
  if (derived.backNav && !backNav) {
    audit.dropped++;
    miss(audit, derived.backNav.href, false);
  }

  return {
    response: {
      page: {
        ...page,
        sections,
        keyInfo: page.keyInfo.filter(keepContact(audit)),
        contacts: page.contacts.filter(keepContact(audit)),
      },
      derived: {
        ...derived,
        backNav,
        subPageLinks: derived.subPageLinks.filter(keepResolved(audit)),
        siblingBand: derived.siblingBand.filter(keepResolved(audit)),
      },
    },
    audit,
  };
}

export function gateHome(tiles: HomeTile[]): { tiles: HomeTile[]; audit: RouteAudit } {
  const audit = newAudit();
  /** A row or whole-tile href: kept if built, otherwise withheld and counted. */
  const unlink = (href: string | undefined, external: boolean | undefined, record = false) => {
    if (!href || external || builtHref(href)) return href;
    audit.unlinked++;
    miss(audit, href, record);
    return undefined;
  };
  /** A CTA: kept if built, otherwise dropped and counted. */
  const cta = <T extends { href: string; external?: boolean }>(c: T | undefined) =>
    c && (c.external || keepLink(audit, c.href)) ? c : undefined;

  const gated = tiles.map((tile): HomeTile => {
    switch (tile.kind) {
      case "linkList":
        return { ...tile, links: tile.links.map((l) => ({ ...l, href: unlink(l.href, l.external) })) };
      case "calendar":
        return {
          ...tile,
          rows: tile.rows.map((r) => ({ ...r, href: unlink(r.href, false) })),
          cta: cta(tile.cta),
        };
      case "news":
        return {
          ...tile,
          rows: tile.rows.map((r) => ({ ...r, href: unlink(r.href, false, true) })),
          cta: cta(tile.cta),
        };
      case "feature":
      case "roster":
        return { ...tile, cta: cta(tile.cta) };
      case "portrait":
      case "spine":
        return { ...tile, href: unlink(tile.href, false) };
      case "mediaCard":
        return {
          ...tile,
          href: unlink(tile.href, false),
          ...(tile.flip ? { flip: { ...tile.flip, cta: cta(tile.flip.cta) } } : {}),
        };
      case "quote":
        return {
          ...tile,
          attribution: {
            ...tile.attribution,
            href: unlink(tile.attribution.href, tile.attribution.external),
          },
        };
      default:
        return tile;
    }
  });
  return { tiles: gated, audit };
}

/** `unlinked N cards, dropped M links (no route)`, for the [cms] line. */
export const auditSummary = (audit: RouteAudit) =>
  `unlinked ${audit.unlinked} cards, ` +
  (audit.unlinkedRows ? `unlinked ${audit.unlinkedRows} rows, ` : "") +
  `dropped ${audit.dropped} links (no route)`;

/** The page's share of the page-build backlog: distinct missing routes by
 *  prefix, most-linked first. Logged once per page render. */
export function logMissingRoutes(path: string, audit: RouteAudit) {
  if (!audit.missing.size) return;
  const list = [...audit.missing]
    .sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]))
    .map(([prefix, paths]) => `${prefix} ×${paths.size}`);
  console.info(`[routes] ${path}: ${list.join(", ")}`);
}
