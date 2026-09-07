// /about/news-events — the News & Events landing (Figma 4123:240887), as the
// CMS will serve it. A SECONDARY page: back-nav and the sibling band come from
// `derived`, never from a section. Typed by content-model.ts as it stands.
import type { Page, PageResponse, Section } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";

// Every article on the board carries this date.
const PUBLISHED = "2026-07-23T00:00:00+05:30";

/** An index stub for a child page: what a card needs and nothing more. Same
 *  shape as the About fixture's, including its TODO(review) about `sections`
 *  being required on a record a card never reads. */
function stub(
  page: Pick<Page, "id" | "title" | "slug" | "parent" | "hero"> & Partial<Page>,
): Page {
  return {
    template: "secondary",
    utility: "back",
    keyInfo: [],
    sections: [],
    contacts: [],
    publishedAt: PUBLISHED,
    ...page,
  };
}

// The four 2026 articles. They are the whole of this year's news, so the
// "Featured" and "2026" sections list the same records — the board draws lorem
// ipsum in the 2026 cards, which is placeholder rather than content.
//
// Typed as Page stubs because the cards union lacks NewsArticle; headline, date
// and thumbnail ride on title, publishedAt and hero[0] (see the TODO(review) on
// CARD_KIND_BY_PARENT in src/lib/content/pages.ts).
const ARTICLES: Page[] = [
  stub({
    id: "news-north-east-artisans",
    title: "North-East Artisans Honoured by Hon’ble President of India at Rashtrapati Bhavan",
    slug: "north-east-artisans",
    parent: PAGE_ID.newsEvents,
    hero: [
      {
        // Measured against the square crop this card renders: the President's
        // face sits at 0.34 of the width and the artisan's at 0.64, so the pair
        // is centred but spans more than any 1:1 window of a 1200×526 frame.
        // Centre keeps both faces and splits the loss between her sari and his
        // shoulder; pushing x toward the pot would crop her out.
        ...mediaAsset(
          "/news/north-east-artisans.jpg",
          "The President of India presenting an award to an artisan at Rashtrapati Bhavan.",
          1200,
          526,
        ),
        focal: { x: 0.5, y: 0.5 },
      },
    ],
  }),
  stub({
    id: "news-incubation-centre",
    title: "Inauguration of the Incubation and Innovation Centre at NID Gandhinagar Campus",
    slug: "incubation-innovation-centre",
    parent: PAGE_ID.newsEvents,
    hero: [
      mediaAsset(
        "/news/incubation-centre.jpg",
        "A speaker addressing the inauguration from a lectern in a wood-panelled hall.",
        1000,
        438,
      ),
    ],
  }),
  stub({
    id: "news-drawing-dialogues",
    title:
      "Drawing Dialogues • Calibration and Celebration of Drawing in Design NID Gandhinagar Campus",
    slug: "drawing-dialogues-2026",
    parent: PAGE_ID.newsEvents,
    hero: [
      mediaAsset(
        "/news/drawing-dialogues.jpg",
        "Drawing Dialogues 2026 poster on a deep blue leaf-vein background.",
        1000,
        439,
      ),
    ],
  }),
  stub({
    id: "news-shifting-paradigms",
    title: "Shifting Paradigms • Design Education Next",
    slug: "shifting-paradigms",
    parent: PAGE_ID.newsEvents,
    hero: [
      mediaAsset(
        "/news/shifting-paradigms.jpg",
        "Shifting Paradigms poster: gold geometric motifs on a deep red ground.",
        1000,
        439,
      ),
    ],
  }),
];

const FEATURED: Section = {
  id: "section-news-featured",
  page: PAGE_ID.newsEvents,
  order: 1,
  type: "cards",
  title: "Featured",
  items: ARTICLES,
  links: [],
  contacts: [],
};

const YEAR_2026: Section = {
  id: "section-news-2026",
  page: PAGE_ID.newsEvents,
  order: 2,
  type: "cards",
  title: "2026",
  items: ARTICLES,
  links: [],
  contacts: [],
};

const ARCHIVE: Section = {
  id: "section-news-archive",
  page: PAGE_ID.newsEvents,
  order: 3,
  type: "links",
  title: "Archive",
  items: [
    { id: "link-news-2025", label: "2025", targetType: "page", page: PAGE_ID.news2025 },
    { id: "link-news-2024", label: "2024", targetType: "page", page: PAGE_ID.news2024 },
    { id: "link-news-older", label: "Older", targetType: "page", page: PAGE_ID.newsArchive },
  ],
  links: [],
  contacts: [],
};

export const NEWS_EVENTS: PageResponse = {
  page: {
    id: PAGE_ID.newsEvents,
    title: "News & Events",
    slug: "news-events",
    parent: PAGE_ID.about,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [],
    sections: [FEATURED, YEAR_2026, ARCHIVE],
    contacts: [],
    seoTitle: "News & Events",
    seoDescription:
      "News and events from the National Institute of Design — announcements, ceremonies and the design calendar across the Ahmedabad, Gandhinagar and Bengaluru campuses.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.about, title: "About NID", path: "/about" },
      { id: PAGE_ID.newsEvents, title: "News & Events", path: "/about/news-events" },
    ],
    backNav: { label: "About NID", href: "/about" },
    subPageLinks: [],
    // siblings(About) minus self, in the board's order (4315:276612). Charter
    // appears under its page title here and as "NID’s ‘Mandate’" in About's own
    // rail: siblingBand carries `title`, subPageLinks carries an authored label.
    siblingBand: [
      { id: PAGE_ID.directorsMessage, title: "Director's Message", href: "/about/directors-message" },
      { id: PAGE_ID.charter, title: "Charter", href: "/about/charter" },
      { id: PAGE_ID.history, title: "History", href: "/about/history" },
      { id: PAGE_ID.campuses, title: "Campuses", href: "/about/campuses" },
      { id: PAGE_ID.ourThemes, title: "Our Themes", href: "/about/our-themes" },
    ],
  },
};
