// /research/[slug] — the research centres (STAGE-0-NOTES §79): one PageResponse
// per centre that builds, keyed by its route slug, made by one helper. The
// boards are one secondary template eight times (1440 only).
//
// Copy is the CMS's, copied as sent: every centre's document has ONE "About"
// section whose paragraphs are the board's sections, so each section here names
// the paragraphs it is (`cms`), and getPage slices the CMS section by them,
// guarded by the paragraph count (`of`, §59). LIVE and FIXTURE read the same
// text. Board text appears only where the CMS has none, marked.
//
// Each hero is the centre's own CMS hero-1, copied to public/research/ — never
// the landing's photo or another centre's, which several boards use as
// placeholders. The landing's tiles take these same objects (fixtures/research.ts),
// so each file has one owner. TODO(review): the alt texts are the CMS's, which
// name the centre rather than describe the photograph.
//
// TODO(designer): six boards put the contacts in the rail and have no key info;
// the template's rule wins for all eight — key info in the rail, the page's
// contacts in column 4 of the first section (Campuses' precedent).
import type { Link, PageResponse, Section } from "@/lib/content-model";
import { PAGE_ID, pageIdOf } from "@/lib/content/pages";
import { researchPath, type ResearchCentre } from "@/lib/content/research-centres";
import { researchBand } from "@/lib/content/sibling-bands";
import { mediaAsset } from "@/lib/media";

const PUBLISHED = "2026-10-03T00:00:00+05:30";

interface CentreSection {
  /** The id's last part: `section-<centre>-<key>`. */
  key: string;
  title: string;
  body: string;
  /** Which paragraphs of the CMS's "About" this section is, 1-based and
   *  inclusive. Absent: board-only, the fixture's in both modes. */
  cms?: [from: number, to: number];
  links?: Link[];
}

interface Centre {
  title: string;
  /** The standfirst: a copy of the CMS's heroText. */
  intro: string;
  /** public/research/<file>, the centre's own CMS hero-1 (1520 × 700). */
  hero: { file: string; alt: string };
  keyInfo?: Array<{ label: string; value: string }>;
  email: string;
  phone: string;
  sections: CentreSection[];
  /** The CMS "About" section's paragraph count the slices were written against. */
  of: number;
}

/** How getPage slices each centre's CMS "About" section. */
export interface CentreSlices {
  of: number;
  sections: Record<string, [from: number, to: number]>;
}

const sectionId = (slug: string, key: string) => `section-${slug}-${key}`;

function centrePage(slug: ResearchCentre, c: Centre): PageResponse {
  const path = researchPath(slug);
  // A ninth centre needs no PAGE_ID entry: nothing links it by id.
  const id = pageIdOf(path) ?? `page-research-${slug}`;
  const sections: Section[] = c.sections.map((s, i) => ({
    id: sectionId(slug, s.key),
    page: id,
    order: i + 1,
    type: "text",
    title: s.title,
    body: s.body,
    items: [],
    links: s.links ?? [],
    contacts: [],
  }));
  return {
    page: {
      id,
      title: c.title,
      slug,
      parent: PAGE_ID.research,
      template: "secondary",
      utility: "back",
      keyInfo: c.keyInfo ?? [],
      hero: [mediaAsset(`/research/${c.hero.file}` as `/${string}`, c.hero.alt, 1520, 700)],
      intro: c.intro,
      sections,
      // Copies of the CMS's two contacts; LIVE, the CMS's replace them.
      contacts: [
        { label: "Email", value: c.email },
        { label: "Phone", value: c.phone },
      ],
      seoTitle: c.title,
      publishedAt: PUBLISHED,
    },
    derived: {
      menuTree: [],
      breadcrumb: [
        { id: PAGE_ID.research, title: "Research & Publications", path: "/research" },
        { id, title: c.title, path },
      ],
      backNav: { label: "Research & Publications", href: "/research" },
      subPageLinks: [],
      // TODO(designer): each board orders its band differently; this is the
      // /research rail's order (sitemap.json) minus this centre.
      siblingBand: researchBand(path),
    },
  };
}

