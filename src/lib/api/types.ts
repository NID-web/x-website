// The public CMS API's response shapes, typed from the live
// GET /public/content/{slug} response and its OpenAPI document (/api/docs-json).
// Hand-written, not generated: the guards check only the fields the front end
// reads and let anything else through, because the backend keeps adding fields
// and an unknown one must never cost us a page.
//
// Two generations of the document are in the wild at once: the deployed API
// still answers with the OLD shape (no `kind`, no `path`, no `config`), the
// local one with the NEW. Everything the new shape added is therefore optional
// here, and the ADAPTERS — not the guards — decide a document is too thin to
// use. That is what makes the deployed API degrade to the static page instead
// of failing the build.

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
  credit?: string | null;
  mimeType: string;
  /** Null until the real files are imported; TileImage renders `fill` and
   *  reads neither, but next/image in the footer needs both. */
  widthPx?: number | null;
  heightPx?: number | null;
  focalPoint?: FocalPoint | null;
}

export interface CardRef {
  id: number;
  /** Flat and globally unique (`convocation-2026`) — not a path. */
  slug: string;
  /** The item's route. Null means the CMS has no page for it yet. */
  path?: string | null;
  title: string;
  heroText: string | null;
  thumbnail: MediaRef | null;
  contentType: ContentTypeRef;
  publishedAt: string | null;
  /** Both only on a curated pick: the editor's short label and its meta line. */
  label?: string | null;
  meta?: string | null;
}

export interface SectionBlock {
  id: number;
  blockType: "TEXT" | "IMAGE" | "VIDEO" | "CONTENT_REFERENCE";
  orderIndex: number;
  /** HTML, not plain text — about-nid's sixth block carries a <strong>. */
  text: string | null;
  media: MediaRef | null;
  /** The card a CONTENT_REFERENCE block points at. */
  referencedItem?: CardRef | null;
}

export interface Section {
  id: number;
  /** New shape only: `statement` | `linkList` | `calendar` | `news` | `feature`
   *  | `portrait` | `mediaCard` | `quote` | `roster` | `spine`. Null on the old
   *  shape and on every editorial page, which are matched by
   *  `structuredContentType.key` instead. */
  kind?: string | null;
  title: string | null;
  orderIndex: number;
  type: "SPECIFIC" | "STRUCTURED";
  /** Content the editor fills in that has no block or item of its own — a
   *  calendar's rows, a spine's book titles, a CTA. Never styling. */
  config?: Record<string, unknown> | null;
  blocks: SectionBlock[] | null;
  structuredContentType: ContentTypeRef | null;
  structuredMode: "CURATED" | "DYNAMIC" | null;
  items: CardRef[] | null;
}

/** `config.cta`, the one shape every CTA arrives in. */
export interface ConfigCta {
  label: string;
  path: string;
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
  /** Null = a disclosure heading, not a link (the handover says so). A null
   *  path with no children is neither, and the menu drops it. */
  path?: string | null;
  orderIndex: number;
  children: NavItem[];
}

export interface PublicContentResponse {
  id: number;
  slug: string;
  /** The page's own route ("/", "/about"). New shape only. */
  path?: string | null;
  title: string | null;
  heroText: string | null;
  thumbnail: MediaRef | null;
  hero: MediaRef[];
  publishedAt: string | null;
  seo: Seo | null;
  contacts?: ContactRef[];
  sections: Section[];
  navigation: {
    header: NavItem[];
    footer: NavItem[];
    footerSecondary?: NavItem[];
  } | null;
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
const isNumOrNull = (v: unknown) => v === null || v === undefined || typeof v === "number";

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
    (v.referencedItem === null || v.referencedItem === undefined || isCardRef(v.referencedItem))
  );
}

function isContactRef(v: unknown): v is ContactRef {
  return isObj(v) && isStr(v.label) && isStr(v.value);
}

function isSection(v: unknown): v is Section {
  if (!isObj(v)) return false;
  const ct = v.structuredContentType;
  // `kind` and `config` are NOT required: an editorial page's sections have
  // neither, and the old shape has neither anywhere.
  return (
    isStrOrNull(v.title) &&
    isStrOrNull(v.kind) &&
    (v.config === null || v.config === undefined || isObj(v.config)) &&
    (ct === null || ct === undefined || (isObj(ct) && isStr(ct.key))) &&
    (v.blocks === null || v.blocks === undefined || (Array.isArray(v.blocks) && v.blocks.every(isBlock))) &&
    (v.items === null || v.items === undefined || (Array.isArray(v.items) && v.items.every(isCardRef)))
  );
}

function isSeo(v: unknown): v is Seo {
  return isObj(v) && isStrOrNull(v.metaTitle) && isStrOrNull(v.metaDescription);
}

export function isNavItem(v: unknown): v is NavItem {
  return (
    isObj(v) &&
    isStr(v.label) &&
    isStr(v.slug) &&
    isStrOrNull(v.path) &&
    isNumOrNull(v.orderIndex) &&
    (v.children === undefined || (Array.isArray(v.children) && v.children.every(isNavItem)))
  );
}

export function isNavItems(v: unknown): v is NavItem[] {
  return Array.isArray(v) && v.every(isNavItem);
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

/** `config.cta` if the section carries a usable one. */
export function configCta(config: Section["config"]): ConfigCta | null {
  const cta = config?.cta;
  if (!isObj(cta) || !isStr(cta.label) || !isStr(cta.path)) return null;
  return { label: cta.label, path: cta.path };
}

/** A string field of `config`, trimmed, or null. */
export function configString(config: Section["config"], key: string): string | null {
  const v = config?.[key];
  return isStr(v) && v.trim() ? v.trim() : null;
}

/** An array field of `config`, or an empty list. */
export function configArray(config: Section["config"], key: string): unknown[] {
  const v = config?.[key];
  return Array.isArray(v) ? v : [];
}
