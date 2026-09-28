// /about/student-awards — the 1440 board's eight awards, in its order, already
// grouped (content-model.ts, PageResponse.groupedItems). THE record for each
// student: About's Student Awards section reads its two from here, so a name,
// detail or portrait cannot differ between the two pages.
//
// The first two keep the copy and portraits About shipped with (About's copy
// differs from the gallery board's for both, and About came first). The board
// repeats one stock portrait for all eight as a stand-in; it is not shipped, so
// the other six draw the placeholder circle.
import type { MediaAsset, PageResponse } from "@/lib/content-model";
import type { AwardEntry } from "@/lib/content/editorial";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";

export const AWARDS_SECTION = "section-awards-all";

const PUBLISHED = "2026-07-23T00:00:00+05:30";

function award(
  slug: string,
  name: string,
  award: string,
  project: string,
  detail: string,
  portrait?: MediaAsset,
): AwardEntry {
  return {
    id: `student-${slug}`,
    title: name,
    slug,
    parent: PAGE_ID.studentAwards,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: portrait ? [portrait] : [],
    intro: detail,
    sections: [],
    contacts: [],
    publishedAt: PUBLISHED,
    award,
    project,
  };
}

/** Keyed by the recipient's CMS slug, so a live record can fall back to its
 *  fixture record field by field (getAwards.ts). */
export const AWARD_ENTRIES: AwardEntry[] = [
  award(
    "rishaya-palkhivala",
    "Rishaya Palkhivala",
    "Satyajit Ray Centenary Award — Best Film, National",
    "Sorry For Your Loss",
    "A short film — ‘Sorry For Your Loss’ — by film and video Communication (FVC) M Des student at the National Institute of Design (NID) Ahmedabad was awarded the best film under the National Category of the Satyajit Ray Centenary Student’s Short Film Competition on the theme ‘Realism’.",
    mediaAsset("/about/alumni-palkhivala.png", "Portrait of Rishaya Palkhivala.", 276, 276),
  ),
  award(
    "mayank-kumar",
    "Mayank Kumar",
    "Dean’s Excellence Award",
    "Disha",
    "Mayank has been awarded the prestigious Dean's Excellence Award for developing an AI-powered accessibility tool that helps visually impaired students navigate campus independently.",
    mediaAsset("/about/alumni-kumar.png", "Portrait of Mayank Kumar.", 172, 195),
  ),
  award(
    "ananya-rege",
    "Ananya Rege",
    "India Design Mark",
    "Kalamkari Reimagined",
    "A Textile Design diploma project translating Srikalahasti kalamkari motifs into a contemporary furnishing range, produced with artisan clusters in Andhra Pradesh.",
  ),
  award(
    "farhan-qureshi",
    "Farhan Qureshi",
    "Red Dot Award — Design Concept",
    "Aarogya Cart",
    "A modular primary-health cart for rural outreach camps, developed at NID Gandhinagar in collaboration with the Innovation Centre for Natural Fibre.",
  ),
  award(
    "meera-krishnan",
    "Meera Krishnan",
    "National Award for Excellence in Toy Design",
    "Chitra Blocks",
    "A tactile block system for early-years learning, drawn from Channapatna lacquerware traditions and finished with food-safe natural dyes.",
  ),
  award(
    "devansh-mehta",
    "Devansh Mehta",
    "Adobe Design Achievement Award",
    "Field Notes",
    "An Interaction Design project documenting craft clusters through an offline-first mobile archive built for low-bandwidth conditions.",
  ),
  award(
    "sanjana-iyer",
    "Sanjana Iyer",
    "IIID Young Designer Award",
    "The Long Verandah",
    "An Exhibition Design thesis reworking circulation and daylight in a small-town municipal library, developed with the local municipal council.",
  ),
  award(
    "rohan-pillai",
    "Rohan Pillai",
    "Jamsetji Tata Universal Design Award",
    "Saath",
    "A wayfinding system for public hospitals, tested with low-vision users across three district facilities in Gujarat.",
  ),
];

export const STUDENT_AWARDS: Omit<PageResponse, "groupedItems"> & {
  groupedItems: Record<string, Array<{ label: string; items: AwardEntry[] }>>;
} = {
  page: {
    id: PAGE_ID.studentAwards,
    title: "Student Awards Gallery",
    slug: "student-awards",
    parent: PAGE_ID.about,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [],
    sections: [
      {
        id: AWARDS_SECTION,
        page: PAGE_ID.studentAwards,
        order: 1,
        type: "cards",
        title: "All Awards",
        items: AWARD_ENTRIES,
        links: [],
        contacts: [],
      },
    ],
    contacts: [],
    seoDescription: "Awards and recognition earned by NID students.",
    publishedAt: PUBLISHED,
  },
  derived: { menuTree: [], breadcrumb: [], backNav: null, subPageLinks: [], siblingBand: [] },
  groupedItems: { [AWARDS_SECTION]: [{ label: "All Awards", items: AWARD_ENTRIES }] },
};
