// /tenders — Tenders, a footer page (STAGE-0-NOTES §102). Careers' shape
// (§101): no board, no parent, the back link to Home, no band.
//
// About and the contacts are a copy of the CMS's `tenders` document as sent
// (23 Oct 2026), so FIXTURE and LIVE say the same. No notice is held here, in
// either mode: they close within days, and a stale tender on a government site
// misleads bidders. Notices come from the CMS or not at all (backend ask TN3,
// a launch blocker).
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";

// TODO(review): backend — the CMS's publishedAt is a seed timestamp.
const PUBLISHED = "2026-09-21T08:48:37+05:30";
const PATH = "/tenders";

export const TENDERS: PageResponse = {
  page: {
    id: PAGE_ID.tenders,
    title: "Tenders",
    slug: "tenders",
    parent: null,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    // The CMS's hero has no alt text and its file 404s (backend ask TN6): no
    // hero, the closed-up state.
    hero: [],
    intro: "Current tender notices and procurement opportunities at NID.",
    sections: [
      {
        id: "section-tenders-about",
        page: PAGE_ID.tenders,
        order: 1,
        type: "text",
        title: "About",
        // The CMS section's IMAGE block (tenders-about.jpg) has no alt text and
        // its file 404s: logged, not rendered (TN6). No CPPP link here: it is
        // the CMS's to send, as a LINK block in this section (TN5).
        body: "NID publishes tender notices for goods, works, and services here as they are floated. See individual notices for submission deadlines and requirements.",
        items: [],
        links: [],
        contacts: [],
      },
      {
        // The CMS's notices, one LINK block per document (§76's list of
        // documents, Careers' openings shape, §101), when it sends a section
        // titled "Current Tenders" (TN3). Empty here on purpose: with no
        // notices the route gate removes the section, and its separator.
        id: "section-tenders-current",
        page: PAGE_ID.tenders,
        order: 2,
        type: "links",
        title: "Current Tenders",
        items: [],
        links: [],
        contacts: [],
      },
    ],
    // TODO(review): backend — these are the CMS's; nid.edu's tender page says
    // "General Administration, NID Ahmedabad, admin@nid.edu" and shows no
    // phone. Confirm which (TN2). Rendered as the CMS sends them.
    contacts: [
      { label: "Contact", value: "procurement@nid.edu" },
      { label: "Contact", value: "+91 79 2662 9540" },
    ],
    seoTitle: "Tenders | National Institute of Design",
    seoDescription: "Current tender notices and procurement opportunities at NID.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [{ id: PAGE_ID.tenders, title: "Tenders", path: PATH }],
    backNav: { label: "Home", href: "/" },
    subPageLinks: [],
    siblingBand: [],
  },
};
