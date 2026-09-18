// /about/charter — Charter page content fixture (Figma 4118:205415).
// All prose is transcribed from the board: the intro from 4118:205430, Mandate
// from 4118:205433, and the ten mandates from the hidden "Full text" node
// 4364:189043 (the visible "Focus body" 4118:205439 is the same copy clamped,
// which is how a designer draws a clamp — in code it is one body string).
import type { PageResponse, Section } from "@/lib/content-model";
import { DOCUMENT_PATH } from "@/lib/content/documents";
import { PAGE_ID } from "@/lib/content/pages";

const PUBLISHED = "2026-07-23T00:00:00+05:30";

// TODO(review): four assets the board assumes and this build does not have —
// the hero banner (4118:205429), the Mandate section image (4140:246794), the
// Ten Mandates section image (4140:246793) and the Act PDF itself
// (/documents/nid-act-and-statutes.pdf). The three images are drawn as the
// board draws them, a flat accent/subtle field at the right crop, so the page
// keeps the board vertical rhythm; supply the assets and TileImage takes over
// with nothing around them moving. The Act link 404s until the PDF lands.

const MANDATE: Section = {
  id: "section-charter-mandate",
  page: PAGE_ID.charter,
  order: 1,
  type: "text",
  title: "Mandate",
  body:
    "The mandate for NID is to offer world-class design education and to promote design " +
    "awareness and application towards raising the quality of life by and through Education " +
    "to create design professionals of excellence to help meet India's diverse design needs." +
    "\n\n" +
    "NID has been declared 'Institution of National Importance' by the Act of Parliament, by " +
    "virtue of the National Institute of Design Act 2014.",
  items: [],
  links: [],
  contacts: [],
};

const TEN_MANDATES: Section = {
  id: "section-charter-ten-mandates",
  page: PAGE_ID.charter,
  order: 2,
  type: "text",
  title: "The Ten Mandates",
  body: [
    "To train design trainers for other design and design-related institutions and positions in the 21st century as global leaders in Design Education and Research.",
    "Ensuring the expansion in the number of quality design professionals and faculty, through existing and new institutional mechanisms.",
    "Becoming a repository of design knowledge, experience and information on products, systems, materials, design and production processes.",
    "Encouraging the design of products and systems of everyday use in a spirit of restless search for indigenous design solutions.",
    "To undertake fundamental and applied research to create cutting edge knowledge in the areas of design.",
    "To help place designers in key sectors of national need for benchmarking of standards.",
    "To offer integrated design consultancy services and cutting-edge design solutions.",
    "Providing design inputs from the point of view of using design as an integrating force.",
    "To humanise technology and integrate the physical with the virtual and digital worlds.",
    "To provide design intervention for craft, handloom, rural technology, small, medium and large-scale enterprises.",
  ].join("\n\n"),
  items: [],
  links: [],
  contacts: [],
};

export const CHARTER: PageResponse = {
  page: {
    id: PAGE_ID.charter,
    title: "Charter",
    slug: "charter",
    parent: PAGE_ID.about,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [],
    intro:
      "The mandate for NID is to offer world-class design education and to promote design " +
      "awareness and application towards raising the quality of life by and through Education " +
      "to create design professionals of excellence to help meet India's diverse design needs.",
    sections: [MANDATE, TEN_MANDATES],
    // The board's rail block (4118:205434): two contacts and a document link on
    // one 64px pitch. The Act row is a LINK, but `Page` has no Link slot, so it
    // rides on `contacts` as a path-valued pair — About's precedent for its own
    // intro link (STAGE-0-NOTES §33, which proposes `Page.introLinks`).
    // `contactCta` in links.ts derives the targetType back out of the value.
    contacts: [
      { label: "Email", value: "info@nid.edu" },
      { label: "Phone", value: "+91 79 2662 9500" },
      { label: "NID Act & Statutes", value: DOCUMENT_PATH.nidAct },
    ],
    seoTitle: "Charter",
    seoDescription:
      "The mandate of the National Institute of Design, an Institution of National Importance under the National Institute of Design Act 2014, and the ten mandates that set out its work.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.about, title: "About NID", path: "/about" },
      { id: PAGE_ID.charter, title: "Charter", path: "/about/charter" },
    ],
    backNav: { label: "About NID", href: "/about" },
    subPageLinks: [],
    // siblings(About) minus self, in the board's order (4315:276045).
    siblingBand: [
      {
        id: PAGE_ID.directorsMessage,
        title: "Director's Message",
        href: "/about/directors-message",
      },
      { id: PAGE_ID.history, title: "History", href: "/about/history" },
      { id: PAGE_ID.campuses, title: "Campuses", href: "/about/campuses" },
      { id: PAGE_ID.newsEvents, title: "News & Events", href: "/about/news-events" },
      { id: PAGE_ID.ourThemes, title: "Our Themes", href: "/about/our-themes" },
    ],
  },
};
