// The page ids the front end has to know by name: card kinds are chosen by an
// item's parent, and card hrefs are built from the parent's path. Both are
// derivable from Page.parent once the API serves the tree (NID-CONTEXT.md
// §8.4); until then this is the static half of that derivation.
//
// TODO(review): PageResponse gives cards items no resolved href. Propose a
// derived `path` on every Page in a response (the way MenuNode and breadcrumb
// entries carry one) so this table can go.
import type { Page, UUID } from "@/lib/content-model";

export const PAGE_ID = {
  about: "page-about",
  charter: "page-about-charter",
  directorsMessage: "page-about-directors-message",
  history: "page-about-history",
  campuses: "page-about-campuses",
  newsEvents: "page-about-news-events",
  ourThemes: "page-about-our-themes",
  studentAwards: "page-about-student-awards",
  newsArchive: "page-about-news-archive",
  news2025: "page-about-news-2025",
  news2024: "page-about-news-2024",
  people: "page-people",
  campusAhmedabad: "page-about-campuses-ahmedabad",
  campusGandhinagar: "page-about-campuses-gandhinagar",
  campusBengaluru: "page-about-campuses-bengaluru",
  programmes: "page-programmes",
  consultingIds: "page-consulting-ids",
  consultingOutreach: "page-consulting-outreach",
  programmesIndustryOnline: "page-programmes-industry-online",
  kmc: "page-kmc",
  researchRailway: "page-research-railway",
  researchNaturalFiber: "page-research-natural-fiber",
  // The parent a CMS discipline card hangs off. It has NO path on purpose: no
  // per-discipline route exists in sitemap.json, so a discipline card renders
  // unlinked and the route backlog logs no path that was only guessed.
  disciplines: "page-disciplines",
} as const;

const PATH: Record<UUID, string> = {
  [PAGE_ID.about]: "/about",
  [PAGE_ID.charter]: "/about/charter",
  [PAGE_ID.directorsMessage]: "/about/directors-message",
  [PAGE_ID.history]: "/about/history",
  [PAGE_ID.campuses]: "/about/campuses",
  [PAGE_ID.newsEvents]: "/about/news-events",
  [PAGE_ID.ourThemes]: "/about/our-themes",
  [PAGE_ID.studentAwards]: "/about/student-awards",
  // TODO(review): only the archive route is in sitemap.json. The two year
  // routes are the shape the archive CTAs need and are not yet designed or
  // agreed — confirm /about/news-events/2025 and /2024, or point all three at
  // the archive with a query.
  [PAGE_ID.newsArchive]: "/about/news-events/archive",
  [PAGE_ID.news2025]: "/about/news-events/2025",
  [PAGE_ID.news2024]: "/about/news-events/2024",
  [PAGE_ID.people]: "/people",
  [PAGE_ID.campusAhmedabad]: "/about/campuses/ahmedabad",
  [PAGE_ID.campusGandhinagar]: "/about/campuses/gandhinagar",
  [PAGE_ID.campusBengaluru]: "/about/campuses/bengaluru",
  [PAGE_ID.programmes]: "/programmes",
  [PAGE_ID.consultingIds]: "/consulting/ids",
  [PAGE_ID.consultingOutreach]: "/consulting/outreach",
  [PAGE_ID.programmesIndustryOnline]: "/programmes/industry-online",
  [PAGE_ID.kmc]: "/kmc",
  [PAGE_ID.researchRailway]: "/research/railway",
  [PAGE_ID.researchNaturalFiber]: "/research/natural-fiber",
};

export function pathOf(id: UUID): string | undefined {
  return PATH[id];
}

/** The page id known by this path, if any — the way back from a CMS slug's
 *  route to a `Link`, which carries a page id, never a path. */
export function pageIdOf(path: string): UUID | undefined {
  return Object.keys(PATH).find((id) => PATH[id] === path);
}

/** A page's route: its parent's path plus its own slug. */
export function pagePath(page: Pick<Page, "slug" | "parent">): string | undefined {
  if (page.parent === null) return `/${page.slug}`;
  const parent = PATH[page.parent];
  return parent ? `${parent}/${page.slug}` : undefined;
}

// TODO(review): the cards union is Discipline | Programme | Page, so news
// articles, campuses and award-winning students all arrive as Page and the
// card is chosen by which page they hang off. Adding NewsArticle, Campus and
// Person to the union lets the kind come from the record instead.
export type CardKind = "news" | "campus" | "alumni" | "thumb";

const CARD_KIND_BY_PARENT: Record<UUID, CardKind> = {
  [PAGE_ID.newsEvents]: "news",
  [PAGE_ID.campuses]: "campus",
  [PAGE_ID.studentAwards]: "alumni",
  // The campus pages' Disciplines: programme pages on the fixture, CMS
  // discipline records with the API (§57).
  [PAGE_ID.programmes]: "thumb",
  [PAGE_ID.disciplines]: "thumb",
};

export function cardKind(item: Pick<Page, "parent">): CardKind | undefined {
  return item.parent === null ? undefined : CARD_KIND_BY_PARENT[item.parent];
}

// TODO(review): the static half of BACKEND-HOME-TASKS A3. The CMS gives every
// item a flat, globally unique slug (`ahmedabad-campus`); the site's routes are
// nested and use their own last segment (`/about/campuses/ahmedabad`). Neither
// is derivable from the other, so until CardRef carries a path this table is
// the only place the two meet — an unlisted slug is dropped, never guessed.
// Every route below is design/tokens/sitemap.json's, never derived from the
// slug: `integrated-design-services` is /consulting/ids and `placements` is
// /industry/placements there. A slug the sitemap does not list stays out of
// this table (the live navigation's `nid-alumni-data-registration` has no route),
// and whatever looks it up drops that link and logs it.
const PATH_BY_CMS_SLUG: Record<string, string> = {
  "about-nid": "/about",
  history: "/about/history",
  charter: "/about/charter",
  "directors-message": "/about/directors-message",
  campuses: "/about/campuses",
  "news-events": "/about/news-events",
  "our-themes": "/about/our-themes",
  "ahmedabad-campus": "/about/campuses/ahmedabad",
  "gandhinagar-campus": "/about/campuses/gandhinagar",
  "bengaluru-campus": "/about/campuses/bengaluru",
  programmes: "/programmes",
  "study-at-nid": "/study",
  "admission-process": "/study/admission",
  "life-at-nid": "/study/life-at-nid",
  "pm-vidyalaxmi-scheme": "/study/pm-vidyalaxmi",
  "young-designers": "/study/young-designers",
  people: "/people",
  "research-publications": "/research",
  contact: "/contact",
  careers: "/careers",
  "integrated-design-services": "/consulting/ids",
  placements: "/industry/placements",
  tenders: "/tenders",
  "right-to-information": "/regulatory/rti",
  "privacy-policy": "/privacy",
  "terms-and-conditions": "/terms",
  sitemap: "/sitemap",
};

export function pathOfCmsSlug(slug: string): string | undefined {
  return PATH_BY_CMS_SLUG[slug];
}

/** A news article's route. Articles are the one collection whose route IS
 *  their CMS slug, under sitemap.json's /about/news-events/[slug] template —
 *  the rule page-adapter.ts applies to the same collection as `slugUnderParent`. */
export function newsArticlePath(slug: string): string {
  return pathOfCmsSlug(slug) ?? `${pathOf(PAGE_ID.newsEvents)}/${slug}`;
}
