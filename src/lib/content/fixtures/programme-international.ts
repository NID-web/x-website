// /programmes/international — International & Collaborative Programmes. There is no
// board for this page: the fixture is a verbatim snapshot of the CMS document (30 Sep
// 2026) as the adapter renders it, so FIXTURE and LIVE show the same content today. It
// is not a design source.
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";
import { PUBLISHED, programmeDerived, textSection } from "@/lib/content/fixtures/programme-parts";

export const PROGRAMME_INTERNATIONAL: PageResponse = {
  page: {
    id: PAGE_ID.programmeInternational,
    title: "International & Collaborative Programmes",
    slug: "international",
    parent: PAGE_ID.programmes,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [mediaAsset("/programmes/international/hero-crochet-portrait.jpg", "International Programmes at NID", 1520, 700)],
    intro:
      "National Institute of Design (NID) is privileged to have the benefit of rewarding academic exchange relationships with several leading design institutions and universities across the world.",
    sections: [
      textSection(
        PAGE_ID.programmeInternational,
        "section-international-models",
        1,
        "Collaboration Models",
        "<strong>1. Faculty Exchange:</strong> enables design educators to share expertise and strengthen dialogue on design education and research between partner institutions.\n\n<strong>2. Research:</strong> research is interwoven into academic and professional design practices, and all continue to remain hallmarks of NID's approach to design research. Joint projects may result in seminars, workshops, and publications.\n\n<strong>3. NID Press:</strong> publications capture the institute's design philosophy across books, monographs, and The Trellis research journal, which welcomes contributions from faculty and students.\n\n<strong>4. Joint Workshops:</strong> short-term collaborative programmes integrate design knowledge across industry and service sectors, using holistic design methodologies.\n\n<strong>5. Open Electives:</strong> two-week January/February workshops for senior students, featuring visiting professors who may bring 5–10 students from partner institutions.\n\n<strong>6. Student exchange:</strong> regular semester-long exchanges, ideally during the second semester (December–May).",
      ),
      textSection(
        PAGE_ID.programmeInternational,
        "section-international-partners",
        2,
        "Partner Institutions",
        "NID maintains exchange relationships with over 140 partner institutions worldwide: 61 across Europe (including Germany, France, the UK, Italy, Spain, Switzerland, the Netherlands, Poland, Portugal, Russia, Ireland, Denmark, the Czech Republic, and Belgium), 18 across Asia (including Israel, Sri Lanka, Korea, Taiwan, Japan, China, Hong Kong, Thailand, and Iran), 12 across the Americas (including Chile, Canada, the USA, Mexico, and Brazil), 6 across Australia and the Pacific (Australia, New Zealand), and 3 across Africa (South Africa, Rwanda, Ghana).",
      ),
    ],
    contacts: [],
    seoTitle: "International & Collaborative Programmes | National Institute of Design",
    seoDescription:
      "Academic exchange relationships with more than 140 leading design institutions and universities across the world.",
    publishedAt: PUBLISHED,
  },
  derived: programmeDerived(PAGE_ID.programmeInternational, "International & Collaborative Programmes"),
};
