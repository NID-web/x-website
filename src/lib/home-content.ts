/**
 * Home / Landing page — static content.
 *
 * A bespoke tile grid, NOT the editorial Section model (design/tokens/
 * content-model.ts stays the backend contract and is not edited here). This
 * file holds STRUCTURE ONLY — tile kind, source order, hrefs, dates, image
 * refs and `*Key` pointers into the "Home" namespace of messages/en.json.
 * All translatable prose lives in the messages file; proper nouns, addresses
 * and pre-formatted date strings are data and live here.
 *
 * CMS-adoptable later: swap HOME_TILES/HOME_FOOTER for a fetch and resolve the
 * `*Key`s to strings server-side.
 */
import type { MediaAsset } from "@/lib/content-model";

/** A dotted key into the "Home" message namespace, e.g. "study.heading". */
export type CopyKey = string;

/** Resolves a CopyKey to its string in the active locale. HomeGrid builds this
 *  from getTranslations("Home") and threads it to each tile. */
export type Translate = (key: CopyKey) => string;

export interface HomeCta {
  labelKey: CopyKey; // never contains an arrow — the arrow is an icon slot
  href: string;
  external?: boolean;
}

export interface HomeLink {
  labelKey: CopyKey;
  href: string;
  metaKey?: CopyKey; // small meta line under the label
  external?: boolean;
}

export interface CalendarRow {
  labelKey: CopyKey;
  date: string; // pre-formatted, editorial ranges — data, not translated
}

export interface NewsRow {
  headlineKey: CopyKey;
  date: string;
  href: string;
  thumbnail: MediaAsset;
}

export type SocialPlatform = "x" | "facebook" | "instagram" | "youtube";
export interface SocialLink {
  platform: SocialPlatform;
  href: string;
}
export interface ContactLink {
  label: string; // the address itself — data
  href: string; // mailto: / tel:
}

interface Base {
  /** Stable React key and future CMS id. */
  id: string;
}

export type HomeTile =
  | (Base & { kind: "statement"; textKey: CopyKey })
  | (Base & { kind: "hero"; media: MediaAsset })
  | (Base & {
      kind: "linkList";
      headingKey?: CopyKey;
      overlineKey?: CopyKey;
      links: HomeLink[];
      gradient?: boolean;
    })
  | (Base & { kind: "calendar"; overlineKey: CopyKey; rows: CalendarRow[]; cta?: HomeCta })
  | (Base & { kind: "news"; overlineKey: CopyKey; rows: NewsRow[]; cta?: HomeCta })
  | (Base & { kind: "feature"; serifKey: CopyKey; subKey?: CopyKey; cta?: HomeCta })
  | (Base & {
      kind: "portrait";
      overlineKey?: CopyKey;
      photo: MediaAsset;
      nameKey: CopyKey;
      bioKey?: CopyKey;
      /** Craft bed behind the portrait: the shared motif on the left, and the
       *  named bandhani scatter on the right. Both portrait tiles carry one in
       *  the design, but the two scatters differ — Pride's is denser and on a
       *  different three colours. */
      bed?: "alumni" | "pride";
    })
  | (Base & { kind: "pattern"; seed?: number })
  | (Base & {
      kind: "mediaCard";
      media?: MediaAsset;
      surface?: "media" | "inverse";
      overlineKey?: CopyKey;
      titleKey: CopyKey;
      date?: string;
      labelPlacement?: "overlay" | "below";
      bylineKey?: CopyKey;
      bylineAvatar?: MediaAsset;
      href?: string;
    })
  | (Base & { kind: "quote"; quoteKey: CopyKey; avatar?: MediaAsset; attribution: HomeCta })
  | (Base & {
      kind: "roster";
      headingKey: CopyKey;
      bodyKey?: CopyKey;
      avatars: MediaAsset[];
      cta?: HomeCta;
    })
  | (Base & { kind: "spine"; headingKey: CopyKey; spines: string[] });

export interface FooterContent {
  primaryLinks: HomeLink[];
  secondaryLinks: HomeLink[];
  contactOverlineKey: CopyKey;
  contacts: ContactLink[];
  social: SocialLink[];
  /** A single pre-composed strip (its own baked heading + partner logos), not a
   *  set of separate marks — the Figma footer ships it as one export. */
  collaborations: MediaAsset;
}

/** THE single place home imagery resolves. Everything under public/home/ is the
 *  real design photography (verified image-by-image against the Figma Make
 *  export's masters — same shots, web-sized), so nothing here is a placeholder
 *  any more.
 *
 *  When the CMS serves media, this helper is the whole migration: change the
 *  path it builds, or replace its call sites with server-provided MediaAssets,
 *  and delete public/home/. No tile component references an image path
 *  directly. Every asset keeps a real alt (the model requires it) and a
 *  square-ish natural size. */
