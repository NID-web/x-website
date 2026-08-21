/**
 * NID Website — content model.
 *
 * Transcribed from the "CMS & Data Model — Backend Reference" page of the
 * Figma file (EAoxODvNK8dNGAeovGI5D7). This is the contract between the CMS
 * and the Next.js front end.
 *
 * THE ONE IDEA
 * A page is not a layout. A page is a short set of fixed fields plus an
 * ordered list of sections, and each section declares a type. The type decides
 * how that section renders and what shape its items take. There are six section
 * types and no more; if content does not fit one, the answer is almost always a
 * different field on the text type rather than a seventh type.
 */

export type UUID = string;
export type ISODate = string;      // YYYY-MM-DD
export type ISODateTime = string;  // RFC 3339

/* ────────────────────────────────────────────────────────────── the spine ── */

export type PageTemplate = "primary" | "secondary";
/** primary  = a section landing; presents its children. Never has back-nav.
 *  secondary = a detail page; carries back-nav to its parent + a sibling band. */

export type UtilitySlot = "back" | "filter" | "none";
/** secondary defaults to "back"; primary uses "filter" on directory pages,
 *  otherwise "none". Lives in the last column of row 1 at 3–4 columns; leaves
 *  the row entirely at 2 columns and below. */

export interface LabelValue {
  label: string;
  value: string;
}

export interface Page {
  id: UUID;
  /** Renders as the H1, spanning columns 1–2. Also supplies the back-nav label
   *  on child pages. */
  title: string;
  /** URL segment. Unique among SIBLINGS, not globally. The full path is built
   *  by walking `parent` to the root — there is no stored path field. */
  slug: string;
  parent: UUID | null;
  template: PageTemplate;
  utility: UtilitySlot;
  /** Rail block beside the hero. Two or three pairs is the working maximum. */
  keyInfo: LabelValue[];
  /** 0 renders nothing, 1 renders static, >1 renders as a slider. */
  hero: MediaAsset[];
  /** Standfirst, Body/Large. The page's opening paragraph, not a summary. */
  intro?: string;
  /** Order is content, not presentation. At least one. */
  sections: Section[];
  /** Surfaced in column 4 of the first text section; stacks after the body
   *  below 3 columns. */
  contacts: LabelValue[];
  seoTitle?: string;        // falls back to title
  seoDescription?: string;  // falls back to first 160 chars of intro
  /** null = draft. Unpublished pages must not appear in menus, siblings
   *  or the search index. */
  publishedAt: ISODateTime | null;
}

/** The closed set. Resist a seventh — check whether the content is a text
 *  section with a different field filled in. */
export type SectionType = "text" | "links" | "cards" | "files" | "rail" | "mosaic";

export type GroupBy = "none" | "month" | "department" | "letter" | "campus" | "faculty";

export interface SectionBase {
  id: UUID;
  page: UUID;
  order: number;
  type: SectionType;
  /** Sits in column 1, on the same row as the first row of its content.
   *  Becomes a full-width band below 3 columns. */
  title: string;
  body?: string;             // rich text — used by type=text, columns 2–3
  image?: MediaAsset;        // columns 2–3 of row n+1
  links: Link[];             // column 4 at 4 cols; rail at 3; stacked below
  contacts: LabelValue[];    // same placement path as links
  groupBy?: GroupBy;         // REQUIRED for rail and mosaic; ignored otherwise
}

/** items[] is ONE polymorphic list keyed by `type`, deliberately not six
 *  separate fields — see the note in the Figma doc. Expose it as a typed
 *  union server-side, not a bag of ids. */
export type Section =
  | (SectionBase & { type: "text";   items: [] })
  | (SectionBase & { type: "links";  items: Link[] })
  | (SectionBase & { type: "cards";  items: Array<Discipline | Programme | Page> })
  | (SectionBase & { type: "files";  items: Document[] })
  | (SectionBase & { type: "rail";   groupBy: GroupBy; items: Person[] })
  | (SectionBase & { type: "mosaic"; groupBy: "month"; items: NewsArticle[] });

export type LinkTargetType = "page" | "document" | "external" | "email" | "phone";

export interface Link {
  id: UUID;
  /** MUST NOT contain arrow characters. The arrow is an icon in its own slot;
   *  putting it in the string breaks screen readers and search. */
  label: string;
  targetType: LinkTargetType;
  page?: UUID;      // targetType = "page"
  document?: UUID;  // targetType = "document"
  url?: string;     // targetType = "external" — absolute, including scheme
  address?: string; // targetType = "email" | "phone"
  /** DERIVED, never authored:
   *   arrow-left       back-navigation
   *   arrow-up-right   page | document | external
   *   none             email | phone  (not navigation) */
  readonly icon?: "arrow-left" | "arrow-up-right" | null;
  /** DERIVED: true for external and document. */
  readonly newTab?: boolean;
}

export interface MediaAsset {
  id: UUID;
  file: string;
  /** Required at UPLOAD, not at use — otherwise it never gets written. */
  alt: string;
  caption?: string;  // section images only; heroes take no caption
  credit?: string;
  /** Normalised 0–1. Heroes crop to a different ratio per breakpoint, so this
   *  is not optional in practice for any off-centre subject. */
  focal?: { x: number; y: number };
  width: number;
  height: number;
}

/* ─────────────────────────────────────────────────── content collections ── */
/* The record owns the facts; the Page owns the layout. Do not duplicate facts
   into the page, and do not put layout into the record. */

export type PersonRole = "faculty" | "council" | "senate" | "staff" | "alumni";

