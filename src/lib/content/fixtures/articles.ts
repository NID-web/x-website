// /about/news-events/[slug] — the two article boards as demo content (STAGE-0-NOTES
// §59). NOT a skeleton: an API document for the same slug replaces one whole, and
// every other article is the API's alone. They exist so the template renders,
// screenshots and diffs against its boards with no CMS.
//
// Both boards draw their section images (and the Convocation hero) as flat
// placeholder boxes named "replace with source image" — stand-ins, not a designed
// state — so those slots are empty here and render nothing.
import type { Page, PageResponse, Section } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";

const PARENT_PATH = "/about/news-events";

function article(
  page: Pick<Page, "id" | "title" | "slug" | "keyInfo" | "hero" | "intro" | "publishedAt"> & {
    sections: Array<Omit<Section, "page" | "order" | "type" | "items" | "links" | "contacts"> & Partial<Pick<Section, "links" | "contacts">>>;
    sibling: { slug: string; title: string };
  },
): PageResponse {
  const { sections, sibling, ...rest } = page;
  return {
    page: {
      ...rest,
      parent: PAGE_ID.newsEvents,
      template: "secondary",
      utility: "back",
      contacts: [],
      sections: sections.map((s, i) => ({
        links: [],
        contacts: [],
        ...s,
        page: page.id,
        order: i + 1,
        type: "text",
        items: [],
      })),
    },
    derived: {
      menuTree: [],
      breadcrumb: [],
      backNav: null,
      subPageLinks: [],
      // The boards' "More news" rows point at each other.
      siblingBand: [
        { id: `article-${sibling.slug}`, title: sibling.title, href: `${PARENT_PATH}/${sibling.slug}` },
      ],
    },
  };
}

const CONVOCATION_TITLE = "The 45th Convocation, National Institute of Design, Ahmedabad";
const ARTISANS_TITLE = "North-East Artisans Honoured by Hon’ble President of India at Rashtrapati Bhavan";

// Keyed by the CMS record for the same event, so the API's document replaces it
// whenever the CMS has one.
const CONVOCATION = article({
  id: "article-convocation-2026",
  slug: "convocation-2026",
  title: CONVOCATION_TITLE,
  publishedAt: "2026-01-22T00:00:00+05:30",
  keyInfo: [
    { label: "Date", value: "22 January 2026" },
    { label: "Venue", value: "NID Gandhinagar Campus" },
  ],
  hero: [],
  intro:
    "The 45th Convocation of the National Institute of Design, Ahmedabad marks a significant academic and institutional milestone. Dr V. Narayanan, Chairman of the Indian Space Research Organisation, will serve as Chief Guest and deliver the Convocation Address.",
  sibling: { slug: "north-east-artisans", title: ARTISANS_TITLE },
  sections: [
    {
      id: "section-convocation-ceremony",
      title: "The Ceremony",
      body: "Beyond the ceremony, the campus will host Graduate Show 2026, Young Designer, Design Panorama, Annual Design Show 2026, Design Street, and the Craft Bazaar. These events showcase student work, interdisciplinary inquiry, and collaborations including Integrated Design Services, the National Design Business Incubator, and Research & Development activities.\n\nThe convocation ceremony will stream at 5:00 PM on NID's YouTube channel.",
      links: [
        // TODO(review): the board names no URL for the stream; this is the
        // footer's YouTube channel (src/lib/footer-content.ts). Confirm.
        {
          id: "link-convocation-live-stream",
          label: "Watch the live stream",
          targetType: "external",
          url: "https://youtube.com/@nid",
        },
      ],
      contacts: [{ label: "Email", value: "cmr@nid.edu" }],
    },
    {
      id: "section-convocation-graduate-show",
      title: "Graduate Show 2026",
      body: "The Graduate Show theme encompasses six interconnected areas:\n\nPeople & Society — emphasising human needs and community.\n\nCulture & Craft — honouring India's traditions.\n\nLiving & Lifestyle — reimagining everyday practices.\n\nTechnology & Interaction — highlighting digital tools and accessibility.\n\nSystems, Infrastructure & Futures — addressing large-scale challenges.\n\nNature & Sustainability — foregrounding ecological responsibility.",
    },
    {
      id: "section-convocation-design-panorama",
      title: "Design Panorama",
      body: "The Design Panorama presents an immersive digital journey through NID's history across its three campuses — Ahmedabad, Gandhinagar and Bengaluru — through curated presentations and student projects.",
    },
    {
      id: "section-convocation-craft-bazaar",
      title: "Craft Bazaar",
      body: "The Craft Bazaar runs 21–23 January, 10:00 AM to 10:00 PM near the Academic Block, featuring artisan stalls and student-led shops.",
      // TODO(review): the board's second link, "Annual Design Show", has no
      // route in sitemap.json and no URL, so it is not authored.
      links: [
        { id: "link-convocation-young-designers", label: "Young Designers 2026", targetType: "page", page: PAGE_ID.youngDesigners },
      ],
    },
  ],
});

