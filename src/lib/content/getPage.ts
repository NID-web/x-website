// The one content seam. A page render is one call — the Page, its sections in
// order, items resolved and already grouped (NID-CONTEXT.md §8.4). A page with
// a PAGE_CONFIG entry is merged from the CMS over its fixture
// (src/lib/content/page-adapter.ts); every other page is its fixture. Nothing
// outside src/lib/content/ may import a fixture (scripts/lint-fixtures.mjs).
import { cache } from "react";
import { getTranslations } from "next-intl/server";
import type { LabelValue, Link, PageResponse, Section } from "@/lib/content-model";
import { assertFloor } from "@/lib/api/build-mode";
import { fileServes } from "@/lib/api/media";
import { documentHref } from "@/lib/content/documents";
import { cmsFetch } from "@/lib/api/client";
import { isPublicContentResponse, type PublicContentResponse } from "@/lib/api/types";
import { campusName } from "@/lib/content/campus-names";
import type { RailLink } from "@/lib/content/editorial";
import { programmeDisciplines, type ProgrammeLevel } from "@/lib/content/getDisciplines";
import { disciplineIndex } from "@/lib/content/getDiscipline";
import { withArchiveYears } from "@/lib/content/getArchive";
import { withAwardRecords } from "@/lib/content/getAwards";
import { articleFeed } from "@/lib/content/getArticle";
import { facultyIndex } from "@/lib/content/getFaculty";
import { CMS_FLOORS } from "@/lib/content/cms-floors";
import {
  detailSections,
  referencedSlugs,
  toPageResponse,
  type PageMergeConfig,
} from "@/lib/content/page-adapter";
import { SIBLING_BAND, SUB_PAGE_RAIL, auditSummary, gatePage, logMissingRoutes } from "@/lib/content/route-gate";
import { ABOUT } from "@/lib/content/fixtures/about";
import { CAMPUSES } from "@/lib/content/fixtures/campuses";
import { CAMPUS_AHMEDABAD } from "@/lib/content/fixtures/campus-ahmedabad";
import { CAMPUS_BENGALURU } from "@/lib/content/fixtures/campus-bengaluru";
import { CAMPUS_GANDHINAGAR } from "@/lib/content/fixtures/campus-gandhinagar";
import { CHARTER } from "@/lib/content/fixtures/charter";
import { DIRECTORS_MESSAGE } from "@/lib/content/fixtures/directors-message";
import { HISTORY } from "@/lib/content/fixtures/history";
import { NEWS_EVENTS } from "@/lib/content/fixtures/news-events";
import { OUR_THEMES } from "@/lib/content/fixtures/our-themes";
import { PROGRAMMES } from "@/lib/content/fixtures/programmes";
import { BDES_KEY_INFO, PROGRAMME_BDES } from "@/lib/content/fixtures/programme-bdes";
import { PROGRAMME_MDES } from "@/lib/content/fixtures/programme-mdes";
import { PROGRAMME_PHD } from "@/lib/content/fixtures/programme-phd";
import { PROGRAMME_FDP } from "@/lib/content/fixtures/programme-fdp";
import { PROGRAMME_INTERNATIONAL } from "@/lib/content/fixtures/programme-international";
import { CURRICULUM_OBJECTIVES } from "@/lib/content/fixtures/programme-curriculum-objectives";
import { STUDY } from "@/lib/content/fixtures/study";
import { STUDY_ADMISSION } from "@/lib/content/fixtures/study-admission";
import { STUDY_PM_VIDYALAXMI } from "@/lib/content/fixtures/study-pm-vidyalaxmi";
import { STUDY_LIFE_AT_NID } from "@/lib/content/fixtures/study-life-at-nid";
import { STUDY_NOTIFICATIONS } from "@/lib/content/fixtures/study-notifications";
import { STUDY_YOUNG_DESIGNERS } from "@/lib/content/fixtures/study-young-designers";
import { RESEARCH } from "@/lib/content/fixtures/research";
import { CONSULTING } from "@/lib/content/fixtures/consulting";
import { CONSULTING_IDS } from "@/lib/content/fixtures/consulting-ids";
import { CONSULTING_CONTINUING_EDUCATION } from "@/lib/content/fixtures/consulting-continuing-education";
import { PEOPLE } from "@/lib/content/fixtures/people";
import { REGULATORY_NID_ACT } from "@/lib/content/fixtures/regulatory-nid-act";
import { REGULATORY_ANNUAL_REPORTS } from "@/lib/content/fixtures/regulatory-annual-reports";
import { REGULATORY_RTI } from "@/lib/content/fixtures/regulatory-rti";
import { RESEARCH_CENTRE_PAGES, RESEARCH_CENTRE_SLICES } from "@/lib/content/fixtures/research-centres";
import { RESEARCH_CHILDREN, researchPath, type ResearchCentre } from "@/lib/content/research-centres";
import { REGULATORY_CHILDREN } from "@/lib/content/regulatory";
import { ADMISSIONS_URL } from "@/lib/content/fixtures/programme-parts";
import { PAGE_ID, cmsSlugOf, pagePath } from "@/lib/content/pages";

