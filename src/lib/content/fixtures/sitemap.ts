// /sitemap — Sitemap, a footer page (STAGE-0-NOTES §106). Its sections are
// generated (getSitemap.ts), never written here: this is only the CMS
// document's copy — the standfirst and the contacts — so FIXTURE and LIVE say
// the same.
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";

export const SITEMAP: PageResponse = {
  page: {
    id: PAGE_ID.sitemap,
    title: "Sitemap",
    slug: "sitemap",
    parent: null,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    // The CMS's hero has no alt text and its file 404s (backend ask SM1).
    hero: [],
    intro: "A full listing of pages on the NID website.",
    sections: [],
    // TODO(review): backend — confirm webmaster@nid.edu is a live mailbox (SM3).
    contacts: [
      { label: "Contact", value: "webmaster@nid.edu" },
      { label: "Contact", value: "+91 79 2662 9500" },
    ],
    seoTitle: "Sitemap | National Institute of Design",
    seoDescription: "A full listing of pages on the National Institute of Design website.",
    // TODO(review): backend — the CMS's publishedAt is a seed timestamp.
    publishedAt: "2026-09-21T08:48:37+05:30",
  },
  derived: {
    menuTree: [],
    breadcrumb: [{ id: PAGE_ID.sitemap, title: "Sitemap", path: "/sitemap" }],
    backNav: { label: "Home", href: "/" },
    subPageLinks: [],
    siblingBand: [],
  },
};
