// /about/history — History page content fixture (Figma 4118:208773, mobile
// 4184:252521). All prose is transcribed from the boards. Clamped bodies come
// from their hidden "Full text" nodes (Origins 4364:189044, The Sarabhais
// 4386:185459, Past Directors 4364:189045, Faculty Stalwarts 4382:185451); the
// visible nodes are the same copy clamped, which is how a designer draws one.
import type { Person, PageResponse, Section } from "@/lib/content-model";
import { DOCUMENT_PATH } from "@/lib/content/documents";
import { PAGE_ID } from "@/lib/content/pages";

const PUBLISHED = "2026-09-21T00:00:00+05:30";

// TODO(review): eleven assets the boards assume and this build does not have —
// the hero (4374:188714), four section images (Origins 4140:246863, The
// Sarabhais 4140:246862, Convocation 4140:246861, Past Directors 4140:246860),
// the six Faculty Stalwarts portraits (4374:188741…188791, square originals),
// and The India Report PDF (/documents/the-india-report.pdf). The images are
// drawn as the boards draw them — flat accent/subtle fields at the right crop,
// empty circles for the portraits — because the board's vertical rhythm
// assumes them; supply them and TileImage takes over with nothing moving. The
// PDF link 404s until the file lands.

const text = (id: string, order: number, title: string, body: string): Section => ({
  id,
  page: PAGE_ID.history,
  order,
  type: "text",
  title,
  body,
  items: [],
  links: [],
  contacts: [],
});

const ORIGINS = text(
  "section-history-origins",
  1,
  "Origins",
  "The establishment of NID was a result of several forces, both global and local. The late 1950s saw a confluence of these forces, and this time would be a significant one for Indian culture and education. This was a time of reappraisal and reconstruction in a newly independent India. A young nation was confronted with the mammoth task of nation building, of balancing age-old traditions with modern technology and ideas." +
    "\n\n" +
    // "Jayaker" is the board's spelling here; every other node, and the CMS,
    // spells it "Jayakar". Transcribed as drawn — a copy question, not ours.
    "In 1955, Pupul Jayaker, the noted writer on Indian craft traditions and the founder of the Indian Handlooms and Handicrafts Export Council (HHEC) met the renowned American designer Charles Eames at the Museum of Modern Art in New York.",
);

const INDIA_REPORT = text(
  "section-history-india-report",
  2,
  "The India Report",
  "On April 7, 1958, the Eameses presented the India Report to the Government of India — a document that defined the spirit of design education in India. It advocated a problem-solving design consciousness linking learning with experience, and positioned the designer as a bridge between tradition and modernity.",
);

const SARABHAIS = text(
  "section-history-sarabhais",
  3,
  "The Sarabhais",
  [
    "Based on the recommendations made in the India Report, the Government of India with the assistance of the Ford Foundation and the Sarabhai family established the National Institute of Industrial Design, as it was originally called, as an autonomous all-India body in September 1961 at Ahmedabad.",
    "Gautam Sarabhai and his sister Gira played a major role in the establishment and early years of NID, reviving the Bauhaus philosophy of learning by doing — a curriculum that endures to this day.",
    "NID has since grown into a multi-campus institution with campuses in Ahmedabad, Gandhinagar and Bengaluru, and has been declared an Institution of National Importance by Act of Parliament.",
  ].join("\n\n"),
);

const CONVOCATION = text(
  "section-history-convocation",
  4,
  "Convocation Through the Years",
  "An archive of 48 convocation photographs spanning 1978 to 2025, one for each year the Institute has conferred its diplomas and degrees.",
);

const PAST_DIRECTORS = text(
  "section-history-past-directors",
  5,
  "Past Directors",
  [
    "Vice-Admiral B. S. Soman — October 1970 to July 1972",
    "Shri Ashoke Chatterjee — July 1975 to October 1985",
    "Shri Vinay Jha — October 1985 to June 1989",
    "Shri Vikas Satwalekar — July 1989 to June 2000",
    "Dr. Darlie O. Koshy — June 2000 to October 2008",
    "Shri Pradyumna Vyas — April 2009 to January 2019",
    "Shri Praveen Nahar — April 2019 to October 2024",
  ].join("\n\n"),
);