const FIXTURES: Record<string, PageResponse> = {
  "/about": ABOUT,
  "/about/campuses": CAMPUSES,
  "/about/campuses/ahmedabad": CAMPUS_AHMEDABAD,
  "/about/campuses/gandhinagar": CAMPUS_GANDHINAGAR,
  "/about/campuses/bengaluru": CAMPUS_BENGALURU,
  "/about/charter": CHARTER,
  "/about/directors-message": DIRECTORS_MESSAGE,
  "/about/history": HISTORY,
  "/about/news-events": NEWS_EVENTS,
  "/about/our-themes": OUR_THEMES,
  "/programmes": PROGRAMMES,
  "/programmes/bdes": PROGRAMME_BDES,
  "/programmes/mdes": PROGRAMME_MDES,
  "/programmes/phd": PROGRAMME_PHD,
  "/programmes/fdp": PROGRAMME_FDP,
  "/programmes/international": PROGRAMME_INTERNATIONAL,
  "/programmes/curriculum-objectives": CURRICULUM_OBJECTIVES,
  "/study": STUDY,
  "/study/admission": STUDY_ADMISSION,
  "/study/pm-vidyalaxmi": STUDY_PM_VIDYALAXMI,
  "/study/life-at-nid": STUDY_LIFE_AT_NID,
  "/study/notifications": STUDY_NOTIFICATIONS,
  "/study/young-designers": STUDY_YOUNG_DESIGNERS,
  "/research": RESEARCH,
  "/consulting": CONSULTING,
  "/consulting/ids": CONSULTING_IDS,
  "/consulting/continuing-education": CONSULTING_CONTINUING_EDUCATION,
  "/people": PEOPLE,
  "/regulatory/nid-act": REGULATORY_NID_ACT,
  "/regulatory/annual-reports": REGULATORY_ANNUAL_REPORTS,
  "/regulatory/rti": REGULATORY_RTI,
  ...Object.fromEntries(
    Object.entries(RESEARCH_CENTRE_PAGES).map(([slug, response]) => [researchPath(slug), response]),
  ),
};

