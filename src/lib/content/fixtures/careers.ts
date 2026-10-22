// /careers — Careers, a footer page (STAGE-0-NOTES §101). No board and no
// parent: the secondary template by its own rules, the back link to Home, no
// band (sitemap.json's Miscellaneous has no landing).
//
// About and the contacts are a copy of the CMS's `careers` document as sent
// (22 Oct 2026), so FIXTURE and LIVE say the same. The caution is held here,
// in both modes, until the CMS carries it (backend ask CR3). No opening is
// held here: they expire, and a stale vacancy misleads applicants.
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";

// TODO(review): backend — the CMS's publishedAt is a seed timestamp.
const PUBLISHED = "2026-09-21T08:48:37+05:30";
const PATH = "/careers";

export const CAREERS: PageResponse = {
  page: {
    id: PAGE_ID.careers,
    title: "Careers",
    slug: "careers",
    parent: null,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    // The CMS's hero has no alt text and its file 404s (backend ask CR5): no
    // hero, the closed-up state.
    hero: [],
    intro:
      "Explore career opportunities at NID — teaching, research, and administrative roles across our three campuses.",
    sections: [
      {
        id: "section-careers-about",
        page: PAGE_ID.careers,
        order: 1,
        type: "text",
        title: "About",
        // The CMS section's IMAGE block (careers-about.jpg) has no alt text and
        // its file 404s: logged, not rendered (CR5).
        body: "NID periodically invites applications for faculty and staff positions across its campuses. Current openings are listed on this page as they become available.",
        items: [],
        links: [],
        contacts: [],
      },
      {
        id: "section-careers-important",
        page: PAGE_ID.careers,
        order: 2,
        type: "text",
        // TODO(review): nid.edu, not in the CMS (backend ask CR3) — nid.edu's
        // career page, verbatim, its "Important:" lead as the title and its
        // three paragraphs as written. It protects applicants from recruitment
        // fraud, so it shows in LIVE too until the CMS sends a section titled
        // "Important", which then replaces it (the title rule, getPage.ts).
        title: "Important",
        body: [
          "Aspiring candidates are requested to initiate application process online from the link given on NID website only. Applications submitted offline or by email will not be entertained.",
          "The general public is hereby cautioned, not to fall prey to the dubious agencies/ organizations/ individuals/aiming at fleecing money from the innocent public. Do not believe any advertisement/job announcement of NID circulated through e-mail / third party social media, etc. without verifying the facts with NID.",
          "Please rely only on information hosted on our website www.nid.edu for any job/career related information pertaining to National Institute of Design.",
        ].join("\n\n"),
        items: [],
        links: [],
        contacts: [],
      },
      {
        // The CMS's openings, one LINK block each (§76's list of documents),
        // when it sends a section titled "Current Openings" (backend ask CR4).
        // Empty here on purpose: with no openings the route gate removes the
        // section, and its separator with it.
        id: "section-careers-openings",
        page: PAGE_ID.careers,
        order: 3,
        type: "links",
        title: "Current Openings",
        items: [],
        links: [],
        contacts: [],
      },
    ],
    // TODO(review): backend — careers@nid.edu is the CMS's; nid.edu's career
    // page says recruitment@nid.edu (General Administration). Confirm which
    // (CR2). Rendered as the CMS sends it.
    contacts: [
      { label: "Contact", value: "careers@nid.edu" },
      { label: "Contact", value: "+91 79 2662 9500" },
    ],
    seoTitle: "Careers | National Institute of Design",
    seoDescription: "View current faculty, research, and administrative job openings at NID.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [{ id: PAGE_ID.careers, title: "Careers", path: PATH }],
    backNav: { label: "Home", href: "/" },
    subPageLinks: [],
    siblingBand: [],
  },
};
