// /about/news-events/archive — the 1440 board's ten rows, already grouped by
// year the way the model says grouped data arrives (content-model.ts,
// PageResponse.groupedItems). Rows whose article is not built are dropped by the
// route gate like any other, so without the CMS only the two stories with an
// article fixture render.
//
// Those two take their title and date FROM the article fixtures, not from the
// archive board: the boards disagree (the archive says 12 March and 04 February,
// the articles 19 May and 22 January, with different headlines), and one story
// has one source — a row must not contradict the page it opens.
import type { MediaAsset, Page, PageResponse } from "@/lib/content-model";
import { ARTICLES } from "@/lib/content/fixtures/articles";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";

export const ARCHIVE_SECTION = "section-news-archive-years";

/** Row thumbnails are decorative: the headline beside them, inside the same
 *  link, says what the photo would. */
const thumb = (file: `/${string}`, width: number, height: number): MediaAsset =>
  mediaAsset(file, "", width, height);

function row(slug: string, title: string, publishedAt: string, hero: MediaAsset[] = []): Page {
  return {
    id: `archive-${slug}`,
    title,
    slug,
    parent: PAGE_ID.newsEvents,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero,
    sections: [],
    contacts: [],
    publishedAt,
  };
}

function fromArticle(slug: string, hero: MediaAsset[] = []): Page {
  const { title, publishedAt } = ARTICLES[slug]!.page;
  return row(slug, title, publishedAt!, hero);
}

const GROUPS: Array<{ label: string; items: Page[] }> = [
  {
    label: "2026",
    items: [
      fromArticle("north-east-artisans", [thumb("/news/north-east-artisans.jpg", 1200, 526)]),
      fromArticle("convocation-2026"),
      row("ids-industry-projects-2026", "Integrated Design Services Opens Applications for Industry Projects", "2026-01-19T00:00:00+05:30"),
    ],
  },
  {
    label: "2025",
    items: [
      row("shifting-paradigms-symposium-2025", "Shifting Paradigms: Annual Symposium Returns to Gandhinagar", "2025-11-21T00:00:00+05:30", [thumb("/news/shifting-paradigms.jpg", 1000, 439)]),
      row("craft-documentation-archive-opens", "Craft Documentation Archive Opens for Public Access", "2025-09-09T00:00:00+05:30"),
      row("nid-press-indian-typography", "NID Press Publishes Three New Titles on Indian Typography", "2025-07-02T00:00:00+05:30"),
      row("smart-handloom-centre-bengaluru", "Smart Handloom Innovation Centre Inaugurated at Bengaluru", "2025-04-14T00:00:00+05:30"),
    ],
  },
  {
    label: "2024",
    items: [
      row("drawing-dialogues-2024", "Drawing Dialogues: Twelve Studios, One Conversation", "2024-12-08T00:00:00+05:30", [thumb("/news/drawing-dialogues.jpg", 1000, 439)]),
      row("jamsetji-tata-chair-universal-design", "Jamsetji Tata Research Chair for Universal Design Announced", "2024-08-27T00:00:00+05:30"),
      row("bamboo-initiatives-material-innovation", "Centre for Bamboo Initiatives Recognised for Material Innovation", "2024-05-03T00:00:00+05:30"),
    ],
  },
];

export const NEWS_ARCHIVE: Omit<PageResponse, "groupedItems"> & {
  groupedItems: Record<string, Array<{ label: string; items: Page[] }>>;
} = {
  page: {
    id: PAGE_ID.newsArchive,
    title: "News & Events Archive",
    slug: "archive",
    parent: PAGE_ID.newsEvents,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [],
    sections: [
      {
        id: ARCHIVE_SECTION,
        page: PAGE_ID.newsArchive,
        order: 1,
        type: "cards",
        // The year labels are the headings; the section itself has none.
        title: "",
        items: GROUPS.flatMap((g) => g.items),
        links: [],
        contacts: [],
      },
    ],
    contacts: [],
    seoDescription:
      "Every news item, event and workshop from the National Institute of Design, by year.",
    publishedAt: "2026-07-23T00:00:00+05:30",
  },
  derived: { menuTree: [], breadcrumb: [], backNav: null, subPageLinks: [], siblingBand: [] },
  groupedItems: { [ARCHIVE_SECTION]: GROUPS },
};
