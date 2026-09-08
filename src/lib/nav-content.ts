/**
 * Header navigation — static content.
 *
 * The real menu tree is `Page.parent` filtered to published pages, served by the
 * CMS (design/NID-CONTEXT.md §7.4 — "there is no menu table"). Until that API
 * exists this mirrors the nine main-menu sets from the design file, with hrefs
 * from design/tokens/sitemap.json. Section TITLES are not links — only the
 * nested page links navigate (§7.4) — so a section carries a label, and an
 * `href` only where the design owner has asked for one (see NavSection.href
 * and docs/STAGE-0-NOTES.md §34). Labels are page titles / proper nouns = data,
 * so they live here rather
 * than in messages/en.json (unlike prose, which stays translatable).
 *
 * CMS-adoptable later: swap MENU_SECTIONS for the recursive parent query.
 */
import { THEMES, type Theme } from "@/lib/theme-constants";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavSection {
  id: string;
  title: string;
  /**
   * The section's own landing page, when it has one. §7.4 says menu titles are
   * NOT links, and eight of the nine still aren't — but About NID has a real
   * landing page and the design owner asked for the title to reach it
   * (docs/STAGE-0-NOTES.md §34). Where this is set the row splits: the title
   * navigates and the plus/minus alone works the disclosure. Add an entry here
   * as each remaining landing page is built.
   */
  href?: string;
  links: NavLink[];
}

// Some sub-links have no destination page designed yet (sitemap notes 25 of 44);
// the hrefs still follow the derived path scheme so they resolve once built.
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
  {
    id: "kmc",
    title: "Knowledge Management Centre",
    links: [
      { label: "Design Classics Collection", href: "/kmc/design-classics" },
      { label: "KMC Database", href: "/kmc/database" },
      { label: "Services", href: "/kmc/services" },
      { label: "e-Resources", href: "/kmc/e-resources" },
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
      { label: "Alpavirama", href: "/events/alpavirama" },
      { label: "Drawing Dialogues", href: "/events/drawing-dialogues" },
      { label: "Shifting Paradigms", href: "/events/shifting-paradigms" },
    ],
  },
  {
    id: "industry-connect",
    title: "Industry Connect",
    links: [
      { label: "Industry MoUs", href: "/industry/mous" },
      { label: "Placements", href: "/placements" },
      { label: "Shifting Paradigms", href: "/events/shifting-paradigms" },
    ],
  },
];

// Home's title. It is not in MENU_SECTIONS — the wordmark reaches Home, not a
// menu row — but the back-nav has to be able to name it, because arriving at a
// page from the landing grid is the commonest way in.
export const HOME_NAV: NavLink = { label: "Home", href: "/" };

// route → page title, for naming a destination the front end only knows as a
// path. The back-nav is the caller: it learns where the visitor came from as a
// URL and has to render that page's NAME, never "Back" (CLAUDE.md § Content).
//
// Built from MENU_SECTIONS rather than typed out, so it cannot fall out of step
// with the menu, and so it goes away with it when the CMS serves the real tree
// (every node there carries a title already). A section title counts only where
// the section has a landing page of its own — eight of the nine do not.
//
// Coverage is the menu, and that is deliberate: a path with no entry has no
// name, and a back link with no name is not rendered at all.
const ROUTE_TITLE: Record<string, string> = Object.fromEntries([
  [HOME_NAV.href, HOME_NAV.label],
  ...MENU_SECTIONS.flatMap((section) => [
    ...(section.href ? [[section.href, section.title] as const] : []),
    ...section.links.map((link) => [link.href, link.label] as const),
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
