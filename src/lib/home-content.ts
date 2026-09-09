/**
 * Home / Landing page tile data and static content definitions.
 */
import type { MediaAsset } from "@/lib/content-model";
import { assetPath, mediaAsset } from "@/lib/media";

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
  /** Optional destination. A row with one becomes a link and takes the hover
   *  treatment — rule to border/default, arrow revealed at the right. Without
   *  one the row is plain text and shows no affordance, because an arrow that
   *  goes nowhere is a lie about what a click will do. */
  href?: string;
}

export interface NewsRow {
  headlineKey: CopyKey;
  date: string;
  href: string;
  thumbnail: MediaAsset;
}

interface Base {
  /** Stable React key and future CMS id. */
  id: string;
}

/** A self-hosted clip a tile plays in place, with the tile's own image as the
 *  still behind it. `src` is a resolved URL — build it with `assetPath`, never as a
 *  bare "/…" literal, or it 404s under the GitHub Pages basePath. Not an embed: nothing is
 *  fetched from a third party, so there is no consent surface and no player
 *  chrome to fight. */
export interface HomeVideo {
  src: string;
  title: string;
}

export type HomeTile =
  | (Base & { kind: "statement"; textKey: CopyKey })
  | (Base & { kind: "hero"; media: MediaAsset; video?: HomeVideo })
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
      /** Where the tile goes. With one set the name becomes the link, the whole
       *  tile becomes its target, and the visit arrow appears on hover. Without
       *  one the tile is a static portrait — an arrow promising a destination
       *  there is not one is worse than no arrow. */
      href?: string;
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
      /** Campuses curves its right edge into a half-round arch. */
      shape?: "arch";
      scrim?: boolean;
      bylineKey?: CopyKey;
      bylineAvatar?: MediaAsset;
      href?: string;
      /** Turns the card into the two-faced workshop card (Figma 257:12880).
       *  Its presence is what adds the hover arrows and the flip; a media card
       *  without it is unchanged. The `cta` is the SAME destination the front's
       *  arrow points at — one event, named once. */
      flip?: { bodyKey: CopyKey; cta: HomeCta };
    })
  | (Base & { kind: "quote"; quoteKey: CopyKey; avatar?: MediaAsset; attribution: HomeCta })
  | (Base & {
      kind: "roster";
      headingKey: CopyKey;
      bodyKey?: CopyKey;
      avatars: MediaAsset[];
      cta?: HomeCta;
    })
  | (Base & { kind: "spine"; headingKey: CopyKey; spines: string[]; href?: string });

const img = (file: string, alt: string, w = 800, h = 800) =>
  mediaAsset(`/home/${file}`, alt, w, h);

// Bento grid tiles ordered row by row, left to right.
// Only the hero spans 2 columns; everything else is one square cell.
export const HOME_TILES: HomeTile[] = [
  // ── row 1 ──────────────────────────────────────────────────────────────
  { id: "statement", kind: "statement", textKey: "statement" },
  {
    id: "hero",
    kind: "hero",
    media: img("hero-forest.jpg", "Sunlight through trees at an NID campus.", 1400, 660),
    video: {
      src: assetPath("/home/nid-film.mp4"),
      title:
        "NID FILM — Introduction film about the National Institute of Design, Ahmedabad",
    },
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
    cta: { labelKey: "cta.allEvents", href: "/events" },
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
    cta: { labelKey: "cta.allNews", href: "/about/news-events" },
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
    // The overline names the destination: /people/alumni is "Notable Alumni" in
    // sitemap.json and in the main menu.
    href: "/people/alumni",
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
    flip: {
      bodyKey: "drawing.body",
      cta: { labelKey: "cta.eventLink", href: "/events/drawing-dialogues" },
    },
  },
  {
    id: "pride",
    kind: "portrait",
    overlineKey: "pride.overline",
    photo: img("pride-murthy.jpg", "Portrait of Dr. Lakshmi Murthy.", 400, 400),
    nameKey: "pride.name",
    bioKey: "pride.bio",
    bed: "pride",
    // As with the alumni tile, the overline names the destination:
    // /people/pride-of-nid is "Pride of NID" in sitemap.json. It had no href
    // while that route was unbuilt, which is what STAGE-0-NOTES §48 recorded;
    // the route exists, so the tile opens on hover like its twin.
    href: "/people/pride-of-nid",
  },
  {
    id: "campuses",
    kind: "mediaCard",
    media: img("campuses.jpg", "The NID campus courtyard.", 700, 700),
    titleKey: "campuses.title",
    labelPlacement: "overlay",
    shape: "arch",
    scrim: false,
    // /about/campuses, not /campuses — the latter is in neither sitemap.json
    // nor the main menu, so the tile pointed at nothing.
    href: "/about/campuses",
  },
  // ── row 4 ──────────────────────────────────────────────────────────────
  {
    id: "shifting-paradigms",
    kind: "mediaCard",
    media: img("shifting-paradigms.jpg", "Shifting Paradigms — call for papers.", 700, 700),
    overlineKey: "callForPapers.overline",
    titleKey: "callForPapers.title",
    date: "Feb 23 – 25 2027",
    labelPlacement: "below",
    href: "/events/shifting-paradigms",
    flip: {
      bodyKey: "callForPapers.body",
      cta: { labelKey: "cta.eventLink", href: "/events/shifting-paradigms" },
    },
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
    // /study/young-designers — "Young Designers" in sitemap.json, which is what
    // the overline says. There is no per-project detail route yet, and
    // /young-designers/hybrid-board-game was in neither the sitemap nor the menu.
    href: "/study/young-designers",
  },
  {
    id: "kmc",
    kind: "spine",
    headingKey: "kmc.heading",
    // /kmc is "Knowledge Management Centre" in sitemap.json — the heading.
    href: "/kmc",
    // Book titles displayed on the vertical spine shelf.
    spines: [
      "The India Report",
      "Design of the Indian Subcontinent",
      "Designing Design",
      "A Pattern Language",
      "Visual Thinking",
      "Hand Made in India",
      "Design - A Primer",
      "The Vision of the Past,",
      "Design as Art",
      "Film as Art",
      "Thoughtless Acts?",
    ],
  },
];
