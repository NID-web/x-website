// /regulatory/nid-act — NID Act, Rules, Ordinances & Statutes, the first
// Regulatory page (STAGE-0-NOTES §86). No board: the secondary template laid out
// by its own rules — the standfirst, a text section, a list of documents (§76),
// the Regulatory band.
//
// The prose is a copy of the CMS's `nid-act` document as sent (6 Oct 2026), so
// FIXTURE and LIVE say the same words. LIVE, "Documents" is the CMS's LINK
// blocks in CMS order with CMS labels, each file checked before the page
// renders; FIXTURE, copies of the same eight rows. The files are nid.edu's,
// linked where they are, never copied into the repo.
import type { Link, PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { regulatoryBand } from "@/lib/content/sibling-bands";
import { mediaAsset } from "@/lib/media";

const PUBLISHED = "2026-09-20T01:03:21+05:30";
const PATH = "/regulatory/nid-act";

// An external PDF row: ↗ and a new tab, no file glyph — the rule for every
// Regulatory list (§86).
const file = (id: string, label: string, name: string): Link => ({
  id: `link-nid-act-${id}`,
  label,
  targetType: "external",
  url: `https://www.nid.edu/public/documents/${name}.pdf`,
});

export const REGULATORY_NID_ACT: PageResponse = {
  page: {
    id: PAGE_ID.regulatoryNidAct,
    // The CMS's title; sitemap.json and the menu say "… & Statutes".
    title: "NID Act, Rules, Ordinances And Statutes",
    slug: "nid-act",
    // No /regulatory page: the page hangs off About, where nid.edu files it.
    parent: PAGE_ID.about,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [
      // The CMS's nid-act-hero-1.jpg. TODO(review): the alt text is ours; the
      // CMS's says only "National Institute of Design".
      mediaAsset(
        "/regulatory/nid-act/hero-campus-gate.jpg",
        "The concrete gateway of NID's Ahmedabad campus, the institute's mark cut into its lintel and repeated on a plinth beside the gate.",
        1280,
        628,
      ),
    ],
    intro:
      "The Act of Parliament declaring NID an Institution of National Importance, and the rules, ordinances, and statutes that followed.",
    sections: [
      {
        id: "section-nid-act-about",
        page: PAGE_ID.regulatoryNidAct,
        order: 1,
        type: "text",
        title: "About",
        // TODO(review): editor — the third paragraph lists the instruments out of
        // date order (the first ordinance, March 2016, before the director rules,
        // November 2015). Rendered as sent.
        body:
          "The National Institute of Design has been declared an ‘Institution of National Importance’ through parliamentary legislation. Minister Nirmala Sitharaman introduced the NID Bill to Parliament with the stated purpose of declaring NID an institution for advancing excellence in design education, research, and training across all design disciplines." +
          "\n\n" +
          "The legislative process moved quickly: the Rajya Sabha approved the measure on 7 July 2014, and the Lok Sabha followed on 9 July 2014 — the first bill passed by the newly elected NDA government, completed within three days across both houses." +
          "\n\n" +
          "The NID Act became effective on 16 September 2014. Subsequent regulatory instruments followed: the first ordinance (8 March 2016), director appointment rules (12 November 2015), accounting format rules (14 September 2016), detailed ordinances (4 January 2017), and institutional statutes (17 January 2017).",
        items: [],
        links: [],
        contacts: [],
      },
      {
        id: "section-nid-act-documents",
        page: PAGE_ID.regulatoryNidAct,
        order: 2,
        type: "links",
        title: "Documents",
        items: [
          file("act-2014", "The National Institute of Design Act, 2014", "vueaXHOvMp"),
          file("appointment-of-director", "Appointment of Director", "Bo2e3xa5zI"),
          file("first-ordinance", "First Ordinance", "qP4z4iai5s"),
          file("accounting-formats", "Accounting Formats", "6wUbDeVc5M"),
          file("detailed-ordinance", "Detailed Ordinance", "yL4YM6Wmws"),
          file("statutes", "Statutes", "qI4umrQzh2"),
          file("first-statutes-amendment-2020", "First Statutes (Amendment), 2020", "A4AWwSCCmQ"),
          file("phd-ordinance", "PhD Ordinance", "gXBBvnwAGs"),
        ],
        links: [],
        contacts: [],
      },
    ],
    contacts: [],
    seoTitle: "NID Act, Rules, Ordinances And Statutes | National Institute of Design",
    seoDescription:
      "The Act of Parliament declaring NID an Institution of National Importance, and the rules, ordinances, and statutes that followed.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.about, title: "About NID", path: "/about" },
      { id: PAGE_ID.regulatoryNidAct, title: "NID Act, Rules, Ordinances & Statutes", path: PATH },
    ],
    // The gate's and breadcrumb's parent. The band is named "More in
    // Regulatory" by the route (siblingParent), not by this label.
    backNav: { label: "About NID", href: "/about" },
    subPageLinks: [],
    siblingBand: regulatoryBand(PATH),
  },
};
