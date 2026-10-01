// /study/life-at-nid — Life at NID (the 1440 board), Admission Process's pattern
// (STAGE-0-NOTES §76). Copy is the board's; a sentence the board clips is left
// out, never completed.
//
// LIVE, the CMS wins where it has data: the standfirst is its "Overview", and
// each section's body is its same-titled section, whole. The rail and every
// CTA are the fixture's in both modes. TODO(review): live slots the fixture
// fills — the rail, the Hostel CTAs.
//
// No section photos: the board's are placeholders and the CMS has none.
import type { Link, PageResponse, Section } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";
import { studyBand } from "@/lib/content/sibling-bands";
import { mediaAsset } from "@/lib/media";

const PUBLISHED = "2026-10-01T00:00:00+05:30";
const PATH = "/study/life-at-nid";

function section(id: string, order: number, title: string, body: string[], links: Link[] = []): Section {
  return { id, page: PAGE_ID.studyLifeAtNid, order, type: "text", title, body: body.join("\n\n"), items: [], links, contacts: [] };
}

// TODO(review): content — "Gandhinagar campuses" (plural).
const HOSTEL = section(
  "section-life-hostel",
  1,
  "Hostel",
  [
    "The Institute offers separate hostel facilities for boys and girls as per availability. This facility is currently available only for undergraduate students at the Paldi campus and for post graduate students at the Gandhinagar campuses. The Institute's hostels in Paldi and Gandhinagar accommodate approximately 450 and 200 students respectively. The Bengaluru campus is a non-residential campus. Hostel accommodation is allotted every academic year on a single or shared occupancy.",
  ],
  // One stack in the board's order: the contacts, then the two residential
  // campuses. TODO(designer): the board puts the campus links at the photo's
  // row; the template places a section's links in one stack (§74).
  // TODO(review): confirm info@nid.edu and the number are the hostel contacts.
  [
    { id: "link-life-email", label: "info@nid.edu", targetType: "email", address: "info@nid.edu" },
    { id: "link-life-phone", label: "+91 79 2662 9500", targetType: "phone", address: "+917926629500" },
    { id: "link-life-ahmedabad", label: "Ahmedabad Campus", targetType: "page", page: PAGE_ID.campusAhmedabad },
    { id: "link-life-gandhinagar", label: "Gandhinagar Campus", targetType: "page", page: PAGE_ID.campusGandhinagar },
  ],
);

const DINING = section("section-life-dining", 2, "Dining", [
  "The Student Mess is run by the Institute on a contractual basis and a Students' Mess Committee oversees its operation.",
  "Full subscription to the mess facilities is compulsory for all hostel residents. The entire mess charges for each semester will be collected by the Institute in advance along with semester fees in the beginning of the semester.",
]);

// The board's "Contact NID" has no built route and no URL: no row (TODO(review)).
const GUEST_HOUSE = section("section-life-guest-house", 3, "Guest House", [
  "The Institute's Guest House facilities may be made available only for parents of a student. Subject to availability of accommodation, this facility is on payment basis. Students can approach the Corporate & Media Relations Office for booking of the Guest House routed through the Registrar.",
]);

const HEALTH_CARE = section("section-life-health-care", 4, "Health Care", [
  "A doctor is available at the campus dispensary for consultation and advice at specific timings. There are no hospitalisation facilities on campus. In an emergency, the local guardian shall be informed and arrangements can be made in only government hospitals when recommended by a doctor.",
  "Mediclaim is compulsory for all students and a student will be required to produce a copy of the original document of Mediclaim at the time of registration. In case of medical emergency at night the respective Hostel Warden should be contacted.",
]);

const COUNSELLING = section("section-life-counselling", 5, "Counselling", [
  "Problems such as anxiety and depression or concerns about relationships, eating disorders, alcohol, or drugs may affect people at one time or another. Although these problems may initially seem minor, they can increase in intensity and interfere with daily life. The institute consults professional counsellors and facilitates their meetings with students. The counsellors are available by appointment.",
]);

// The board's second paragraph clips ("…groups which plan social…") and is left
// out. Its "Alpavirama" CTA has no built route and no URL: no row (TODO(review)).
const EXTRA_CURRICULAR = section("section-life-extra-curricular", 6, "Extra Curricular Activities", [
  "The Students Activity Committee (SAC) is a sociocultural organisation of the Institute that promotes a healthy academic environment and student friendly services including sports, social and special interest activities along with support and advice on any issue. Expenses incurred by the Committee are met by a fund created by student contributions over the year.",
]);

export const STUDY_LIFE_AT_NID: PageResponse = {
  page: {
    id: PAGE_ID.studyLifeAtNid,
    title: "Life at NID",
    slug: "life-at-nid",
    parent: PAGE_ID.study,
    template: "secondary",
    utility: "back",
    // TODO(review): facts from the board; the CMS has neither.
    keyInfo: [
      { label: "Campuses", value: "Ahmedabad • Gandhinagar • Bengaluru" },
      { label: "Hostel capacity", value: "~450 Paldi • ~200 Gandhinagar" },
    ],
    hero: [
      // The CMS's hero[0], the photograph /study's Life at NID section also
      // shows — a landing's teaser using its child's photo. TODO(review): the
      // alt text is ours; the CMS's is generic.
      mediaAsset(
        "/study/life-at-nid-dress-form.jpg",
        "A student fitting a blue panelled bodice on a dress form in a studio, more dress forms around her.",
        1280,
        628,
      ),
    ],
    intro: "Hostel, dining, guest house, healthcare, counselling and student activities across NID's three campuses.",
    sections: [HOSTEL, DINING, GUEST_HOUSE, HEALTH_CARE, COUNSELLING, EXTRA_CURRICULAR],
    contacts: [],
    seoTitle: "Life at NID",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.study, title: "Study at NID", path: "/study" },
      { id: PAGE_ID.studyLifeAtNid, title: "Life at NID", path: PATH },
    ],
    backNav: { label: "Study at NID", href: "/study" },
    subPageLinks: [],
    // sitemap.json's order minus this page. TODO(designer): the board lists PM
    // Vidyalaxmi Scheme second.
    siblingBand: studyBand(PATH),
  },
};