// basePath does NOT reach these. Next prefixes _next/* assets and <Link> hrefs
// with it, but a raw src pointing into public/ is passed through untouched — so
// under GitHub Pages (site served from /x-website/) every photo would resolve
// against the domain root and 404. Set for the export build only; empty on a
// normal build and in dev, where the site is served from /.
const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function img(file: string, alt: string, w = 800, h = 800): MediaAsset {
  return { id: file, file: `${ASSET_BASE}/home/${file}`, alt, width: w, height: h };
}

// Source order = the Figma bento, row by row, left → right (see get_metadata).
// Only the hero spans 2 columns; everything else is one square cell.
export const HOME_TILES: HomeTile[] = [
  // ── row 1 ──────────────────────────────────────────────────────────────
  { id: "statement", kind: "statement", textKey: "statement" },
  {
    id: "hero",
    kind: "hero",
    media: img("hero-forest.jpg", "Sunlight through trees at an NID campus.", 1400, 660),
  },
  {
    id: "study",
    kind: "linkList",
    headingKey: "study.heading",
    gradient: true,
    links: [
      { labelKey: "study.bdes", metaKey: "study.bdesMeta", href: "/study/bdes" },
      { labelKey: "study.mdes", metaKey: "study.mdesMeta", href: "/study/mdes" },
      { labelKey: "study.phd", metaKey: "study.phdMeta", href: "/study/phd" },
      { labelKey: "study.fdp", metaKey: "study.fdpMeta", href: "/study/fdp" },
    ],
  },
  // ── row 2 ──────────────────────────────────────────────────────────────
  {
    id: "academic",
    kind: "calendar",
    overlineKey: "academic.overline",
    rows: [
      { labelKey: "academic.r1", date: "June 1 to June 5 2026" },
      { labelKey: "academic.r2", date: "July 9 & 10 2026" },
      { labelKey: "academic.r3", date: "Mon, July 13 2026" },
      { labelKey: "academic.r4", date: "Fri, Aug 7 2026  &  Fri, Oct 16 2026" },
    ],
  },
  {
    id: "news",
    kind: "news",
    overlineKey: "news.overline",
    rows: [
      {
        headlineKey: "news.r1",
        date: "July 23 2026",
        href: "/news/artisans-honoured",
        thumbnail: img("news-1.jpg", "Artisans at the ceremony.", 200, 200),
      },
      {
        headlineKey: "news.r2",
        date: "July 23 2026",
        href: "/news/incubation-centre",
        thumbnail: img("news-2.jpg", "The new innovation centre.", 200, 200),
      },
      {
        headlineKey: "news.r3",
        date: "July 23 2026",
        href: "/news/kmc-membership",
        thumbnail: img("news-3.jpg", "Inside the Knowledge Management Centre.", 200, 200),
      },
    ],
    cta: { labelKey: "cta.allNews", href: "/news" },
  },
  {
    id: "national-importance",
    kind: "feature",
    serifKey: "nationalImportance.serif",
    subKey: "nationalImportance.sub",
    cta: { labelKey: "cta.readAct", href: "/about/act" },
  },
  {
    id: "alumni",
    kind: "portrait",
    overlineKey: "alumni.overline",
    photo: img("alumni-keshavan.jpg", "Portrait of Sujata Keshavan.", 400, 400),
    nameKey: "alumni.name",
    bioKey: "alumni.bio",
    bed: "alumni",
  },
  // ── row 3 ──────────────────────────────────────────────────────────────
  { id: "pattern-3", kind: "pattern", seed: 3 },
  {
    id: "drawing-dialogues",
    kind: "mediaCard",
    media: img("workshop-drawing.jpg", "Ink drawing on deep blue.", 700, 700),
    overlineKey: "drawing.overline",
    titleKey: "drawing.title",
    date: "Oct 30 & 31 2026",
    labelPlacement: "below",
    href: "/events/drawing-dialogues",
  },
  {
    id: "pride",
    kind: "portrait",
    overlineKey: "pride.overline",
    photo: img("pride-murthy.jpg", "Portrait of Dr. Lakshmi Murthy.", 400, 400),
    nameKey: "pride.name",
    bioKey: "pride.bio",
    bed: "pride",
  },
  {
    id: "campuses",
    kind: "mediaCard",
    media: img("campuses.jpg", "The NID campus courtyard.", 700, 700),
    titleKey: "campuses.title",
    labelPlacement: "overlay",
    href: "/campuses",
  },
  // ── row 4 ──────────────────────────────────────────────────────────────
  {
    id: "shifting-paradigms",
    kind: "mediaCard",
    // The maroon "Call for Papers" surface is a background IMAGE, not a colour —
    // an overlay card, label over a scrim (user-confirmed).
    media: img("shifting-paradigms.jpg", "Shifting Paradigms — call for papers.", 700, 700),
    overlineKey: "callForPapers.overline",
    titleKey: "callForPapers.title",
    date: "Feb 23 – 25 2027",
    labelPlacement: "overlay",
    href: "/events/shifting-paradigms",
  },
  {
    id: "director",
    kind: "quote",
    quoteKey: "director.quote",
    avatar: img("director.jpg", "Portrait of the Director.", 200, 200),
    attribution: { labelKey: "cta.directorsNote", href: "/about/director" },
  },
  { id: "pattern-1", kind: "pattern", seed: 1 },
  {
    id: "faculty",
    kind: "roster",
    headingKey: "faculty.heading",
    bodyKey: "faculty.body",
    avatars: [
      img("faculty-1.jpg", "Faculty portrait.", 160, 160),
      img("faculty-2.jpg", "Faculty portrait.", 160, 160),
      img("faculty-3.jpg", "Faculty portrait.", 160, 160),
      img("faculty-4.jpg", "Faculty portrait.", 160, 160),
      img("faculty-5.jpg", "Faculty portrait.", 160, 160),
      img("faculty-6.jpg", "Faculty portrait.", 160, 160),
    ],
    cta: { labelKey: "cta.learnMore", href: "/about/history" },
  },
  // ── row 5 ──────────────────────────────────────────────────────────────
  {
    id: "research",
    kind: "mediaCard",
    media: img("research.jpg", "Stacked NID publications.", 700, 700),
    titleKey: "research.title",
    labelPlacement: "overlay",
    href: "/research",
  },
  { id: "pattern-2", kind: "pattern", seed: 2 },
  {
    id: "young-designers",
    kind: "mediaCard",
    media: img("young-designers.jpg", "A hybrid business board game.", 700, 700),
    overlineKey: "youngDesigners.overline",
    titleKey: "youngDesigners.title",
    bylineKey: "youngDesigners.byline",
    bylineAvatar: img("young-designer-yadav.jpg", "Portrait of Manish Yadav.", 120, 120),
    labelPlacement: "below",
    href: "/young-designers/hybrid-board-game",
  },
  {
    id: "kmc",
    kind: "spine",
    headingKey: "kmc.heading",
    spines: [
      "The India Report",
      "Designing Design",
      "A Pattern Language",
      "Visual Thinking",
      "Thoughtless Acts?",
      "The Nature of Order",
      "Head, Hand & Heart",
      "Design as Art",
    ],
  },
];

