// /consulting — Consulting & Entrepreneurship landing page content fixture (the
// 1440 "06 Consulting & Entrepreneurship — Landing" board; no narrower boards
// exist). STAGE-0-NOTES §80.
//
// Copy is the CMS's (consulting-and-entrepreneurship), copied as sent, so FIXTURE
// and LIVE read the same words. Where the board and this file differ, on purpose:
// - The standfirst is the CMS's IDS paragraph 1; the board's is a shorter
//   paraphrase of the same sentence.
// - The board's two film tiles and its "Completed Projects" tiles are the CMS's
//   "IDS Resources" LINK blocks: two films (YouTube) and two PDFs. The model has
//   no video card and the CMS no thumbnails, so they are a links section, not
//   tiles (TODO(designer)); the board's project tiles were two research centres,
//   filler. The PDFs and the IDS FAQ are LIVE only: a CMS file is never a
//   hard-coded URL here (§76).
// - No hero photo is the board's: its hero is the /research photo, its tiles
//   research centres' photos (§79's rule). The hero is the CMS's hero 1.
import type { PageResponse, Section } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";

const PUBLISHED = "2026-10-03T00:00:00+05:30";

// The CMS's paragraphs 2–6 (paragraph 1 is the standfirst). 2–4 are the board's
// hidden full text, verbatim; 5–6 (how a project runs, students on IDS
// projects) are the CMS's alone. TODO(review).
const IDS: Section = {
  id: "section-consulting-ids",
  page: PAGE_ID.consulting,
  order: 1,
  type: "text",
  title: "Integrated Design Services",
  body:
    "Since then Client servicing has been an integral part of NID’s activity. Through the Integrated Design Services (IDS) NID undertakes consultancy projects from various government, semi-government and private organizations and professionally deliver design solutions in diverse design domains ranging from Industrial Design, Communication Design, Textile/Apparel/Lifestyle Accessory Design and IT Integrated Design." +
    "\n\n" +
    "IDS also has its Outreach Activities to provide the Institute’s experience and training facilities to the services of craft sectors in the areas of training, research and need assessment study, craft documentation, capacity building and skill up-gradation in design using contextual approach." +
    "\n\n" +
    "The projects are undertaken by faculty mainly to bring market realities to the design studios of NID in a multidisciplinary environment for the benefit of the Clients. Projects in line with NID’s areas of expertise are carefully chosen, so that the Institution can provide state of the art design solutions to the Clients." +
    "\n\n" +
    "Consultancy project at NID starts with an enquiry from the Client with details of their probable design requirement. In many cases, an enquiry is followed by the meeting with the Client in order to understand the scope of the project and formulate a design brief. Based on the final design brief, a techno-commercial proposal is made and sent to the Client for approval. On approval of the proposal, the design team headed by the Faculty (Project Head) initiates the design process which involves intense research, conceptualization, design detailing, prototyping, testing and final delivery of the project." +
    "\n\n" +
    "To bring in fresh perspective to the projects by leveraging on the creative potential of bright and young minds, NID students are also actively engaged in most of the IDS projects either through the Institutes 'Earn While You Learn' Scheme or Graduation Projects or Internships.",
  items: [],
  links: [],
  // The CMS's four IDS contacts, as sent; its three Continuing Education
  // Programme contacts belong to a section this page does not draw. LIVE, each
  // contact goes to the section its label names (contactsTo: "sections").
  // TODO(review): "+91 079 …" carries a trunk 0 after the country code, so
  // neither number links (contactCta); backend — dialable numbers.
  contacts: [
    { label: "Integrated Design Services", value: "ids@nid.edu" },
    { label: "Integrated Design Services (Outreach)", value: "outreach@nid.edu" },
    { label: "Integrated Design Services", value: "+91 079 26629 764/765/766/768/771" },
    { label: "Integrated Design Services (Direct)", value: "+91 079 26623 996" },
  ],
};

// Its CMS title and CMS order. The board drew these as tiles (films) and a
// "Completed Projects" section; TODO(designer).
const IDS_RESOURCES: Section = {
  id: "section-consulting-resources",
  page: PAGE_ID.consulting,
  order: 2,
  type: "links",
  title: "IDS Resources",
  items: [
    {
      id: "link-consulting-film-1",
      label: "IDS Film",
      targetType: "external",
      url: "https://youtu.be/k11dSeM_HfU",
    },
    {
      id: "link-consulting-film-2",
      label: "Outreach Film",
      targetType: "external",
      url: "https://youtu.be/QnOMRlCwk1I",
    },
  ],
  links: [],
  contacts: [],
};

export const CONSULTING: PageResponse = {
  page: {
    id: PAGE_ID.consulting,
    title: "Consulting & Entrepreneurship",
    slug: "consulting",
    parent: null,
    template: "primary",
    utility: "none",
    keyInfo: [],
    // The CMS's hero 1, copied: a collage of client logos, not a photograph.
    // TODO(review): content, and its alt text names the page, not the image;
    // backend — alt text that describes it.
    hero: [
      mediaAsset(
        "/consulting/hero-1.jpg",
        "Consulting & Entrepreneurship, National Institute of Design",
        1520,
        700,
      ),
    ],
    intro:
      "“The India Report” was submitted by Charles and Ray Eames in April 1958, based on which the Government of India established the National Institute of Design Ahmedabad in 1961 to fulfil two goals – imparting design education, and at the same time providing design services to the Nation.",
    sections: [IDS, IDS_RESOURCES],
    contacts: [],
    seoTitle: "Consulting & Entrepreneurship",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      {
        id: PAGE_ID.consulting,
        title: "Consulting & Entrepreneurship",
        path: "/consulting",
      },
    ],
    backNav: null,
    // sitemap.json's five children, in its order, by its names. All unbuilt:
    // unlinked rows until each route ships (KEEP_UNBUILT).
    // TODO(designer): the board adds "Clients of NID IDS" (no sitemap entry; the
    // CMS's clients list is a PDF in IDS Resources) and says "Continuing
    // Education Programme".
    subPageLinks: [
      { label: "Integrated Design Services", href: "/consulting/ids" },
      { label: "Continuing Education", href: "/consulting/continuing-education" },
      { label: "National Design Business Incubator", href: "/consulting/ndbi" },
      { label: "Outreach Programmes", href: "/consulting/outreach" },
      { label: "Ongoing Projects", href: "/consulting/projects" },
    ],
    siblingBand: [],
  },
};