// Keys are content-type keys from GET /public/content-types.
const PAGE_CONFIG: Record<string, PageMergeConfig> = {
  "/about": {
    slug: "about-nid",
    subPagesKey: "static",
    sections: {
      "section-about-news": { structuredKey: "news", slugUnderParent: true },
      "section-about-campuses": { structuredKey: "campus" },
      // section-about-student-awards: the backend serves these records through
      // the student-awards document, not about-nid; getAwards.ts reads them
      // for both pages (withAwardRecords below).
    },
  },
  "/about/campuses": {
    slug: "campuses",
    intro: "heroText",
    // Section 51 (key `campus`) lists the three children; the navigation tree
    // lists the same three today. Same mechanism as About's sub-page rail.
    subPagesKey: "campus",
    sections: {
      // TODO(review): backend — section 50 "About" carries three board
      // sections' prose in one section's five blocks. `blocks` is a shim for
      // the ask to split it (or for a stable Section.key, A1); delete it the day
      // the CMS splits them. `of` is the guard: any other block count and all
      // three fall back to the fixture.
      "section-campuses-about": { textTitle: "About", blocks: [1, 3], of: 5 },
      "section-campuses-three": { textTitle: "About", blocks: [4, 4], of: 5 },
      "section-campuses-visiting": { textTitle: "About", blocks: [5, 5], of: 5 },
    },
  },
  // The three campus pages read a "Campus Detail" document: one SPECIFIC
  // "About" section plus a typed `detail` record, which the adapter turns into
  // key-info values and ordinary sections (STAGE-0-NOTES §57). A detail list
  // with no board slot is logged, never given a section of its own.
  // TODO(review): "Programmes" key-info rows stay static on all three — the
  // API has no programmes summary, and composing one from counted disciplines
  // would invent a figure.
  "/about/campuses/ahmedabad": {
    slug: "ahmedabad-campus",
    intro: "heroText",
    sections: { "section-ahmedabad-about": { textTitle: "About" } },
    detail: {
      keyInfo: { Established: "establishedYear" },
      // TODO(review): backend — which Services & Centres list is authoritative?
      // The CMS's four (Printing & Reprographics, Design Clinic, Integrated
      // Design Services, Continuing Education) is a different list from the
      // board's five, and lacks three that have designed routes (Outreach,
      // Industry & Online, Railway). Held on the fixture so live and fallback
      // render the same; move this key into `lists` to switch.
      hold: { serviceCentres: "section-ahmedabad-services" },
      lists: {
        labAndFacilities: "section-ahmedabad-workshops",
        // TODO(review): the board draws three PROGRAMME cards; the CMS sends
        // seventeen discipline records. The API wins where it has data, so with
        // the CMS on this section lists disciplines and without it the
        // fixture's three programmes — it changes meaning with CMS availability.
        // Delete this one line to keep the programme cards.
        disciplines: "section-ahmedabad-disciplines",
      },
    },
  },
  "/about/campuses/gandhinagar": {
    slug: "gandhinagar-campus",
    intro: "heroText",
    sections: { "section-gandhinagar-about": { textTitle: "About" } },
    detail: {
      keyInfo: { Address: "address" },
      lists: {
        labAndFacilities: "section-gandhinagar-workshops",
        disciplines: "section-gandhinagar-disciplines",
      },
    },
  },
  "/about/campuses/bengaluru": {
    slug: "bengaluru-campus",
    intro: "heroText",
    // The board draws the campus contacts in the key-info rail (4119:230974).
    contactsTo: "keyInfo",
    sections: { "section-bengaluru-about": { textTitle: "About" } },
    detail: {
      keyInfo: { Inaugurated: "establishedYear" },
      lists: { disciplines: "section-bengaluru-disciplines" },
    },
  },
  "/about/charter": {
    slug: "charter",
    // The first SPECIFIC section is the Mandate BODY, not a standfirst —
    // History's shape.
    intro: "heroText",
    sections: {
      // Held off the CMS deliberately, and the page's ONE manual switch — every
      // other fallback here flips itself. The document's "Mandate" section is a
      // single block that also condenses all ten mandates (stating them twice,
      // with the section below) and drops the "Institution of National
      // Importance / NID Act 2014" sentence, so adopting it loses content.
      // TODO(review): backend — restore this line the day the CMS splits
      // "Mandate" into "Mandate" (the two-paragraph statement, Act sentence
      // back) + "The Ten Mandates". Until then the board's copy stands.
      // "section-charter-mandate": { textTitle: "Mandate" },
      // Not in the document yet; switches on by itself when the CMS splits it.
      "section-charter-ten-mandates": { textTitle: "The Ten Mandates" },
    },
  },
  "/about/directors-message": {
    slug: "directors-message",
    // Block 1 is the essay's opening paragraph, a body in columns 2–3, not a
    // standfirst — the default would consume the whole "Message" section as one.
    intro: "static",
    // The essay is one SPECIFIC section of eight TEXT blocks; the board splits it
    // at block boundaries (opening = 1, first body = 2–4, second = 5–8). `of`
    // is the guard: any other block count and all three fall back to the
    // fixture. The "Director" section is a CONTENT_REFERENCE to the person
    // record, which feeds the Person card's name, role and portrait.
    sections: {
      "section-dm-director": { referencesTitle: "Director" },
      "section-dm-opening": { textTitle: "Message", blocks: [1, 1], of: 8 },
      "section-dm-body-1": { textTitle: "Message", blocks: [2, 4], of: 8 },
      "section-dm-body-2": { textTitle: "Message", blocks: [5, 8], of: 8 },
    },
  },
  "/about/history": {
    slug: "history",
    // The document's first SPECIFIC section is the Origins BODY, not a
    // standfirst, so the intro is its heroText — which words the page
    // differently from the board (NID-CONTEXT §8.1; see the gap report).
    intro: "heroText",
    // The block beside the hero is the model's keyInfo (the 390 board names
    // it "Key Info"), not a first section's contacts.
    contactsTo: "keyInfo",
    sections: {
      "section-history-origins": { textTitle: "Origins" },
      "section-history-india-report": { textTitle: "The India Report" },
      "section-history-sarabhais": { textTitle: "The Sarabhais" },
      "section-history-convocation": { textTitle: "Convocation Through the Years" },
      "section-history-past-directors": { textTitle: "Past Directors" },
      // TODO(review): backend — `person` or `academic_faculty`? Both are content
      // types (GET /public/content-types); the document sends neither yet.
      "section-history-faculty-stalwarts": { structuredKey: "person" },
    },
  },
  "/about/news-events": {
    slug: "news-events",
    sections: {
      "section-news-featured": { structuredKey: "news", nth: 1, slugUnderParent: true },
      // TODO(review): designer — is this section a year bucket ("2026", the
      // board) or a recency feed ("Latest News", the API, items 2020–2026)? It
      // takes the API's title, so it currently reads "Latest News".
      "section-news-2026": { structuredKey: "news", nth: 2, slugUnderParent: true },
      // section-news-archive: a links section, and sections have no link model (A4).
    },
    // Events and workshops open their page under /about/news-events, as news
    // does (there is no /events route, STAGE-0-NOTES §85); getArticle.ts builds
    // exactly this document's items.
    appendSections: [
      { id: "section-news-events", structuredKey: "event", after: "section-news-2026", itemParent: PAGE_ID.newsEvents, slugUnderParent: true },
      { id: "section-news-workshops", structuredKey: "workshop", after: "section-news-2026", itemParent: PAGE_ID.newsEvents, slugUnderParent: true },
    ],
  },
  "/about/our-themes": {
    slug: "our-themes",
    // The subtitle is the document's summary line; the page has no SPECIFIC
    // section for a standfirst. The ten cards are the theme system itself, not
    // content, so no section rule: the document has none to give (19 Sep:
    // title, heroText and seo only), and every unit falls back and says so.
    intro: "heroText",
    sections: {},
  },
  // About's shape (STAGE-0-NOTES §69). The document's two SPECIFIC sections
  // both carry orderIndex 1, so nothing here reads it: the intro is the first
  // SPECIFIC section no rule claims by title ("About", block 1; block 2 has no
  // slot and is logged), and every slot keeps the fixture's order.
  // TODO(review): backend — both SPECIFIC sections carry orderIndex 1 (logged
  // on every build); and there is no STRUCTURED section listing the six
  // children, nor `programme` records for FDP, Industry & Online or
  // International (the three that exist have no altText and 404 thumbnails).
  // TODO(review): content — the hero renders hero[0], a workshop photo; the
  // board's hero is hero[1], the night film shoot. An editor swaps the two in
  // the CMS; the front end adds no rule for picking a hero.
  "/programmes": {
    slug: "programmes",
    // The document has no STRUCTURED section listing children, and the
    // navigation gives Programmes none; switches over once one covers all six.
    subPagesKey: "static",
    sections: {
      "section-programmes-curriculum": { textTitle: "Curriculum Objectives" },
      // Inert on purpose, and leave it so: the CMS has 3 `programme` records
      // (bachelor-of-design, master-of-design, doctorate) against the board's 6
      // cards, and `doctorate` is not the `phd` page. None of those slugs is in
      // PATH_BY_CMS_SLUG, so a programme section would route nothing and the
      // fixture's six cards stay; mapping them would let 3 records replace 6.
      "section-programmes-list": { structuredKey: "programme" },
    },
  },
  // The programme pages (STAGE-0-NOTES §70): Generic Page documents, "About"
  // block 1 the standfirst as on /programmes. Five have no board; their fixtures
  // are snapshots of these documents.
  // TODO(review): content — the CMS title is "Bachelor of Design (B.Des.)" and
  // wins live; the board and the /programmes card say "Bachelor of Design".
  // TODO(review): content — the hero renders hero[0], the handmade paper; the
  // board's glaze tiles are hero[1]. An editor swaps them in the CMS.
  "/programmes/bdes": {
    slug: "bdes",
    sections: {
      // About block 2 is the admissions line: it becomes the Apply section's
      // body, so the DAT is not said twice. The board's Disciplines prose is
      // unused — the cards are the records (DISCIPLINES below).
      "section-bdes-apply": { textTitle: "About", afterIntro: true },
    },
  },
  "/programmes/mdes": {
    slug: "mdes",
    // The prose is the fallback; the records replace it (DISCIPLINES).
    sections: { "section-mdes-disciplines": { textTitle: "Disciplines" } },
  },
  "/programmes/phd": {
    slug: "phd",
    // TODO(review): designer — "About" is the CMS section's own title for the
    // blocks after the standfirst (Ph.D 2–4, FDP 2); no board names them.
    sections: { "section-phd-about": { textTitle: "About", afterIntro: true } },
  },
  "/programmes/fdp": {
    slug: "fdp",
    // The Centre's email and phone, in the rail beside the hero.
    contactsTo: "keyInfo",
    sections: { "section-fdp-about": { textTitle: "About", afterIntro: true } },
  },
  "/programmes/international": {
    slug: "international",
    sections: {
      "section-international-models": { textTitle: "Collaboration Models" },
      "section-international-partners": { textTitle: "Partner Institutions" },
    },
  },
  "/programmes/curriculum-objectives": {
    slug: "curriculum-objectives",
    // No "About" section: the standfirst is the document's summary line, and
    // Objectives renders whole.
    intro: "heroText",
    sections: { "section-curriculum-objectives": { textTitle: "Objectives" } },
  },
  // The third primary page (STAGE-0-NOTES §73). The standfirst is "About" block
  // 1, as on /programmes; block 2 and the "Overview" section have no slot and
  // are logged. Nothing else on the board is in this document, so the notices,
  // Life at NID and PM Vidyalaxmi are the fixture's, LIVE too. /study reads
  // only this document — never its children's.
  // TODO(review): backend — "About" and "Overview" both carry orderIndex 1
  // (logged); there is no STRUCTURED section listing the five children (the
  // navigation gives three); and no Life at NID or PM Vidyalaxmi summary
  // section, so the landing duplicates its children by hand.
  // TODO(review): content — hero[0] is a drawing class; the board's hero is the
  // night film shoot (Programmes' photograph). An editor's fix in the CMS.
  "/study": {
    slug: "study-at-nid",
    subPagesKey: "static",
    sections: {},
  },
  // Study at NID's first child (STAGE-0-NOTES §74). Mapped by meaning, not by
  // title: the CMS's "How to Apply" (register, DAT, studio test, interview) is
  // the standfirst — the first SPECIFIC section no rule claims — and is
  // consumed; its "Admissions" section is the board's "How to Apply", whole:
  // the text block is the body, the portal LINK block the CTA. The board's
  // dates and fake-website paragraphs are fixture-only and never mix into it.
  // heroText is logged, unused. B.Des, M.Des and Ph.D have no CMS data.
  // TODO(review): backend — the CMS titles the section "Admissions"; both
  // sections carry orderIndex 1; no handbook files, contacts, section images
  // or an admissions-status field.
  "/study/admission": {
    slug: "admission-process",
    sectionImages: true,
    sections: { "section-admission-how": { textTitle: "Admissions", linkBlocks: true } },
  },
  // Admission Process's pattern with one section (STAGE-0-NOTES §75). The CMS's
  // "About" is the board's "About the Scheme", whole — text blocks and the
  // portal LINK block. The standfirst is the fixture's: heroText says something
  // else, and the SEO description is not read into it.
  // TODO(review): backend — the board's sentence belongs in heroText (it is
  // already the SEO description); the document has two sections, and the one
  // titled "About the Scheme" is not the scheme's description (unused, logged);
  // the hero has no alt text and its file returns 404.
  "/study/pm-vidyalaxmi": {
    slug: "pm-vidyalaxmi-scheme",
    intro: "static",
    sections: { "section-pmv-about": { textTitle: "About", linkBlocks: true } },
  },
  // The last three Study at NID children (STAGE-0-NOTES §76), the same pattern.
  // Life at NID: the standfirst is "Overview" (the first section no rule
  // claims); each board section is its same-titled CMS section, whole.
  // TODO(review): editor — the document also has "Extracurricular Activities"
  // (orderIndex 7), a one-line duplicate of "Extra Curricular Activities";
  // unused and logged.
  "/study/life-at-nid": {
    slug: "life-at-nid",
    sectionImages: true,
    sections: {
      "section-life-hostel": { textTitle: "Hostel" },
      "section-life-dining": { textTitle: "Dining" },
      "section-life-guest-house": { textTitle: "Guest House" },
      "section-life-health-care": { textTitle: "Health Care" },
      "section-life-counselling": { textTitle: "Counselling" },
      "section-life-extra-curricular": { textTitle: "Extra Curricular Activities" },
    },
  },
  // Academic Notifications: the standfirst is heroText (the text block would
  // otherwise render twice); "Notifications" is the board's "Downloads", a list
  // of documents fed from its LINK blocks. TODO(review): the CMS titles it
  // "Notifications".
  "/study/notifications": {
    slug: "academic-notifications",
    intro: "heroText",
    sections: { "section-notifications-downloads": { textTitle: "Notifications", linkBlocks: true } },
  },
  // Young Designers: the standfirst is the fixture's. Three CMS images are
  // refused by id, so a new upload shows with no code change (§77): the hero
  // is a 1298 × 337 banner with its text baked in, which the hero crop cuts;
  // About's and Convocation Messages' are square portraits the 684:330 row
  // would crop (§76).
  // TODO(review): backend — a photograph with alt text for the hero and for
  // each section; the board's sentence in heroText (it is the SEO description).
  "/study/young-designers": {
    slug: "young-designers",
    intro: "static",
    sectionImages: true,
    rejectMedia: [
      "cmu8sbyho0000c4o2sp7dwa73", // young-designers-hero.png, the banner
      "cmu8sbynb0001c4o2eisw3llb", // young-designers-vijai-singh-katiyar.png
      "cmu8sbyqs0003c4o2cwjp7wc1", // young-designers-ashok-mondal.png
    ],
    sections: {
      "section-yd-about": { textTitle: "About", linkBlocks: true },
      "section-yd-disciplines": { textTitle: "Disciplines" },
      "section-yd-convocation": { textTitle: "Convocation Messages" },
    },
  },
  // The fourth primary page (STAGE-0-NOTES §78). Research at NID is three CMS
  // sections merged by meaning: the board's title, "About" as the body, the
  // research_center list as the tiles. "Research at NID" (one sentence on the
  // centres) is then the standfirst — the first SPECIFIC section no rule
  // claims. The rail is the fixture's: the list has no NID Press, and it feeds
  // the tiles. Both CMS heroes are other photographs (a railway coach render,
  // the bamboo room), refused by id so the board's shows until a new upload.
  // TODO(review): backend — "About" should carry the board's full text (the
  // four Research Chairs, "mid-1960s"); upload the board's photo as hero 1;
  // fix the list thumbnails of Natural Fiber and Railway (404, no alt text);
  // the SEO description says "Six" centres, the list has seven; "About" and
  // "Research at NID" share orderIndex 1.
  "/research": {
    slug: "research-publications",
    subPagesKey: "static",
    rejectMedia: [
      "cmu8sd8g60000omo2x1x7q57g", // research-landing-hero-1.jpg, a railway coach render
      "cmu8sd8ij0001omo277uxzi4o", // research-landing-hero-2.jpg, the bamboo room
    ],
    sections: {
      "section-research-at-nid": {
        structuredKey: "research_center",
        bodyTitle: "About",
        keepTitle: true,
        photoFallback: true,
      },
    },
  },
  ...researchCentreConfigs(),
  // The fifth primary page (STAGE-0-NOTES §80). The CMS's "Integrated Design
  // Services" is the standfirst (its paragraph 1, §69's rule) and the IDS body
  // (the rest, with its FAQ PDF as a CTA); "IDS Resources" — two films, the
  // clients list and the completed projects (PDFs) — is a links section in CMS
  // order. Each contact goes to the section its label names; the Continuing
  // Education Programme's three are dropped and logged. "Continuing Education
  // Programme" and "National Design Business Incubator" are not on the board:
  // unused, logged. TODO(designer): both; backend — contacts per section.
  "/consulting": {
    slug: "consulting-and-entrepreneurship",
    subPagesKey: "static",
    contactsTo: "sections",
    sections: {
      "section-consulting-ids": { textTitle: "Integrated Design Services", afterIntro: true, linkBlocks: true },
      "section-consulting-resources": { textTitle: "IDS Resources", linkBlocks: true },
    },
  },
  // The first Consulting child (§92): the static `integrated-design-services`
  // document — the footer's, and the complete one; the `service_centre` record
  // `integrated-design-services-centre` is a broken subset (backend ask). The
  // standfirst is heroText, a summary written for the page; About renders whole,
  // its FAQ PDF the column-4 link above the page contacts (§80's stack).
  "/consulting/ids": {
    slug: "integrated-design-services",
    intro: "heroText",
    sections: {
      "section-ids-about": { textTitle: "About", linkBlocks: true },
      "section-ids-resources": { textTitle: "Resources", linkBlocks: true },
    },
  },
  // A Consulting child from a `service_centre` document (§93), IDS's pattern:
  // heroText the standfirst, About whole — its "- " runs are lists by the
  // adapter's own rule (§68) — and its cep.nid.edu LINK above the contacts.
  // The hero carries a caption band baked into the photograph, which every
  // crop below 1440 cuts: refused by id, as Young Designers' banner (§77), so
  // the page closes up and a new upload shows with no edit here.
  // TODO(review): backend — a photograph without baked-in text, with alt text.
  "/consulting/continuing-education": {
    slug: "continuing-education-programme",
    intro: "heroText",
    rejectMedia: ["cmuaop6bi0000acpdkjco9gxw"], // service-cep-hero.jpg, captioned
    sections: { "section-cep-about": { textTitle: "About", linkBlocks: true } },
  },
  // The sixth primary page (STAGE-0-NOTES §81): no sections on the board. The
  // standfirst is "About", claimed BY TITLE: it and "Overview" tie at orderIndex
  // 1, so "the first section" would be whichever the API sent first. Overview,
  // Explore (five child links) and the Pride of NID person list have no slot:
  // unused, logged. TODO(review): backend — break the tie.
  "/people": {
    slug: "people",
    subPagesKey: "static",
    introTitle: "About",
    sections: {},
  },
  // The first Regulatory page (STAGE-0-NOTES §86). The standfirst is heroText:
  // "About" is three narrative paragraphs with no summary among them, so it
  // renders whole, and "Documents" is a list of documents (§76) — its eight
  // LINK blocks, nid.edu PDFs, in CMS order with CMS labels. hero[1] (a second
  // photograph of the entrance wall /people and /study/notifications show) is
  // mapped but never renders: the template shows hero[0].
  "/regulatory/nid-act": {
    slug: "nid-act",
    intro: "heroText",
    sections: {
      "section-nid-act-about": { textTitle: "About" },
      "section-nid-act-documents": { textTitle: "Documents", linkBlocks: true },
    },
  },
  // No text section (§87): the standfirst is heroText, the only prose the
  // document has, and "Reports" is its ten LINK blocks — newest first, English
  // then Hindi, in CMS order.
  "/regulatory/annual-reports": {
    slug: "annual-reports",
    intro: "heroText",
    sections: { "section-annual-reports-reports": { textTitle: "Reports", linkBlocks: true } },
  },
  // §89: the officers named in the rail (namedContacts; the unnamed contacts
  // stay in About's column 4), About whole, "Key Documents" its LINK blocks on
  // four hosts. "On this website" is the fixture's in both modes.
  "/regulatory/rti": {
    slug: "right-to-information",
    intro: "heroText",
    namedContacts: "keyInfo",
    sections: {
      "section-rti-about": { textTitle: "About" },
      "section-rti-key-documents": { textTitle: "Key Documents", linkBlocks: true },
    },
  },
};

