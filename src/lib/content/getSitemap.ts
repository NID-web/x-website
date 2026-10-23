// The Sitemap's list (STAGE-0-NOTES §106), generated from the site's own
// navigation data and never hand-written: a page built tomorrow appears with no
// edit here. getPage calls this for /sitemap only; the rows are ordinary
// `links` sections, so no component reads navigation data.
//
// Five sources, in priority order; a destination appears once, under the
// first source that lists it, with that source's label:
//   1. the header menu (MENU_SECTIONS), in both modes: the LIVE header is the
//      CMS's, but this is the designed structure, and it lists CTL and
//      Resources, which the CMS menu does not yet;
//   2. each landing's sub-page rail (Continuing Education and Director's
//      Message are listed nowhere else), under its landing's menu section;
//   3. UNLISTED_PAGES: a section's landing heads its menu section (matched by
//      title); the rest go to Quick Links;
//   4. the footer, as getSiteChrome gives it, into Quick Links;
//   5. the labs (labIndex, less WITHHELD), their own section after Programmes.
// Only built routes (builtHref) and external links; never this page itself.
// Dynamic children other than the labs (disciplines, faculty members,
// articles, the campus pages) are reached through their index pages.
import { getTranslations } from "next-intl/server";
import type { LabelValue, Link, PageResponse, Section } from "@/lib/content-model";
import { routing } from "@/i18n/routing";
import { labsInGroupOrder } from "@/lib/content/getResources";
import { getSiteChrome } from "@/lib/content/getSiteChrome";
import { builtHref } from "@/lib/content/links";
import { labPageId, pageIdOf, routePageId } from "@/lib/content/pages";
import { labPath } from "@/lib/content/resources";
import { MENU_SECTIONS, UNLISTED_PAGES } from "@/lib/nav-content";

export const SITEMAP_PATH = "/sitemap";

const RESOURCES = { id: "resources", title: "Resources" } as const;
const QUICK_LINKS = { id: "quick-links", title: "Quick Links" } as const;

/** Every section the page can have, in order: the route lays each two-up. */
export function sitemapSectionIds(): string[] {
  const ids = MENU_SECTIONS.flatMap((s) => (s.id === "programmes" ? [s.id, RESOURCES.id] : [s.id]));
  return [...ids, QUICK_LINKS.id].map(sectionId);
}

const sectionId = (id: string) => `section-sitemap-${id}`;

const external = (href: string) => /^https?:\/\//.test(href);

type Row = { label: string; href: string };

/** The Sitemap's sections, built from the sources above. `rail` reads a
 *  landing's sub-page rail as rendered (getPage, passed in to keep this module
 *  free of a cycle). The page's contacts go on the last section that renders:
 *  beside the first they would read as that section's (§106). */
export async function withSitemapSections(
  response: PageResponse,
  rail: (landing: string) => Promise<ReadonlyArray<{ label: string; href: string }>>,
): Promise<PageResponse> {
  const seen = new Set<string>([SITEMAP_PATH]);
  const keep = (rows: Row[], row: Row) => {
    if (seen.has(row.href)) return;
    if (!external(row.href) && !builtHref(row.href)) return;
    seen.add(row.href);
    rows.push(row);
  };

  const landings = new Map(UNLISTED_PAGES.map((page) => [page.label, page.href]));
  const usedLandings = new Set<string>();
  const groups: Array<{ id: string; title: string; rows: Row[] }> = [];

  for (const section of MENU_SECTIONS) {
    const rows: Row[] = [];
    const landing = section.href ?? landings.get(section.title);
    if (landing) {
      keep(rows, { label: section.title, href: landing });
      usedLandings.add(landing);
    }
    for (const link of section.links) keep(rows, { label: link.label, href: link.href });
    if (landing) for (const link of await rail(landing)) keep(rows, link);
    groups.push({ id: section.id, title: section.title, rows });

    if (section.id === "programmes") {
      const labs: Row[] = [];
      for (const lab of await labsInGroupOrder()) keep(labs, { label: lab.title, href: labPath(lab.slug) });
      groups.push({ ...RESOURCES, rows: labs });
    }
  }

  const quick: Row[] = [];
  for (const page of UNLISTED_PAGES) if (!usedLandings.has(page.href)) keep(quick, page);
  const [{ footer, copy }, t] = await Promise.all([getSiteChrome(routing.defaultLocale), getTranslations("Footer")]);
  for (const link of [...footer.primaryLinks, ...footer.secondaryLinks]) {
    keep(quick, { label: copy[link.labelKey] ?? t(link.labelKey), href: link.href });
  }
  groups.push({ ...QUICK_LINKS, rows: quick });

  const page = response.page;
  const rendered = groups.filter((g) => g.rows.length > 0);
  const last = rendered[rendered.length - 1]?.id;
  const sections: Section[] = rendered.map((group, i) => ({
    id: sectionId(group.id),
    page: page.id,
    order: i + 1,
    type: "links",
    title: group.title,
    items: group.rows.map(toLink),
    links: [],
    contacts: group.id === last ? ([...page.contacts] as LabelValue[]) : [],
  }));
  // The contacts now sit in their section; the template would otherwise look
  // for a first text section to host them, and there is none.
  return { ...response, page: { ...page, sections, contacts: [] } };
}

function toLink(row: Row): Link {
  if (external(row.href)) return { id: `link-sitemap-${row.href}`, label: row.label, targetType: "external", url: row.href };
  const lab = /^\/programmes\/resources\/([^/]+)$/.exec(row.href)?.[1];
  const page = pageIdOf(row.href) ?? (lab ? labPageId(lab) : routePageId(row.href));
  return { id: `link-sitemap-${row.href}`, label: row.label, targetType: "page", page };
}
