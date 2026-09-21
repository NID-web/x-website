// /about/campuses/bengaluru — content fixture (Figma 4119:230966). Prose is the
// board's: About from its hidden "Full text" 4364:189050, Research Labs from
// 4364:189051, the intro 4119:230981, and the five Thumbs 4260:264511–543.
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import {
  PUBLISHED,
  campusDerived,
  textSection,
  thumb,
} from "@/lib/content/fixtures/campus-parts";

const discipline = (slug: string, title: string) => thumb(PAGE_ID.disciplines, slug, title, "M.Des");

export const CAMPUS_BENGALURU: PageResponse = {
  page: {
    id: PAGE_ID.campusBengaluru,
    title: "Bengaluru",
    slug: "bengaluru",
    parent: PAGE_ID.campuses,
    template: "secondary",
    utility: "back",
    // 4119:230974: two facts, then the campus contacts — this board draws them
    // in the rail, not in column 4 of the first section (whose Frame 264 is
    // empty). With the CMS on, the API's contacts replace the two contact rows
    // and "Inaugurated" takes detail.establishedYear (2015; the board and the
    // CMS's own metaDescription say 2006).
    keyInfo: [
      { label: "Inaugurated", value: "March 2006 · 2-acre site" },
      { label: "Programmes", value: "5 M.Des disciplines" },
      { label: "Email", value: "bengaluru_campus@nid.edu" },
      { label: "Phone", value: "+91 80 2972 5006" },
    ],
    hero: [],
    intro:
      "NID Bengaluru campus is one of the three campuses of the National Institute of Design, Ahmedabad, located in Yeshvanthpur in north-western Bengaluru.",
    sections: [
      textSection("bengaluru", "section-bengaluru-about", 1, "About the Campus", [
        "NID Bengaluru campus is one of the three campuses of the National Institute of Design, Ahmedabad. It is located in Yeshvanthpur, a sub-locality of north western part of Bengaluru city in the state of Karnataka. It was set up as a joint initiative of and funding from the Department of Industrial Policy and Promotion (DIPP), Ministry of Commerce and Industry and the Ministry of Information Technology, Government of India. The campus was inaugurated in March 2006 and today stands as a compact set-up on a small 2-acre site.",
        "The campus commenced with two PG programmes namely Design for Digital experience and Design for Retail experience from the academic year 2007-2008.",
        "Being in Bengaluru, the IT city of India, the educational and research activities at the campus are in sync with the city ecosystem and focus on bringing digital inclusion in their products and processes across the various disciplines.",
      ]),
      {
        id: "section-bengaluru-disciplines",
        page: PAGE_ID.campusBengaluru,
        order: 2,
        type: "cards",
        title: "Disciplines",
        items: [
          discipline("design-for-retail-experience", "Design for Retail Experience"),
          discipline("digital-game-design", "Digital Game Design"),
          discipline("information-design", "Information Design"),
          discipline("interaction-design", "Interaction Design"),
          discipline("universal-design", "Universal Design"),
        ],
        links: [],
        contacts: [],
      },
      textSection("bengaluru", "section-bengaluru-research", 3, "Research Labs", [
        "In the past faculty members of the campus have taken up several research projects under various labs:",
        "e-kalpa lab — Digital Online Learning environment for Design, funded by the Ministry of Human Resources.",
        "Digital Hampi Lab — Digital Reconstruction of Hampi monuments and Bazaars, funded by the Department of Science and Technology.",
        "The campus has collaborated with various industry partners on research initiatives and is actively seeking to build industry-academia research collaborations.",
      ]),
    ],
    contacts: [],
    seoTitle: "Bengaluru Campus",
    publishedAt: PUBLISHED,
  },
  derived: campusDerived("bengaluru"),
};
