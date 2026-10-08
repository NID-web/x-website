// /consulting/continuing-education — Continuing Education Programme, a
// Consulting & Entrepreneurship child (STAGE-0-NOTES §93), IDS's pattern (§92).
// The first page read from a `service_centre` document; the adapter reads it as
// any Generic Page.
//
// The words are a copy of the CMS's `continuing-education-programme` document
// as sent (7 Oct 2026), so FIXTURE and LIVE say the same. Its TEXT blocks are
// joined by the adapter's own rule (joinBlocks, §68): a run of "- " blocks is
// one list, a lead-in sentence stays a paragraph.
import type { PageResponse } from "@/lib/content-model";
import { joinBlocks } from "@/lib/content/format";
import { PAGE_ID } from "@/lib/content/pages";
import { consultingBand } from "@/lib/content/sibling-bands";

// TODO(review): backend — the CMS's publishedAt is a seed timestamp.
const PUBLISHED = "2026-09-21T08:57:07+05:30";
const PATH = "/consulting/continuing-education";

// The CMS's thirteen TEXT blocks, in order.
const ABOUT = [
  "The impact of design education programmes clearly shows that in the future skill development must form one of the major components of educational initiative to support the Indian economy. The challenge is to create a continuing education system to promote design education where the effervescence of the mass upsurge of the design education campaigns can be channelled into structuring a continuous and life-long learning process. Thus, CEP is taken up to make the learners aware of the power and significance of design education. The continuing education scheme is, therefore, multi-faceted and enjoys supreme flexibility to allow grassroots community participation and design enhancement initiative.",
  "The following is the framework for the functioning of CEP:",
  "- To design equivalent programmes as an alternative to the existing formal general or vocational education.",
  "- Initiate income-generating short-term programmes where the participants acquire or upgrade their vocational skills and thereby take up income-generating activities.",
  "- Programmes which aim to equip learners and the community with essential knowledge, attitude, values and skills to raise their standard of living.",
  "- Individual interest promotion programmes to provide opportunities for learners to participate and learn about their individually chosen social, cultural, spiritual, health, physical and artistic interests.",
  "CEP endeavours to achieve its objectives through the conduct of the following:",
  "- Conferences/Workshop",
  "- Symposiums",
  "- Formal lectures, courses, webinars",
  "The courses and programmes designed are prepared to meet the needs and requirements of different target groups. In addition to the above, provide policy related inputs on all the above matters to the Institute's Senate, Standing Committee and Governing Council.",
  "The short format educational activities of the Institute, such as industry workshops, online courses, executive workshops, summer workshops, etc., hitherto managed and coordinated by Industry & Online Programmes (I&OP), are now reorganized under the umbrella of ‘Continuous Education Programmes (CEP)’.",
  "Consequently, the CEP department will continue to make the selection and award of projects through the consultancy scheme of NID, as per the established norms.",
];

export const CONSULTING_CONTINUING_EDUCATION: PageResponse = {
  page: {
    id: PAGE_ID.consultingContinuingEducation,
    title: "Continuing Education Programme",
    slug: "continuing-education",
    parent: PAGE_ID.consulting,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    // The CMS's hero is refused (§93, as §77): its caption band is baked into
    // the photograph and cut below 1440. The page closes up in both modes.
    hero: [],
    intro:
      "Short-format design education - conferences, workshops, symposiums, lectures, courses and webinars - to support life-long learning in design.",
    sections: [
      {
        id: "section-cep-about",
        page: PAGE_ID.consultingContinuingEducation,
        order: 1,
        type: "text",
        title: "About",
        body: joinBlocks(ABOUT).body,
        items: [],
        links: [
          {
            id: "link-cep-workshops",
            label: "CEP Workshops (Schedule & Gallery)",
            targetType: "external",
            url: "https://cep.nid.edu/",
          },
        ],
        contacts: [],
      },
    ],
    // Column 4 of About (the template's rule), as sent. TODO(review): the
    // phone carries a trunk 0 and two numbers, so it is plain text (§80).
    contacts: [
      { label: "Continuing Education Programme", value: "cep@nid.edu" },
      { label: "Continuing Education Programme", value: "ipp@nid.edu" },
      { label: "Continuing Education Programme", value: "+91 079 26629767 / 746" },
    ],
    seoTitle: "Continuing Education Programme | National Institute of Design",
    seoDescription:
      "Short-format design education - conferences, workshops, symposiums, lectures, courses and webinars - to support life-long learning in design.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.consulting, title: "Consulting & Entrepreneurship", path: "/consulting" },
      { id: PAGE_ID.consultingContinuingEducation, title: "Continuing Education Programme", path: PATH },
    ],
    // Names the band too: "More in Consulting & Entrepreneurship" (§92).
    backNav: { label: "Consulting & Entrepreneurship", href: "/consulting" },
    subPageLinks: [],
    siblingBand: consultingBand(PATH),
  },
};
