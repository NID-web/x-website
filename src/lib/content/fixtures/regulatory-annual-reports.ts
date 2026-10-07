// /regulatory/annual-reports — Annual Reports, a Regulatory page with no text
// section: the standfirst, one list of documents, the band (STAGE-0-NOTES §87).
//
// The words are a copy of the CMS's `annual-reports` document as sent (6 Oct
// 2026). LIVE, "Reports" is the CMS's LINK blocks in CMS order with CMS labels,
// each file checked before the page renders; FIXTURE, copies of the same ten
// rows. Newest first, English then Hindi, as the CMS sends them: the pairing is
// content, and the list is never regrouped here (a `groupBy` is the backend's).
import type { Link, PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { regulatoryBand } from "@/lib/content/sibling-bands";
import { mediaAsset } from "@/lib/media";

const PUBLISHED = "2026-09-20T01:03:26+05:30";
const PATH = "/regulatory/annual-reports";

// An external PDF row: ↗ and a new tab, no file glyph (§86).
// TODO(review): backend — no row says its file's language to assistive tech;
// that needs a language on the LINK block. Labels are never sniffed for it.
const file = (id: string, label: string, name: string): Link => ({
  id: `link-annual-report-${id}`,
  label,
  targetType: "external",
  url: `https://www.nid.edu/public/documents/${name}.pdf`,
});

export const REGULATORY_ANNUAL_REPORTS: PageResponse = {
  page: {
    id: PAGE_ID.regulatoryAnnualReports,
    title: "Annual Reports",
    slug: "annual-reports",
    // No /regulatory page: the page hangs off About, where nid.edu files it.
    parent: PAGE_ID.about,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [
      // The CMS's annual-reports-hero-1.jpg. TODO(review): the alt text is ours
      // (the CMS's says only "National Institute of Design"); content — the
      // fourth photograph of the entrance wall on the site (/people,
      // /study/notifications, NID Act's unused second hero).
      mediaAsset(
        "/regulatory/annual-reports/hero-entrance-wall.jpg",
        "The brick entrance wall of NID's Ahmedabad campus, the concrete NID mark beside the institute's name in Hindi and English.",
        1520,
        700,
      ),
    ],
    intro: "Annual reports of the last five years, in English and Hindi.",
    sections: [
      {
        id: "section-annual-reports-reports",
        page: PAGE_ID.regulatoryAnnualReports,
        order: 1,
        type: "links",
        title: "Reports",
        items: [
          file("2024-25-en", "Annual Report 2024–25 (English)", "azCBMSFrDT"),
          file("2024-25-hi", "Annual Report 2024–25 (Hindi)", "BY8jgOUCET"),
          file("2023-24-en", "Annual Report 2023–24 (English)", "KJzdZlCsLk"),
          file("2023-24-hi", "Annual Report 2023–24 (Hindi)", "BM5liBHjDH"),
          file("2022-23-en", "Annual Report 2022–23 (English)", "JLrrlCXGZq"),
          file("2022-23-hi", "Annual Report 2022–23 (Hindi)", "ZCRVFFwDx5"),
          file("2021-22-en", "Annual Report 2021–22 (English)", "KXaeg6CRO7"),
          // TODO(review): content — this file is the English edition, byte for
          // byte the row above (the same on nid.edu). Rendered as sent; the Hindi
          // PDF is a backend/content ask.
          file("2021-22-hi", "Annual Report 2021–22 (Hindi)", "h1vMMP18gp"),
          file("2020-21-en", "Annual Report 2020–21 (English)", "ugZ6DdqZeY"),
          file("2020-21-hi", "Annual Report 2020–21 (Hindi)", "naiiQpJrYV"),
        ],
        links: [],
        contacts: [],
      },
    ],
    contacts: [],
    seoTitle: "Annual Reports | National Institute of Design",
    seoDescription: "Annual reports of the last five years, in English and Hindi.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.about, title: "About NID", path: "/about" },
      { id: PAGE_ID.regulatoryAnnualReports, title: "Annual Reports", path: PATH },
    ],
    // The gate's and breadcrumb's parent; the band is "More in Regulatory" (§86).
    backNav: { label: "About NID", href: "/about" },
    subPageLinks: [],
    siblingBand: regulatoryBand(PATH),
  },
};