/** The research centres (§79), one config each, from the fixture's slices: every
 *  centre's document has ONE "About" section whose paragraphs are the board's
 *  sections, so each fixture section claims its paragraphs of it, guarded by
 *  the count (§59: any other count and every slice falls back to its fixture
 *  body, loud and whole). The standfirst is heroText — "About" is claimed. The
 *  CMS slug is the route's in PATH_BY_CMS_SLUG, else the route slug itself. */
function researchCentreConfigs(): Record<string, PageMergeConfig> {
  return Object.fromEntries(
    (Object.entries(RESEARCH_CENTRE_SLICES) as Array<[ResearchCentre, (typeof RESEARCH_CENTRE_SLICES)[ResearchCentre]]>).map(
      ([slug, { of, sections }]) => {
        const path = researchPath(slug);
        const config: PageMergeConfig = {
          slug: cmsSlugOf(path) ?? slug,
          intro: "heroText",
          sections: Object.fromEntries(
            Object.entries(sections).map(([id, blocks]) => [id, { textTitle: "About", blocks, of }]),
          ),
        };
        return [path, config];
      },
    ),
  );
}

/** The links the adapter made from CMS LINK blocks (ids `link-cms-…`) that
 *  point at a FILE — a document link, or a URL ending .pdf — each checked once
 *  per build with media.ts's HEAD rule; a file that 404s or 410s is dropped and
 *  logged, so a list never offers a dead download (§76). A CMS section image
 *  (`sectionImages`, the only section image with an absolute URL) is checked the
 *  same way: one that 404s is dropped, so its page draws the placeholder rather
 *  than a broken image (§77). Fixture files are never checked: they are the
 *  repo's, and a FIXTURE build stays offline. */
