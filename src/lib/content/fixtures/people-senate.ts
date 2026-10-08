// /people/senate — NID Senate, a People child (STAGE-0-NOTES §96). No board: the
// secondary template by its own rules.
//
// The words are a copy of the CMS's `nid-senate` document as sent (8 Oct 2026),
// so FIXTURE and LIVE say the same. "Members" is its nineteen TEXT blocks, one
// paragraph each, through the adapter's own rules (richParagraphs, joinBlocks).
// "Senate Members with NID profiles" is its STRUCTURED person section as cards
// (railItems): name, designation (the item's heroText) and portrait from each
// item, no per-person fetch. A card links only where that member page builds.
// TODO(review): content — the thirteen with profiles are listed in both
// sections; the four external members are in "Members" only.
import type { PageResponse, Person } from "@/lib/content-model";
import { joinBlocks, richParagraphs } from "@/lib/content/format";
import { PAGE_ID } from "@/lib/content/pages";
import { peopleBand } from "@/lib/content/sibling-bands";
import { mediaAsset } from "@/lib/media";

// TODO(review): backend — the CMS's publishedAt is a seed timestamp.
const PUBLISHED = "2026-09-20T14:34:18+05:30";
const PATH = "/people/senate";

// The CMS's nineteen TEXT blocks, in order, as sent (HTML).
// TODO(review): content — block 1 restates the section's title.
const MEMBERS = [
  "Members of NID Senate",
  "<strong>Dr Ashok Mondal</strong>, Director, National Institute of Design, Ahmedabad. Ex-officio under Section 15 (a) of NID Act 2014",
  "<strong>Jitendra Singh Rajput</strong>, Dean NID Gandhinagar Campus, Gandhinagar. Ex-officio under Section 15 (b) of NID Act 2014",
  "<strong>Dr Susanth CS.</strong>, Dean NID Bengaluru Campus, Bengaluru. Ex-officio under Section 15 (b) of NID Act 2014",
  "<strong>Vijai Singh Katiyar</strong>, Activity Chairperson, PEP, National Institute of Design, Ahmedabad. Ex-officio under Section 15 (c) and Statute 12 (a) of NID Act 2014 & NID Statutes",
  "<strong>Dr Amit Kumar Sinha</strong>, Activity Chairperson, Integrated Design Services, National Institute of Design, Ahmedabad. Ex-officio under Section 15 (c) and Statute 12 (a) of NID Act 2014 & NID Statutes",
  "<strong>Dr Tridha Gajjar</strong>, Activity Chairperson, Research and Publications, National Institute of Design, Ahmedabad. Ex-officio under Section 15 (c) and Statute 12 (a) of NID Act 2014 & NID Statutes",
  "<strong>Dr Mamata N. Rao</strong>, Activity Chairperson, Knowledge Management Centre, National Institute of Design, Ahmedabad. Ex-officio under Section 15 (c) and Statute 12 (a) of NID Act 2014 & NID Statutes",
  "<strong>Chakradhar Saswade</strong>, Activity Chairperson, Design Foundation Studies, National Institute of Design, Ahmedabad. Ex-officio under Section 15 (c) and Statute 12 (a) of NID Act 2014 & NID Statutes",
  "<strong>Pravinsinh Solanki</strong>, Activity Chairperson Industry & online programmes (I&OP), National Institute of Design, Ahmedabad. Ex-officio under Section 15 (c) and Statute 12 (a) of NID Act 2014 & NID Statutes",
  "<strong>V Sakthivel</strong>, Activity Chairperson, Outreach Programmes, National Institute of Design, Ahmedabad. Ex-officio under Section 15 (c) and Statute 12 (a) of NID Act 2014 & NID Statutes",
  "<strong>Dr. P K Ghosh</strong>, Vice-Chancellor, Visva-Bharati, Santiniketan, West Bengal. Nominated under Section 15 (d) of NID Act 2014 (from the field of science)",
  "<strong>Prof. Ravindra D. Kulkarni</strong>, Vice Chancellor, University of Mumbai, Maharashtra. Nominated under Section 15 (d) of NID Act 2014 (from the field of engineering)",
  "<strong>Dr. Ami Upadhyay</strong>, Vice Chancellor, Dr. Babasaheb Ambedkar Open University, Ahmedabad, Gujarat. Nominated under Section 15 (d) of NID Act 2014 (from the field of humanities)",
  "<strong>Dr. Shridhar Marri</strong>, CEO and Founder Flyfish.ai, Bengaluru, Karnataka. Nominated under Section 15 (e) of NID Act 2014",
  "<strong>Sonal Chauhan</strong>, Head, Faculty of Textile & Apparel Design, National Institute of Design, Ahmedabad. Ex-officio under Section 15 (f) and Statute 12 (b) of NID Act 2014 & NID Statutes",
  "<strong>Guruprasad S</strong>, Head, Placement, Industry & Alumni Relations, National Institute of Design, Ahmedabad. Ex-officio under Section 15 (f) and Statute 12 (b) of NID Act 2014 & NID Statutes",
  "<strong>Viral Rajyaguru</strong>, Controller of Finance & Accounts, National Institute of Design, Ahmedabad. Ex-officio under Section 15 (f) and Statute 12 (b) of NID Act 2014 & NID Statutes",
  "As per the Section 20(2) of NID Act 2014, the Registrar shall be the Secretary of the senate.",
];