export const HOME_FOOTER: FooterContent = {
  primaryLinks: [
    { labelKey: "footer.careers", href: "/careers" },
    { labelKey: "footer.ids", href: "/integrated-design-services" },
    { labelKey: "footer.placements", href: "/placements" },
    { labelKey: "footer.youngDesigners", href: "/young-designers" },
    { labelKey: "footer.alumniReg", href: "/alumni/registration" },
    { labelKey: "footer.tenders", href: "/tenders" },
    { labelKey: "footer.pmVidyalaxmi", href: "/pm-vidyalaxmi" },
  ],
  secondaryLinks: [
    { labelKey: "footer.rti", href: "/right-to-information" },
    { labelKey: "footer.privacy", href: "/privacy-policy" },
    { labelKey: "footer.terms", href: "/terms" },
    { labelKey: "footer.sitemap", href: "/sitemap" },
  ],
  contactOverlineKey: "footer.contact",
  contacts: [
    { label: "info@nid.edu", href: "mailto:info@nid.edu" },
    { label: "cmc@nid.edu", href: "mailto:cmc@nid.edu" },
    { label: "+91 79 2662 9500", href: "tel:+917926629500" },
    { label: "+91 79 2662 9600", href: "tel:+917926629600" },
  ],
  social: [
    { platform: "x", href: "https://x.com/nid_ahmedabad" },
    { platform: "facebook", href: "https://facebook.com/nid.ahmedabad" },
    { platform: "youtube", href: "https://youtube.com/@nid" },
    { platform: "instagram", href: "https://instagram.com/nid.ahmedabad" },
  ],
  collaborations: img(
    "collaborations.png",
    "Collaborations — Skill India, India.gov.in, Make in India, meriPehchaan, Ministry of Women & Child Development, Khelo India.",
    330,
    161,
  ),
};