// Keyed by sitemap.json's /about/news-events/north-east-artisans, which the
// News & Events and About fixtures already link — not by the CMS record's
// 79-character slug for the same story (BACKEND gap A3).
const NORTH_EAST_ARTISANS = article({
  id: "article-north-east-artisans",
  slug: "north-east-artisans",
  title: ARTISANS_TITLE,
  publishedAt: "2026-05-19T00:00:00+05:30",
  keyInfo: [
    { label: "Date", value: "19 May 2026" },
    { label: "Venue", value: "Rashtrapati Bhavan, New Delhi" },
    { label: "Email", value: "cmr@nid.edu" },
  ],
  hero: [
    mediaAsset(
      "/news/north-east-artisans.jpg",
      "The President of India presenting an award to an artisan at Rashtrapati Bhavan.",
      1200,
      526,
    ),
  ],
  intro:
    "An 80-member delegation of artisans and weavers from all eight North Eastern states called on the President of India, Smt Droupadi Murmu, at Rashtrapati Bhavan. The group had crafted the invitation kit for the ‘At Home’ Reception held on 26 January 2026 — work carried out with technical support from the National Institute of Design.",
  sibling: { slug: "convocation-2026", title: CONVOCATION_TITLE },
  sections: [
    {
      id: "section-artisans-delegation",
      title: "The Delegation",
      body: "The delegation numbered eighty, drawn from all eight North Eastern states and made up predominantly of women from remote districts. Their work was presented to the President at Rashtrapati Bhavan, after which the group was taken on a guided tour of the estate, including the Amrit Udyan gardens.\n\nAddressing the artisans, the President described them as the shining example of the living heritage of the nation, and spoke of the need to support them so that their artistic knowledge reaches as many people as possible and they can become self-reliant. She urged the artisans to carry their traditions to younger generations.",
      links: [
        { id: "link-artisans-rashtrapati-bhavan", label: "Rashtrapati Bhavan", targetType: "external", url: "https://rashtrapatibhavan.gov.in" },
        { id: "link-artisans-icic", label: "International Centre for Indian Crafts", targetType: "page", page: PAGE_ID.researchIcic },
      ],
    },
    {
      id: "section-artisans-woven-threads",
      title: "Woven Threads × Noklak",
      body: "Artisans from Noklak district in Nagaland worked with Ehlon niu — stinging nettle and wild rhea fibres — retted, spun and woven by hand. Team Woven Threads × Noklak presented handcrafted home textiles from their newest collection, comprising three pillow covers.\n\nWoven Threads is a design label engaged in artisanal textile design and manufacturing in collaboration with local communities, and led the Noklak contingent within the wider delegation.",
    },
    {
      id: "section-artisans-invitation-kit",
      title: "The Invitation Kit",
      body: "The kit was produced for the ‘At Home’ Reception held at Rashtrapati Bhavan on 26 January 2026. It carried the artistic and cultural heritage of the North Eastern region into a piece of official state correspondence — placing craft from eight states directly into the hands of every guest, rather than displaying it at a remove.",
    },
    {
      id: "section-artisans-institute-role",
      title: "The Institute’s Role",
      body: "NID provided technical support to the initiative, undertaken under the aegis of Rashtrapati Bhavan. The engagement continues the Institute’s long association with craft communities, in which design input is directed at the making, finishing and presentation of work that is already the product of generations of skill.",
      links: [
        { id: "link-artisans-bamboo", label: "Center for Bamboo Initiatives", targetType: "page", page: PAGE_ID.researchBamboo },
        { id: "link-artisans-handloom", label: "Smart Handloom Innovation Centre", targetType: "page", page: PAGE_ID.researchHandloom },
      ],
    },
  ],
});

export const ARTICLES: Record<string, PageResponse> = {
  [CONVOCATION.page.slug]: CONVOCATION,
  [NORTH_EAST_ARTISANS.page.slug]: NORTH_EAST_ARTISANS,
};
