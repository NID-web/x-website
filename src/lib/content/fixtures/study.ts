// /study — Study at NID landing page content fixture (the 1440 "04 Study at NID —
// Landing" board; no narrower boards exist). STAGE-0-NOTES §73.
//
// Where the board and this file differ, on purpose:
// - The standfirst is a copy of the CMS's "About" block 1 (study-at-nid); the
//   board has Lorem ipsum there. FIXTURE and LIVE read the same sentence.
// - Life at NID's prose is a copy of the CMS's life-at-nid "Overview". The board
//   repeats Programmes' Curriculum Objectives text word for word, a placeholder.
// - The notices are the shared academic calendar (academic-calendar.ts), so the
//   last row reads "Oct 16" as Home's tile does, not the board's "Oct16".
import type { PageResponse, Section } from "@/lib/content-model";
import { ACADEMIC_CALENDAR } from "@/lib/content/academic-calendar";
import type { NoticeEntry } from "@/lib/content/editorial";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";

const PUBLISHED = "2026-10-01T00:00:00+05:30";

const NOTICES: NoticeEntry[] = ACADEMIC_CALENDAR.map(({ id, title, date }) => ({ id, title, date, notice: true }));

// The three CTAs point at unbuilt pages. They show as unlinked text (no anchor,
// no arrow), as the rail does, and each becomes a link on its own when its page
// ships (§73).
const NOTIFICATIONS: Section = {
  id: "section-study-notifications",
  page: PAGE_ID.study,
  order: 1,
  type: "cards",
  title: "Academic Notifications",
  items: NOTICES as unknown as Extract<Section, { type: "cards" }>["items"],
  links: [
    { id: "link-study-all-notifications", label: "All notifications", targetType: "page", page: PAGE_ID.studyNotifications },
  ],
  contacts: [],
};

const LIFE: Section = {
  id: "section-study-life",
  page: PAGE_ID.study,
  order: 2,
  type: "text",
  title: "Life at NID",
  // TODO(designer): the board's prose is Curriculum Objectives' text verbatim;
  // this is the CMS's life-at-nid Overview, copied.
  body: "NID’s campuses offer residential hostels, dining halls, healthcare and counselling services, and a wide range of extracurricular activities.",
  // The CMS's life-at-nid-hero-1.jpg: the board's photograph by subject and
  // ratio (1280 × 628 against the board's 676 × 332).
  // TODO(review): the alt text is ours; the CMS's says only "Student life at
  // the National Institute of Design".
  image: mediaAsset(
    "/study/life-at-nid-dress-form.jpg",
    "A student fitting a blue panelled bodice on a dress form in a studio, more dress forms around her.",
    1280,
    628,
  ),
  items: [],
  // TODO(designer): the board puts this CTA in column 4 at the photo's top;
  // the template's utility rule puts it on the title row (§73).
  links: [{ id: "link-study-life-read-more", label: "Read more", targetType: "page", page: PAGE_ID.studyLifeAtNid }],
  contacts: [],
};

const VIDYALAXMI: Section = {
  id: "section-study-vidyalaxmi",
  page: PAGE_ID.study,
  order: 3,
  type: "text",
  title: "PM Vidyalaxmi Scheme",
  body:
    "Government of India has launched the Pradhan Mantri Vidyalaxmi Scheme, which has been officially introduced by the Department of Higher Education, Ministry of Education, vide Office Memorandum No. F.No.39-212025-CSIS-Part(I) (PM Vidyalaxmi Scheme Dated 24.06.2025), a centralized platform for applying for education loans for students pursuing higher education.\n\n" +
    "All eligible students are encouraged to make use of this platform for educational funding needs.",
  items: [],
  links: [{ id: "link-study-vidyalaxmi-learn-more", label: "Learn more", targetType: "page", page: PAGE_ID.studyPmVidyalaxmi }],
  contacts: [],
};

export const STUDY: PageResponse = {
  page: {
    id: PAGE_ID.study,
    title: "Study at NID",
    slug: "study",
    parent: null,
    template: "primary",
    utility: "none",
    keyInfo: [],
    hero: [
      // The board's hero is Programmes' photograph; the file is shared, not copied.
      mediaAsset(
        "/programmes/hero-night-film-shoot.jpg",
        "A night film shoot at a roadside tea stall: the camera’s monitor frames two actors, with the crew and string lights behind.",
        1520,
        700,
      ),
    ],
    intro:
      "With a year-long design foundation studies that precedes eight undergraduate programmes, its nineteen postgraduate programmes, and a newly launched doctoral programme, NID's professional educational programmes are designed not only to prepare students for practice in industry, but also for entrepreneurship. Offered distinctly from three campuses in Ahmedabad, Gandhinagar and Bengaluru, these courses have emerged and continue to evolve, in response to the socio-cultural and economic landscape of the times.",
    sections: [NOTIFICATIONS, LIFE, VIDYALAXMI],
    contacts: [],
    seoTitle: "Study at NID",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [{ id: PAGE_ID.study, title: "Study at NID", path: "/study" }],
    backNav: null,
    // sitemap.json's five children, in its order. All are designed but unbuilt:
    // unlinked rows until each route ships (KEEP_UNBUILT, §69, §73).
    // TODO(review): content — the menu says "Admission Notifications", the
    // sitemap's children and the board "Academic Notifications".
    subPageLinks: [
      { label: "Admission Process", href: "/study/admission" },
      { label: "Life at NID", href: "/study/life-at-nid" },
      { label: "Academic Notifications", href: "/study/notifications" },
      { label: "PM Vidyalaxmi Scheme", href: "/study/pm-vidyalaxmi" },
      { label: "Young Designers", href: "/study/young-designers" },
    ],
    siblingBand: [],
  },
};
