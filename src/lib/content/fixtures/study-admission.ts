// /study/admission — Admission Process (the 1440 board, real 24 / 330 grid).
// Copy is the board's, verbatim, typos and stale dates included: corrections
// belong in the CMS (STAGE-0-NOTES §74).
//
// LIVE, the CMS wins where it has data: the standfirst is its "How to Apply"
// sentence and "How to Apply" here is its "Admissions" section, whole — body
// and portal link. Everything else on this page is the fixture's, LIVE too.
// TODO(review): live slots the fixture fills — the "Apply at" row, the email
// and phone links, and the B.Des, M.Des and Ph.D sections.
//
// Not here, on purpose: the "Applications open" rail row (no data, and false
// today); the three handbooks (no file URLs anywhere — backend ask); the four
// section photos (placeholders on the board, none in the CMS — backend ask).
import type { Link, PageResponse, Section } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { studyBand } from "@/lib/content/sibling-bands";
import { mediaAsset } from "@/lib/media";
import { ADMISSIONS_URL } from "@/lib/content/fixtures/programme-parts";

const PUBLISHED = "2026-10-01T00:00:00+05:30";
const PATH = "/study/admission";

function section(id: string, order: number, title: string, body: string[], links: Link[] = []): Section {
  return {
    id,
    page: PAGE_ID.studyAdmission,
    order,
    type: "text",
    title,
    body: body.join("\n\n"),
    items: [],
    links,
    contacts: [],
  };
}

// TODO(review): content — the board prints the portal URL in the prose and
// again as the CTA beside it.
// TODO(review): confirm admissions@nid.edu and 079-26623462 are current; the
// CMS has neither. The phone dials in full international form.
const HOW_TO_APPLY = section(
  "section-admission-how",
  1,
  "How to Apply",
  [
    "For admission related information, kindly visit https://admissions.nid.edu/.",
    // TODO(review): stale — the 2026–27 cycle closed on 01 December 2025. FIXTURE
    // only: LIVE renders the CMS's "Admissions" section instead.
    "Applications for B.Des and M.Des 2026–27 opened on Thursday, 11 September 2025 and closed at 11:59 pm on Monday, 01 December 2025. The DAT Prelims examination was held on Sunday, 21 December 2025.",
    "The only official website of NID, Ahmedabad is nid.edu. Any website referring to NID with '.org' or 'org.in' is a fake website.",
  ],
  [
    { id: "link-admission-portal", label: "admissions.nid.edu", targetType: "external", url: ADMISSIONS_URL },
    { id: "link-admission-email", label: "admissions@nid.edu", targetType: "email", address: "admissions@nid.edu" },
    { id: "link-admission-phone", label: "079-26623462", targetType: "phone", address: "+917926623462" },
  ],
);

const BDES = section("section-admission-bdes", 2, "Bachelor of Design (B.Des)", [
  "The four-year-long Bachelor of Design programme is offered only at NID Ahmedabad in the following areas of specialization: Faculty of Industrial Design, Faculty of Communication Design, Faculty of Textile, Apparel, Lifestyle & Accessory Design and Ceramic & Glass Design.",
  "Eight disciplines across three faculties, preceded by a Foundation Programme of 128 seats at Ahmedabad.",
]);

// TODO(review): content — "19 discipline" (singular), and the second paragraph
// says what the first does.
const MDES = section("section-admission-mdes", 3, "Master of Design (M.Des)", [
  "This 2.5 year programme is offered in 19 discipline across all 3 campuses in the following areas of specialization: Faculty of Communication Design, Faculty of Industrial Design, Faculty of Interdisciplinary Design, Faculty of IT Integrated Design and Faculty of Textile, Apparel, Lifestyle and Accessory Design.",
  "The two-and-a-half year long Master of Design (M.Des.) programme at NID is offered at its campuses in Ahmedabad, Bengaluru and Gandhinagar.",
]);

// The visible board copy, which clips at "Both full…"; the end of that sentence
// is the board's hidden "Full text" layer (read from Figma). The layer's
// "reinvent" is not used — the visible text says "reinvigorate" — nor its third
// paragraph, a note that no Ph.D intake is listed for 2026–27, which the CMS's
// Ph.D 2027 call contradicts and which would ship to LIVE (§74).
// TODO(review): content — "Ph.D" here, "PhD" in the board's handbook label.
const PHD = section(
  "section-admission-phd",
  4,
  "Ph.D",
  [
    "In pursuit of its continued commitment to Design research, NID started a doctoral programme in Design in the year 2017. NID's PhD programme in Design aims to promote deep reflection, inquiry, and rigour in the development and dissemination of new ideas, expressions and skills in the field of Design and allied fields.",
    "The programme is open to educators and professionals in design and allied fields who wish to reinvigorate their own practice or knowledge base. Both full-time and part-time routes are offered.",
  ],
  [{ id: "link-admission-phd-email", label: "info@nid.edu", targetType: "email", address: "info@nid.edu" }],
);

export const STUDY_ADMISSION: PageResponse = {
  page: {
    id: PAGE_ID.studyAdmission,
    title: "Admission Process",
    slug: "admission",
    parent: PAGE_ID.study,
    template: "secondary",
    utility: "back",
    // TODO(review): "Apply at" is the board's row, plain text — the rail has no
    // linked value for a bare domain; the How to Apply CTA carries the link.
    keyInfo: [{ label: "Apply at", value: "admissions.nid.edu" }],
    hero: [
      // The CMS's admission-process-hero-1.jpg (the board's is a placeholder).
      // TODO(review): the alt text is ours; the CMS's says only "National
      // Institute of Design".
      mediaAsset(
        "/study/admission/hero-candidates-reading.jpg",
        "Candidates seated on chairs in a hall, reading printed papers while they wait.",
        1280,
        628,
      ),
    ],
    intro:
      "Admission to all programmes at NID is on the basis of the candidates' performance in two stages of the Design Aptitude Test (DAT). The objective of these exams is to assess the knowledge, skills and behavioural qualities of candidates.",
    sections: [HOW_TO_APPLY, BDES, MDES, PHD],
    contacts: [],
    seoTitle: "Admission Process",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.study, title: "Study at NID", path: "/study" },
      { id: PAGE_ID.studyAdmission, title: "Admission Process", path: PATH },
    ],
    backNav: { label: "Study at NID", href: "/study" },
    subPageLinks: [],
    // TODO(designer): the board lists PM Vidyalaxmi Scheme first; the band
    // follows sitemap.json's order. All four are unbuilt: unlinked rows until
    // each ships (SIBLING_BAND, §74).
    siblingBand: studyBand(PATH),
  },
};