async function withServedFiles(path: string, response: PageResponse): Promise<PageResponse> {
  const fileOf = (link: Link) =>
    link.id.startsWith("link-cms-")
      ? link.targetType === "document"
        ? documentHref(link)
        : link.targetType === "external" && link.url && /\.pdf$/i.test(new URL(link.url).pathname)
          ? link.url
          : undefined
      : undefined;
  const imageOf = (section: Section) =>
    section.image && /^https?:\/\//.test(section.image.file) ? section.image.file : undefined;
  const files = response.page.sections.flatMap((s) => {
    const links = [...s.links, ...(s.type === "links" ? s.items : [])].map(fileOf);
    return [...links, imageOf(s)].filter((href): href is string => Boolean(href));
  });
  if (!files.length) return response;
  const served = new Map(await Promise.all(files.map(async (href) => [href, await fileServes(href)] as const)));
  const gone = [...served].filter(([, ok]) => !ok).map(([href]) => href);
  if (!gone.length) return response;
  console.info(`[cms] ${path}: dropped ${gone.length} CMS file${gone.length === 1 ? "" : "s"} that 404 (${gone.join(", ")})`);
  const keep = (l: Link) => {
    const href = fileOf(l);
    return !href || served.get(href) !== false;
  };
  const sections = response.page.sections.map((s): Section => {
    const image = imageOf(s);
    const kept: Section =
      s.type === "links" ? { ...s, items: s.items.filter(keep), links: s.links.filter(keep) } : { ...s, links: s.links.filter(keep) };
    return image && served.get(image) === false ? { ...kept, image: undefined } : kept;
  });
  return { ...response, page: { ...response.page, sections } };
}


