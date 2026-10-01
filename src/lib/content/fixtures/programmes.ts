// /programmes — Programmes landing page content fixture (the 1440 Programmes
// board; no narrower boards exist). Copy is the board's, verbatim.
//
// Photos are the board's, one set of real NID photographs (STAGE-0-NOTES §69):
// the hero is the same photograph as the CMS's `programmes-hero-2.jpg`, and the
// Ph.D card photo is the CMS's `fdp-hero-1` — the board puts it on Ph.D, and the
// fixture follows the board.
import type { Page, PageResponse, Section } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";

const PUBLISHED = "2026-09-30T00:00:00+05:30";

/** A programme card: what a Thumb card reads and nothing more. Its route is
 *  the parent's path plus `slug` (/programmes/bdes), unlinked until built. */
function programme(
  slug: string,
  title: string,
  hero: Page["hero"],
  meta?: string,
): Page {
  return {
    id: `programme-${slug}`,
    title,
    slug,
    parent: PAGE_ID.programmes,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero,
    ...(meta ? { intro: meta } : {}),
    sections: [],
    contacts: [],
    publishedAt: PUBLISHED,
  };
}

const CURRICULUM: Section = {
  id: "section-programmes-curriculum",
  page: PAGE_ID.programmes,
  order: 1,
  type: "text",
  title: "Curriculum Objectives",
  body: "NID's education programmes, at both undergraduate and postgraduate levels, foster flexible, student-centred learning that integrates experiential exploration with creative innovation. Grounded in cultural, social and technological awareness, they build interdisciplinary knowledge alongside focused specialisation, critical problem-solving skills, technical and managerial fundamentals, real-world exposure, and a strong sense of social and professional responsibility.",
  items: [],
  // Linked since /programmes/curriculum-objectives was built (§70). Had it
  // been unbuilt, it would show as an unlinked row (§73).
  links: [
    {
      id: "link-curriculum-read-more",
      label: "Read more",
      targetType: "page",
      page: PAGE_ID.curriculumObjectives,
    },
  ],
  contacts: [],
};

const CARDS: Section = {
  id: "section-programmes-list",
  page: PAGE_ID.programmes,
  order: 2,
  type: "cards",
  title: "Programmes",
  // Titles as the board sets the cards ("Ph.D in Design"), which differ from
  // the rail's labels ("Ph.D") on purpose. Meta on B.Des and M.Des only.
  items: [
    programme(
      "bdes",
      "Bachelor of Design",
      [mediaAsset("/programmes/bdes-terracotta-pots.jpg", "Terracotta pots, vases and a lidded jar of different shapes lined up on a table.", 1200, 628)],
      "B.Des",
    ),
    programme(
      "mdes",
      "Master of Design",
      [mediaAsset("/programmes/mdes-thread-acrylic-boxes.jpg", "A student cutting red thread strung between clear acrylic boxes that hold small white models.", 1200, 628)],
      "M.Des",
    ),
    programme("phd", "Ph.D in Design", [
      mediaAsset("/programmes/phd-seminar-table.jpg", "A seminar around a long table covered in papers, a presenter at the far end beside a whiteboard.", 1520, 700),
    ]),
    programme("fdp", "Faculty Development Programme", [
      mediaAsset("/programmes/fdp-lecture-hall.jpg", "A speaker with a microphone addressing a large seated audience in a hall.", 1520, 700),
    ]),
    programme("industry-online", "Industry & Online Programmes", [
      mediaAsset("/programmes/industry-online-studio.jpg", "A teacher talking with two smiling students at their work tables in a studio.", 1520, 700),
    ]),
    programme("international", "International & Collaborative Programmes", [
      mediaAsset("/programmes/international-lawn-crochet.jpg", "Two women sitting on a grassy slope in the sun, each working on yellow crochet.", 1520, 700),
    ]),
  ],
  links: [],
  contacts: [],
};

export const PROGRAMMES: PageResponse = {
  page: {
    id: PAGE_ID.programmes,
    title: "Programmes",
    slug: "programmes",
    parent: null,
    template: "primary",
    utility: "none",
    keyInfo: [],
    hero: [
      mediaAsset(
        "/programmes/hero-night-film-shoot.jpg",
        "A night film shoot at a roadside tea stall: the camera’s monitor frames two actors, with the crew and string lights behind.",
        1520,
        700,
      ),
    ],
    intro:
      "NID offers professional education programmes at Bachelors and Masters level with five faculty streams and 20 diverse design domains. Recently Ph.D Programme (5 years) has been introduced at NID Ahmedabad Campus. NID has established exchange programmes and ongoing pedagogic relationships with more than 55 overseas institutions. NID has also been playing a significant role in promoting design.",
    sections: [CURRICULUM, CARDS],
    contacts: [],
    seoTitle: "Programmes",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [{ id: PAGE_ID.programmes, title: "Programmes", path: "/programmes" }],
    backNav: null,
    // The board's order. Curriculum Objectives, which the menu lists, is a
    // section with its own link here instead. All six are designed but unbuilt:
    // they render as unlinked rows (the gate's exemption, STAGE-0-NOTES §69).
    // TODO(review): each row turns into a link on its own when its route joins
    // BUILT_ROUTES — check the rail as each child page ships.
    subPageLinks: [
      { label: "Bachelor of Design (B.Des)", href: "/programmes/bdes" },
      { label: "Master of Design (M.Des)", href: "/programmes/mdes" },
      { label: "Ph.D", href: "/programmes/phd" },
      { label: "Faculty Development Programme", href: "/programmes/fdp" },
      { label: "Industry & Online Programmes", href: "/programmes/industry-online" },
      { label: "International & Collaborative Programmes", href: "/programmes/international" },
    ],
    siblingBand: [],
  },
};
