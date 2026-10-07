// /consulting/ids — Integrated Design Services, the first Consulting &
// Entrepreneurship child (STAGE-0-NOTES §92). No board: the secondary template by
// its own rules.
//
// The words are a copy of the CMS's `integrated-design-services` document as
// sent (7 Oct 2026), so FIXTURE and LIVE say the same. LIVE adds what a fixture
// never carries (§76, §80): the "FAQ - IDS" PDF in column 4 and the two PDFs in
// Resources are CMS files; FIXTURE has the two films only.
//
// TODO(designer/review): the /consulting landing renders the same six paragraphs,
// FAQ, films and PDFs from its own document (§80). The landing could become a
// summary that links here; this page does not change it.
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { consultingBand } from "@/lib/content/sibling-bands";
import { mediaAsset } from "@/lib/media";

// TODO(review): backend — the CMS's publishedAt is a seed timestamp.
const PUBLISHED = "2026-09-21T08:56:57+05:30";
const PATH = "/consulting/ids";

export const CONSULTING_IDS: PageResponse = {
  page: {
    id: PAGE_ID.consultingIds,
    title: "Integrated Design Services",
    slug: "ids",
    parent: PAGE_ID.consulting,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [
      // The landing's copy of the CMS's consulting-hero-1.jpg: one file, not two.
      // TODO(review): same image as /consulting (the client-logo collage); the
      // alt names the page, not the image (§80).
      mediaAsset("/consulting/hero-1.jpg", "Consulting & Entrepreneurship, National Institute of Design", 1520, 700),
    ],
    intro:
      "NID undertakes consultancy projects from government, semi-government and private organisations, delivering design solutions across its design domains.",
    sections: [
      {
        id: "section-ids-about",
        page: PAGE_ID.consultingIds,
        order: 1,
        type: "text",
        title: "About",
        body:
          "“The India Report” was submitted by Charles and Ray Eames in April 1958, based on which the Government of India established the National Institute of Design Ahmedabad in 1961 to fulfil two goals – imparting design education, and at the same time providing design services to the Nation." +
          "\n\n" +
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
        contacts: [],
      },
      {
        id: "section-ids-resources",
        page: PAGE_ID.consultingIds,
        order: 2,
        type: "links",
        title: "Resources",
        items: [
          { id: "link-ids-film", label: "IDS Film", targetType: "external", url: "https://youtu.be/k11dSeM_HfU" },
          { id: "link-ids-outreach-film", label: "Outreach Film", targetType: "external", url: "https://youtu.be/QnOMRlCwk1I" },
        ],
        links: [],
        contacts: [],
      },
    ],
    // Column 4 of About (the template's rule), as sent. TODO(review): "+91 079 …"
    // carries a trunk 0 after the country code, so neither number links (§80).
    contacts: [
      { label: "Integrated Design Services", value: "ids@nid.edu" },
      { label: "Integrated Design Services (Outreach)", value: "outreach@nid.edu" },
      { label: "Integrated Design Services", value: "+91 079 26629 764/765/766/768/771" },
      { label: "Integrated Design Services (Direct)", value: "+91 079 26623 996" },
    ],
    seoTitle: "Integrated Design Services | National Institute of Design",
    seoDescription:
      "NID undertakes consultancy projects from government, semi-government and private organisations, delivering design solutions across its design domains.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.consulting, title: "Consulting & Entrepreneurship", path: "/consulting" },
      { id: PAGE_ID.consultingIds, title: "Integrated Design Services", path: PATH },
    ],
    // Names the band too: "More in Consulting & Entrepreneurship".
    backNav: { label: "Consulting & Entrepreneurship", href: "/consulting" },
    subPageLinks: [],
    siblingBand: consultingBand(PATH),
  },
};
