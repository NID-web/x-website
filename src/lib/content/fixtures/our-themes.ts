// /about/our-themes — Our Themes page content fixture.
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
    siblingBand: [],
  },
};
