// /people/governing-council — Governing Council, the first People child
// (STAGE-0-NOTES §95). No board: the secondary template by its own rules.
//
// The words are a copy of the CMS's `governing-council` document as sent (8 Oct
// 2026), so FIXTURE and LIVE say the same: its eleven TEXT blocks, each a
// paragraph, through the adapter's own rules (richParagraphs, joinBlocks).
// TODO(review): backend — the members as person records (§81); then this page
// takes Senate's person cards. Names are never matched to faculty pages here.
import type { PageResponse } from "@/lib/content-model";
import { joinBlocks, richParagraphs } from "@/lib/content/format";
import { PAGE_ID } from "@/lib/content/pages";
import { peopleBand } from "@/lib/content/sibling-bands";
import { mediaAsset } from "@/lib/media";

// TODO(review): backend — the CMS's publishedAt is a seed timestamp.
const PUBLISHED = "2026-09-20T14:34:14+05:30";
const PATH = "/people/governing-council";

// The CMS's eleven TEXT blocks, in order, as sent (HTML): ¶1 the constitution,
// then nine seats, then the Registrar. TODO(review): backend — the fourth names
// a post and no person (DPIIT's Additional Secretary & FA): a name, or "vacant".
const MEMBERS = [
  "Members of the Interim Governing Council, of National Institute of Design Ahmedabad, constituted by the Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce & Industry, Government of India w.e.f. 25th August 2022.",
  "<strong>Shri Jai Prakash Shivahare, IAS</strong>, Joint Secretary, Department for Promotion of Industry and Internal Trade (DPIIT) Ministry of Commerce & Industry, Government of India - Chairperson and <em>ex officio</em> member",
  "<strong>Dr. Ashok Mondal</strong> Director - Member <em>ex officio</em>",
  "Additional Secretary & Financial Advisor, Department for Promotion of Industry and Internal Trade (DPIIT) Ministry of Commerce & Industry, Government of India - Member ex officio (Financial Adviser, DPIIT)",
  "<strong>Ms. Manmohan Kaur, Advisor (Cost), Dept. of Higher Education</strong> Government of India - Member, <em>ex officio</em> (Representative of Department of Higher Education)",
  "<strong>Smt. Sunita Verma</strong>, Scientist 'G', Ministry of Electronics & Information Technology, Government of India - Member, <em>ex officio</em> (Representative of MeitY)",
  "<strong>Dr. S. Selvakumar, IAS</strong> Principal Secretary Commerce & Industries Department, Govt. of Karnataka - Member (Representative(s) from the State(s) in which the Institute campus is located)",
  "<strong>Ms. Mamta Verma, IAS</strong>, Principal Secretary, Industries and Mines Department, Govt. of Gujarat - Member (Representative(s) from the State(s) in which the Institute campus is located)",
  "<strong>Mr. Jitendra Singh Rajput</strong>, Dean, Gandhinagar Campus - Member, <em>ex officio</em> (Dean of each Institute campus)",
  "<strong>Mr. Susanth C S</strong>, Dean, Bengaluru Campus - Member, ex officio (Dean of each Institute campus)",
  "<strong>The Registrar shall be the Secretary of the interim Governing Council.</strong>",
];

export const PEOPLE_GOVERNING_COUNCIL: PageResponse = {
  page: {
    id: PAGE_ID.peopleGoverningCouncil,
    title: "Governing Council",
    slug: "governing-council",
    parent: PAGE_ID.people,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [
      // The landing's copy of the CMS's file: people-governing-council-hero.jpg
      // is byte for byte /people's hero. TODO(review): same photo as /people;
      // the alt names the page, not the photograph (§81).
      mediaAsset("/people/hero-entrance.jpg", "Governing Council, National Institute of Design", 1520, 700),
    ],
    // TODO(review): content — the standfirst and Members ¶1 open with nearly the
    // same words ("Members of the Interim Governing Council…").
    intro: "Members of the Interim Governing Council of the National Institute of Design.",
    sections: [
      {
        id: "section-gc-members",
        page: PAGE_ID.peopleGoverningCouncil,
        order: 1,
        type: "text",
        title: "Members",
        body: joinBlocks(MEMBERS.map((html) => richParagraphs(html).text)).body,
        items: [],
        links: [],
        contacts: [],
      },
    ],
    contacts: [],
    seoTitle: "Governing Council | National Institute of Design",
    seoDescription: "Members of the Interim Governing Council of the National Institute of Design.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.people, title: "People", path: "/people" },
      { id: PAGE_ID.peopleGoverningCouncil, title: "Governing Council", path: PATH },
    ],
    // Names the band too: "More in People".
    backNav: { label: "People", href: "/people" },
    subPageLinks: [],
    siblingBand: peopleBand(PATH),
  },
};
