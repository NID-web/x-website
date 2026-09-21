// /about/campuses — Campuses page content fixture (Figma 4118:212141). Prose is
// transcribed from the board: the clamped bodies from their hidden "Full text"
// nodes (About 4364:189046, The Three Campuses 4364:189047), Visiting NID from
// 4118:215384.
import type { PageResponse, Section } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";

const PUBLISHED = "2026-09-21T00:00:00+05:30";

// TODO(review): four assets the board assumes and this build does not have —
// the hero banner (4118:212155) and the three campus section images (Ahmedabad
// 4140:246911, Gandhinagar 4140:246910, Bengaluru 4140:246909). With the CMS the
// hero arrives; the section images do not (no block carries media, and every
// campus thumbnail has altText null). All draw as the board's flat placeholder.

const text = (id: string, order: number, title: string, paragraphs: string[]): Section => ({
  id,
  page: PAGE_ID.campuses,
  order,
  type: "text",
  title,
  body: paragraphs.join("\n\n"),
  items: [],
  links: [],
  contacts: [],
});

export const CAMPUSES: PageResponse = {
  page: {
    id: PAGE_ID.campuses,
    title: "Campuses",
    slug: "campuses",
    parent: PAGE_ID.about,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [],
    intro:
      "As part of extension plan, NID has three campuses located in Ahmedabad, Gandhinagar and Bengaluru.",
    sections: [
      text("section-campuses-about", 1, "About", [
        "The National Institute of Design (NID) is internationally acclaimed as one of the foremost multi-disciplinary institutions in the field of design education and research. The institute functions as an autonomous body under the department of Industrial Policy & Promotion, Ministry of Commerce & Industry, Government of India.",
        "NID has been declared 'Institution of National Importance' by the Act of Parliament, by virtue of the National Institute of Design Act 2014. NID is recognised by the Dept. of Scientific & Industrial Research (DSIR) under Ministry of Science & Technology, Government of India, as a scientific and industrial design research organisation.",
        "NID has been a pioneer in industrial design education after Bauhaus and Ulm in Germany and is known for its pursuit of design excellence to make Designed in India, Made for the World a reality.",
      ]),
      text("section-campuses-three", 2, "The Three Campuses", [
        "NID Ahmedabad Campus is situated in Ahmedabad city, in Gujarat State and it offers 8 Bachelor Degree Programmes and 7 Master Degree Programmes (2.5 years). Recently Ph.D Programme has been introduced at NID Ahmedabad Campus.",
        "NID Gandhinagar Campus is situated in the city of Gandhinagar, in Gujarat State and it offers 7 masters programmes of 2.5 years.",
        "NID Bengaluru Campus is situated in the city of Bengaluru, in Karnataka State. Bengaluru Campus offers 5 masters programmes (2.5 years).",
      ]),
      text("section-campuses-visiting", 3, "Visiting NID", [
        "All NID campuses are open to visitors throughout the year from 9am to 6pm, Monday to Friday (apart from public holidays). Visitors will have to obtain a Visitor's Pass at the Main Gate to enter the campus.",
        "If you are visiting us in a group with prior appointment, NID can arrange a Guided Tour of Campus.",
      ]),
    ],
    // The board's column-4 pair beside the About body (4118:212160) — where the
    // model surfaces page contacts. page.tsx hands them to the first section.
    contacts: [
      { label: "Email", value: "info@nid.edu" },
      { label: "Phone", value: "+91 79 2662 9500" },
    ],
    seoTitle: "Campuses",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.about, title: "About NID", path: "/about" },
      { id: PAGE_ID.campuses, title: "Campuses", path: "/about/campuses" },
    ],
    backNav: { label: "About NID", href: "/about" },
    // children(Campuses), in the board's order (4140:246912); sitemap.json's
    // routes. The route gate withholds them until those pages are built.
    subPageLinks: [
      { label: "Ahmedabad Campus", href: "/about/campuses/ahmedabad" },
      { label: "Gandhinagar Campus", href: "/about/campuses/gandhinagar" },
      { label: "Bengaluru Campus", href: "/about/campuses/bengaluru" },
    ],
    // siblings(About) minus self, in the board's order (4315:276423).
    siblingBand: [
      { id: PAGE_ID.charter, title: "Charter", href: "/about/charter" },
      {
        id: PAGE_ID.directorsMessage,
        title: "Director's Message",
        href: "/about/directors-message",
      },
      { id: PAGE_ID.history, title: "History", href: "/about/history" },
      { id: PAGE_ID.newsEvents, title: "News & Events", href: "/about/news-events" },
      { id: PAGE_ID.ourThemes, title: "Our Themes", href: "/about/our-themes" },
    ],
  },
};