const campusLink = (id: string, label: string, page: string): Link => ({
  id,
  label,
  targetType: "page",
  page,
});

const CENTRES: Record<ResearchCentre, Centre> = {
  "natural-fiber": {
    title: "Innovation Center for Natural Fiber",
    intro:
      "Researching natural fibre materials for sustainable product and textile design.",
    hero: { file: "natural-fiber.jpg", alt: "Innovation Center for Natural Fiber" },
    // TODO(review): the board's facts. The CMS has them only in prose (About's
    // first paragraph names the same six fibres); backend — structured key info.
    keyInfo: [
      { label: "Campus", value: "Gandhinagar" },
      {
        label: "Priority fibres",
        value: "Banana, Bamboo, Coir, Hemp, Jute, Water Hyacinth",
      },
    ],
    email: "icnf@nid.edu",
    phone: "+91 79 23265 507",
    of: 2,
    sections: [
      // TODO(designer): the board puts the campus CTA beside the photo; the utility
      // rule puts it on the title row (§73).
      {
        key: "about",
        title: "About",
        body: "The Innovation Center for Natural Fiber (ICNF) operates as an exploratory Research & Development Lab situated at NID's Gandhinagar campus. Drawing on six decades of design education, the centre applies design-driven approaches to India's natural fibre resources and sustainability goals, prioritising six fibres: banana, bamboo, coir, hemp, jute, and water hyacinth. It collaborates with domestic and international institutions to develop sustainable applications using these materials as primary resources.",
        cms: [1, 1],
        links: [
          campusLink(
            "link-natural-fiber-campus",
            "Gandhinagar Campus",
            PAGE_ID.campusGandhinagar,
          ),
        ],
      },
      {
        key: "mission-vision",
        title: "Mission & Vision",
        body: "Mission: to grow capacity and opportunities for research, creative, and innovation activities, leveraging available skills and partnerships to generate knowledge with academic, economic, and social benefits. Vision: to establish an innovation-driven research culture emphasising sustainability and natural materials, supported by modern infrastructure and services.",
        cms: [2, 2],
      },
    ],
  },
  icic: {
    title: "International Centre for Indian Crafts (ICIC)",
    intro:
      "Building a national and international network for crafts design research, training, and knowledge dissemination.",
    hero: { file: "icic.jpg", alt: "International Centre for Indian Crafts" },
    email: "icic@nid.edu",
    phone: "+91 79 23265 512",
    of: 2,
    sections: [
      {
        key: "about",
        title: "About",
        body: "The International Centre for Indian Crafts (ICIC) is established to effectively understand the strengths, weaknesses, opportunities, and threats of a particular crafts sector in its local context. The centre applies design expertise to strengthen Indian craft traditions through collaborative, sustainable approaches.",
        cms: [1, 1],
      },
      {
        key: "approach",
        title: "Approach",
        body: "India maintains significant craft traditions reflecting diverse regional and socio-cultural profiles. ICIC develops a national and international network for crafts design research, training, and knowledge dissemination, to support the sector's development and economy.",
        cms: [2, 2],
      },
    ],
  },
  bamboo: {
    title: "Center for Bamboo Initiatives",
    intro:
      "Bamboo-based research, design, technical development, and training, across NID's campuses.",
    hero: { file: "bamboo.jpg", alt: "Center for Bamboo Initiatives" },
    email: "bamboocentre@nid.edu",
    phone: "+91 80 2972 5006 Ext. 115",
    of: 2,
    sections: [
      // TODO(designer): the board puts the campus CTA beside the photo (§73).
      {
        key: "about",
        title: "About",
        body: "The Center for Bamboo Initiatives operates across multiple NID campuses, focusing on bamboo-based research, design, technical development, and training. It serves as a collaborative space for faculty, students, and designers engaged in innovation within the bamboo sector — supporting entrepreneurs with knowledge resources, facilitating stakeholder connections, and advancing bamboo-based ecosystem development both domestically and internationally.",
        cms: [1, 1],
        links: [
          campusLink("link-bamboo-campus", "Bengaluru Campus", PAGE_ID.campusBengaluru),
        ],
      },
      {
        key: "activities",
        title: "Activities",
        body: "Key activities encompass new product development, joints, finishes, the introduction of new tools and equipment, and building curriculum and institutions. The centre regularly organises seminars, workshops, and World Bamboo Day celebrations, particularly at the Bengaluru campus, and actively participates in national and international events to showcase innovations in sustainable bamboo applications.",
        cms: [2, 2],
      },
    ],
  },
  railway: {
    title: "Railway Design Center",
    intro:
      "A dedicated centre for railway coach, station, and passenger-experience design.",
    hero: { file: "railway.jpg", alt: "Railway Design Center" },
    // TODO(review): the board's facts. The CMS has the MoU only in prose (its
    // detail.about and About's first paragraph); backend — structured key info.
    keyInfo: [
      { label: "Campus", value: "Ahmedabad" },
      { label: "Established", value: "MoU with Ministry of Railways, 10 April 2015" },
    ],
    email: "studiordc@nid.edu",
    phone: "+91 79 26629 786",
    of: 2,
    sections: [
      {
        key: "about",
        title: "About",
        body: "NID Ahmedabad and India's Ministry of Railways signed a Memorandum of Understanding on 10 April 2015, fostering collaboration in design fields relevant to rail transport, focused on design, research, innovation, and developing superior design solutions. The initiative seeks to establish best design practices in transportation design for Indian Railways, engaging young designers, service providers, researchers, and professionals through the Railway Design Centre at NID.",
        cms: [1, 1],
      },
      {
        key: "focus-areas",
        title: "Focus Areas",
        body: "The partnership concentrates on several primary domains: station improvements (colour scheme of station buildings, platform shelters, station name boards, signage and display boards), coach enhancements (layouts, colour schemes, lighting, air-conditioning, and passenger comfort), online and freight service systems and specialised tools such as lightweight inspection trolleys, environmental and public relations initiatives, and the design of Indian Railways branding, commemorative stamps and coins, and exhibition materials.",
        cms: [2, 2],
      },
    ],
  },
  handloom: {
    title: "Smart Handloom Innovation Centre",
    intro:
      "Integrating modern technologies into handloom textile creation, in partnership with the Government of Karnataka.",
    hero: { file: "handloom.jpg", alt: "Smart Handloom Innovation Centre" },
    email: "shic@nid.edu",
    phone: "+91 79 26629 605",
    of: 2,
    sections: [
      {
        key: "about",
        title: "About",
        body: "The handloom sector faces significant challenges in preserving traditional skills while meeting contemporary market demands for sustainability. In 2018–19, the Government of Karnataka approved establishing the Smart Handlooms Innovation Center in partnership with the National Institute of Design, as sanctioned by the Chief Minister.",
        cms: [1, 1],
      },
      {
        key: "purpose",
        title: "Purpose",
        body: "The centre's primary objective is integrating modern technologies into handloom textile creation. By merging traditional craftsmanship with contemporary maker culture, the initiative aims to develop a new generation of weavers equipped with both heritage knowledge and technological expertise, while providing continuous design assistance to Karnataka's textile industry. SHIC operates as a collaborative resource platform uniting weavers with professionals spanning design, research, technology, and marketing, with a mission to restore handloom weaving's prestige as both a sustainable livelihood and vibrant cultural practice throughout Karnataka.",
        cms: [2, 2],
      },
    ],
  },
  // TODO(review): backend — the board's "IPR Catalogue (PDF)" and "Article on IPR
  // — Rupankan" CTAs have no file or URL anywhere; no CTA until they do.
  ipr: {
    title: "Intellectual Property Rights Cell",
    intro:
      "Protecting NID's creative and innovative output through appropriate legal mechanisms.",
    hero: { file: "ipr.jpg", alt: "Intellectual Property Rights Cell" },
    email: "ipr@nid.edu",
    phone: "+91 79 26629689",
    of: 3,
    sections: [
      {
        key: "about",
        title: "About",
        body: "The National Institute of Design actively promotes creativity and innovation to generate intellectual property. The institute established an IPR Cell to protect these creations through appropriate legal mechanisms.",
        cms: [1, 1],
      },
      // TODO(review): editor — the CMS paragraph opens with its own heading in
      // <strong>; rendered as sent, so the title repeats.
      {
        key: "role",
        title: "Role of NID's IPR Cell",
        body: "<strong>Role of NID's IPR Cell</strong> — the Cell provides all assistance and guidance for filing of IPR, preparation of documents, and IPR-related support in commercialisation of protected works. The institute covers all filing costs without charging students. Prior existence searches are conducted to avoid duplicate applications, and the Cell reserves discretion to decline filing requests if products involve socially sensitive content or where IP protection might restrict beneficial open distribution.",
        cms: [2, 2],
      },
      {
        key: "recognition",
        title: "Recognition",
        body: "NID's IPR Cell received the ‘Best IP Campus of the Year – 2019’ designation under the Non-Legal Category, from the Intellectual Property Protection Organisation.",
        cms: [3, 3],
      },
    ],
  },
  "nid-press": {
    title: "NID Press",
    intro:
      "An independent publishing initiative of NID, publishing books, monographs, catalogues, and more since 1961.",
    hero: { file: "nid-press.jpg", alt: "NID Press" },
    email: "publications@nid.edu",
    phone: "+91 79 26629 741",
    of: 3,
    sections: [
      // The CMS's three paragraphs, mapped by meaning against the board: 1 is the
      // board's About 1; 2 is its About 2 (The India Report, The Ahmedabad
      // Declaration) and also names the partner publishers the board puts under
      // Catalogue — a paragraph cannot be split, and most of it is About; 3 matches
      // neither, so it goes to About (CMS text is never dropped).
      {
        key: "about",
        title: "About",
        body:
          "NID Press operates as an independent publishing initiative under the National Institute of Design, Ahmedabad, established in 1961. The press publishes across multiple formats, including books, conference proceedings, monographs, archival publications, anthologies, graphic novels, reprints, catalogues, and magazines." +
          "\n\n" +
          "Key historical publications include The India Report (1958) by Charles and Ray Eames, which shaped NID's foundational educational philosophy, and The Ahmedabad Declaration (1979), addressing industrial design standards for India's diverse needs. The press has partnered with publishers such as Tulika Books, Tara Publishing, Wisdom Tree, Mapin, and Manohar Publishers to expand its reach, with notable contributors including design educators H. Kumar Vyas, I.S. Mathur, and M.P. Ranjan." +
          "\n\n" +
          "Recent publications feature perspectives from students, faculty, staff, and alumni examining design as both a practical discipline and a philosophical framework within national and global contexts.",
        cms: [1, 3],
      },
      // Board-only, both modes: no CMS paragraph is about the catalogue. The
      // board's second Catalogue paragraph (the partner publishers) is left out:
      // the CMS's About already names them. TODO(review): content; backend — the
      // catalogue PDF (the board's "NID Press Catalogue 2026" CTA) as a file.
      {
        key: "catalogue",
        title: "Catalogue",
        body: "The NID Press 2026 Catalogue lists current and forthcoming titles across the Press’s imprints.",
      },
    ],
  },
};

/** The centres that build, keyed by route slug. */
export const RESEARCH_CENTRE_PAGES = Object.fromEntries(
  (Object.entries(CENTRES) as Array<[ResearchCentre, Centre]>).map(([slug, c]) => [
    slug,
    centrePage(slug, c),
  ]),
) as Record<ResearchCentre, PageResponse>;

/** Each centre's slices of its CMS "About" section, by fixture section id. */
export const RESEARCH_CENTRE_SLICES = Object.fromEntries(
  (Object.entries(CENTRES) as Array<[ResearchCentre, Centre]>).map(([slug, c]) => [
    slug,
    {
      of: c.of,
      sections: Object.fromEntries(
        c.sections.flatMap((s) => (s.cms ? [[sectionId(slug, s.key), s.cms]] : [])),
      ),
    },
  ]),
) as Record<ResearchCentre, CentreSlices>;
