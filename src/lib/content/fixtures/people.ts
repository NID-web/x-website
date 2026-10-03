// /people — People landing page content fixture (the 1440 "08 People — Landing"
// board; no narrower boards exist). STAGE-0-NOTES §81.
//
// The board has no sections: a title, the hero, the standfirst and the sub-page
// links three across under it (PrimaryTemplate `subPages="below-intro"`).
// Where the board and this file differ, on purpose:
// - The hero is the CMS's people-hero.jpg (NID's entrance wall), not the board's
//   composite of faculty portraits, which has an unfinished dark gap.
// - The standfirst is a copy of the CMS's "About"; the board's is Lorem ipsum.
// - The links are sitemap.json's eight children, by their titles, in its order:
//   the board draws seven (no Notable Alumni) and labels two differently.
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";

const PUBLISHED = "2026-10-03T00:00:00+05:30";

export const PEOPLE: PageResponse = {
  page: {
    id: PAGE_ID.people,
    title: "People",
    slug: "people",
    parent: null,
    template: "primary",
    utility: "none",
    keyInfo: [],
    // TODO(review): the CMS's alt text names the page, not the photograph.
    hero: [mediaAsset("/people/hero-entrance.jpg", "People, National Institute of Design", 1520, 700)],
    intro: "NID's people are at the centre of design education.",
    sections: [],
    contacts: [],
    seoTitle: "People",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [{ id: PAGE_ID.people, title: "People", path: "/people" }],
    backNav: null,
    // All unbuilt: unlinked rows until each route ships (KEEP_UNBUILT).
    // TODO(designer): the board drops Notable Alumni and says "Visitor •
    // President of India" and "Senate". TODO(review): content owner — the menu
    // says "Founding Faculty" (/people/founding-faculty), sitemap.json "Faculty
    // Stalwarts" (/people/faculty-stalwarts); the menu is not edited here.
    subPageLinks: [
      { label: "Faculty", href: "/people/faculty" },
      { label: "Governing Council", href: "/people/governing-council" },
      { label: "NID Senate", href: "/people/senate" },
      { label: "Staff", href: "/people/staff" },
      { label: "Notable Alumni", href: "/people/alumni" },
      { label: "Visitor / President of India", href: "/people/visitor" },
      { label: "Faculty Stalwarts", href: "/people/faculty-stalwarts" },
      { label: "Pride of NID", href: "/people/pride-of-nid" },
    ],
    siblingBand: [],
  },
};