const person = (slug: string, name: string): Person => ({
  id: `person-${slug}`,
  name,
  slug,
  role: "faculty",
});

// The six on the board, in its order (4374:188741 → 4374:188791).
const FACULTY_STALWARTS: Section = {
  id: "section-history-faculty-stalwarts",
  page: PAGE_ID.history,
  order: 6,
  type: "rail",
  title: "Faculty Stalwarts",
  body: "NID's founding vision was carried by Pupul Jayakar, whose advocacy brought Charles and Ray Eames to India and shaped the institute's founding philosophy. Dashrath Patel, founder-secretary, gave NID its institutional form. H Kumar Vyas, its first full-time professor, built the Product Design programme after training at Ulm. Gajanan Upadhyaya founded Furniture Design, marrying Bauhaus rigour with Indian craft. Later, MP Ranjan advanced systemic design and rural craft documentation, while Aditi Ranjan's work on Indian textile traditions became foundational. Together, they built not just departments, but a design philosophy — learning by doing — that still defines NID.",
  // The board shows one ungrouped run; the model requires the field.
  groupBy: "none",
  items: [
    person("pupul-jayakar", "Pupul Jayakar"),
    person("aditi-ranjan", "Aditi Ranjan"),
    person("dashrath-patel", "Dashrath Patel"),
    person("gajanan-upadhyaya", "Gajanan Upadhyaya"),
    person("h-kumar-vyas", "H Kumar Vyas"),
    person("mp-ranjan", "MP Ranjan"),
  ],
  links: [
    {
      id: "link-history-all-faculty-stalwarts",
      label: "All Faculty Stalwarts",
      targetType: "page",
      page: PAGE_ID.people,
    },
  ],
  contacts: [],
};

export const HISTORY: PageResponse = {
  page: {
    id: PAGE_ID.history,
    title: "History",
    slug: "history",
    parent: PAGE_ID.about,
    template: "secondary",
    utility: "back",
    // The board's rail block beside the hero, named "Key Info" on the 390 board
    // (4184:255406) — the model's `keyInfo`, not `contacts`. The PDF row is a
    // LINK riding on a pair, as Charter's Act row does (§33's `Page.introLinks`
    // TODO); `contactCta` derives the document glyph from the value.
    // TODO(review): Charter draws the same block and ships it on `contacts`
    // (STAGE-0-NOTES §52). The two pages now disagree; propose moving Charter's
    // three rows to `keyInfo` so the field means one thing site-wide.
    keyInfo: [
      { label: "Email", value: "info@nid.edu" },
      { label: "The India Report (PDF)", value: DOCUMENT_PATH.indiaReport },
    ],
    hero: [],
    intro: "NID's establishment in 1961 and the growth thereafter.",
    sections: [ORIGINS, INDIA_REPORT, SARABHAIS, CONVOCATION, PAST_DIRECTORS, FACULTY_STALWARTS],
    contacts: [],
    seoTitle: "History",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.about, title: "About NID", path: "/about" },
      { id: PAGE_ID.history, title: "History", path: "/about/history" },
    ],
    backNav: { label: "About NID", href: "/about" },
    subPageLinks: [],
    // siblings(About) minus self, in the boards' order (4315:276234, 4377:185430).
    siblingBand: [
      { id: PAGE_ID.charter, title: "Charter", href: "/about/charter" },
      {
        id: PAGE_ID.directorsMessage,
        title: "Director's Message",
        href: "/about/directors-message",
      },
      { id: PAGE_ID.campuses, title: "Campuses", href: "/about/campuses" },
      { id: PAGE_ID.newsEvents, title: "News & Events", href: "/about/news-events" },
      { id: PAGE_ID.ourThemes, title: "Our Themes", href: "/about/our-themes" },
    ],
  },
};
