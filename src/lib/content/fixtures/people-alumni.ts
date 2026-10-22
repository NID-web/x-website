// /people/alumni — Alumni, a People child (STAGE-0-NOTES §100). No board: the
// secondary template by its own rules.
//
// The words are a copy of the CMS's `alumni` document as sent (22 Oct 2026), so
// FIXTURE and LIVE say the same. "Alumni" is a letter to graduates whose one
// LINK block, the registration form, is the section's filled button (§70's
// Apply), never part of the prose. "Notable Alumni" is the STRUCTURED person
// section as AlumniCard, Home's Notable Alumni tile. The document's "Pride of
// NID" section is not rendered: that list has a designed route of its own,
// /people/pride-of-nid (§81's precedent).
import type { Page, PageResponse } from "@/lib/content-model";
import { joinBlocks, richParagraphs } from "@/lib/content/format";
import { PAGE_ID } from "@/lib/content/pages";
import { peopleBand } from "@/lib/content/sibling-bands";
import { mediaAsset } from "@/lib/media";

// TODO(review): backend — the CMS's publishedAt is a seed timestamp.
const PUBLISHED = "2026-09-20T14:34:23+05:30";
const PATH = "/people/alumni";

// The CMS's TEXT blocks, in order, as sent: blocks 1–5 come before the LINK
// block, 6–7 after it. TODO(review): editor — the letter reads as an email
// (a salutation, "Hope you are doing well", a signature). The signature's line
// break is a single "\n", which the prose rules collapse to a space; two TEXT
// blocks would keep the name and the post on two lines (backend ask AL6).
const LETTER = [
  "Dear Graduates,",
  "Greetings from The National Institute of Design, Ahmedabad!",
  "Hope you are doing well.",
  "We are in the process of updating and rebuilding the NID alumni database to connect with the alumni community. In this endeavor, we intend to generate and give all NID alumni a permanent NID Alumni email id, once we have received your present confirmed e-mail id through this process.",
  "You are requested to kindly register at the earliest. Thank you, if you have already done the same, and apologize if you have already received this official mail from other sources too, as we are in the process of sharing this official email around. To help us in this process, you are kindly requested to assist us by spreading this message to all your batch mates and other NID graduates with whom you are connected with.",
  "Take care and stay connected.",
  "Sujitha Nair\nAssistant Registrar (Students, Alumni & Industry Interface)",
];

// The CMS's one item, as toCards builds it: id, slug, title, heroText and a
// copy of its thumbnail, byte for byte the CMS's 352px PNG, beside the other
// person portraits (R1h). Never under public/people/alumni/: a file there is a
// URL inside this page's route.
const SUJATA_KESHAVAN: Page = {
  id: "747",
  title: "Sujata Keshavan",
  slug: "sujata-keshavan",
  parent: PAGE_ID.peopleAlumni,
  template: "secondary",
  utility: "back",
  keyInfo: [],
  hero: [mediaAsset("/people/faculty/sujata-keshavan.png", "Sujata Keshavan", 352, 352)],
  intro: "GD Class of 1984. Pioneered brand design in India, co-founding Ray+Keshavan and shaping identities.",
  sections: [],
  contacts: [],
  publishedAt: "2026-09-20T14:33:51+05:30",
};

export const PEOPLE_ALUMNI: PageResponse = {
  page: {
    id: PAGE_ID.peopleAlumni,
    // The CMS's title. The menu and the /people rail say "Notable Alumni", each
    // keeping its own. TODO(designer): one name for the page.
    title: "Alumni",
    slug: "alumni",
    parent: PAGE_ID.people,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [
      // The landing's copy of the CMS's file: people-alumni-hero.jpg is byte for
      // byte /people's hero. TODO(review): same photo as /people (and Governing
      // Council, Senate, Staff); the alt names the page, not the photograph (§81).
      mediaAsset("/people/hero-entrance.jpg", "Alumni, National Institute of Design", 1520, 700),
    ],
    intro: "Registration notice for NID graduates.",
    sections: [
      {
        id: "section-alumni-letter",
        page: PAGE_ID.peopleAlumni,
        order: 1,
        type: "text",
        // The CMS's title, which repeats the page's, as Staff's does (§99).
        // TODO(review): backend.
        title: "Alumni",
        body: joinBlocks(LETTER.map((html) => richParagraphs(html).text)).body,
        items: [],
        links: [
          {
            id: "link-alumni-registration-form",
            label: "Alumni Registration Form",
            targetType: "external",
            // As the CMS sends it. Without /viewform it is a 404; with it, a
            // Google sign-in (backend ask AL2).
            url: "https://docs.google.com/forms/d/e/1FAIpQLSda2ZTSwMVzuo5CK-HcvkYW67slXfoOps5UiZnsjClD11OyZw/viewform",
          },
        ],
        contacts: [],
      },
      {
        id: "section-alumni-notable",
        page: PAGE_ID.peopleAlumni,
        order: 2,
        type: "cards",
        title: "Notable Alumni",
        items: [SUJATA_KESHAVAN],
        links: [],
        contacts: [],
      },
    ],
    contacts: [],
    seoTitle: "Alumni | National Institute of Design",
    seoDescription: "Registration notice for NID graduates.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.people, title: "People", path: "/people" },
      { id: PAGE_ID.peopleAlumni, title: "Alumni", path: PATH },
    ],
    // Names the band too: "More in People".
    backNav: { label: "People", href: "/people" },
    subPageLinks: [],
    siblingBand: peopleBand(PATH),
  },
};
