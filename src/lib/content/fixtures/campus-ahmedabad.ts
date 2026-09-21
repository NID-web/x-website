// /about/campuses/ahmedabad — content fixture (Figma 4119:224215). Prose is the
// board's: About from its hidden "Full text" 4364:189048, the intro 4119:224230,
// Disciplines paragraph 1 of 4119:227463.
//
// Two board nodes are notes to the developer, not copy, and are NOT here:
// 4119:227458 (the whole Workshops body — "Not published on the campus page at
// present… Content to be supplied by NID.") and paragraph 2 of 4119:227463 ("A
// discipline-by-discipline list is not published on the campus page…"). So the
// Workshops section has no fixture content and does not render without the CMS.
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import {
  PUBLISHED,
  campusDerived,
  pageLink,
  textSection,
  thumb,
} from "@/lib/content/fixtures/campus-parts";

export const CAMPUS_AHMEDABAD: PageResponse = {
  page: {
    id: PAGE_ID.campusAhmedabad,
    title: "Ahmedabad",
    slug: "ahmedabad",
    parent: PAGE_ID.campuses,
    template: "secondary",
    utility: "back",
    // 4119:224223. "Established" is fed by detail.establishedYear with the CMS
    // on — which today says 1951 (the board, and NID, say 1961). Programmes has
    // no API field; see the TODO in getPage.ts.
    keyInfo: [
      { label: "Established", value: "1961" },
      { label: "Programmes", value: "8 B.Des, 7 M.Des, Ph.D" },
    ],
    hero: [],
    intro:
      "NID Ahmedabad Campus offers 8 Bachelor Degree Programmes and 7 Master Degree Programmes. Recently a Doctoral Programme in Design has been introduced.",
    sections: [
      textSection("ahmedabad", "section-ahmedabad-about", 1, "About the Campus", [
        "The National Institute of Design (NID) is internationally acclaimed as one of the foremost multi-disciplinary institutions in the field of design education and research.",
        "NID has been a pioneer in industrial design education after Bauhaus and Ulm in Germany, and is known for its pursuit of design excellence to make Designed in India, Made for the World a reality.",
        "The Ahmedabad campus is the founding campus of the Institute, established in 1961 at Paldi.",
      ]),
      {
        id: "section-ahmedabad-services",
        page: PAGE_ID.campusAhmedabad,
        order: 2,
        type: "links",
        title: "Services & Centres",
        // 4132:246478 draws five. Four are designed-but-unbuilt routes in
        // sitemap.json and render as unlinked rows until those pages exist
        // (the gate's campus exemption, STAGE-0-NOTES §58). "Design Clinic for
        // MSME" has no route at all, and a link needs a target — not authored.
        items: [
          pageLink("link-ahmedabad-ids", "Integrated Design Services", PAGE_ID.consultingIds),
          pageLink("link-ahmedabad-outreach", "Outreach Programmes", PAGE_ID.consultingOutreach),
          pageLink(
            "link-ahmedabad-industry-online",
            "Industry & Online Programmes",
            PAGE_ID.programmesIndustryOnline,
          ),
          pageLink("link-ahmedabad-railway", "Railway Design Centre", PAGE_ID.researchRailway),
        ],
        links: [],
        contacts: [],
      },
      textSection("ahmedabad", "section-ahmedabad-workshops", 3, "Workshops, Labs & Facilities", []),
      {
        id: "section-ahmedabad-disciplines",
        page: PAGE_ID.campusAhmedabad,
        order: 4,
        type: "cards",
        title: "Disciplines",
        body: "Eight Bachelor of Design disciplines across three faculties, and seven Master of Design disciplines, with a doctoral programme introduced recently.",
        // 4260:264431… — programme pages, not disciplines. With the CMS on, this
        // section lists detail.disciplines instead (STAGE-0-NOTES §57).
        items: [
          thumb(PAGE_ID.programmes, "bdes", "Bachelor of Design (B.Des)", "8 disciplines"),
          thumb(PAGE_ID.programmes, "mdes", "Master of Design (M.Des)", "7 disciplines"),
          thumb(PAGE_ID.programmes, "phd", "Ph.D", "Doctoral programme"),
        ],
        links: [],
        contacts: [],
      },
    ],
    // 4119:224234 — handed to the first section's column 4 by the template.
    contacts: [
      { label: "Email", value: "info@nid.edu" },
      { label: "Phone", value: "+91 79 2662 9500" },
    ],
    seoTitle: "Ahmedabad Campus",
    publishedAt: PUBLISHED,
  },
  derived: campusDerived("ahmedabad"),
};
