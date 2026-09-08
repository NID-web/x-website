// /about/our-themes — the Our Themes page (Figma 4800:347502), as the CMS will
// serve it. A secondary page: back-nav from `derived`, no sibling band.
//
// TODO(review): the ten theme cards are not expressible as any of the six
// Section types — they are one card per entry in THEMES, a system list rather
// than editorial items, so the page renders them from theme-constants the way
// Home renders its tiles. This fixture therefore carries only the spine. Decide
// whether the backend will ever serve the cards (which would need a seventh
// type, and content-model.ts says resist that) or whether the page stays
// code-owned.
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";

const PUBLISHED = "2026-07-23T00:00:00+05:30";

export const OUR_THEMES: PageResponse = {
  page: {
    id: PAGE_ID.ourThemes,
    title: "Our Themes",
    slug: "our-themes",
    parent: PAGE_ID.about,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [],
    intro:
      "Ten palettes drawn from Indian craft, colour and creature — one system, ten voices.",
    sections: [],
    contacts: [],
    seoTitle: "Our Themes",
    seoDescription:
      "The ten craft palettes behind the National Institute of Design's identity — peacock, lotus, indigo, henna, yoga, tanjore, khadi, terracotta, ikkat and tiger.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.about, title: "About NID", path: "/about" },
      { id: PAGE_ID.ourThemes, title: "Our Themes", path: "/about/our-themes" },
    ],
    backNav: { label: "About NID", href: "/about" },
    subPageLinks: [],
    // TODO(review): the board draws no sibling band, although this is a
    // secondary page and News & Events — its sibling under About NID — closes
    // on one. Empty here so the page follows the board; decide whether the band
    // belongs on every secondary page or only where a board draws it.
    siblingBand: [],
  },
};
