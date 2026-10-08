// The sibling bands a page derives rather than carries: until the API serves
// the tree (NID-CONTEXT §8.4), a child of a child of About takes About's own
// children as its band, named "More in About NID".
import type { DerivedPageContext } from "@/lib/content-model";
import { CONSULTING } from "@/lib/content/fixtures/consulting";
import { NEWS_EVENTS } from "@/lib/content/fixtures/news-events";
import { PEOPLE } from "@/lib/content/fixtures/people";
import { PROGRAMMES } from "@/lib/content/fixtures/programmes";
import { STUDY } from "@/lib/content/fixtures/study";
import { PAGE_ID, pageIdOf, pathOf } from "@/lib/content/pages";
import { REGULATORY_CHILDREN } from "@/lib/content/regulatory";
import { RESEARCH_CHILDREN, researchPath } from "@/lib/content/research-centres";

/** About's children: News & Events' own band (About's children minus itself)
 *  plus News & Events. Derived, never copied from a board. Student Awards is not
 *  among them, so the gallery's band is the same list. */
export function aboutChildrenBand(): DerivedPageContext["siblingBand"] {
  return [
    ...NEWS_EVENTS.derived.siblingBand,
    {
      id: PAGE_ID.newsEvents,
      title: NEWS_EVENTS.page.title,
      href: pathOf(PAGE_ID.newsEvents)!,
    },
  ];
}

/** The band's heading names About: "More in About NID". */
export const ABOUT_BAND_PARENT = NEWS_EVENTS.derived.backNav?.label ?? "About NID";

/** "More in Programmes": the /programmes rail — the six programme pages, in its
 *  order — minus `path`. Curriculum Objectives is not in the rail, so its band
 *  is all six. An unbuilt one (Industry & Online) is withheld by the gate, and
 *  appears when its page ships. */
export function programmesBand(path: string): DerivedPageContext["siblingBand"] {
  return PROGRAMMES.derived.subPageLinks
    .filter((link) => link.href !== path)
    .map((link) => ({
      id: pageIdOf(link.href) ?? link.href,
      title: link.label,
      href: link.href,
    }));
}

/** "More in Study at NID": the /study rail — sitemap.json's five children, in its
 *  order — minus `path` (§74). */
export function studyBand(path: string): DerivedPageContext["siblingBand"] {
  return STUDY.derived.subPageLinks
    .filter((link) => link.href !== path)
    .map((link) => ({
      id: pageIdOf(link.href) ?? link.href,
      title: link.label,
      href: link.href,
    }));
}

/** "More in Research & Publications": sitemap.json's eight children — the
 *  /research rail — minus `path` (§79). Read from the centre list, not the
 *  landing's fixture, which takes its tile photos from the centre fixtures: the
 *  other way round would be an import cycle. A withheld centre (Nation Building)
 *  stays an unlinked row (KEEP_UNBUILT_BAND). */
export function researchBand(path: string): DerivedPageContext["siblingBand"] {
  return RESEARCH_CHILDREN.map((c) => ({ href: researchPath(c.slug), title: c.title }))
    .filter((link) => link.href !== path)
    .map((link) => ({
      id: pageIdOf(link.href) ?? link.href,
      title: link.title,
      href: link.href,
    }));
}

/** "More in Regulatory": sitemap.json §11's three children minus `path` (§86).
 *  There is no Regulatory page, so the route names the band's parent itself
 *  (SecondaryLayout.siblingParent). Unbuilt siblings stay unlinked rows
 *  (KEEP_UNBUILT_BAND). */
export function regulatoryBand(path: string): DerivedPageContext["siblingBand"] {
  return REGULATORY_CHILDREN.filter((link) => link.path !== path).map((link) => ({
    id: pageIdOf(link.path) ?? link.path,
    title: link.title,
    href: link.path,
  }));
}

/** "More in Consulting & Entrepreneurship": the /consulting rail — sitemap.json's
 *  five children, in its order — minus `path` (§92). Unbuilt siblings stay
 *  unlinked rows (KEEP_UNBUILT_BAND). */
export function consultingBand(path: string): DerivedPageContext["siblingBand"] {
  return CONSULTING.derived.subPageLinks
    .filter((link) => link.href !== path)
    .map((link) => ({
      id: pageIdOf(link.href) ?? link.href,
      title: link.label,
      href: link.href,
    }));
}

/** "More in People": the /people rail — sitemap.json's eight children, in its
 *  order — minus `path` (§95). Senate, Staff and Alumni take it as they ship.
 *  Unbuilt siblings stay unlinked rows (KEEP_UNBUILT_BAND). */
export function peopleBand(path: string): DerivedPageContext["siblingBand"] {
  return PEOPLE.derived.subPageLinks
    .filter((link) => link.href !== path)
    .map((link) => ({
      id: pageIdOf(link.href) ?? link.href,
      title: link.label,
      href: link.href,
    }));
}
