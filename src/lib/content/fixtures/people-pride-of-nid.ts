// /people/pride-of-nid — Pride of NID, a People child (STAGE-0-NOTES §108).
// Fixture-only, as CTL (§103): the CMS has no document for it. No board: the
// secondary template by its own rules.
//
// The words are the content team's "Pride of NID.docx" (27 Nov 2026) as
// written, through the adapter's own prose rules (richParagraphs, joinBlocks).
// Left out of the copy: each bio's word count ("(163 words)") and the
// subheading "Design contributions and professional profiles", both notes to
// the editor rather than text. Each convocation is a cards section of
// AlumniCards on the Pride bed (the home tile's twin), each awardee's profile
// a text section after it. TODO(designer): no board; the order is the
// document's.
// TODO(review): content — the names drop the document's "Ms."/"Mr.", as the
// People cards do; Lakshmi Murthy is "Ms." here and "Dr." on the home tile
// (question 11 to the content team). The portraits are the document's, cropped
// square: 183 to 322px, smaller than the 288px the faculty cards use, so
// David Abraham's and K. B. Jinan's are soft at 2x (question 36).
import type { Page, PageResponse, Section } from "@/lib/content-model";
import { joinBlocks, richParagraphs } from "@/lib/content/format";
import { PAGE_ID } from "@/lib/content/pages";
import { peopleBand } from "@/lib/content/sibling-bands";
import { mediaAsset } from "@/lib/media";

const PATH = "/people/pride-of-nid";
const PUBLISHED = "2026-11-27T19:26:11Z"; // the document's date

// The document's three opening paragraphs. Its opening quote mark is curly and
// its closing one straight; both are curly here (a mechanical fix).
const ABOUT = [
  "The National Institute of Design (NID) Ahmedabad has built a distinguished legacy of nurturing creative minds, advanced design education, and shaping the role of design in addressing the evolving needs of society. Over the years, its alumni have carried forward this legacy through their work across diverse disciplines, demonstrating how design, guided by creativity, empathy, and innovation, can influence industries, enrich communities, and contribute to meaningful social, cultural, and economic progress.",
  "The “Pride of NID Ahmedabad Award” has been instituted to recognise and celebrate the outstanding achievements and contributions of NID Ahmedabad alumni who have made a meaningful difference through their professional excellence, creative vision, leadership, and commitment to society. The award honours individuals whose work not only reflects distinction in their respective fields but also embodies the values, spirit, and enduring influence of the Institute.",
  "More than a recognition of individual accomplishment, the award represents a celebration of the shared legacy between NID Ahmedabad and its alumni. It seeks to strengthen this enduring association, bring inspiring journeys and significant contributions to wider public attention, and encourage future generations to explore the potential of design as a force for positive change. Through this initiative, the Institute aspires to celebrate achievements that extend beyond professional success and demonstrate how thoughtful, responsible, and human-centred design can help shape a more inclusive, sustainable, and progressive world.",
];

interface Awardee {
  slug: string;
  name: string;
  /** The document's headline: the card's line under the name. */
  headline: string;
  /** The document's role line, which opens the profile. */
  role: string;
  side: number;
  bio: string[];
}

