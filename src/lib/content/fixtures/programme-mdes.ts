// /programmes/mdes — Master of Design (M.Des.). There is no board for this page: the
// fixture is a verbatim snapshot of the CMS document (30 Sep 2026) as the adapter
// renders it, so FIXTURE and LIVE show the same content today. It is not a design
// source.
//
// The Disciplines prose is the fallback: live, getPage replaces it with the discipline
// records as grouped cards (getDisciplines.ts).
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";
import { PUBLISHED, programmeDerived, textSection } from "@/lib/content/fixtures/programme-parts";

export const PROGRAMME_MDES: PageResponse = {
  page: {
    id: PAGE_ID.programmeMdes,
    title: "Master of Design (M.Des.)",
    slug: "mdes",
    parent: PAGE_ID.programmes,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [mediaAsset("/programmes/mdes/hero-mannequins.jpg", "Master of Design at NID", 1200, 628)],
    intro:
      "NID's Master of Design (M.Des.) is a 2.5-year postgraduate programme spanning 19 disciplines across three campuses, with specialisations in Communication Design, Industrial Design, Interdisciplinary Design, IT Integrated Design, and Textile/Apparel/Lifestyle/Accessory Design. Admissions require performance across two stages of the Design Aptitude Test (DAT), applied for at admissions.nid.edu.",
    sections: [
      textSection(
        PAGE_ID.programmeMdes,
        "section-mdes-disciplines",
        1,
        "Disciplines",
        "Communication Design — Film and Video Communication (19 seats, Ahmedabad), Graphic Design (19 seats, Ahmedabad), Animation Film Design (19 seats, Ahmedabad), Photography Design (19 seats, Gandhinagar).\n\nIndustrial Design — Ceramic &amp; Glass Design (12 seats, Ahmedabad), Furniture and Interior Design (19 seats, Ahmedabad), Product Design (19 seats, Ahmedabad), Toy &amp; Game Design (12 seats, Gandhinagar), Transportation &amp; Automobile Design (19 seats, Gandhinagar), Universal Design (19 seats, Bengaluru).\n\nInterdisciplinary Design — Design for Retail Experience (19 seats, Bengaluru), Strategic Design Management (19 seats, Gandhinagar).\n\nIT Integrated Design — Digital Game Design (19 seats, Bengaluru), Interaction Design (19 seats, Bengaluru), Information Design (19 seats, Bengaluru), New Media Design (19 seats, Gandhinagar).\n\nTextile, Apparel, Lifestyle &amp; Accessory Design — Apparel Design (19 seats, Gandhinagar), Lifestyle Accessory Design (19 seats, Gandhinagar), Textile Design (19 seats, Ahmedabad).",
      ),
    ],
    contacts: [],
    seoTitle: "Master of Design (M.Des.) | National Institute of Design",
    seoDescription:
      "A 2.5-year postgraduate programme spanning 19 disciplines across three campuses.",
    publishedAt: PUBLISHED,
  },
  derived: programmeDerived(PAGE_ID.programmeMdes, "Master of Design (M.Des.)"),
};
