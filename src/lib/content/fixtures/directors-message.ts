// /about/directors-message — Director's Message page content fixture. The board's
// copy, verbatim; the CMS's "Message" section feeds the three bodies by block
// (getPage.ts), everything else stays here (STAGE-0-NOTES §60).
import type { PageResponse } from "@/lib/content-model";
import type { EditorialSection } from "@/lib/content/editorial";
import { PAGE_ID } from "@/lib/content/pages";
import { mediaAsset } from "@/lib/media";

const PUBLISHED = "2026-07-23T00:00:00+05:30";

// Untitled: the board leaves column 1 empty beside every body.
function prose(id: string, body: string, pullQuote?: string): EditorialSection {
  return {
    id,
    page: PAGE_ID.directorsMessage,
    order: 0,
    type: "text",
    title: "",
    body,
    items: [],
    links: [],
    contacts: [],
    ...(pullQuote ? { pullQuote } : {}),
  };
}

const OPENING = prose(
  "section-dm-opening",
  "It is truly an honour to serve this great institution that has always stood up to emerging local and global challenges through the power of design. ‘The World of Indian Design’ is now in a leadership position to contribute to the ‘Design of the World’. We are in the process of taking up many collaborative initiatives with support from public involved with the nation’s economic and social sectors. Before we embark on these challenges afresh, we need some reflection and rethinking on the fundamental notions of ‘Design’ in the Indian context.",
);

// Both quotes are the Director's own sentences from the body that follows them
// — chosen by the board, not by us. Neither exists in the CMS (no quote block).
const BODY_1 = prose(
  "section-dm-body-1",
  [
    "There is a lot of discussion on ‘wicked problems in design thinking’. Rarely do we look at design or a particular conception of design itself as a ‘wicked’ problem. The mainstream notion of design centered around the transformation of the artificial world for human consumption takes a slightly extreme end of the spectrum perspective, instead of an entire spectrum ranging from art, craft, engineering, architecture, design and many more. Being an alumnus of Visva-Bharati and NID, I am fortunate to empathize with both viewpoints. However, contemporary design has a lot to learn from the holistic, integrated, and evolved notions of art, craft, engineering, and architecture. The concept of kala evolved in the Indian subcontinent over several thousand years and does not explicitly distinguish between fine arts and practical arts. Similarly, manifestations of arts, crafts, architecture, and traditional engineering reflect much more diversity across India's diverse regions and cultures compared to contemporary design.",
    "Even within Europe from where design has evolved, the word ‘design’ or its equivalent takes on a different meaning in each country. For example, the German concept of ‘Design’ is very different from the Italian notion of ‘Disegno’. There is a need to redefine our idea of design that is culturally rooted and that can address diverse challenges of different regions in the Indian context.",
    "The second concern I have relates to the ‘purpose of design’. All forms of design aim to improve the human condition through creation, modification, and transformation of the physical world. Unfortunately, this aim is often mediated by powerful personal, social, economic, and political forces leading to compromised design outcomes. Design with a strong connection to materialistic consumption supported by market forces, needs to be re-envisioned for a society that has always had deep-rooted spiritual values at the core. Design is now recognized as a transformative force for improving the ‘standard of living’ for many. For a welfare state such as India, this also needs to be complemented with equal, if not more, emphasis on improving the ‘quality of life’ for all. Hence, there is a need for a paradigm shift in focus on improving the standard of living for few to improving the quality of life of many.",
  ].join("\n\n"),
  "“There is a need for a paradigm shift in focus on improving the standard of living for few to improving the quality of life of many.”",
);