/** `photoFallback` (page-adapter.ts): a CMS card whose photo was refused,
 *  never sent, or does not serve takes the fixture card's photo at the same
 *  route; the fixture's are copies of each record's own CMS photo (§78). Only
 *  a card that HAS a fallback is checked — one HEAD per CMS photo, once per
 *  build — so a FIXTURE build stays offline and a card with no fixture photo
 *  keeps ThumbCard's empty box. */
async function withPhotoFallback(
  path: string,
  response: PageResponse,
  fixture: PageResponse,
  config: PageMergeConfig | undefined,
): Promise<PageResponse> {
  const ruled = Object.entries(config?.sections ?? {}).flatMap(([id, rule]) =>
    "structuredKey" in rule && rule.photoFallback ? [id] : [],
  );
  if (!ruled.length) return response;
  const sections = await Promise.all(
    response.page.sections.map(async (s): Promise<Section> => {
      if (s.type !== "cards" || !ruled.includes(s.id)) return s;
      const fallbacks = new Map(
        (fixture.page.sections.find((f) => f.id === s.id)?.items ?? []).flatMap((item) => {
          const photo = "parent" in item ? item.hero[0] : undefined;
          const route = "parent" in item ? pagePath(item) : undefined;
          return photo && route ? [[route, photo] as const] : [];
        }),
      );
      const items = await Promise.all(
        s.items.map(async (item) => {
          if (!("parent" in item)) return item;
          const route = pagePath(item);
          const fallback = route ? fallbacks.get(route) : undefined;
          if (!route || !fallback) return item;
          const photo = item.hero[0];
          const why = !photo
            ? "no usable CMS photo"
            : /^https?:\/\//.test(photo.file) && !(await fileServes(photo.file))
              ? `CMS photo does not serve (${photo.file})`
              : undefined;
          if (!why) return item;
          console.info(`[cms] ${path}: ${route} photo from the fixture — ${why}`);
          return { ...item, hero: [fallback] };
        }),
      );
      return { ...s, items } as Section;
    }),
  );
  return { ...response, page: { ...response.page, sections } };
}

