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
  /** The API STRUCTURED section that replaces this fixture section is found by
   *  structuredContentType.key — never by title, orderIndex or position. */
  structuredKey: string;
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
}

export interface SourceLog {
  api: string[];
  static: string[];
  notes: string[];
}

const structured = (api: PublicContentResponse, key: string) =>
  api.sections.find((s) => s.type === "STRUCTURED" && s.structuredContentType?.key === key);

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
  const log: SourceLog = { api: [], static: [], notes: [] };
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
  } else log.static.push("intro(no TEXT block in a SPECIFIC section)");

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
    const section = structured(api, config.subPagesKey);
    if (!section) log.static.push(`subPages(no api section key=${config.subPagesKey})`);
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

  const sectionName = (id: string) => `section:${id.replace(`section-${fixture.page.slug}-`, "")}`;
  page.sections = fixture.page.sections.map((fs): Section => {
    const name = sectionName(fs.id);
    const rule = config.sections[fs.id];
    if (!rule) {
      log.static.push(name);
      return fs;
    }
    const as = structured(api, rule.structuredKey);
    if (!as) {
      log.static.push(`${name}(no api section key=${rule.structuredKey})`);
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
    const parentPath = parent ? pathOf(parent) : undefined;
    if (!parent || !parentPath) {
      log.static.push(`${name}(fixture items have no routable parent)`);
      return fs;
    }

    const thumbRejects = new Set<string>();
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
      if ("rejected" in thumb) thumbRejects.add(thumb.rejected);
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
    if (thumbRejects.size) log.notes.push(`${name}: thumbnails rejected: ${[...thumbRejects].join("; ")}`);
    if (!items.length) {
      log.static.push(`${name}(api section key=${rule.structuredKey} has no routable items)`);
      return fs;
    }
    log.api.push(name);
    // The fixture's links stay: the API has no link model for a section.
    return { ...fs, title: as.title?.trim() || fs.title, items };
  });

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
