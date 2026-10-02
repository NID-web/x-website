// /research — Research & Publications landing page content fixture (the 1440
// "05 Research & Publications — Landing" board; no narrower boards exist).
// STAGE-0-NOTES §78.
//
// Where the board and this file differ, on purpose:
// - The standfirst is a copy of the CMS's "Research at NID" sentence; the board
//   repeats History's opening paragraph there, a placeholder never rendered.
// - The rail and the tiles follow sitemap.json's children order, and the rail
//   its labels ("…(ICIC)"); the board orders each differently.
// - Each tile's photo is that centre's own CMS hero-1, the centre page's
//   fixture hero (§79) — the CMS photos win in LIVE, and these are their
//   fallback by route (§78). The
//   board's tile photos are not used: its Nation Building tile is IPR's photo
//   and its IPR tile the landing's bamboo room, so Nation Building, which has
//   no photo of its own, draws ThumbCard's empty box.
import type { Page, PageResponse, Section } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { RESEARCH_CHILDREN, researchPath, type ResearchCentre } from "@/lib/content/research-centres";
import { RESEARCH_CENTRE_PAGES } from "@/lib/content/fixtures/research-centres";
import { mediaAsset } from "@/lib/media";

const PUBLISHED = "2026-10-02T00:00:00+05:30";

/** A centre's tile: what a Thumb card reads. No meta line — the board draws
 *  the title alone, and the template passes thumbMeta={false} anyway. */
function centre(slug: string, title: string, hero: Page["hero"]): Page {
  return {
    id: `research-centre-${slug}`,
    title,
    slug,
    parent: PAGE_ID.research,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero,
    sections: [],
    contacts: [],
    publishedAt: PUBLISHED,
  };
}

// Each tile's photo is its centre page's own hero — the same object, so each
// file in public/research/ has one owner (fixtures/research-centres.ts, §79). A
// centre that does not build (Nation Building) has none: ThumbCard's empty box.
// NID Press has no tile (below).
const CENTRES: Page[] = RESEARCH_CHILDREN.filter((c) => c.slug !== "nid-press").map((c) =>
  centre(c.slug, c.title, RESEARCH_CENTRE_PAGES[c.slug as ResearchCentre]?.page.hero ?? []),
);

// One section from three CMS sections (§78): the title is the board's, the
// body the CMS's "About", the tiles its research_center list. The body here is
// the board's hidden full text, verbatim; the CMS's is a shorter paraphrase.
// TODO(designer): NID Press has no tile — 7 tiles for 8 centres, as drawn.
const RESEARCH_AT_NID: Section = {
  id: "section-research-at-nid",
  page: PAGE_ID.research,
  order: 1,
  type: "cards",
  title: "Research at NID",
  body:
    "Research and Development activities are grounded in action-research conducted through engagement with communities and industry. The fieldwork of faculty, staff and students has often led to the design of products, services and systems that have had a significant impact on these communities.\n\n" +
    "NID’s craft documentation programme since the mid-1960s has resulted in several renowned publications on Indian craft traditions and continues to be an important part of its curriculum. The Institute has set up several Research Chairs in partnership with industry such as the Jamsetji Tata Research Chair for Universal Design, Asian Paints Colour Research Chair, Jindal Stainless Chair for Product Design Innovation and Autodesk Research Chair in Design Education and Innovation.",
  items: CENTRES,
  links: [],
  contacts: [],
};

export const RESEARCH: PageResponse = {
  page: {
    id: PAGE_ID.research,
    title: "Research & Publications",
    slug: "research",
    parent: null,
    template: "primary",
    utility: "none",
    keyInfo: [],
    // The board's photograph (download_assets on the board, 2 Oct 2026); the
    // CMS's two heroes are other photos and are refused by id (getPage.ts).
    // TODO(review): the alt text is ours.
    hero: [
      mediaAsset(
        "/research/hero-red-string-acrylic.jpg",
        "A student threads red string between clear acrylic boxes with a pair of tweezers.",
        1200,
        628,
      ),
    ],
    intro:
      "NID hosts a number of dedicated research and innovation centres spanning natural fibres, crafts, bamboo, handloom, railway design, and intellectual property.",
    sections: [RESEARCH_AT_NID],
    // The board draws these in Research at NID's column 4; the route moves them
    // there (PrimaryTemplate `contactsIn`). The CMS sends them page-level too.
    contacts: [
      { label: "Email", value: "research@nid.edu" },
      { label: "Phone", value: "+91 79 26629 687" },
    ],
    seoTitle: "Research & Publications",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [{ id: PAGE_ID.research, title: "Research & Publications", path: "/research" }],
    backNav: null,
    // sitemap.json's eight children, in its order, by its names (the centre
    // list, research-centres.ts). A centre that does not build stays an
    // unlinked row (KEEP_UNBUILT).
    // TODO(designer): the board's rail, its tiles, sitemap.json and the menu
    // each order the centres differently; the board's rail drops "(ICIC)".
    subPageLinks: RESEARCH_CHILDREN.map((c) => ({ label: c.title, href: researchPath(c.slug) })),
    siblingBand: [],
  },
};