// A programme's disciplines as grouped cards (getDisciplines.ts), replacing the
// named fixture section when the records arrive: B.Des's board cards, M.Des's
// prose. Without the CMS the fixture's section stands.
const DISCIPLINES: Record<string, { level: ProgrammeLevel; section: string }> = {
  "/programmes/bdes": { level: "bdes", section: "section-bdes-disciplines" },
  "/programmes/mdes": { level: "mdes", section: "section-mdes-disciplines" },
};

// The rail's Apply button (a filled Cta, the events rail's `apply` link). Only
// a real URL renders it: the CMS's own LINK block in the named section where it
// has one (Ph.D), else the fixture's (Ph.D's is the snapshot of that link).
// The header's Apply points at /study/admission (APPLY_HREF, nav-content.ts),
// the page that explains admissions; these buttons go straight to the portal.
const APPLY: Record<string, { href: string; linkIn?: string }> = {
  "/programmes/bdes": { href: ADMISSIONS_URL },
  "/programmes/mdes": { href: ADMISSIONS_URL },
  "/programmes/phd": { href: ADMISSIONS_URL, linkIn: "About" },
};

// Key info a board draws that the CMS does not serve (B.Des only; a page with no
// board gets no invented rows). Used only when the page has none of its own.
const KEY_INFO: Record<string, typeof BDES_KEY_INFO> = {
  "/programmes/bdes": BDES_KEY_INFO,
};

/** The first absolute LINK block in the SPECIFIC section titled `title`. LINK
 *  is served but not in types.ts's block union (§59), so it is read loosely. */