export interface Person {
  id: UUID;
  name: string;
  slug: string;
  role: PersonRole;
  designation?: string;
  discipline?: UUID;     // used by the by-Discipline grouping
  campus?: UUID;         // used by the by-Campus grouping
  designFaculty?: string;// the six faculty streams; by-Design-Faculty grouping
  photo?: MediaAsset;    // circular crop at render — supply a square original
  email?: string;
  phone?: string;
  profile?: string;      // rich text
  page?: UUID;
}

export interface Discipline {
  id: UUID;
  name: string;
  /** Live pattern appends the level: animation-film-design-bdes */
  slug: string;
  programme: UUID;
  campus: UUID;
  seats?: number;        // shown on the thumb card as part of the meta line
  image?: MediaAsset;
  page?: UUID;
}

export type ProgrammeLevel = "bachelors" | "masters" | "doctoral" | "executive";

export interface Programme {
  id: UUID;
  name: string;
  slug: string;
  level: ProgrammeLevel;
  duration?: string;
  disciplines: UUID[];
  page?: UUID;
}

export interface Campus {
  id: UUID;
  name: string;
  slug: string;
  established?: number;
  address?: string;
  email?: string;
  phone?: string;
  images: MediaAsset[];
  page?: UUID;
}

export interface NewsArticle {
  id: UUID;
  /** The article page itself. Cascade delete. The article BODY lives on the
   *  Page's sections; this record carries only what the index needs. */
  page: UUID;
  headline: string;
  slug: string;
  /** Drives the month grouping in the mosaic and the sort order. */
  date: ISODate;
  category?: string;      // free-form tag shown as an overline on the card
  /** The card thumbnail. Distinct from the page hero — do not reuse blindly. */
  image: MediaAsset;
  /** At most THREE across the whole site. Enforce it. */
  featured: boolean;
}

export interface Centre {
  id: UUID;
  name: string;
  slug: string;
  campus?: UUID;         // some centres run across campuses; null is legal
  established?: string;  // free text — several are dated by an MoU
  focus?: string;
  email?: string;
  phone?: string;
  page?: UUID;
}

export type DocumentCategory = "act" | "report" | "handbook" | "notice" | "catalogue";

export interface Document {
  id: UUID;
  label: string;         // include the year where there are annual editions
  file: string;          // pdf
  category?: DocumentCategory;
  publishedAt?: ISODate;
  sizeBytes?: number;
  pageCount?: number;
}

export interface NIDEvent {
  id: UUID;
  name: string;
  slug: string;
  startDate: ISODate;
  endDate?: ISODate;     // null for single-day events
  venue?: string;
  campus?: UUID;
  registrationUrl?: string; // external — renders with arrow-up-right
  page?: UUID;
}

/* ──────────────────────────────────────────── derived — never authored ───── */
/* None of this is a field an editor fills in, and none of it should be stored. */

export interface DerivedPageContext {
  /** One recursive query over Page.parent, published only. There is no menu
   *  table — the tree IS the menu. */
  menuTree: MenuNode[];
  /** Walk parent upward. Depth reaches four levels under Programmes. */
  breadcrumb: Array<{ id: UUID; title: string; path: string }>;
  /** parent.title. No arrow in the string — the icon carries it. */
  backNav: { label: string; href: string } | null;
  /** children(page), ordered. Column 1, row 2 of every overview page. */
  subPageLinks: Array<{ label: string; href: string }>;
  /** siblings(page) minus self. MUST NOT RENDER AT ALL when empty. */
  siblingBand: Array<{ id: UUID; title: string; href: string }>;
}

export interface MenuNode {
  id: UUID;
  title: string;
  path: string;
  children: MenuNode[];
}

/* ───────────────────────────────────────────────────── the one query ─────── */
/**
 * A page render should be ONE request: the Page, its sections in order, and
 * each section's items already resolved and already grouped. If the front end
 * has to make a second call to find out what a section contains, or a third to
 * group them, the model has leaked into the client.
 */
export interface PageResponse {
  page: Page;
  derived: DerivedPageContext;
  /** When section.groupBy is set the response arrives ALREADY GROUPED — the
   *  front end must not sort a flat list into buckets, because the group label
   *  is a rendered element with its own place in the grid. */
  groupedItems?: Record<UUID, Array<{ label: string; items: unknown[] }>>;
}

/* ───────────────────────────────────────────────────────── validation ────── */
/**
 * WHAT THE CMS MUST REFUSE TO SAVE
 *  - a page with no sections
 *  - a section with no title
 *  - a section of type rail or mosaic with no groupBy
 *  - a link whose label contains an arrow character
 *  - a link whose target fields do not match its targetType (exactly one of
 *    page / document / url / address must be set)
 *  - an image with no alt text
 *  - a fourth featured article while three already exist
 *  - a slug that duplicates a sibling's
 *  - a person with role="faculty" and no discipline (the by-discipline
 *    grouping would silently drop them)
 *
 * WHAT THE FRONT END MUST REFUSE TO RENDER
 *  - a section with no content. If body, image, links[] and items[] are all
 *    empty, the section does not render. An empty scaffold is worse than an
 *    absent section: it reads as neglect rather than as brevity.
 */
export const ARROW_CHARS = /[→←↑↓➔➜⟶⟵»«›‹]/u;

export function linkIcon(l: Pick<Link, "targetType">, isBackNav = false) {
  if (isBackNav) return "arrow-left" as const;
  if (l.targetType === "email" || l.targetType === "phone") return null;
  return "arrow-up-right" as const;
}

export function linkNewTab(l: Pick<Link, "targetType">) {
  return l.targetType === "external" || l.targetType === "document";
}
