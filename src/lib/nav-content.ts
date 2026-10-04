/**
 * Header navigation static content and route hierarchy.
 */
import { THEMES, type Theme } from "@/lib/theme-constants";
import { KMC } from "@/lib/kmc";

export interface NavLink {
  label: string;
  href: string;
  /** An absolute URL on another site: opens in a new tab, and the back link
   *  never names it (it is not a route of this site). */
  external?: boolean;
}

export interface NavSection {
  id: string;
  title: string;
  /** The section's own landing page route, if present. */
  href?: string;
  links: NavLink[];
}

// Some sub-links have no destination page designed yet (sitemap notes 25 of 44);
// the hrefs still follow the derived path scheme so they resolve once built.
// TODO(designer): an external row looks like any other. Should a row that
// leaves the site say so (a glyph, or a label)?
export const MENU_SECTIONS: NavSection[] = [
  {
    id: "about",
    title: "About NID",
    href: "/about",
    links: [
      { label: "History", href: "/about/history" },
      { label: "Charter", href: "/about/charter" },
      { label: "Campuses", href: "/about/campuses" },
      { label: "News & Events", href: "/about/news-events" },
      { label: "Our Themes", href: "/about/our-themes" },
    ],
  },
  {
    id: "programmes",
    title: "Programmes",
    links: [
      { label: "Curriculum Objectives", href: "/programmes/curriculum-objectives" },
      { label: "Bachelor of Design", href: "/programmes/bdes" },
      { label: "Master of Design", href: "/programmes/mdes" },
      { label: "Ph.D", href: "/programmes/phd" },
      { label: "Faculty Development Programme", href: "/programmes/fdp" },
      { label: "Industry & Online Programmes", href: "/programmes/industry-online" },
      {
        label: "International & Collaborative Programmes",
        href: "/programmes/international",
      },
    ],
  },
  {
    id: "study",
    title: "Study at NID",
    links: [
      { label: "Admission Process", href: "/study/admission" },
      { label: "Life at NID", href: "/study/life-at-nid" },
      { label: "Admission Notifications", href: "/study/notifications" },
      { label: "PM Vidyalaxmi Scheme", href: "/study/pm-vidyalaxmi" },
      { label: "Young Designers", href: "/study/young-designers" },
    ],
  },
  {
    id: "research",
    title: "Research & Publications",
    links: [
      { label: "Innovation Center for Natural Fiber", href: "/research/natural-fiber" },
      { label: "International Centre for Indian Crafts (ICIC)", href: "/research/icic" },
      { label: "Center for Bamboo Initiatives", href: "/research/bamboo" },
      { label: "Railway Design Center", href: "/research/railway" },
      { label: "Smart Handloom Innovation Centre", href: "/research/handloom" },
      {
        label: "Design Research & Innovation Centre for Nation Building",
        href: "/research/nation-building",
      },
      { label: "NID Press", href: "/research/nid-press" },
      { label: "Intellectual Property Rights Cell", href: "/research/ipr" },
    ],
  },
  {
    id: "consulting",
    title: "Consulting & Entrepreneurship",
    links: [
      { label: "Integrated Design Services", href: "/consulting/ids" },
      { label: "Outreach Programmes", href: "/consulting/outreach" },
      { label: "National Design Business Incubator", href: "/consulting/ndbi" },
    ],
  },
  // KMC is a separate project, built and owned outside this site (4 Oct 2026):
  // every row opens its nid.edu page. Design Classics and Services are
  // paragraphs of the landing with no id of their own, so they open the landing.
  // /kmc/* redirects to the same pages (next.config.ts).
  {
    id: "kmc",
    title: "Knowledge Management Centre",
    links: [
      { label: "Design Classics Collection", href: KMC.landing, external: true },
      { label: "KMC Database", href: KMC.database, external: true },
      { label: "Services", href: KMC.landing, external: true },
      { label: "e-Resources", href: KMC.eResources, external: true },
    ],
  },
  {
    id: "people",
    title: "People",
    links: [
      { label: "Visitor / President of India", href: "/people/visitor" },
      { label: "Founding Faculty", href: "/people/founding-faculty" },
      { label: "Governing Council", href: "/people/governing-council" },
      { label: "NID Senate", href: "/people/senate" },
      { label: "Faculty", href: "/people/faculty" },
      { label: "Staff", href: "/people/staff" },
      { label: "Notable Alumni", href: "/people/alumni" },
    ],
  },
  {
    id: "events",
    title: "Events",
    links: [
      // The festival's own site, not an event page of this one.
      { label: "Alpavirama", href: "https://alpavirama.nid.edu", external: true },
      { label: "Drawing Dialogues", href: "/about/news-events/drawing-dialogues" },
      { label: "Shifting Paradigms", href: "/about/news-events/shifting-paradigms" },
    ],
  },
  {
    id: "industry-connect",
    title: "Industry Connect",
    links: [
      { label: "Industry MoUs", href: "/industry/mous" },
      { label: "Placements", href: "/placements" },
      { label: "Shifting Paradigms", href: "/about/news-events/shifting-paradigms" },
    ],
  },
];

// Home's title. It is not in MENU_SECTIONS — the wordmark reaches Home, not a
// menu row — but the back-nav has to be able to name it, because arriving at a
// page from the landing grid is the commonest way in.
export const HOME_NAV: NavLink = { label: "Home", href: "/" };

// Built pages the menu does not list as a link but a visitor arrives FROM — the
// archive links every event, About links the gallery; Programmes, Study at NID,
// Research & Publications, Consulting & Entrepreneurship and People are menu
// titles, which are not links — so the back link can name them.
// Their labels are the pages' own titles.
const UNLISTED_PAGES: NavLink[] = [
  { label: "News & Events Archive", href: "/about/news-events/archive" },
  { label: "Student Awards Gallery", href: "/about/student-awards" },
  { label: "Programmes", href: "/programmes" },
  { label: "Study at NID", href: "/study" },
  { label: "Research & Publications", href: "/research" },
  { label: "Consulting & Entrepreneurship", href: "/consulting" },
  { label: "People", href: "/people" },
];

// Map of route path to display title derived from MENU_SECTIONS for BackNav labels.
// External rows are not routes of this site, so they are not in it.
const ROUTE_TITLE: Record<string, string> = Object.fromEntries([
  [HOME_NAV.href, HOME_NAV.label],
  ...UNLISTED_PAGES.map((page) => [page.href, page.label] as const),
  ...MENU_SECTIONS.flatMap((section) => [
    ...(section.href ? [[section.href, section.title] as const] : []),
    ...section.links.filter((link) => !link.external).map((link) => [link.href, link.label] as const),
  ]),
]);

/** The page title for a route, or undefined if the site has no name for it. */
export function routeTitle(route: string): string | undefined {
  return ROUTE_TITLE[route];
}

// The "Apply" CTA in the header points at the admissions flow.
export const APPLY_HREF = "/study/admission";

// Display names for the ten themes (the constant is lower-case keys). Every
// theme name is a single proper noun, so this is just presentation casing.
export const THEME_LABELS: Record<Theme, string> = {
  peacock: "Peacock",
  lotus: "Lotus",
  indigo: "Indigo",
  henna: "Henna",
  yoga: "Yoga",
  tanjore: "Tanjore",
  khadi: "Khadi",
  terracotta: "Terracotta",
  ikkat: "Ikkat",
  tiger: "Tiger",
};

// Re-exported so header components import the ordered list from one place.
export { THEMES };
