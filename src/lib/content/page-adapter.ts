// A CMS content document merged over a page's fixture, one field or section at
// a time. Whatever the API can feed comes from the API; everything else stays
// the fixture's, with the reason recorded — a page-level swap would ship a page
// with its lower sections missing while the CMS is only part-seeded. The only
// per-page knowledge is the PageMergeConfig in getPage.ts, so Charter, News &
// Events and Our Themes go through this same function.
import type { Page, PageResponse, Section } from "@/lib/content-model";
import type { CardRef, PublicContentResponse, Section as ApiSection } from "@/lib/api/types";
import { toMediaAsset } from "@/lib/api/media";
import { plainText } from "@/lib/content/format";
import { pathOf, pathOfCmsSlug } from "@/lib/content/pages";

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
}

export interface PageMergeConfig {
  /** The document at /public/content/{slug}. */
  slug: string;
  /** structuredContentType.key of the section listing the page's children. */
  subPagesKey?: string;
  /** Keyed by the FIXTURE section's id. */
  sections: Record<string, SectionMergeRule>;
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

export interface SourceLog {
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

  const heroes = api.hero.map((ref) => toMediaAsset(ref));
  const accepted = heroes.flatMap((h) => ("asset" in h ? [h.asset] : []));
  const rejected = [...new Set(heroes.flatMap((h) => ("rejected" in h ? [h.rejected] : [])))];
  if (accepted.length) {
    // Every accepted image is mapped (the model's >1 is a slider); the page
    // still renders hero[0] only.
    page.hero = accepted;
    log.api.push("hero");
    if (rejected.length) log.notes.push(`hero: ${rejected.length} rejected (${rejected.join("; ")})`);
  } else {
    log.static.push(`hero(${rejected.length ? `media rejected: ${rejected.join("; ")}` : "api empty"})`);
  }

  // The standfirst is the first TEXT block of the first SPECIFIC section. The
  // model has one intro and no slot for the blocks after it, so they are
  // counted, not rendered — inventing a text section would add one the board
  // does not have.
  const introSection = api.sections.find((s) => s.type === "SPECIFIC");
  const blocks = introSection?.blocks ?? [];
  const introBlock = blocks.find((b) => b.blockType === "TEXT" && b.text?.trim());
  const intro = introBlock?.text ? plainText(introBlock.text) : undefined;
  if (introSection && intro?.text) {
    consumed.add(introSection);
    page.intro = intro.text;
    log.api.push("intro");
    if (intro.tags.length) log.notes.push(`intro: stripped <${intro.tags.join(">, <")}>`);
    const rest = blocks.filter((b) => b !== introBlock);
    if (rest.length) {
      const types = [...new Set(rest.map((b) => b.blockType))].join("/");
      log.notes.push(`dropped ${rest.length} ${types} block${rest.length === 1 ? "" : "s"}`);
    }
  } else log.static.push(`intro(${introSection ? "no TEXT block in a SPECIFIC section" : "no SPECIFIC section"})`);

  // The document's own summary line. No secondary board draws one, and the
  // standfirst above is the intro when a page has any.
  if (api.heroText?.trim()) log.notes.push("dropped heroText");

  const contacts = api.contacts ?? [];
  if (contacts.length) {
    page.contacts = contacts.map(({ label, value }) => ({ label, value }));
    log.api.push("contacts");
  } else log.static.push("contacts(api empty)");

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

  const sections = fixture.page.sections.map((fs): Section => {
    const name = sectionName(fs.id);
    const rule = config.sections[fs.id];
    if (!rule) {
      log.static.push(fs.type === "links" ? `${name}(no link model)` : name);
      return fs;
    }
    const as = structured(api, rule, consumed);
    if (typeof as === "string") {
      log.static.push(`${name}(${as})`);
      return fs;
    }
    consumed.add(as);
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

    // An API-fed section takes the API's title. The fixture's links stay: the
    // API has no link model for a section.
    const title = as.title?.trim() || fs.title;
    log.api.push(`${name}${title === fs.title ? "" : `→"${title}"`}(${items.length})`);
    return { ...fs, title, items };
  });

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

  // The document carries no parent or sibling relationship, so a secondary
  // page's back-nav and sibling band are always the fixture's.
  if (derived.backNav) log.static.push("backNav");
  if (derived.siblingBand.length) log.static.push("siblingBand");

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
