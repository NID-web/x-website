// /about/campuses/gandhinagar — content fixture (Figma 4119:227603). Prose is
// the board's: About from its hidden "Full text" 4364:189049, the intro
// 4119:227618, Workshops 4119:227627, and the seven Thumbs 4260:264455–503.
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import {
  PUBLISHED,
  campusDerived,
  pageLink,
  textSection,
  thumb,
} from "@/lib/content/fixtures/campus-parts";

const discipline = (slug: string, title: string) => thumb(PAGE_ID.disciplines, slug, title, "M.Des");

export const CAMPUS_GANDHINAGAR: PageResponse = {
  page: {
    id: PAGE_ID.campusGandhinagar,
    title: "Gandhinagar",
    slug: "gandhinagar",
    parent: PAGE_ID.campuses,
    template: "secondary",
    utility: "back",
    // 4119:227611. With the CMS on, Address takes detail.address, which is only
    // "Gandhinagar, Gujarat".
    keyInfo: [
      { label: "Programmes", value: "7 M.Des disciplines" },
      { label: "Address", value: "GH-0, Extension Road, Nr. Infocity" },
    ],
    hero: [],
    intro:
      "Located in the capital city of Gandhinagar, Gujarat, NID Gandhinagar campus offers a full-time residential programme in M.Des across seven disciplines.",
    sections: [
      textSection("gandhinagar", "section-gandhinagar-about", 1, "About the Campus", [
        "Located in the capital city of Gandhinagar, Gujarat, NID- Gandhinagar campus offers full time residential program in M.Des (Master of Design) across seven disciplines, at the moment.",
        "The campus also has an all-new auditorium/amphi-theatre for holding conferences and cultural events besides a Design Gallery that witnesses frequent exhibitions.",
        "The campus is also the home to the ICNF (Innovation Centre for Natural Fibre), that is actively engaged in finding design applications for natural fibres.",
      ]),
      textSection(
        "gandhinagar",
        "section-gandhinagar-workshops",
        2,
        "Workshops, Labs & Facilities",
        [
          "The campus houses facilities and resources that provide students with a gamut of learning opportunities and help them enhance their creativity:",
          "Knowledge Management Centre · Central workshop (wood / metal) · Laser cutting · CNC machine · 3D printing · Digital lab · Discipline-specific labs and studios",
          "Auditorium and amphi-theatre · Design Gallery · Innovation Centre for Natural Fibre (ICNF)",
        ],
        // 4132:246852, column 4. Both are designed-but-unbuilt routes in
        // sitemap.json and render as unlinked rows until those pages exist
        // (STAGE-0-NOTES §58). The CMS's labAndFacilities list is a different
        // four with no path on any record (T2), so these stay.
        [
          pageLink("link-gandhinagar-kmc", "Knowledge Management Centre", PAGE_ID.kmc),
          pageLink(
            "link-gandhinagar-icnf",
            "Innovation Centre for Natural Fibre",
            PAGE_ID.researchNaturalFiber,
          ),
        ],
      ),
      {
        id: "section-gandhinagar-disciplines",
        page: PAGE_ID.campusGandhinagar,
        order: 3,
        type: "cards",
        title: "Disciplines",
        items: [
          discipline("lifestyle-accessory-design", "Lifestyle Accessory Design"),
          discipline("apparel-design", "Apparel Design"),
          discipline("new-media-design", "New Media Design"),
          discipline("toy-and-game-design", "Toy and Game Design"),
          discipline("photography-design", "Photography Design"),
          discipline("strategic-design-management", "Strategic Design Management"),
          discipline("transportation-automobile-design", "Transportation & Automobile Design"),
        ],
        links: [],
        contacts: [],
      },
    ],
    // 4119:227622 — handed to the first section's column 4 by the template.
    contacts: [
      { label: "Email", value: "pgcampus@nid.edu" },
      { label: "Phone", value: "+91 79 2326 5500" },
    ],
    seoTitle: "Gandhinagar Campus",
    publishedAt: PUBLISHED,
  },
  derived: campusDerived("gandhinagar"),
};
