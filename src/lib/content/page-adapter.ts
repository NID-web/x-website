// A CMS content document merged over a page's fixture, one field or section at
// a time. Whatever the API can feed comes from the API; everything else stays
// the fixture's, with the reason recorded — a page-level swap would ship a page
// with its lower sections missing while the CMS is only part-seeded. The only
// per-page knowledge is the PageMergeConfig in getPage.ts, so Charter, News &
// Events and Our Themes go through this same function.
import type { LabelValue, Link, MediaAsset, Page, PageResponse, Person, Section } from "@/lib/content-model";
import {
  campusDetail,
  personDetail,
  type CardRef,
  type MediaRef,
  type PublicContentResponse,
  type Section as ApiSection,
  type SectionBlock,
} from "@/lib/api/types";
import { toMediaAsset, type MediaResult } from "@/lib/api/media";
import { joinBlocks, plainText, richParagraphs } from "@/lib/content/format";
import type { CmsFileLink } from "@/lib/content/documents";
import { contactCta } from "@/lib/content/links";
import { PAGE_ID, pageIdOf, pathOf, pathOfCmsSlug } from "@/lib/content/pages";

export interface SectionMergeRule {
  /** The API STRUCTURED section that feeds this fixture section is found by
   *  structuredContentType.key — never by title. */
  structuredKey: string;
  /** 1-based, among the STRUCTURED sections carrying `structuredKey`, in
   *  orderIndex order; default 1. Only needed when one document carries a key
   *  twice (news-events: "Featured" and "Latest News" are both `news`). A
   *  stand-in for a stable machine key on Section — delete it when that lands. */
  nth?: number;
  /** Route an item the slug table does not list as `<parent path>/<slug>`:
   *  right for a collection whose route is its CMS slug (news, under the
   *  /about/news-events/[slug] template), wrong for one whose routes are named
   *  differently (campuses: `ahmedabad-campus` is /about/campuses/ahmedabad). */
  slugUnderParent?: boolean;
  /** The section's body from the SPECIFIC section with this title (matched as
   *  TextMergeRule.textTitle, with its failure mode), so one page section
   *  merges a list and its prose — Research at NID: the centres plus "About"
   *  (§78). The title counts as claimed, so it is never the standfirst. */
  bodyTitle?: string;
  /** The fixture's title stands instead of the API section's: a section merged
   *  from several CMS sections is named by none of them (§78). */
  keepTitle?: true;
  /** An item whose CMS photo is missing, refused or does not serve keeps the
   *  fixture item's photo at the same route, so the fixture's photos must be
   *  copies of each record's own CMS photo — never one record's on another.
   *  Applied by getPage (it HEADs the CMS photos); logged one line each (§78). */
  photoFallback?: true;
}

/** A SPECIFIC section's TEXT blocks feed a fixture `text` section's body.
 *  Matched on the section's editorial TITLE — exact, case-insensitive, no
 *  fuzzing — because a SPECIFIC section carries no machine key at all. That is
 *  the failure mode: an editor who renames the section in the CMS silently
 *  drops the page back to its fixture body. Safe (it falls back and logs), and
 *  the cheapest thing available until Section carries a stable `key`. Never a
 *  synthetic key made from the title. */
export type TextMergeRule = {
  textTitle: string;
  /** The section's LINK blocks become links: an absolute `url` an external
   *  link, a block with no url but a `media` file a document link (§76). In a
   *  `text` section they replace the fixture's external and document links;
   *  its email, phone and page links stay (§74). In a `links` section they ARE
   *  the items, in CMS order with CMS labels — a list of documents (§76). LINK
   *  is served but not in types.ts's block union (§59), so it is read loosely. */
  linkBlocks?: true;
} & (
  | { blocks?: never; of?: never; afterIntro?: never }
  | {
      /** Only the section's TEXT blocks after the one the standfirst took
       *  (`intro: "firstTextBlock"` from this same section): "About" block 1
       *  is the standfirst, blocks 2… a body below it. Without this rule
       *  those blocks are dropped and logged. If the intro did not come from
       *  this section, or nothing follows it, the fixture body stays. */
      afterIntro: true;
      blocks?: never;
      of?: never;
    }
  | {
      afterIntro?: never;
      /** Only TEXT blocks `from`–`to` (1-based, inclusive) of that section,
       *  for a document that runs several board sections' prose together in
       *  one section. Several rules may slice the same section. Ordinal, so it
       *  breaks silently the moment an editor adds or reorders a block. */
      blocks: [from: number, to: number];
      /** The exact TEXT block count the slices were written against. Any
       *  other count and EVERY slice rule on the section falls back to its
       *  fixture body — loud and whole, never half-merged. Required with
       *  `blocks`, by the type: an unguarded slice is an invalid state. */
      of: number;
    }
);

/** A SPECIFIC section's CONTENT_REFERENCE blocks to person records feed a
 *  fixture `rail` section's people, one per block, in block order. Matched on
 *  the section's editorial TITLE, exactly as TextMergeRule is and with the same
 *  failure mode. The block carries the person as a card; the designation is
 *  only on the record, so getPage fetches each one (referencedSlugs) and passes
 *  them in. Per person, each field the record lacks keeps the fixture person's
 *  at the same position; a record that did not arrive keeps the fixture
 *  person whole. */
export interface ReferenceMergeRule {
  referencesTitle: string;
}