function linkBlockUrl(api: PublicContentResponse, title: string): string | undefined {
  const wanted = title.trim().toLowerCase();
  const section = api.sections.find((s) => s.type === "SPECIFIC" && (s.title ?? "").trim().toLowerCase() === wanted);
  for (const block of section?.blocks ?? []) {
    const url = (block as unknown as { url?: unknown }).url;
    if ((block.blockType as string) === "LINK" && typeof url === "string" && /^https?:\/\//.test(url)) return url;
  }
  return undefined;
}

/** What a page render gets: the model's response, plus the rail's filled
 *  buttons, which the model has no page-level slot for (editorial.ts). */
export type PageData = PageResponse & { railLinks?: RailLink[] };

// Primary pages that keep an unbuilt link as an unlinked row, in the sub-page
// rail AND in their sections' own links: a landing whose children are all
// designed but unbuilt reads as broken with an empty rail (§69), and its
// "Read more" pointers to those children are the same records (§73). Every
// other page still drops an unbuilt link (§58).
const KEEP_UNBUILT = new Set(["/programmes", "/study", "/research", "/consulting", "/people"]);

// Pages whose sibling band keeps an unbuilt sibling as an unlinked row: Study at
// NID's children, read from its own rail — the band of a landing whose children
// are built one at a time would otherwise thin out or vanish (§74, §75). A
// sibling that is built links as usual.
const KEEP_UNBUILT_BAND = new Set([
  ...STUDY.derived.subPageLinks.map((link) => link.href),
  // Research & Publications' centres: a withheld one (Nation Building) stays an
  // unlinked row in every centre's band (§79).
  ...RESEARCH_CHILDREN.map((c) => researchPath(c.slug)),
  // Regulatory's three: each built one at a time, the others unlinked rows (§86).
  ...REGULATORY_CHILDREN.map((c) => c.path),
  // Consulting & Entrepreneurship's five, from its rail (§92).
  ...CONSULTING.derived.subPageLinks.map((link) => link.href),
]);

// cache(): generateMetadata and the page both call this; one fetch and one log
// line per render.
export const getPage = cache(async (path: string): Promise<PageData | null> => {
  const fixture = FIXTURES[path];
  if (!fixture) return null;
  const config = PAGE_CONFIG[path];
  // The article index registers which /about/news-events/[slug] routes exist;
  // the gate below and every card's href read it.
  // The faculty index, likewise: it registers the member pages, so a person
  // card on this page (Director's Message) links exactly those that build (§83).
  const [api] = await Promise.all([
    config ? cmsFetch(`/public/content/${config.slug}`, isPublicContentResponse) : null,
    articleFeed(),
    facultyIndex(),
  ]);

  // The gate runs on every page, CMS or not: a fixture links to unbuilt routes
  // just as the API does.
  if (api && config) {
    const source = `/public/content/${config.slug}`;
    assertFloor(`document ${config.slug}: sections`, CMS_FLOORS.documentSections[config.slug] ?? 0, api.sections.length, source);
    const itemFloor = CMS_FLOORS.documentItems[config.slug];
    if (itemFloor !== undefined) {
      const items = api.sections.reduce((n, s) => n + (s.items?.length ?? 0), 0);
      assertFloor(`document ${config.slug}: listed items`, itemFloor, items, source);
    }
    // A list of documents is LINK blocks, not STRUCTURED items, so it has a
    // floor of its own — counted as the CMS sends them, before a file that
    // 404s is dropped (§86).
    const linkFloor = CMS_FLOORS.documentLinkBlocks[config.slug];
    if (linkFloor !== undefined) {
      const links = api.sections.reduce(
        (n, s) => n + (s.blocks ?? []).filter((b) => (b.blockType as string) === "LINK").length,
        0,
      );
      assertFloor(`document ${config.slug}: LINK blocks`, linkFloor, links, source);
    }
  }

  // Referenced records (a person's designation is only on the record), fetched
  // here so the merge stays synchronous. One request each, memoised like the
  // document; a failure is a null the adapter falls back from.
  const slugs = api && config ? referencedSlugs(api, config) : [];
  const fetched = await Promise.all(
    slugs.map((slug) => cmsFetch(`/public/content/${slug}`, isPublicContentResponse)),
  );
  const records = new Map(slugs.map((slug, i) => [slug, fetched[i] ?? null]));
  const merged = api && config ? toPageResponse(api, fixture, config, records) : null;
  const built = merged?.response ?? fixture;
  // The listing's Archive row names the archive's own years (getArchive.ts);
  // About's award winners are the gallery's records (getAwards.ts).
  const withRecords =
    path === "/about/news-events"
      ? await withArchiveYears(built)
      : path === "/about"
        ? await withAwardRecords(built)
        : built;
  const served = await withServedFiles(path, await withProgrammeParts(path, withRecords, api));
  const page = merged ? await withPhotoFallback(path, served, fixture, config) : served;
  const keepUnbuilt = detailSections(config?.detail);
  if (KEEP_UNBUILT.has(path)) {
    keepUnbuilt.add(SUB_PAGE_RAIL);
    for (const section of page.page.sections) keepUnbuilt.add(section.id);
  }
  if (KEEP_UNBUILT_BAND.has(path)) keepUnbuilt.add(SIBLING_BAND);
  const { response, audit } = gatePage(page, {
    // The campus pages' detail-derived sections list records, so an unbuilt
    // link there stays as an unlinked row (route-gate.ts, STAGE-0-NOTES §58).
    keepUnbuilt,
  });
  if (merged) {
    const { sources } = merged;
    for (const line of sources.lines ?? []) console.info(`[cms] ${path}: ${line}`);
    console.info(
      `[cms] ${path}: api=${sources.api.join(",") || "none"}` +
        (sources.appended.length ? ` · appended=${sources.appended.join(",")}` : "") +
        ` · static=${sources.static.join(",") || "none"}` +
        (sources.notes.length ? ` · ${sources.notes.join(" · ")}` : "") +
        ` · ${auditSummary(audit)}`,
    );
  }
  logMissingRoutes(path, audit);
  // The gate returns page + derived only; the grouped cards and the rail's
  // buttons ride beside them.
  const apply = APPLY[path];
  const applyUrl = apply && ((apply.linkIn && api ? linkBlockUrl(api, apply.linkIn) : undefined) ?? apply.href);
  return {
    ...response,
    ...(page.groupedItems ? { groupedItems: page.groupedItems } : {}),
    ...(applyUrl ? { railLinks: [{ key: "apply" as const, url: applyUrl }] } : {}),
  };
});

/** A programme page's parts from outside its document: the discipline records
 *  as grouped cards, and the board's key-info rows where the CMS has none. */
async function withProgrammeParts(
  path: string,
  response: PageResponse,
  api: PublicContentResponse | null,
): Promise<PageResponse> {
  let out = response;
  const rows = KEY_INFO[path];
  if (rows && out.page.keyInfo.length === 0) {
    const t = await getTranslations("KeyInfo");
    const keyInfo: LabelValue[] = rows.flatMap((row) => {
      const value = row.key === "campus" ? campusName(row.campus) : row.value;
      return value ? [{ label: t(row.key), value }] : [];
    });
    out = { ...out, page: { ...out.page, keyInfo } };
  }
  const disciplines = DISCIPLINES[path];
  // The discipline pages this build makes, registered with the route gate so
  // the cards link exactly those (getDiscipline.ts, STAGE-0-NOTES §72).
  if (disciplines) await disciplineIndex(disciplines.level);
  if (disciplines && api) {
    const result = await programmeDisciplines(disciplines.level);
    const at = out.page.sections.findIndex((s) => s.id === disciplines.section);
    const fs = out.page.sections[at];
    const count = result?.groups.reduce((n, g) => n + g.items.length, 0) ?? 0;
    if (result && fs && count > 0) {
      const cards: Section = {
        id: fs.id,
        page: fs.page,
        order: fs.order,
        type: "cards",
        title: fs.title,
        items: result.groups.flatMap((g) => g.items),
        links: fs.links,
        contacts: fs.contacts,
      };
      const sections = out.page.sections.map((s, i) => (i === at ? cards : s));
      out = {
        ...out,
        page: { ...out.page, sections },
        groupedItems: { ...out.groupedItems, [fs.id]: result.groups },
      };
    }
    console.info(
      `[cms] ${path} disciplines: ` +
        (result
          ? `${count} records in ${result.groups.length} faculties (${result.groups.map((g) => `${g.label} ${g.items.length}`).join(", ")})` +
            (result.notes.length ? ` · ${result.notes.join(" · ")}` : "")
          : "list unavailable, fixture section stands"),
    );
  }
  return out;
}
