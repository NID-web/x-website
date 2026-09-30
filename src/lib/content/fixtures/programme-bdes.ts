// /programmes/bdes — Bachelor of Design, the programme page template's board
// (1440 only). Copy is the board's, verbatim. Photos are CMS files: the hero is
// the `bdes` document's hero[1] (the board's glaze tiles), the cards the
// discipline records' images.
//
// The board's "13 seats" on every card is designer filler and is not here: the
// meta line is the campus alone, and live the record's own seats.
import type { PageResponse, UUID } from "@/lib/content-model";
import type { DisciplineCard } from "@/lib/content/editorial";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";
import { ADMISSIONS_URL, PUBLISHED, programmeDerived } from "@/lib/content/fixtures/programme-parts";

const DISCIPLINES = "section-bdes-disciplines";

function discipline(slug: string, name: string, file: string, alt: string, width = 1200, height = 628): DisciplineCard {
  return {
    id: `discipline-${slug}`,
    name,
    slug,
    programme: PAGE_ID.programmeBdes,
    campus: PAGE_ID.campusAhmedabad,
    campuses: [PAGE_ID.campusAhmedabad],
    image: mediaAsset(`/programmes/bdes/${file}`, alt, width, height),
  };
}

// The board's groups and order. Live, both are the records' (alphabetical).
const GROUPS = [
  {
    label: "Communication Design",
    items: [
      discipline("exhibition-design-bdes", "Exhibition Design", "exhibition-design.jpg", "Exhibition Design, B.Des."),
      discipline("animation-film-design-bdes", "Animation Film Design", "animation-film-design.jpg", "Animation Film Design, B.Des."),
      discipline("graphic-design-bdes", "Graphic Design", "graphic-design.jpg", "Graphic Design, B.Des."),
      discipline("film-and-video-communication-bdes", "Film & Video Communication", "film-video-communication.jpg", "Film and Video Communication, B.Des."),
    ],
  },
  {
    label: "Industrial Design",
    items: [
      discipline("furniture-and-interior-design-bdes", "Furniture Design", "furniture-design.jpg", "Furniture and Interior Design, B.Des."),
      discipline("ceramic-glass-design-bdes", "Ceramic Design", "ceramic-design.jpg", "Ceramic & Glass Design, B.Des."),
      discipline("product-design-bdes", "Product Design", "product-design.jpg", "Product Design, B.Des.", 1000, 750),
    ],
  },
  {
    label: "Textile, Apparel, Lifestyle & Accessory Design",
    items: [discipline("textile-design-bdes", "Textile Design", "textile-design.jpg", "Textile Design, B.Des.")],
  },
];

/** The rail's key info where the CMS has none: labels are UI strings
 *  (messages KeyInfo.*), resolved in getPage; the campus is named from the
 *  campus pages' own data. */
export const BDES_KEY_INFO: Array<{ key: "duration"; value: string } | { key: "campus"; campus: UUID }> = [
  { key: "duration", value: "4 years" },
  { key: "campus", campus: PAGE_ID.campusAhmedabad },
];

export const PROGRAMME_BDES: PageResponse = {
  page: {
    id: PAGE_ID.programmeBdes,
    title: "Bachelor of Design",
    slug: "bdes",
    parent: PAGE_ID.programmes,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [
      mediaAsset(
        "/programmes/bdes/hero-glaze-tiles.jpg",
        "A grid of glazed ceramic test tiles in blues, greys and ochres.",
        1200,
        628,
      ),
    ],
    intro:
      "The four-year Bachelor of Design (B.Des.) programme, offered exclusively at NID Ahmedabad, spans Industrial Design, Communication Design, Textile & Apparel Design, and Ceramic & Glass Design. Rooted in NID's learning-by-doing philosophy, it builds interdisciplinary thinking, technical skill, and design sensibility — preparing students to solve real-world problems for user, society, and industry.",
    sections: [
      {
        id: DISCIPLINES,
        page: PAGE_ID.programmeBdes,
        order: 1,
        type: "cards",
        title: "Faculties & Disciplines",
        // Flat, in group order; the groups are `groupedItems` below.
        items: GROUPS.flatMap((g) => g.items),
        links: [],
        contacts: [],
      },
      {
        id: "section-bdes-apply",
        page: PAGE_ID.programmeBdes,
        order: 2,
        type: "text",
        title: "Apply",
        body: "Admission to all programmes at NID is on the basis of the candidates' performance in two stages of the Design Aptitude Test (DAT). The objective of these exams is to assess the knowledge, skills and behavioural qualities of candidates.",
        items: [],
        links: [{ id: "link-bdes-apply", label: "Apply", targetType: "external", url: ADMISSIONS_URL }],
        contacts: [],
      },
    ],
    contacts: [],
    seoTitle: "Bachelor of Design",
    publishedAt: PUBLISHED,
  },
  derived: programmeDerived(PAGE_ID.programmeBdes, "Bachelor of Design"),
  groupedItems: { [DISCIPLINES]: GROUPS },
};
