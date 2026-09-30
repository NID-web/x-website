// /programmes/curriculum-objectives — Curriculum Objectives. There is no board for
// this page: the fixture is a verbatim snapshot of the CMS document (30 Sep 2026) as
// the adapter renders it, so FIXTURE and LIVE show the same content today. It is not a
// design source.
//
// There is no "About" section, so the standfirst is the document's heroText and
// Objectives renders whole.
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";
import { PUBLISHED, programmeDerived, textSection } from "@/lib/content/fixtures/programme-parts";

export const CURRICULUM_OBJECTIVES: PageResponse = {
  page: {
    id: PAGE_ID.curriculumObjectives,
    title: "Curriculum Objectives",
    slug: "curriculum-objectives",
    parent: PAGE_ID.programmes,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [mediaAsset("/programmes/curriculum-objectives/hero-idea-wall.jpg", "National Institute of Design", 1520, 700)],
    intro:
      "The broader objectives shaping NID's undergraduate and postgraduate education programmes.",
    sections: [
      textSection(
        PAGE_ID.curriculumObjectives,
        "section-curriculum-objectives",
        1,
        "Objectives",
        "NID's education programmes, at both Undergraduate and Postgraduate levels, are designed under each discipline to meet a shared set of broader objectives, so that students progress through their courses in an integrated manner: to generate the scope for opportunities to integrate experiential and explorative learning, in order to understand and achieve a high degree of creative innovation and quality; to build a flexible framework for student-centred learning, whereby courses and assignments are able to harness the potential each student has in terms of creative expression and multi-dimensional learning; and to provide the opportunity to identify, plan, and achieve learning goals through an understanding of cultural, social, and technological developments in the context of historical, contemporary, and individual concerns.\n\nProgrammes provide interdisciplinary and progressive knowledge of design, but with a focused understanding of an area of specialisation suited to professional design practice. Students develop innovative and exploratory thinking, necessary technical skills, and the ability to locate individual design approaches within professional contexts. The curriculum fosters a sense of social and professional commitment, where learners own the responsibility for their professional decisions, and emphasises the development of critical, analytical, speculative, and reflective problem-solving skills in an integrated manner — including a scenario-based, user-based, and culture-centric approach to design. Programmes deliver a thorough understanding of technical, managerial, and design fundamentals, along with strong exposure to real-life situations.",
      ),
    ],
    contacts: [],
    seoTitle: "Curriculum Objectives | National Institute of Design",
    seoDescription:
      "The broader objectives shaping NID's undergraduate and postgraduate education programmes.",
    publishedAt: PUBLISHED,
  },
  derived: programmeDerived(PAGE_ID.curriculumObjectives, "Curriculum Objectives"),
};