const AWARDEES: Record<44 | 45, Awardee[]> = {
  44: [
    {
      slug: "lakshmi-murthy",
      name: "Lakshmi Murthy",
      headline: "Designing Communication for Social Change",
      role: "Social Communication Designer | Founder, Vikalpdesign",
      side: 294,
      bio: [
        "Lakshmi Murthy is an alumna of NID Ahmedabad whose work demonstrates how design can make essential information accessible, meaningful and actionable for diverse communities.",
        "Murthy has devoted much of her design practice to reproductive and sexual health communication, particularly among rural and urban communities with limited literacy. Through Vikalpdesign, based in Udaipur, she has developed visual learning materials, illustrated publications, flipbooks, audio-based resources and participatory training tools.",
        "A defining contribution of her work is the recognition that effective communication must begin with how people themselves perceive, interpret and understand images. By studying local visual languages and involving communities in the design process, she has helped develop communication approaches that are culturally sensitive and relevant to everyday life.",
        "Her practice represents an important strand of socially responsive design in India, demonstrating that design quality is measured not only by visual appeal, but also by clarity, accessibility and the capacity to support informed decisions.",
      ],
    },
    {
      slug: "pratap-bose",
      name: "Pratap Bose",
      headline: "Shaping the Future of Automotive Design",
      role: "Automotive Designer and Design Leader | NID Alumnus",
      side: 322,
      bio: [
        "Pratap Bose is an internationally experienced automotive designer whose career illustrates the role of design in shaping product identity, mobility and industrial innovation.",
        "An alumnus of NID Ahmedabad and the Royal College of Art, London, Bose has built his career across major automotive companies and international design environments. During his tenure at Tata Motors, he contributed to the development of the company's design direction and the visual identities of its vehicle portfolio. He subsequently joined Mahindra & Mahindra as Executive Vice President and Chief Design Officer in 2021, leading its global design organisation.",
        "His contribution extends beyond individual vehicle styling to the strategic integration of design with engineering, brand identity and product development. His career reflects how designers can translate cultural context, consumer expectations and technological possibilities into distinctive products for competitive global markets.",
        "Bose's professional journey exemplifies the growing influence of Indian design education on international industrial design and the development of products conceived for diverse markets.",
      ],
    },
  ],
  45: [
    {
      slug: "k-b-jinan",
      name: "K. B. Jinan",
      headline: "Reconnecting Design, Craft and Human Learning",
      role: "Designer | Craft Activist and Design Thinker",
      side: 200,
      bio: [
        "K. B. Jinan is recognised for a practice that questions conventional design education and explores the relationship between creativity, traditional knowledge and community-led making.",
        "An alumnus of NID, Jinan has worked extensively with artisan communities, notably through Kumbham in Aruvacode, Kerala. His work with traditional potters explored how local skills, material knowledge and creative intuition could inform contemporary terracotta products without reducing craft to mere decoration or nostalgia.",
        "His design approach challenges the assumption that innovation must originate exclusively from formal professional training. Instead, it recognises artisans as active creators whose accumulated knowledge and understanding of materials are essential sources of design intelligence.",
        "Beyond craft-based production, Jinan has investigated how people develop creativity, aesthetic sensibility and knowledge through direct experience. His contribution offers a valuable perspective on design as a participatory process—one that respects cultural diversity, strengthens the agency of makers and questions standardised approaches to learning.",
      ],
    },
    {
      slug: "david-abraham",
      name: "David Abraham",
      headline: "Reinterpreting Indian Textiles Through Contemporary Design",
      role: "Fashion and Textile Designer | Co-founder, Abraham & Thakore",
      side: 183,
      bio: [
        "David Abraham is an NID Ahmedabad alumnus whose work has helped establish a distinctive contemporary language for Indian textiles, clothing and craft traditions.",
        "Co-founder of the design label Abraham & Thakore, established in 1992 with Rakesh Thakore, Abraham has developed a practice that brings together Indian textile heritage, sophisticated material choices and modern design sensibilities. The label is known for its understated aesthetic, considered detailing and reinterpretation of traditional techniques for contemporary lifestyles.",
        "His contribution lies in demonstrating that heritage and innovation need not be opposing forces. Through clothing and textile-led design, he has helped bring Indian craft traditions into contemporary fashion while building a design identity that resonates with audiences in India and internationally.",
        "Abraham's engagement with textiles also reflects a wider interest in material culture, craftsmanship and sustainability. His work underscores the importance of research, discernment and respect for inherited knowledge in creating products that remain relevant across changing contexts.",
      ],
    },
  ],
};

const body = (html: string[]) => joinBlocks(html.map((p) => richParagraphs(p).text)).body;

/** An awardee as an AlumniCard: a Page hanging off this page, whose parent
 *  picks the Pride bed (CARD_KIND_BY_PARENT). It has no route and never links. */
const card = (a: Awardee): Page => ({
  id: `pride-${a.slug}`,
  title: a.name,
  slug: a.slug,
  parent: PAGE_ID.peoplePrideOfNid,
  template: "secondary",
  utility: "back",
  keyInfo: [],
  hero: [mediaAsset(`/people/pride/${a.slug}.jpg`, a.name, a.side, a.side)],
  intro: a.headline,
  sections: [],
  contacts: [],
  publishedAt: PUBLISHED,
});

let order = 1;
const section = (s: Omit<Section, "page" | "order" | "links" | "contacts">): Section =>
  ({ ...s, page: PAGE_ID.peoplePrideOfNid, order: order++, links: [], contacts: [] }) as Section;

const convocation = (n: 44 | 45): Section[] => [
  section({
    id: `section-pride-convocation-${n}`,
    type: "cards",
    // The document's "44th Convocation Winners", shortened as a heading.
    // TODO(review): content — the convocations' years (question 36).
    title: `${n}th Convocation`,
    items: AWARDEES[n].map(card),
  }),
  ...AWARDEES[n].map((a) =>
    section({
      id: `section-pride-${a.slug}`,
      type: "text",
      title: a.name,
      body: body([`<strong>${a.role}</strong>`, ...a.bio]),
      items: [],
    }),
  ),
];

export const PEOPLE_PRIDE_OF_NID: PageResponse = {
  page: {
    id: PAGE_ID.peoplePrideOfNid,
    // The menu's, sitemap.json's and the home tile's name; the document's
    // "Pride of NID Ahmedabad Award" heads the award's own section.
    title: "Pride of NID",
    slug: "pride-of-nid",
    parent: PAGE_ID.people,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [],
    // The document's own summary line, as written. TODO(review): editor —
    // title case in a sentence.
    intro: "Recognising Excellence, Celebrating Impact, and Inspiring Future Generations",
    sections: [
      section({
        id: "section-pride-award",
        type: "text",
        title: "Pride of NID Ahmedabad Award",
        body: body(ABOUT),
        items: [],
      }),
      ...convocation(44),
      ...convocation(45),
    ],
    contacts: [],
    seoTitle: "Pride of NID | National Institute of Design",
    seoDescription:
      "The Pride of NID Ahmedabad Award recognises alumni who have made a meaningful difference through their professional excellence, creative vision, leadership and commitment to society.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.people, title: "People", path: "/people" },
      { id: PAGE_ID.peoplePrideOfNid, title: "Pride of NID", path: PATH },
    ],
    // Names the band too: "More in People".
    backNav: { label: "People", href: "/people" },
    subPageLinks: [],
    siblingBand: peopleBand(PATH),
  },
};