/** A profile card as railItems builds it from the CMS item: its id, slug, title
 *  and heroText, and a copy of its thumbnail (the faculty fixture's 288px
 *  squares, §83). `role` is railItems' constant; it is not rendered. */
const person = (id: number, slug: string, name: string, designation: string): Person => ({
  id: String(id),
  name,
  slug,
  role: "faculty",
  designation,
  photo: mediaAsset(`/people/faculty/${slug}.jpg`, name, 288, 288),
});

// The CMS's thirteen items, in CMS order.
// TODO(review): content — three designations here contradict "Members" (V
// Sakthivel, Sonal Chauhan, Guruprasad S); these match each person's own
// record. Pravinsinh Solanki's reads "(l&OP}" in capitals, as sent.
const PROFILES: Person[] = [
  // Director's Message's copy of the same file.
  { ...person(7, "ashok-mondal", "Dr Ashok Mondal", "Director, National Institute of Design."), photo: mediaAsset("/about/ashok-mondal.jpg", "Dr Ashok Mondal", 300, 300) },
  person(555, "jitendra-singh-rajput", "Jitendra Singh Rajput", "Dean, NID Gandhinagar Campus"),
  person(484, "susanth-cs", "Dr Susanth CS.", "Dean, NID Bengaluru Campus"),
  person(378, "vijai-singh-katiyar", "Vijai Singh Katiyar", "Activity Chairperson, PEP"),
  person(469, "amit-kumar-sinha", "Dr Amit Kumar Sinha", "Activity Chairperson, Integrated Design Services"),
  person(352, "tridha-gajjar", "Dr Tridha Gajjar", "Activity Chairperson, Research & Publications"),
  person(524, "mamata-n-rao", "Dr Mamata N. Rao", "Activity Chairperson, Knowledge Management Centre (KMC)"),
  person(517, "chakradhar-saswade", "Chakradhar Saswade", "Activity Chairperson, Design Foundation Studies"),
  person(368, "pravinsinh-solanki", "Pravinsinh Solanki", "Activity Chairperson, INDUSTRY & ONLINE PROGRAMMES (l&OP}"),
  person(377, "v-sakthivel", "V Sakthivel", "Head, Smart Handloom Innovation Centre"),
  person(470, "sonal-chauhan", "Sonal Chauhan", "Head, Faculty of Textile, Apparel & Lifestyle Accessory Design"),
  person(554, "guruprasad-s", "Guruprasad S", "Head, IPR Cell"),
  // In no faculty list, so no member page: the card is unlinked.
  person(744, "viral-rajyaguru", "Viral Rajyaguru", "Controller of Finance and Accounts"),
];

export const PEOPLE_SENATE: PageResponse = {
  page: {
    id: PAGE_ID.peopleSenate,
    title: "NID Senate",
    slug: "senate",
    parent: PAGE_ID.people,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [
      // The landing's copy of the CMS's file: people-nid-senate-hero.jpg is byte
      // for byte /people's hero. TODO(review): same photo as /people (and
      // Governing Council); the alt names the page, not the photograph (§81).
      mediaAsset("/people/hero-entrance.jpg", "NID Senate, National Institute of Design", 1520, 700),
    ],
    intro: "Members of the NID Senate.",
    sections: [
      {
        id: "section-senate-members",
        page: PAGE_ID.peopleSenate,
        order: 1,
        type: "text",
        title: "Members",
        body: joinBlocks(MEMBERS.map((html) => richParagraphs(html).text)).body,
        items: [],
        links: [],
        contacts: [],
      },
      {
        id: "section-senate-profiles",
        page: PAGE_ID.peopleSenate,
        order: 2,
        type: "rail",
        groupBy: "none",
        title: "Senate Members with NID profiles",
        items: PROFILES,
        links: [],
        contacts: [],
      },
    ],
    contacts: [],
    seoTitle: "NID Senate | National Institute of Design",
    seoDescription: "Members of the NID Senate.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.people, title: "People", path: "/people" },
      { id: PAGE_ID.peopleSenate, title: "NID Senate", path: PATH },
    ],
    // Names the band too: "More in People".
    backNav: { label: "People", href: "/people" },
    subPageLinks: [],
    siblingBand: peopleBand(PATH),
  },
};
