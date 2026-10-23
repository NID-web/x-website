// /programmes/ctl — Centre for Teaching and Learning, a Programmes child
// (STAGE-0-NOTES §103). No board: the secondary template by its own rules.
//
// nid.edu, not in the CMS (backend ask: document centre-for-teaching-and-learning,
// CTL1). The first page with no CMS document: no PAGE_CONFIG, so FIXTURE and LIVE
// render this file alike. The words are nid.edu's as served on 23 Oct 2026,
// verbatim, in its four paragraphs (its <p> elements decide the breaks, not the
// content pack): ¶1 the standfirst, ¶2–¶4 About. Its sidebar's NID Press book
// excerpt is not CTL's and is left out.
// TODO(review): editor — the source's spellings, kept as written: "Bangalore"
// (the site says Bengaluru), "campuses- Ahmedabad", "teaching- learning",
// "reflect-share- critique", "vis a vis" (twice), "FLGs/SIGs- Faculty Learning
// Groups/ Subject Interest Groups", "COPs- Communities of Practice".
import type { PageResponse } from "@/lib/content-model";
import { joinBlocks, richParagraphs } from "@/lib/content/format";
import { PAGE_ID } from "@/lib/content/pages";
import { PUBLISHED, programmeDerived, textSection } from "@/lib/content/fixtures/programme-parts";

const ABOUT = [
  "Since the design community is a highly vibrant community, the faculty members can share, reflect on and research vis a vis teaching- learning methods. While most of the NID pedagogy stems from the principle of “learning by doing” of progressive pedagogy; over the years, faculty colleagues have evolved their own variations of the same. CTL facilitates sharing and enhancement of learning methods. The work is based on current research and best practices for effective teaching and learning in the domain of Design. CTL facilitates under three distinct verticals of explore, reflect-share- critique and connect. With this line of thinking, CTL holds lectures, workshops and trainings for faculty colleagues to inform them vis a vis new research in the domain of design pedagogy, cognition, learnability etc.",
  "It encourages in-house faculty to reflect on their teaching methods and share thoughts through critical analysis and various means of interaction. CTL also aids in coming together of cross disciplinary faculty across three NID campuses to share, discuss and reflect on their teaching, by facilitating formation of FLGs/SIGs- Faculty Learning Groups/ Subject Interest Groups.",
  // "@ Connect," is how nid.edu opens this paragraph, not a heading.
  "@ Connect, CTL aims to partner with departments within the three NID campuses, alternative education hubs & think tanks, with international MoU partners; to share, learn & contribute towards a robust “design learning and teaching culture”. CTL facilitates formation of COPs- Communities of Practice, across the International MoU partners. COPs are a group of people who come together to share ideas or concerns and determine solutions.",
];

export const PROGRAMME_CTL: PageResponse = {
  page: {
    id: PAGE_ID.programmeCtl,
    title: "Centre for Teaching and Learning",
    slug: "ctl",
    parent: PAGE_ID.programmes,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    // nid.edu's page has no photograph: no hero, the closed-up state.
    hero: [],
    intro:
      "Centre for Teaching and Learning (CTL), was founded in late 2019, with an aim to support, promote and facilitate an academic ambience for sharing thoughts and innovations in Design. It functions under the office of Activity Chairperson Education and it operates across the three NID campuses- Ahmedabad, Bangalore and Gandhinagar. At CTL in NID Ahmedabad, efforts are made to create an institutional culture focused on “learning” by facilitating a space for discussions on design pedagogy.",
    sections: [
      // TODO(review): "About" is our title; nid.edu's page has no section heading.
      // Built with the adapter's own rules, as the CMS document's TEXT blocks
      // will be, so the day it lands nothing changes (§103: a raw "&" in ¶4 was
      // the one byte the rehearsal found).
      textSection(
        PAGE_ID.programmeCtl,
        "section-ctl-about",
        1,
        "About",
        joinBlocks(ABOUT.map((html) => richParagraphs(html).text)).body,
      ),
    ],
    contacts: [
      { label: "Centre for Teaching and Learning", value: "teachinglearning@nid.edu" },
      // nid.edu writes "+91 79 26629 500": the same number, grouped as the rest
      // of the site writes it (§103).
      { label: "Centre for Teaching and Learning", value: "+91 79 2662 9500" },
    ],
    // No description of our own: the metadata falls back to the standfirst.
    seoTitle: "Centre for Teaching and Learning | National Institute of Design",
    publishedAt: PUBLISHED,
  },
  derived: programmeDerived(PAGE_ID.programmeCtl, "Centre for Teaching and Learning"),
};