/** The records a config's reference rules need, so they can be fetched before
 *  the (synchronous) merge. Person references only. */
export function referencedSlugs(api: PublicContentResponse, config: PageMergeConfig): string[] {
  const slugs = Object.values(config.sections).flatMap((rule) =>
    "referencesTitle" in rule ? personRefs(referenceSection(api, rule)).map((r) => r.slug) : [],
  );
  return [...new Set(slugs)];
}

function referenceSection(api: PublicContentResponse, rule: ReferenceMergeRule) {
  const wanted = rule.referencesTitle.trim().toLowerCase();
  return api.sections.find((s) => s.type === "SPECIFIC" && (s.title ?? "").trim().toLowerCase() === wanted);
}

function personRefs(as: ApiSection | undefined): CardRef[] {
  return [...(as?.blocks ?? [])]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .flatMap((b) =>
      b.blockType === "CONTENT_REFERENCE" && b.referencedItem?.contentType.key === "person"
        ? [b.referencedItem]
        : [],
    );
}

/** A section's LINK blocks as links (TextMergeRule.linkBlocks): an absolute
 *  `url` is an external link; no url but a `media` file is a document link
 *  carrying the file's URL (documents.ts). A block with neither, or no label,
 *  is counted as unusable. Ids are `link-cms-<block id>`: getPage checks the
 *  files among them before the page renders (§76). */
function linkBlockLinks(blocks: SectionBlock[]): { links: Link[]; unusable: number } {
  const links: Link[] = [];
  let unusable = 0;
  for (const b of blocks) {
    if ((b.blockType as string) !== "LINK") continue;
    const url = (b as unknown as { url?: unknown }).url;
    const label = b.text?.trim();
    const file = b.media?.url;
    if (label && typeof url === "string" && /^https?:\/\//.test(url)) {
      links.push({ id: `link-cms-${b.id}`, label, targetType: "external", url });
    } else if (label && b.media && file && /^https?:\/\//.test(file)) {
      const link: CmsFileLink = { id: `link-cms-${b.id}`, label, targetType: "document", document: b.media.id, file };
      links.push(link);
    } else unusable++;
  }
  return { links, unusable };
}

export interface PageMergeConfig {
  /** The document at /public/content/{slug}. */
  slug: string;
  /** Where the standfirst comes from. `firstTextBlock` (the default, About's
   *  shape) takes the first TEXT block of the first SPECIFIC section and
   *  consumes that section. `heroText` takes the document's own summary line —
   *  for a page whose first SPECIFIC section is a body, not a standfirst.
   *  `static` keeps the fixture's. */
  intro?: "firstTextBlock" | "heroText" | "static";
  /** With `firstTextBlock`: the standfirst's section BY TITLE (exact, case-
   *  insensitive, as textTitle) instead of the first section no rule claims.
   *  For a document whose sections tie on orderIndex, where "first" is only
   *  the order the API happened to send (People's About and Overview, §81). */
  introTitle?: string;
  /** CMS media ids never used as the hero or a section image: a file that
   *  cannot serve as one, refused by id so that the next upload — a new id —
   *  shows with no code change (§77). A refused hero leaves the fixture's. */
  rejectMedia?: readonly string[];
  /** A whole-section text rule's first IMAGE block that passes media.ts (alt
   *  text, an allowed host) and `rejectMedia` becomes the section's image, in
   *  place of the fixture's. Opt-in per page, and only on a page whose boards
   *  draw a photograph in every section its rules feed — anywhere else it would
   *  add photos the designer never drew (§77). */
  sectionImages?: true;
  /** The page field the document's `contacts` feed. `contacts` by default;
   *  `keyInfo` for a page whose rail block beside the hero is the model's
   *  key info rather than a first section's contacts. `sections`: each contact
   *  goes to the section its label names — the label IS the section's title, or
   *  is the title followed by " (…)" ("Integrated Design Services (Direct)") —
   *  and replaces that section's contacts; a contact no section claims is
   *  dropped, one log line each. Exact, like textTitle: no fuzzy matching, so
   *  an editor's renamed label drops the contact, loudly (§80). */
  contactsTo?: "contacts" | "keyInfo" | "sections";
  /** A template's typed `detail` record ("Campus Detail"), turned into key-info
   *  values and ordinary sections HERE, so nothing past the adapter knows it
   *  exists. */
  detail?: DetailRules;
  /** structuredContentType.key of the section listing the page's children. */
  subPagesKey?: string;
  /** Keyed by the FIXTURE section's id. */
  sections: Record<string, SectionMergeRule | TextMergeRule | ReferenceMergeRule>;
  /** API sections that become NEW cards sections, in this order. Opt-in on
   *  purpose: rendering every unmatched section would let an editor push
   *  arbitrary sections into a designed page. A named section the API does not
   *  send appends nothing, so a page with no CMS renders its fixture exactly. */
  appendSections?: AppendRule[];
}

export interface AppendRule extends SectionMergeRule {
  /** The new section's id — the page keys per-section presentation off it. */
  id: string;
  /** Inserted immediately after this FIXTURE section; several naming the same
   *  one keep their config order. */
  after: string;
  /** The parent every item hangs off. A replaced section inherits its fixture
   *  items' parent; an appended one has none to inherit. */
  itemParent: string;
}

type DetailList = "disciplines" | "serviceCentres" | "labAndFacilities";
type DetailField = "establishedYear" | "address" | "campusSize" | "hostelCapacity";

