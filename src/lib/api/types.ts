// The public CMS API's response shapes, typed from the live
// GET /public/content/{slug} response and its OpenAPI document (/api/docs-json).
// Hand-written, not generated: the guards check only the fields the front end
// reads and let anything else through, because the backend keeps adding fields
// and an unknown one must never cost us a page.
//
// One generic document model serves every page, Home included: sections are
// SPECIFIC (blocks) or STRUCTURED (items of one content type). There is no
// per-page shape and no machine key on a SPECIFIC section — see getHome.ts.

export interface ContentTypeRef {
  key: string;
  displayName: string;
}

export interface FocalPoint {
  x: number;
  y: number;
}

export interface MediaRef {
  id: string;
  url: string;
  altText: string | null;
  /** The uploaded FILE's name much of the time ("news-1.jpg") — never alt text. */
  title: string | null;
  caption: string | null;
  mimeType: string;
  // Not served by the deployed API. Kept optional because toMediaAsset reads
  // them, so real dimensions start flowing the day the DTO exposes them.
  credit?: string | null;
  widthPx?: number | null;
  heightPx?: number | null;
  focalPoint?: FocalPoint | null;
}

export interface CardRef {
  id: number;
  /** Flat and globally unique (`convocation-2026`) — not a path. */
  slug: string;
  /** Not served today — routes come from pathOfCmsSlug(). Nothing may depend
   *  on it; it is typed so a future `path` is used rather than ignored. */
  path?: string | null;
  title: string;
  heroText: string | null;
  thumbnail: MediaRef | null;
  contentType: ContentTypeRef;
  publishedAt: string | null;
}

export interface SectionBlock {
  id: number;
  blockType: "TEXT" | "IMAGE" | "VIDEO" | "CONTENT_REFERENCE";
  orderIndex: number;
  /** HTML, not plain text — about-nid's sixth block carries a <strong>. */
  text: string | null;
  /** The file of an IMAGE or VIDEO block. */
  media: MediaRef | null;
}

export interface Section {
  id: number;
  title: string | null;
  orderIndex: number;
  type: "SPECIFIC" | "STRUCTURED";
  blocks: SectionBlock[] | null;
  structuredContentType: ContentTypeRef | null;
  structuredMode: "CURATED" | "DYNAMIC" | null;
  items: CardRef[] | null;
}

export interface Seo {
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: MediaRef | null;
  isIndexed: boolean;
  isFollowed: boolean;
}

/** EMAIL | PHONE only: the DTO has no way to say "a link to a page". */
export interface ContactRef {
  label: string;
  type: "EMAIL" | "PHONE";
  value: string;
  personName: string | null;
}

export interface NavItem {
  id: number;
  label: string;
  slug: string;
  /** Not served today — getSiteChrome derives it with pathOfCmsSlug(). */
  path?: string | null;
  orderIndex: number;
  children: NavItem[];
}

export interface PublicContentResponse {
  id: number;
  slug: string;
  title: string | null;
  heroText: string | null;
  thumbnail: MediaRef | null;
  hero: MediaRef[];
  publishedAt: string | null;
  seo: Seo | null;
  contacts?: ContactRef[];
  sections: Section[];
  /** `footer` is ONE flat list; getSiteChrome splits it into two columns. */
  navigation: { header: NavItem[]; footer: NavItem[] } | null;
}

/** GET /public/site-config. `value` is already-parsed JSON for a JSON setting. */
export interface SiteSetting {
  key: string;
  group: string;
  valueType: string;
  value: unknown;
}
export interface SiteConfig {
  settings: SiteSetting[];
}

/** GET /public/contact-details. */
export interface ContactDetail {
  id: number;
  label: string;
  type: "EMAIL" | "PHONE";
  value: string;
  orderIndex: number;
}

/** GET /public/content-items?… */
export interface ContentItems {
  items: CardRef[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isStrOrNull = (v: unknown) => v === null || v === undefined || isStr(v);

export function isMediaRef(v: unknown): v is MediaRef {
  return isObj(v) && isStr(v.id) && isStr(v.url) && isStrOrNull(v.altText);
}

export function isCardRef(v: unknown): v is CardRef {
  return (
    isObj(v) &&
    typeof v.id === "number" &&
    isStr(v.slug) &&
    isStr(v.title) &&
    isStrOrNull(v.publishedAt) &&
    isStrOrNull(v.path) &&
    (v.thumbnail === null || v.thumbnail === undefined || isMediaRef(v.thumbnail))
  );
}

function isBlock(v: unknown): v is SectionBlock {
  return (
    isObj(v) &&
    isStr(v.blockType) &&
    isStrOrNull(v.text) &&
    (v.media === null || v.media === undefined || isMediaRef(v.media))
  );
}

function isContactRef(v: unknown): v is ContactRef {
  return isObj(v) && isStr(v.label) && isStr(v.value);
}

function isSection(v: unknown): v is Section {
  if (!isObj(v)) return false;
  const ct = v.structuredContentType;
  return (
    isStrOrNull(v.title) &&
    (ct === null || ct === undefined || (isObj(ct) && isStr(ct.key))) &&
    (v.blocks === null || v.blocks === undefined || (Array.isArray(v.blocks) && v.blocks.every(isBlock))) &&
    (v.items === null || v.items === undefined || (Array.isArray(v.items) && v.items.every(isCardRef)))
  );
}

function isSeo(v: unknown): v is Seo {
  return isObj(v) && isStrOrNull(v.metaTitle) && isStrOrNull(v.metaDescription);
}

export function isPublicContentResponse(v: unknown): v is PublicContentResponse {
  return (
    isObj(v) &&
    isStr(v.slug) &&
    isStrOrNull(v.title) &&
    isStrOrNull(v.heroText) &&
    Array.isArray(v.hero) &&
    v.hero.every(isMediaRef) &&
    (v.seo === null || v.seo === undefined || isSeo(v.seo)) &&
    (v.contacts === undefined || (Array.isArray(v.contacts) && v.contacts.every(isContactRef))) &&
    Array.isArray(v.sections) &&
    v.sections.every(isSection)
  );
}

export function isSiteConfig(v: unknown): v is SiteConfig {
  return (
    isObj(v) &&
    Array.isArray(v.settings) &&
    v.settings.every((s) => isObj(s) && isStr(s.key))
  );
}

export function isContactDetails(v: unknown): v is ContactDetail[] {
  return (
    Array.isArray(v) &&
    v.every((c) => isObj(c) && isStr(c.label) && isStr(c.value) && isStr(c.type))
  );
}

export function isContentItems(v: unknown): v is ContentItems {
  return isObj(v) && Array.isArray(v.items) && v.items.every(isCardRef);
}
