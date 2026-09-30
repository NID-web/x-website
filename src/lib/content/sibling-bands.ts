// The sibling bands a page derives rather than carries: until the API serves
// the tree (NID-CONTEXT §8.4), a child of a child of About takes About's own
// children as its band, named "More in About NID".
import type { DerivedPageContext } from "@/lib/content-model";
import { NEWS_EVENTS } from "@/lib/content/fixtures/news-events";
import { PROGRAMMES } from "@/lib/content/fixtures/programmes";
import { PAGE_ID, pageIdOf, pathOf } from "@/lib/content/pages";

/** About's children: News & Events' own band (About's children minus itself)
 *  plus News & Events. Derived, never copied from a board. Student Awards is not
 *  among them, so the gallery's band is the same list. */
export function aboutChildrenBand(): DerivedPageContext["siblingBand"] {
  return [
    ...NEWS_EVENTS.derived.siblingBand,
    { id: PAGE_ID.newsEvents, title: NEWS_EVENTS.page.title, href: pathOf(PAGE_ID.newsEvents)! },
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
    .map((link) => ({ id: pageIdOf(link.href) ?? link.href, title: link.label, href: link.href }));
}
