// /study/young-designers — Young Designers (the 1440 board), Admission Process's
// pattern (STAGE-0-NOTES §76). Copy is the board's; a line the board clips is
// left out, never completed.
//
// LIVE, the CMS wins where it has data: About, Disciplines and Convocation
// Messages are its same-titled sections, whole; About's LINK blocks are its CTAs
// — the "Download Young Designers" PDF (a block with its file in media) and the
// microsite. The rail and the standfirst are the fixture's in both modes.
// TODO(review): live slots the fixture fills — the rail, the standfirst.
//
// No hero (the CMS's is a banner with its text baked in, which the hero crop
// cuts) and no section photos (the CMS's are square portraits). Backend asks.
// TODO(review): content — Young Designers 2025 and the 45th Convocation (22
// January 2026) are both past.
import type { PageResponse, Section } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { studyBand } from "@/lib/content/sibling-bands";

const PUBLISHED = "2026-10-01T00:00:00+05:30";
const PATH = "/study/young-designers";

function section(id: string, order: number, title: string, body: string[], links: Section["links"] = []): Section {
  return { id, page: PAGE_ID.youngDesigners, order, type: "text", title, body: body.join("\n\n"), items: [], links, contacts: [] };
}

// The quote is an ordinary paragraph, as the CMS sends it: a pull quote here
// would print it twice once the CMS body replaces the fixture's.
const ABOUT = section(
  "section-yd-about",
  1,
  "About",
  [
    "\"Young Designers 2025 brings together graduation projects that thoughtfully engage with the challenges and opportunities emerging across diverse sectors of Indian society.\" — Vijai Singh Katiyar, Activity Chairperson, Education, NID Ahmedabad",
    "Young Designers is published as a separate microsite at youngdesigners.nid.edu, with a downloadable edition and an archive of previous years.",
  ],
  // FIXTURE has no "Download Young Designers" row: the file is the CMS's, never
  // a hard-coded URL. TODO(review): confirm the microsite URL (the CMS links the
  // same one); the CMS's PDF is the 2025 edition.
  [{ id: "link-yd-microsite", label: "youngdesigners.nid.edu", targetType: "external", url: "https://youngdesigners.nid.edu/" }],
);

// The board shows two paragraphs and clips the rest.
const DISCIPLINES = section("section-yd-disciplines", 2, "Disciplines", [
  "Communication Design — Animation Film Design, Exhibition Design, Film & Video Communication, Graphic Design, Photography Design.",
  "Industrial Design — Ceramic & Glass Design, Furniture & Interior Design, Product Design, Toy & Game Design, Transportation & Automobile Design, Universal Design.",
]);

// The board's third line ("Dr. Ashok Mondal — Director, NID…") clips and is
// left out. TODO(review): content — the section lists names and roles, not
// messages.
const CONVOCATION = section("section-yd-convocation", 3, "Convocation Messages", [
  "Dr. V Narayanan — Secretary, Department of Space & Chairman, ISRO · Convocation Speaker",
  "Jai Prakash Shivahare — Joint Secretary & Chairperson, Governing Council, NID Ahmedabad",
]);

export const STUDY_YOUNG_DESIGNERS: PageResponse = {
  page: {
    id: PAGE_ID.youngDesigners,
    title: "Young Designers",
    slug: "young-designers",
    parent: PAGE_ID.study,
    template: "secondary",
    utility: "back",
    // TODO(review): from the board — a past event; the microsite as plain text,
    // as Admission Process's "Apply at".
    keyInfo: [
      { label: "45th Convocation", value: "22 January 2026, 10:00 AM" },
      { label: "Microsite", value: "youngdesigners.nid.edu" },
    ],
    hero: [],
    // TODO(review): backend — the CMS's heroText says something else; this
    // sentence is its SEO description.
    intro:
      "Young Designers is NID's annual showcase of graduating student projects from every discipline across the three campuses.",
    sections: [ABOUT, DISCIPLINES, CONVOCATION],
    contacts: [],
    seoTitle: "Young Designers",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.study, title: "Study at NID", path: "/study" },
      { id: PAGE_ID.youngDesigners, title: "Young Designers", path: PATH },
    ],
    backNav: { label: "Study at NID", href: "/study" },
    subPageLinks: [],
    // sitemap.json's order minus this page. TODO(designer): the board lists PM
    // Vidyalaxmi Scheme second.
    siblingBand: studyBand(PATH),
  },
};
