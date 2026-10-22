// /people/staff — Staff, a People child (STAGE-0-NOTES §99). No board: the
// secondary template by its own rules.
//
// The words are a copy of the CMS's `staff` document as sent (22 Oct 2026), so
// FIXTURE and LIVE say the same. Its one section, "Staff", is a STRUCTURED
// person section as cards (railItems, §96): name, designation (the item's
// heroText) and portrait from each item, no per-person fetch. No staff member
// has a member page, so every card is unlinked.
// TODO(review): backend — nid.edu groups the same twelve people into General
// Administration, Academic Administration and Accounts. The groups need a
// `groupBy` on the section or three sections; the front end never buckets a
// flat list (CLAUDE.md). Until then, one list in CMS order.
import type { PageResponse, Person } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { peopleBand } from "@/lib/content/sibling-bands";
import { mediaAsset } from "@/lib/media";

// TODO(review): backend — the CMS's publishedAt is a seed timestamp.
const PUBLISHED = "2026-09-20T14:34:10+05:30";
const PATH = "/people/staff";

/** A card as railItems builds it from the CMS item: its id, slug, title and
 *  heroText, and a copy of its thumbnail (the faculty fixture's 288px squares,
 *  §83). `role` is railItems' constant; it is not rendered. */
const person = (id: number, slug: string, name: string, designation: string): Person => ({
  id: String(id),
  name,
  slug,
  role: "faculty",
  designation,
  photo: mediaAsset(`/people/faculty/${slug}.jpg`, name, 288, 288),
});

// The CMS's twelve items, in CMS order — alphabetical by slug, though the
// section is CURATED. TODO(review): backend — the curated order (nid.edu's
// runs by post within each group), and one designation style: " - NID
// Ahmedabad" beside "(Bengaluru Campus)".
const STAFF: Person[] = [
  person(679, "ap-semwal", "Dr AP Semwal", "Deputy Registrar - NID Gandhinagar Campus"),
  person(702, "mukund-trivedi", "Mukund Trivedi", "Senior Account Officer - NID Ahmedabad"),
  person(710, "ps-pradeep", "PS Pradeep", "Chief Administrative Officer"),
  person(715, "rupesh-kumar-jindal", "Rupesh Kumar Jindal", "Deputy Registrar - NID Ahmedabad"),
  person(716, "sagarkumar-v-shah", "Sagarkumar V Shah", "Senior Account Officer - NID Gandhinagar Campus"),
  person(717, "samir-more", "Samir More", "Senior Administrative Officer - NID Ahmedabad"),
  person(718, "sanjay-pandit", "Sanjay Pandit", "Senior Administrative Officer - NID Ahmedabad"),
  person(719, "sanjeev-kumar", "Sanjeev Kumar", "Deputy Controller of Finance and Accounts"),
  person(721, "sejal-roy", "Sejal Roy", "Executive Engineer"),
  person(723, "shailesh-khubchandani", "Shailesh Khubchandani", "Senior Account Officer - NID Bengaluru Campus"),
  person(724, "sharath-b", "Sharath B", "Deputy Registrar (Bengaluru Campus)"),
  // Senate's copy of the same file (§96).
  person(744, "viral-rajyaguru", "Viral Rajyaguru", "Controller of Finance and Accounts"),
];

export const PEOPLE_STAFF: PageResponse = {
  page: {
    id: PAGE_ID.peopleStaff,
    title: "Staff",
    slug: "staff",
    parent: PAGE_ID.people,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [
      // The landing's copy of the CMS's file: people-staff-hero.jpg is byte for
      // byte /people's hero. TODO(review): same photo as /people (and Governing
      // Council, Senate); the alt names the page, not the photograph (§81).
      mediaAsset("/people/hero-entrance.jpg", "Staff, National Institute of Design", 1520, 700),
    ],
    intro: "Administrative and finance staff of the National Institute of Design.",
    sections: [
      {
        id: "section-staff-people",
        page: PAGE_ID.peopleStaff,
        order: 1,
        type: "rail",
        groupBy: "none",
        // The CMS's title, which repeats the page's. A section title is
        // mandatory (NID-CONTEXT §8), and /programmes renders its "Programmes"
        // the same way. TODO(review): backend — with the three groups, the
        // group names carry the headings.
        title: "Staff",
        items: STAFF,
        links: [],
        contacts: [],
      },
    ],
    contacts: [],
    seoTitle: "Staff | National Institute of Design",
    seoDescription: "Administrative and finance staff of the National Institute of Design.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.people, title: "People", path: "/people" },
      { id: PAGE_ID.peopleStaff, title: "Staff", path: PATH },
    ],
    // Names the band too: "More in People".
    backNav: { label: "People", href: "/people" },
    subPageLinks: [],
    siblingBand: peopleBand(PATH),
  },
};
