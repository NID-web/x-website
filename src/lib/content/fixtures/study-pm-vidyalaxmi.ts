// /study/pm-vidyalaxmi — PM Vidyalaxmi Scheme (the 1440 board). Admission
// Process's pattern with one section (STAGE-0-NOTES §75). Copy is the board's.
//
// LIVE, the CMS's "About" section is "About the Scheme", whole: its two text
// blocks (with their <strong>) and its portal link. The rail, the standfirst and
// the email link are the fixture's in both modes.
// TODO(review): live slots the fixture fills — the rail, the standfirst,
// info@nid.edu.
//
// No hero: the board's is a placeholder, and the CMS's has no alt text (its
// file returns 404) — backend ask.
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { studyBand } from "@/lib/content/sibling-bands";

const PUBLISHED = "2026-10-01T00:00:00+05:30";
const PATH = "/study/pm-vidyalaxmi";

export const STUDY_PM_VIDYALAXMI: PageResponse = {
  page: {
    id: PAGE_ID.studyPmVidyalaxmi,
    title: "PM Vidyalaxmi Scheme",
    slug: "pm-vidyalaxmi",
    parent: PAGE_ID.study,
    template: "secondary",
    utility: "back",
    // TODO(review): facts about a government scheme, from the board; the CMS
    // has neither. "24 June 2025" is the body's "24.06.2025".
    keyInfo: [
      { label: "Type", value: "Central education-loan platform" },
      { label: "Introduced", value: "Office Memorandum, 24 June 2025" },
    ],
    hero: [],
    // TODO(review): backend — the CMS's heroText says something else; this
    // sentence is its SEO description.
    intro: "A centralized platform for applying for education loans for students pursuing higher education.",
    sections: [
      {
        id: "section-pmv-about",
        page: PAGE_ID.studyPmVidyalaxmi,
        order: 1,
        type: "text",
        title: "About the Scheme",
        // The board's two paragraphs. Its third sentence ("For more information,
        // the students can access the…") clips on the board and is in no source
        // we have, so it is not here.
        body:
          "Government of India has launched the Pradhan Mantri Vidyalaxmi Scheme, which has been officially introduced by the Department of Higher Education, Ministry of Education, vide Office Memorandum No. F.No.39-212025-CSIS-Part(I) (PM Vidyalaxmi Scheme Dated 24.06.2025), a centralized platform for applying for education loans for students pursuing higher education.\n\n" +
          "All eligible students are encouraged to make use of this platform for educational funding needs.",
        items: [],
        links: [
          // TODO(review): confirm the official URL (the CMS links the same one).
          { id: "link-pmv-portal", label: "pmvidyalaxmi.co.in", targetType: "external", url: "https://pmvidyalaxmi.co.in/" },
          { id: "link-pmv-email", label: "info@nid.edu", targetType: "email", address: "info@nid.edu" },
        ],
        contacts: [],
      },
    ],
    contacts: [],
    seoTitle: "PM Vidyalaxmi Scheme",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.study, title: "Study at NID", path: "/study" },
      { id: PAGE_ID.studyPmVidyalaxmi, title: "PM Vidyalaxmi Scheme", path: PATH },
    ],
    backNav: { label: "Study at NID", href: "/study" },
    subPageLinks: [],
    // sitemap.json's order minus this page, which is also the board's. Admission
    // Process is built and links; the others are unlinked rows (SIBLING_BAND).
    siblingBand: studyBand(PATH),
  },
};