export interface DetailRules {
  /** Key-info rows, by the FIXTURE row's label, whose value a detail field
   *  feeds. The label stays the board's ("Inaugurated", not "established"). */
  keyInfo?: Record<string, DetailField>;
  /** The fixture section each list feeds. A `cards` section takes every entry
   *  as a card — unlinked until the record has a route; a `links` section, or a
   *  `text` section's column-4 links, takes only the routable entries, because
   *  a link with nowhere to go is not a link. A list with no slot is logged. */
  lists?: Partial<Record<DetailList, string>>;
  /** Lists that map to a fixture section but must NOT replace it yet — the API
   *  list answers the same question as the board's and is incomplete against
   *  it. Received, logged by name, and not used; moving a key from `hold` to
   *  `lists` flips it. The section still counts as detail-derived. */
  hold?: Partial<Record<DetailList, string>>;
}

/** Every fixture section a page's detail rules touch, fed or held. */
export function detailSections(rules: DetailRules | undefined): Set<string> {
  return new Set([...Object.values(rules?.lists ?? {}), ...Object.values(rules?.hold ?? {})]);
}

export interface SourceLog {
  /** Lines getPage prints on their own, one event each. */
  lines?: string[];
  api: string[];
  appended: string[];
  static: string[];
  notes: string[];
}

/** The rule's API section, or why there is none. Each API section feeds at
 *  most one page section. */
function structured(
  api: PublicContentResponse,
  rule: SectionMergeRule,
  consumed: Set<ApiSection>,
): ApiSection | string {
  const nth = rule.nth ?? 1;
  const same = api.sections
    .filter((s) => s.type === "STRUCTURED" && s.structuredContentType?.key === rule.structuredKey)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  const label = `key=${rule.structuredKey}${nth > 1 ? ` #${nth}` : ""}`;
  const found = same[nth - 1];
  if (!found) {
    return same.length && nth > 1
      ? `api has ${same.length} section${same.length === 1 ? "" : "s"} key=${rule.structuredKey}, no #${nth}`
      : `no api section ${label}`;
  }
  if (consumed.has(found)) return `api section ${label} already used`;
  return found;
}

/** The item's route, or undefined — an item with no route is dropped, never
 *  rendered with a guessed href. */
function routeOf(item: CardRef, parentPath: string | undefined, rule?: SectionMergeRule) {
  return (
    pathOfCmsSlug(item.slug) ??
    (rule?.slugUnderParent && parentPath ? `${parentPath}/${item.slug}` : undefined)
  );
}