// The board ends with a closing paragraph ("I invite all of you…") that the
// CMS's eight blocks do not have; with the CMS on, the API's version renders and
// that line is lost until the backend adds it (gap report).
const BODY_2 = prose(
  "section-dm-body-2",
  [
    "The third perspective that needs more clarity in the Indian context is the ‘human centeredness of design’. Quite often the human centeredness ranges from human-centered to customer-centered to consumer-centered to user-centered design by the level of abstractness of the concept. However, ancient spiritual philosophy of India puts humans as an integral part of the outer and inner cosmic existence. Human-centered design needs to expand beyond the materialistic, physical to the transcendental and spiritual realms considering the intangible value system of human existence. Even within the physical realm, the entire spectrum of users, makers, designers, sponsors, and other enablers needs to be considered as an integral part of the design process. Over several decades of commitment, NID has demonstrated the power of ‘maker-centric design’ through professional projects in collaboration with stakeholders.",
    "There is no value in excellent design that is divorced from reality, that is out of context and not in sync with the momentum that is gaining ground. India is now one of the world's largest and fastest growing economies, and design initiatives need to keep pace with the idiom of ‘faster, affordable and better’ solutions that are aligned with the immediate context. When NID was set up in the 1960s, we conversant with design thinking and had the resources, technology, and intellectual and professional orientation. We are now in the process of re-envisioning our programmes to keep pace with the national and international educational policies and perspectives. Efforts are also in place to support professional education with research chairs, design innovation centers, and design incubation centers in collaboration with stakeholders. There is also a need for curricular reforms that incorporate contemporary design thinking alongside Indian knowledge systems to celebrate originality, innovation, and sustainability.",
    "The fifth dimension where maximum effort is needed refers to the ‘level of design intervention’. Design is amazingly systemic at macro level and at the same time being elemental at micro level. Design has a lot to contribute at all levels of the spectrum; namely, the individual community, regional, national, and at the global levels. The design profession has been very successful in contributing at the individual level, as it is relatively easier to visualize and realize products, services and systems at this level. We, at NID, have demonstrated and made significant contributions through collaborative design solutions at the community level. India has a vast regional diversity and this diversity is not well reflected in the design outcomes which tend to imitate and promote an outdated mono-aesthetic value system. At NID, we would like to expand our qualitative and quantitative capacity to scale up our strengths to make meaningful contributions through design as a powerful engine for national and international development.",
    "How do we address all the challenges outlined above? Harold Nelson through ‘The Design Way’, popularized the notion of ‘design as a culture of inquiry and action’. Dr Jaishankar, through ‘The India Way’ called for ‘rediscovering India's unique identity’ in the global arena. The late Prof M.P Ranjan, through his lifetime contributions, reflected on ‘The NID Way’, which is a unique institutional spirit that defined NID's design efforts in teaching, research, and practice over six decades.",
    "I invite all of you to join us in re-envisioning design thinking for an emergent and vibrant India through our collective efforts in ideas, words, and actions.",
  ].join("\n\n"),
  "There is no value in excellent design that is divorced from reality, that is out of context and not in sync with the momentum that is gaining ground",
);

export const DIRECTORS_MESSAGE: PageResponse = {
  page: {
    id: PAGE_ID.directorsMessage,
    title: "Director's Message",
    slug: "directors-message",
    parent: PAGE_ID.about,
    template: "secondary",
    utility: "back",
    // The Person card: the row's label is the role overline, its value the name.
    // The model has no person slot on a page; key info is its "who / what" rail.
    keyInfo: [{ label: "Director", value: "Dr. Ashok Mondal" }],
    // The PORTRAIT, not a banner — this board has no hero. The CMS's `hero` is
    // the same 300 × 300 photograph, so the adapter's hero mapping feeds it.
    hero: [
      mediaAsset(
        "/about/ashok-mondal.jpg",
        "Dr. Ashok Mondal, Director, National Institute of Design",
        300,
        300,
      ),
    ],
    sections: [OPENING, BODY_1, BODY_2],
    contacts: [],
    seoTitle: "Director's Message",
    seoDescription:
      "A message from Dr. Ashok Mondal, Director of the National Institute of Design, on re-envisioning design thinking in the Indian context.",
    publishedAt: PUBLISHED,
  },
  derived: {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.about, title: "About NID", path: "/about" },
      { id: PAGE_ID.directorsMessage, title: "Director's Message", path: "/about/directors-message" },
    ],
    backNav: { label: "About NID", href: "/about" },
    subPageLinks: [],
    // siblings(About) minus self, in the board's order, reading across.
    siblingBand: [
      { id: PAGE_ID.charter, title: "Charter", href: "/about/charter" },
      { id: PAGE_ID.history, title: "History", href: "/about/history" },
      { id: PAGE_ID.campuses, title: "Campuses", href: "/about/campuses" },
      { id: PAGE_ID.newsEvents, title: "News & Events", href: "/about/news-events" },
      { id: PAGE_ID.ourThemes, title: "Our Themes", href: "/about/our-themes" },
    ],
  },
};
