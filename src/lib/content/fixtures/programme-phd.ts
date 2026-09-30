// /programmes/phd — Ph.D. There is no board for this page: the fixture is a verbatim
// snapshot of the CMS document (30 Sep 2026) as the adapter renders it, so FIXTURE and
// LIVE show the same content today. It is not a design source.
//
// "About" block 1 is the standfirst and blocks 2–4 the About section; its LINK block
// (Apply via NID Admissions) is the rail's Apply button (getPage.ts).
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";
import { PUBLISHED, programmeDerived, textSection } from "@/lib/content/fixtures/programme-parts";

export const PROGRAMME_PHD: PageResponse = {
  page: {
    id: PAGE_ID.programmePhd,
    title: "Ph.D",
    slug: "phd",
    parent: PAGE_ID.programmes,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [mediaAsset("/programmes/phd/hero-group-under-tree.jpg", "PhD in Design at NID", 1200, 628)],
    intro:
      "NID established its doctoral programme in Design in 2017, moving beyond undergraduate and master's studies into advanced, in-depth research study of particular aspects of design. The programme aims to promote deep reflection, inquiry, and rigour in the development and dissemination of new ideas in design and allied disciplines.",
    sections: [
      textSection(
        PAGE_ID.programmePhd,
        "section-phd-about",
        1,
        "About",
        "<strong>Practice-led Research</strong> involves original investigation undertaken to gain new knowledge mostly by means of practice; creative outcomes may include artefacts such as objects, images, film, fashion, music, design collections, models, samples, prototypes, digital media, performances, and exhibitions. <strong>Theory-led Research</strong> focuses on advancing knowledge about or within practice through textual thesis work.\n\n<strong>Full-time PhD</strong> — <strong>Duration:</strong> maximum 3 years, extendable to 5. <strong>Residence:</strong> campus residence required, eligible for occasional financial support. <strong>Part-time PhD</strong> — maximum 5 years, extendable to 7; presence required for scheduled coursework; ineligible for financial support; working professionals must provide an <strong>Employer's No-Objection Certificate</strong>.\n\nThe curriculum aims to foster original research, deepen understanding of design methods, further NID's pedagogic principles, enable advanced research collaboration, and contribute to design for dignity and service to society.",
      ),
    ],
    contacts: [],
    seoTitle: "Ph.D | National Institute of Design",
    seoDescription:
      "NID's doctoral programme in Design, established in 2017, combining practice-led and theory-led research.",
    publishedAt: PUBLISHED,
  },
  derived: programmeDerived(PAGE_ID.programmePhd, "Ph.D"),
};
