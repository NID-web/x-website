// /programmes/fdp — Faculty Development Programme. There is no board for this page:
// the fixture is a verbatim snapshot of the CMS document (30 Sep 2026) as the adapter
// renders it, so FIXTURE and LIVE show the same content today. It is not a design
// source.
//
// The hero is the CMS's fdp-hero-1, byte-identical to the photo the /programmes Ph.D
// card already uses, so it is that file. The contacts are the rail's key info.
import type { PageResponse } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";
import { PUBLISHED, programmeDerived, textSection } from "@/lib/content/fixtures/programme-parts";

export const PROGRAMME_FDP: PageResponse = {
  page: {
    id: PAGE_ID.programmeFdp,
    title: "Faculty Development Programme",
    slug: "fdp",
    parent: PAGE_ID.programmes,
    template: "secondary",
    utility: "back",
    keyInfo: [
      { label: "Centre for Teaching and Learning", value: "teachinglearning@nid.edu" },
      { label: "Centre for Teaching and Learning", value: "+91 79 26629 500" },
    ],
    hero: [mediaAsset("/programmes/phd-seminar-table.jpg", "Centre for Teaching and Learning, NID", 1520, 700)],
    intro:
      "The Faculty Development Programme is run through NID's Centre for Teaching and Learning (CTL), established in late 2019 to support, promote, and facilitate an academic ambience for sharing thoughts and innovations in design. CTL operates across NID's three campuses — Ahmedabad, Bengaluru, and Gandhinagar — functioning under the office of the Activity Chairperson, Education.",
    sections: [
      textSection(
        PAGE_ID.programmeFdp,
        "section-fdp-about",
        1,
        "About",
        "CTL's framework rests on progressive pedagogy principles, particularly learning by doing, and operates through three verticals: explore, reflect-share-critique, and connect. Activities include lectures, workshops, and trainings for faculty colleagues, addressing design pedagogy, cognition, and learnability research. The programme recognises design faculty as a dynamic community, facilitating sharing, reflecting on, and researching teaching-learning methods, and establishes Faculty Learning Groups and Subject Interest Groups across campuses. Through its Connect initiative, CTL partners with departments, educational hubs, think tanks, and international MoU partners to foster a design learning culture and develop Communities of Practice.",
      ),
    ],
    contacts: [],
    seoTitle: "Faculty Development Programme | National Institute of Design",
    seoDescription:
      "Run through NID's Centre for Teaching and Learning, supporting design pedagogy across all three campuses.",
    publishedAt: PUBLISHED,
  },
  derived: programmeDerived(PAGE_ID.programmeFdp, "Faculty Development Programme"),
};