export function toPageResponse(
  api: PublicContentResponse,
  fixture: PageResponse,
  config: PageMergeConfig,
  /** Records referencedSlugs() asked for, by slug; null where the fetch failed. */
  records: ReadonlyMap<string, PublicContentResponse | null> = new Map(),
): { response: PageResponse; sources: SourceLog } {
  const log: SourceLog = { api: [], appended: [], static: [], notes: [] };
  const consumed = new Set<ApiSection>();
  const page: Page = { ...fixture.page };
  let derived = fixture.derived;

  const title = api.title?.trim();
  if (title) {
    page.title = title;
    log.api.push("title");
  } else log.static.push("title(api empty)");

  const refused = new Set(config.rejectMedia ?? []);
  const media = (ref: MediaRef | null): MediaResult =>
    ref && refused.has(ref.id) ? { rejected: `rejectMedia ${ref.id}` } : toMediaAsset(ref);

  const heroes = api.hero.map(media);
  const accepted = heroes.flatMap((h) => ("asset" in h ? [h.asset] : []));
  const rejected = [...new Set(heroes.flatMap((h) => ("rejected" in h ? [h.rejected] : [])))];
  if (accepted.length) {
    // Every accepted image is mapped (the model's >1 is a slider); the page
    // still renders hero[0] only.
    page.hero = accepted;
    log.api.push("hero");
    // Said, so a second photograph an editor uploads is not mistaken for one
    // that shows (§86).
    if (accepted.length > 1) log.notes.push(`hero: ${accepted.length} accepted, hero[0] renders`);
    if (rejected.length) log.notes.push(`hero: ${rejected.length} rejected (${rejected.join("; ")})`);
  } else {
    log.static.push(`hero(${rejected.length ? `media rejected: ${rejected.join("; ")}` : "api empty"})`);
  }

  const introSource = config.intro ?? "firstTextBlock";
  // The section and block the standfirst came from, for `afterIntro` rules.
  let introPick: { section: ApiSection; block: SectionBlock } | undefined;
  if (introSource === "heroText") {
    const intro = api.heroText?.trim() ? plainText(api.heroText) : undefined;
    if (intro?.text) {
      page.intro = intro.text;
      log.api.push("intro(heroText)");
      if (intro.tags.length) log.notes.push(`intro: stripped <${intro.tags.join(">, <")}>`);
    } else log.static.push("intro(api heroText empty)");
  } else if (introSource === "static") {
    log.static.push("intro(config)");
  } else {
    // The standfirst is the first TEXT block of the first SPECIFIC section. The
    // model has one intro and no slot for the blocks after it, so they are
    // counted, not rendered — inventing a text section would add one the board
    // does not have. A section a rule claims by title is never the intro:
    // "first" is array order (orderIndex can tie, as on Programmes), and a
    // reordered array must not turn a named section into the standfirst.
    // An `afterIntro` rule names the intro's own section, so it claims nothing.
    const claimed = new Set(
      Object.values(config.sections).flatMap((rule) =>
        "textTitle" in rule
          ? rule.afterIntro ? [] : [rule.textTitle]
          : "referencesTitle" in rule
            ? [rule.referencesTitle]
            : rule.bodyTitle ? [rule.bodyTitle] : [],
      ).map((title) => title.trim().toLowerCase()),
    );
    const introTitle = config.introTitle?.trim().toLowerCase();
    const introSection = api.sections.find((s) =>
      s.type !== "SPECIFIC"
        ? false
        : introTitle
          ? (s.title ?? "").trim().toLowerCase() === introTitle
          : !claimed.has((s.title ?? "").trim().toLowerCase()),
    );
    const blocks = introSection?.blocks ?? [];
    const introBlock = blocks.find((b) => b.blockType === "TEXT" && b.text?.trim());
    const intro = introBlock?.text ? plainText(introBlock.text) : undefined;
    if (introSection && intro?.text) {
      consumed.add(introSection);
      introPick = { section: introSection, block: introBlock! };
      page.intro = intro.text;
      log.api.push("intro");
      if (intro.tags.length) log.notes.push(`intro: stripped <${intro.tags.join(">, <")}>`);
      const rest = blocks.filter((b) => b !== introBlock);
      const restRuled = Object.values(config.sections).some(
        (rule) =>
          "textTitle" in rule &&
          rule.afterIntro &&
          rule.textTitle.trim().toLowerCase() === (introSection.title ?? "").trim().toLowerCase(),
      );
      if (rest.length && !restRuled) {
        const types = [...new Set(rest.map((b) => b.blockType))].join("/");
        log.notes.push(`dropped ${rest.length} ${types} block${rest.length === 1 ? "" : "s"}`);
      }
    } else
      log.static.push(
        `intro(${introSection ? "no TEXT block in a SPECIFIC section" : config.introTitle ? `no api section titled "${config.introTitle}"` : "no SPECIFIC section"})`,
      );

    // The document's own summary line. No secondary board draws one, and the
    // standfirst above is the intro when a page has any.
    if (api.heroText?.trim()) log.notes.push("dropped heroText");
  }

  const detail = config.detail ? campusDetail(api) : null;
  if (config.detail && !detail) log.static.push("detail(api has none, or it is malformed)");

  if (detail && config.detail?.keyInfo) {
    const fields = config.detail.keyInfo;
    page.keyInfo = page.keyInfo.map((row) => {
      const field = fields[row.label];
      if (!field) return row;
      const value = detail[field];
      if (value === null || String(value).trim() === "") {
        log.static.push(`keyInfo:${row.label}(detail.${field} empty)`);
        return row;
      }
      // Rendered as the API sends it, disputed values included (a campus's
      // establishedYear) — a wrong fact is corrected in the CMS, never here.
      log.api.push(`keyInfo:${row.label}←${field}`);
      return { ...row, value: String(value) };
    });
  }

  const contacts = api.contacts ?? [];
  const contactsTo = config.contactsTo ?? "contacts";
  if (contactsTo === "sections") {
    // Matched to the sections below, once they are merged.
  } else if (contacts.length) {
    // The API's contacts replace the fixture's email and phone rows, in their
    // place; any other row (a key-info fact, a document link) stays. All of a
    // page's `contacts` are email/phone, so there it is a plain replacement.
    // Nothing is de-duplicated: a repeated number is the CMS's to fix.
    const isContact = (row: LabelValue) => {
      const href = contactCta(row)?.href ?? "";
      return href.startsWith("mailto:") || href.startsWith("tel:");
    };
    const rows = page[contactsTo];
    const firstContact = rows.findIndex(isContact);
    const before = firstContact < 0 ? rows : rows.slice(0, firstContact).filter((r) => !isContact(r));
    const after = firstContact < 0 ? [] : rows.slice(firstContact).filter((r) => !isContact(r));
    page[contactsTo] = [...before, ...contacts.map(({ label, value }) => ({ label, value })), ...after];
    log.api.push(`${contactsTo}(${contacts.length} contacts)`);
    // LabelValue has no slot for a named person; dropped, not folded into the
    // label, which would change the content.
    const named = contacts.filter((c) => c.personName?.trim()).length;
    if (named) log.notes.push(`contacts: personName dropped (${named})`);
  } else {
    log.static.push(contactsTo === "contacts" ? "contacts(api empty)" : `${contactsTo}(api contacts empty)`);
  }

  const seoTitle = api.seo?.metaTitle?.trim();
  const seoDescription = api.seo?.metaDescription?.trim();
  if (seoTitle) page.seoTitle = seoTitle;
  if (seoDescription) page.seoDescription = seoDescription;
  if (seoTitle || seoDescription) log.api.push("seo");
  else log.static.push("seo(no metaTitle or metaDescription)");

  if (api.publishedAt) {
    page.publishedAt = api.publishedAt;
    log.api.push("publishedAt");
  }

  // The rail is an editorial list — order and labels are decisions — so the two
  // lists are never merged. The API's replaces the fixture's only when it
  // reaches every page the fixture does; otherwise adopting it would silently
  // remove a link.
  if (config.subPagesKey) {
    const section = structured(api, { structuredKey: config.subPagesKey }, consumed);
    if (typeof section === "string") log.static.push(`subPages(${section})`);
    else {
      consumed.add(section);
      const links: Array<{ label: string; href: string }> = [];
      for (const item of section.items ?? []) {
        const href = routeOf(item, undefined);
        if (href) links.push({ label: item.title, href });
        else log.notes.push(`subPages: dropped slug ${item.slug} (no path)`);
      }
      const missing = fixture.derived.subPageLinks
        .map((l) => l.href)
        .filter((href) => !links.some((l) => l.href === href));
      if (missing.length) log.static.push(`subPages(api lacks ${missing.join(",")})`);
      else {
        derived = { ...derived, subPageLinks: links };
        log.api.push("subPages");
      }
    }
  }

  // `section-about-news` → `section:news`, `section-news-2026` → `section:2026`.
  const sectionName = (id: string) => `section:${id.replace(/^section-[^-]+-/, "")}`;

  /** An API section's items as card stubs; null (with the reason logged) when
   *  none of them can be routed. */
  const toCards = (as: ApiSection, rule: SectionMergeRule, parent: string, name: string) => {
    const parentPath = pathOf(parent);
    if (!parentPath) {
      log.static.push(`${name}(parent ${parent} has no path)`);
      return null;
    }
    const thumbRejects: string[] = [];
    const items: Page[] = [];
    for (const item of as.items ?? []) {
      const path = routeOf(item, parentPath, rule);
      const slug = path?.startsWith(`${parentPath}/`) ? path.slice(parentPath.length + 1) : "";
      if (!slug || slug.includes("/")) {
        log.notes.push(`${name}: dropped slug ${item.slug} (${path ? `route ${path} is not under ${parentPath}` : "no path"})`);
        continue;
      }
      // Not decorative: the photo IS the card; its title is only the caption.
      const thumb = toMediaAsset(item.thumbnail);
      if ("rejected" in thumb) thumbRejects.push(thumb.rejected);
      items.push({
        id: String(item.id),
        title: item.title,
        slug,
        parent,
        template: "secondary",
        utility: "back",
        keyInfo: [],
        hero: "asset" in thumb ? [thumb.asset] : [],
        ...(item.heroText ? { intro: item.heroText } : {}),
        sections: [],
        contacts: [],
        publishedAt: item.publishedAt,
      });
    }
    if (thumbRejects.length) {
      log.notes.push(`${name}: ${thumbRejects.length} thumbnail${thumbRejects.length === 1 ? "" : "s"} rejected (${[...new Set(thumbRejects)].join("; ")})`);
    }
    if (!items.length) {
      log.static.push(`${name}(api section key=${rule.structuredKey} has no routable items)`);
      return null;
    }
    return items;
  };

  /** A fixture text section's body from the SPECIFIC section titled
   *  `rule.textTitle`; the fixture's title, image (unless `sectionImages`)
   *  and links stay. */
  /** Detail entries as cards. Every entry is kept — a discipline has no route
   *  to drop it for — and hangs off a parent with no path, so the card renders
   *  unlinked until the record has a route (T2) rather than guessing one. */
  const detailCards = (entries: CardRef[], name: string): Page[] => {
    const rejects: string[] = [];
    const items = entries.map((item): Page => {
      const thumb = toMediaAsset(item.thumbnail);
      if ("rejected" in thumb) rejects.push(thumb.rejected);
      return {
        id: String(item.id),
        title: item.title,
        slug: item.slug,
        parent: PAGE_ID.disciplines,
        template: "secondary",
        utility: "back",
        keyInfo: [],
        hero: "asset" in thumb ? [thumb.asset] : [],
        sections: [],
        contacts: [],
        publishedAt: item.publishedAt,
      };
    });
    if (rejects.length) {
      log.notes.push(`${name}: ${rejects.length} thumbnail${rejects.length === 1 ? "" : "s"} rejected (${[...new Set(rejects)].join("; ")})`);
    }
    return items;
  };

  /** Detail entries as links — only those whose slug has a route the site
   *  knows a page id for. */
  const detailLinks = (entries: CardRef[]): Link[] =>
    entries.flatMap((item) => {
      const path = pathOfCmsSlug(item.slug);
      const page = path ? pageIdOf(path) : undefined;
      return page
        ? [{ id: `link-${item.slug}`, label: item.title, targetType: "page" as const, page }]
        : [];
    });

  const sliced = new Set<ApiSection>();
  const textBody = (fs: Section, rule: TextMergeRule, name: string): Section => {
    const wanted = rule.textTitle.trim().toLowerCase();
    const as = api.sections.find(
      (s) => s.type === "SPECIFIC" && (s.title ?? "").trim().toLowerCase() === wanted,
    );
    if (!as) {
      log.static.push(`${name}(no api section titled "${rule.textTitle}")`);
      return fs;
    }
    // A slice may share its section with other slices, never with a whole-
    // section rule; an `afterIntro` rule shares it with the standfirst.
    const afterIntro = Boolean(rule.afterIntro);
    if (afterIntro && introPick?.section !== as) {
      log.static.push(`${name}(standfirst did not come from "${rule.textTitle}")`);
      return fs;
    }
    if (consumed.has(as) && !afterIntro && !(rule.blocks && sliced.has(as))) {
      log.static.push(`${name}(api section "${rule.textTitle}" already used)`);
      return fs;
    }
    consumed.add(as);
    if (rule.blocks) sliced.add(as);
    const blocks = (as.blocks ?? []).filter((b) => !afterIntro || b !== introPick?.block);
    const { links: linked, unusable } = rule.linkBlocks ? linkBlockLinks(blocks) : { links: [], unusable: 0 };
    if (unusable) log.notes.push(`${name}: dropped ${unusable} LINK block${unusable === 1 ? "" : "s"} with no url or file`);
    if (fs.type === "links" && rule.linkBlocks) {
      // A list of documents (§76): the LINK blocks are the items, whole. A links
      // section has no body slot, so its TEXT blocks are logged, not rendered.
      if (!linked.length) {
        log.static.push(`${name}(api section "${rule.textTitle}" has no usable LINK block)`);
        return fs;
      }
      const other = blocks.filter((b) => (b.blockType as string) !== "LINK");
      if (other.length) {
        const types = [...new Set(other.map((b) => b.blockType))].join("/");
        log.notes.push(`${name}: dropped ${other.length} ${types} block${other.length === 1 ? "" : "s"} (a list has no body)`);
      }
      log.api.push(`${name}(${linked.length} link block${linked.length === 1 ? "" : "s"})`);
      return { ...fs, items: linked };
    }
    // A cards section takes a body too: the lead-in above its cards (§78).
    if (fs.type !== "text" && fs.type !== "cards") {
      log.static.push(`${name}(fixture section is ${fs.type}, not text)`);
      return fs;
    }
    let texts = blocks.flatMap((b) => (b.blockType === "TEXT" && b.text?.trim() ? [richParagraphs(b.text)] : []));
    if (rule.blocks) {
      if (texts.length !== rule.of) {
        log.static.push(`${name}(block count ${texts.length} ≠ ${rule.of})`);
        return fs;
      }
      const [from, to] = rule.blocks;
      texts = texts.slice(from - 1, to);
    }
    // The body keeps its <strong>/<em>, and a run of "- " blocks is a list
    // (format.ts; Prose.tsx renders both).
    const body = joinBlocks(texts.map((t) => t.text).filter(Boolean)).body;
    if (!body) {
      log.static.push(`${name}(api section "${rule.textTitle}" has no TEXT)`);
      return fs;
    }
    // Printed on every build, so the day the CMS copy gains paragraph breaks the
    // log says so rather than the page quietly changing shape.
    const breaks = texts.reduce((n, t) => n + t.breaks, 0);
    if (breaks) log.notes.push(`${name}: ${breaks} authored paragraph break${breaks === 1 ? "" : "s"} kept`);
    const tags = [...new Set(texts.flatMap((t) => t.tags))];
    if (tags.length) log.notes.push(`${name}: stripped <${tags.join(">, <")}>`);
    // Not for a slice: several rules share its section, and each would take
    // the same photo. An IMAGE block looked at here is logged here, taken or
    // refused, and not again as dropped below.
    let image: MediaAsset | undefined;
    const seen = new Set<SectionBlock>();
    if (config.sectionImages && !rule.blocks) {
      const refusals: string[] = [];
      for (const b of blocks) {
        if (b.blockType !== "IMAGE") continue;
        seen.add(b);
        const result = media(b.media);
        if ("asset" in result) {
          image = result.asset;
          break;
        }
        refusals.push(result.rejected);
      }
      if (refusals.length) log.notes.push(`${name}: image rejected (${refusals.join("; ")})`);
    }
    const rest = blocks.filter(
      (b) => b.blockType !== "TEXT" && !seen.has(b) && !(rule.linkBlocks && (b.blockType as string) === "LINK"),
    );
    if (rest.length && !rule.blocks) {
      const types = [...new Set(rest.map((b) => b.blockType))].join("/");
      log.notes.push(`${name}: dropped ${rest.length} ${types} block${rest.length === 1 ? "" : "s"}`);
    }
    log.api.push(
      (rule.blocks ? `${name}(blocks ${rule.blocks[0]}–${rule.blocks[1]})` : afterIntro ? `${name}(after the standfirst)` : name) +
        (linked.length ? ` + ${linked.length} link block${linked.length === 1 ? "" : "s"}` : "") +
        (image ? " + image" : ""),
    );
    // The CMS's links replace the fixture's external and document ones in the
    // same place, in block order; with none, the fixture's stand.
    const merged = linked.length
      ? { ...fs, body, links: [...linked, ...fs.links.filter((l) => l.targetType !== "external" && l.targetType !== "document")] }
      : { ...fs, body };
    return image ? { ...merged, image } : merged;
  };

  /** A fixture rail section's people from a STRUCTURED section. Title, body
   *  and links stay the fixture's; a person keeps their place without a photo
   *  when the photo is rejected. */
  const railItems = (fs: Extract<Section, { type: "rail" }>, as: ApiSection, name: string): Section => {
    const photoRejects: string[] = [];
    const items = (as.items ?? []).map((item): Person => {
      // The person's name is the model's alt rule for a portrait (NID-CONTEXT
      // §12) — a card's own title, which media.ts allows as the fallback.
      const photo = toMediaAsset(item.thumbnail, { altFallback: item.title });
      if ("rejected" in photo) photoRejects.push(photo.rejected);
      return {
        id: String(item.id),
        name: item.title,
        slug: item.slug,
        role: "faculty",
        ...("asset" in photo ? { photo: photo.asset } : {}),
      };
    });
    if (photoRejects.length) {
      log.notes.push(`${name}: ${photoRejects.length} photo${photoRejects.length === 1 ? "" : "s"} rejected (${[...new Set(photoRejects)].join("; ")})`);
    }
    if (!items.length) {
      log.static.push(`${name}(api section has no items)`);
      return fs;
    }
    log.api.push(`${name}(${items.length})`);
    return { ...fs, items };
  };

  /** A fixture rail section's people from a SPECIFIC section's person
   *  references (ReferenceMergeRule). */
  const referenceRail = (fs: Section, rule: ReferenceMergeRule, name: string): Section => {
    const as = referenceSection(api, rule);
    if (!as) {
      log.static.push(`${name}(no api section titled "${rule.referencesTitle}")`);
      return fs;
    }
    if (consumed.has(as)) {
      log.static.push(`${name}(api section "${rule.referencesTitle}" already used)`);
      return fs;
    }
    consumed.add(as);
    if (fs.type !== "rail") {
      log.static.push(`${name}(fixture section is ${fs.type}, not rail)`);
      return fs;
    }
    const refs = personRefs(as);
    if (!refs.length) {
      log.static.push(`${name}(api section "${rule.referencesTitle}" has no person reference)`);
      return fs;
    }
    const people: Person[] = [];
    refs.forEach((ref, i) => {
      const fallback = fs.items[i];
      const record = records.get(ref.slug);
      if (!record) {
        if (fallback) people.push(fallback);
        log.static.push(`${name}#${i + 1}(record ${ref.slug} unavailable${fallback ? "" : ", no fixture person"})`);
        return;
      }
      const fromApi: string[] = [];
      const fromFixture: string[] = [];
      const pick = <T,>(field: string, api: T | undefined, fixed: T | undefined) => {
        if (api !== undefined) fromApi.push(field);
        else if (fixed !== undefined) fromFixture.push(field);
        return api ?? fixed;
      };
      const personName = pick("name", record.title?.trim() || undefined, fallback?.name) ?? ref.title;
      const designation = pick("designation", personDetail(record)?.designation?.trim() || undefined, fallback?.designation);
      // The person's name is the portrait's alt when the record gives none
      // (NID-CONTEXT §12). The record's thumbnail is the portrait; its `hero`
      // is a page banner.
      const media = toMediaAsset(record.thumbnail ?? ref.thumbnail, { altFallback: personName });
      if ("rejected" in media) log.notes.push(`${name}#${i + 1}: photo rejected (${media.rejected})`);
      const photo = pick("photo", "asset" in media ? media.asset : undefined, fallback?.photo);
      people.push({
        id: String(record.id),
        name: personName,
        slug: record.slug,
        // The CMS has no role vocabulary; the fixture person's stands.
        role: fallback?.role ?? "staff",
        ...(designation ? { designation } : {}),
        ...(photo ? { photo } : {}),
      });
      log.api.push(`${name}#${i + 1}(${ref.slug}: ${fromApi.join(",") || "nothing"})`);
      if (fromFixture.length) log.static.push(`${name}#${i + 1}(${fromFixture.join(",")})`);
    });
    return people.length ? { ...fs, items: people } : fs;
  };

  // A section a detail list feeds is logged by the detail block below, once.
  const detailTargets = detailSections(config.detail);
  const sections: Section[] = fixture.page.sections.map((fs): Section => {
    const name = sectionName(fs.id);
    const rule = config.sections[fs.id];
    if (!rule && detailTargets.has(fs.id) && detail) return fs;
    if (!rule) {
      log.static.push(fs.type === "links" ? `${name}(no link model)` : name);
      return fs;
    }
    if ("textTitle" in rule) return textBody(fs, rule, name);
    if ("referencesTitle" in rule) return referenceRail(fs, rule, name);
    const listed = structuredSection(fs, rule, name);
    return rule.bodyTitle ? textBody(listed, { textTitle: rule.bodyTitle }, `${name}.body`) : listed;
  });

  /** A fixture rail or cards section from its STRUCTURED section. */
  function structuredSection(fs: Section, rule: SectionMergeRule, name: string): Section {
    const as = structured(api, rule, consumed);
    if (typeof as === "string") {
      log.static.push(`${name}(${as})`);
      return fs;
    }
    consumed.add(as);
    if (fs.type === "rail") return railItems(fs, as, name);
    if (fs.type !== "cards") {
      log.static.push(`${name}(fixture section is ${fs.type}, not cards)`);
      return fs;
    }

    // cardKind() and pagePath() read an item's parent, so an API item takes the
    // parent its fixture siblings hang off.
    const parent = fs.items.find((i): i is Page => "parent" in i)?.parent ?? null;
    if (!parent) {
      log.static.push(`${name}(fixture items have no routable parent)`);
      return fs;
    }
    const items = toCards(as, rule, parent, name);
    if (!items) return fs;

    // An API-fed section takes the API's title, unless the rule keeps the
    // fixture's. The fixture's links stay: the API has no link model for a
    // section.
    const title = (!rule.keepTitle && as.title?.trim()) || fs.title;
    log.api.push(`${name}${title === fs.title ? "" : `→"${title}"`}(${items.length})`);
    return { ...fs, title, items };
  }

  if (detail) {
    const lists = config.detail?.lists ?? {};
    const LISTS: DetailList[] = ["disciplines", "serviceCentres", "labAndFacilities"];
    const hold = config.detail?.hold ?? {};
    for (const list of LISTS) {
      const entries = detail[list];
      const held = hold[list];
      if (held) {
        if (entries.length) {
          log.notes.push(
            `${sectionName(held)}: held on the fixture, detail.${list} received and not used (${entries.length}: ${entries.map((e) => e.title).join(", ")})`,
          );
        }
        continue;
      }
      const sectionId = lists[list];
      if (!sectionId) {
        if (entries.length) log.notes.push(`detail.${list}: ${entries.length} ${entries.length === 1 ? "entry" : "entries"}, no board slot`);
        continue;
      }
      const at = sections.findIndex((s) => s.id === sectionId);
      const name = sectionName(sectionId);
      const fs = sections[at];
      if (!fs) {
        log.static.push(`${name}(no fixture section ${sectionId})`);
        continue;
      }
      if (!entries.length) {
        log.static.push(`${name}(detail.${list} empty)`);
        continue;
      }
      if (fs.type === "cards") {
        sections[at] = { ...fs, items: detailCards(entries, name) };
        log.api.push(`${name}(${entries.length} from detail.${list})`);
        continue;
      }
      const links = detailLinks(entries);
      if (!links.length) {
        log.static.push(`${name}(detail.${list}: ${entries.length} ${entries.length === 1 ? "entry" : "entries"}, none routable)`);
        continue;
      }
      sections[at] = fs.type === "links" ? { ...fs, items: links } : { ...fs, links };
      log.api.push(`${name}(${links.length} of ${entries.length} from detail.${list})`);
    }
    const unusedFields = (["address", "mapEmbedUrl", "hostelCapacity", "campusSize", "establishedYear"] as const)
      .filter((f) => detail[f] !== null && !Object.values(config.detail?.keyInfo ?? {}).includes(f as DetailField));
    if (unusedFields.length) log.notes.push(`detail unused: ${unusedFields.join(", ")}`);
  }

  const fixtureIds = new Set(fixture.page.sections.map((s) => s.id));
  const appendedAfter = new Map<string, Section[]>();
  for (const rule of config.appendSections ?? []) {
    const name = `appended:${rule.structuredKey}${rule.nth && rule.nth > 1 ? `#${rule.nth}` : ""}`;
    if (!fixtureIds.has(rule.after)) {
      log.static.push(`${name}(no fixture section ${rule.after} to follow)`);
      continue;
    }
    const as = structured(api, rule, consumed);
    if (typeof as === "string") {
      log.static.push(`${name}(${as})`);
      continue;
    }
    consumed.add(as);
    const title = as.title?.trim();
    if (!title) {
      // A section title is column 1 of the section's first row; none to show.
      log.static.push(`${name}(api section has no title)`);
      continue;
    }
    const items = toCards(as, rule, rule.itemParent, name);
    if (!items) continue;
    log.appended.push(`${rule.structuredKey} "${title}"(${items.length})`);
    const list = appendedAfter.get(rule.after) ?? [];
    list.push({
      id: rule.id,
      page: fixture.page.id,
      order: 0,
      type: "cards",
      title,
      items,
      links: [],
      contacts: [],
    });
    appendedAfter.set(rule.after, list);
  }
  page.sections = appendedAfter.size
    ? sections
        .flatMap((s) => [s, ...(appendedAfter.get(s.id) ?? [])])
        .map((s, i) => ({ ...s, order: i + 1 }))
    : sections;

  if (contactsTo === "sections") {
    const owner = (label: string) =>
      page.sections.find((s) => s.title && (label === s.title || label.startsWith(`${s.title} (`)));
    const claimed = new Map<string, LabelValue[]>();
    for (const { label, value } of contacts) {
      const section = owner(label.trim());
      if (section) claimed.set(section.id, [...(claimed.get(section.id) ?? []), { label, value }]);
      else (log.lines ??= []).push(`contact dropped — "${label}" ${value}: no section on the page is titled so`);
    }
    if (claimed.size) {
      page.sections = page.sections.map((s) => (claimed.has(s.id) ? { ...s, contacts: claimed.get(s.id)! } : s));
      log.api.push(`contacts(${[...claimed.values()].flat().length} to sections)`);
    } else log.static.push(contacts.length ? "contacts(none claimed by a section)" : "contacts(api empty)");
  }

  // The document carries no parent or sibling relationship, so a secondary
  // page's back-nav and sibling band are always the fixture's.
  if (derived.backNav) log.static.push("backNav");
  if (derived.siblingBand.length) log.static.push("siblingBand");

  // Page order is the fixture's; the API's orderIndex never reorders a slot.
  // A tie is logged because it makes the API's own order ambiguous.
  const byIndex = new Map<number, ApiSection[]>();
  for (const s of api.sections) byIndex.set(s.orderIndex, [...(byIndex.get(s.orderIndex) ?? []), s]);
  for (const [index, tied] of byIndex) {
    if (tied.length > 1) {
      log.notes.push(`orderIndex ${index} tie: ${tied.map((s) => `"${s.title ?? s.id}"`).join(", ")}`);
    }
  }

  const unused = api.sections.filter((s) => !consumed.has(s));
  log.notes.push(
    `unused api sections: ${
      unused.length
        ? unused.map((s) => `"${s.title ?? s.id}" (${s.structuredContentType?.key ?? s.type})`).join(", ")
        : "none"
    }`,
  );

  return { response: { ...fixture, page, derived }, sources: log };
}
