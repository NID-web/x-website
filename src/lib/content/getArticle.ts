// The article seam, /about/news-events/[slug] — the one route where the CMS owns
// page STRUCTURE (STAGE-0-NOTES §59). Every other page merges the API over a
// fixture that decides which sections exist (page-adapter.ts); an article is a
// collection item with no board of its own, so its sections, their order, titles
// and count are the document's. The boards are the layout contract only.
//
// Two fixture articles (fixtures/articles.ts) render when the API has no document
// for their slug. An API document replaces a fixture whole, never merges over it.
import { cache } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import type { LabelValue, Link, MediaAsset, PageResponse, Section } from "@/lib/content-model";
import { ARROW_CHARS } from "@/lib/content-model";
import { cmsFetch } from "@/lib/api/client";
import { toMediaAsset } from "@/lib/api/media";
import {
  isPublicContentResponse,
  type CardRef,
  type PublicContentResponse,
  type Section as ApiSection,
} from "@/lib/api/types";
import { formatEventDate, plainParagraphs, plainText } from "@/lib/content/format";
import { registerBuiltParams } from "@/lib/content/links";
import { PAGE_ID, newsArticlePath, pageIdOf, pathOf } from "@/lib/content/pages";
import { auditSummary, gatePage, logMissingRoutes } from "@/lib/content/route-gate";
import { ARTICLES } from "@/lib/content/fixtures/articles";
import { routeTitle } from "@/lib/nav-content";
import { normalise } from "@/lib/nav-trail";

const ROUTE = "/about/news-events/[slug]";
const PARENT = normalise(pathOf(PAGE_ID.newsEvents) ?? "/about/news-events");
/** The listing document whose items are the articles the site links to. */
const FEED_SLUG = "news-events";
/** A slug that can be one URL segment as-is. The CMS derives slugs from titles
 *  (A3); anything else — a slash, a space, an uppercase letter — is dropped
 *  rather than escaped into a URL nobody authored. */
const SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const articlePath = (slug: string) => `${PARENT}/${slug}`;

interface Feed {
  /** Routable feed items, newest first, one per slug. */
  items: CardRef[];
  /** Every slug the route builds: the feed's and the fixtures'. */
  slugs: Set<string>;
  dropped: string[];
}

// The listing document's items ARE the article index: every card the site links
// to under this route comes from it, so building exactly these makes every card
// on /about/news-events resolve. One request for the whole index — the
// alternative, /public/content-items?contentType=…, returns card refs too (not
// documents), caps `limit` at 50 and adds 31 `calendar-*` events nothing links.
//
// Memoised per PROCESS, not per render (react `cache`): every article page and
// every gate needs the same list, and one request per page would spend the
// API's 100-a-minute budget on a document that cannot change mid-build. A build
// is a fresh process. Under `next dev` the list is read once per server start —
// restart to see an article added in the CMS.
let feed: Promise<Feed> | undefined;

async function loadFeed(): Promise<Feed> {
  const doc = await cmsFetch(`/public/content/${FEED_SLUG}`, isPublicContentResponse);
  const bySlug = new Map<string, CardRef>();
  const dropped: string[] = [];
  for (const section of doc?.sections ?? []) {
    if (section.type !== "STRUCTURED") continue;
    for (const item of section.items ?? []) {
      if (bySlug.has(item.slug)) continue;
      // The same rule the listing's cards are routed by (slugUnderParent).
      const path = newsArticlePath(item.slug);
      const reason =
        path !== articlePath(item.slug)
          ? `routes to ${path}`
          : !SEGMENT.test(item.slug)
            ? "not a URL segment"
            : pageIdOf(path)
              ? "collides with a named page"
              : null;
      if (reason) {
        dropped.push(`${item.slug} (${reason})`);
        continue;
      }
      bySlug.set(item.slug, item);
    }
  }
  const time = (item: CardRef) => (item.publishedAt ? Date.parse(item.publishedAt) : -Infinity);
  const items = [...bySlug.values()].sort((a, b) => time(b) - time(a));
  const slugs = new Set([...items.map((i) => i.slug), ...Object.keys(ARTICLES)]);
  registerBuiltParams(ROUTE, slugs);
  return { items, slugs, dropped };
}

/** The article index, registered with the route gate. Every page that gates
 *  links awaits this first, so a card to a built article is linked and one to
 *  an unbuilt slug is not. */
export function articleFeed(): Promise<Feed> {
  return (feed ??= loadFeed());
}

/** generateStaticParams' slugs, with the one summary line for the build. */
export async function articleSlugs(): Promise<string[]> {
  const { items, slugs, dropped } = await articleFeed();
  const fixtures = Object.keys(ARTICLES);
  const shared = fixtures.filter((s) => items.some((i) => i.slug === s)).length;
  console.info(
    `[cms] ${ROUTE}: ${slugs.size} routes — ${items.length} from the api feed, ` +
      `${fixtures.length - shared} fixture-only, ${shared} fixture slug${shared === 1 ? "" : "s"} also in the feed` +
      ` · dropped ${dropped.length} (no path)${dropped.length ? `: ${dropped.join(", ")}` : ""}`,
  );
  return [...slugs];
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/** The typed `detail` an item document carries, read defensively: `body` on
 *  news, `schedules` + stream/registration links on events, symposium dates +
 *  an apply link on workshops. Anything malformed is simply absent. */
function readDetail(api: PublicContentResponse) {
  const d = isObj(api.detail) ? api.detail : {};
  const schedule = Array.isArray(d.schedules) ? d.schedules.filter(isObj) : [];
  const first = schedule[0];
  const links: Array<{ key: "liveStream" | "register" | "apply"; url: string }> = [];
  for (const [field, key] of [
    ["liveStreamLink", "liveStream"],
    ["registrationLink", "register"],
    ["applyLink", "apply"],
  ] as const) {
    const url = str(d[field]);
    if (url && /^https?:\/\//.test(url)) links.push({ key, url });
  }
  const known = new Set([
    "contentItemId", "body", "schedules", "liveStreamLink", "registrationLink", "applyLink",
    "symposiumStartDate", "symposiumEndDate",
  ]);
  return {
    body: str(d.body),
    start: str(first?.startDate) ?? str(d.symposiumStartDate),
    end: str(first?.endDate) ?? str(d.symposiumEndDate),
    dateFrom: first?.startDate ? "schedules" : d.symposiumStartDate ? "symposiumStartDate" : undefined,
    venue: str(first?.venue),
    schedules: schedule.length,
    links,
    unused: Object.keys(d).filter((k) => !known.has(k) && d[k] !== null && d[k] !== ""),
  };
}

interface Log {
  api: string[];
  absent: string[];
  notes: string[];
  rejected: string[];
}

/** A SPECIFIC section as a text section: TEXT blocks are the body, the first
 *  usable IMAGE block the image, LINK blocks the column-4 links. */
function toSection(as: ApiSection, pageId: string, log: Log): Section | null {
  const blocks = [...(as.blocks ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
  const texts: string[] = [];
  const links: Link[] = [];
  let image: MediaAsset | undefined;
  const dropped: string[] = [];
  let extraImages = 0;
  for (const block of blocks) {
    // LINK is served but not in the typed union (types.ts predates it); read
    // as a string so the comparison type-checks.
    const type: string = block.blockType;
    if (type === "TEXT") {
      const text = block.text ? plainParagraphs(block.text).text : "";
      if (text) texts.push(text);
    } else if (type === "IMAGE") {
      const media = toMediaAsset(block.media);
      if ("rejected" in media) log.rejected.push(media.rejected);
      else if (image) extraImages++;
      else image = media.asset;
    } else if (type === "LINK") {
      const url = str((block as unknown as Obj).url);
      const label = str(block.text);
      if (!url || !/^https?:\/\//.test(url) || !label) {
        dropped.push("LINK(no label or absolute url)");
      } else if (ARROW_CHARS.test(label)) {
        // content-model.ts: a label never carries an arrow; the icon does.
        dropped.push(`LINK("${label}": arrow in label)`);
      } else {
        links.push({ id: `link-${block.id}`, label, targetType: "external", url });
      }
    } else {
      dropped.push(type);
    }
  }
  // The model has one image per section; the rest are counted, not rendered.
  if (extraImages) dropped.push(`IMAGE×${extraImages}(one image per section)`);
  const title = as.title?.trim() ?? "";
  const name = `"${title || `section ${as.id}`}"`;
  if (dropped.length) log.notes.push(`${name}: dropped ${dropped.join(", ")}`);
  const body = texts.join("\n\n");
  if (!body && !image && !links.length) {
    // CLAUDE.md: the front end refuses to render a section with no content.
    log.notes.push(`${name}: no content, not rendered`);
    return null;
  }
  return {
    id: `section-${as.id}`,
    page: pageId,
    order: 0,
    type: "text",
    title,
    ...(body ? { body } : {}),
    ...(image ? { image } : {}),
    links,
    contacts: [],
    items: [],
  };
}

function toArticle(
  api: PublicContentResponse,
  card: CardRef | undefined,
  t: (key: "date" | "venue" | "liveStream" | "register" | "apply" | "allNews") => string,
  locale: string,
  log: Log,
): PageResponse {
  const pageId = `article-${api.slug}`;
  const detail = readDetail(api);

  const title = str(api.title) ?? card?.title ?? api.slug;
  if (str(api.title)) log.api.push("title");

  const keyInfo: LabelValue[] = [];
  // TODO(review): an event's Date is its schedule's startDate and a workshop's
  // its symposium dates — the date the board draws (22 January 2026 is the
  // Convocation itself). Everything else falls back to publishedAt, which is
  // the ANNOUNCEMENT date and, on several records, a seed timestamp (B4).
  const published = api.publishedAt ?? card?.publishedAt ?? null;
  if (detail.start) {
    keyInfo.push({ label: t("date"), value: formatEventDate(detail.start, locale, detail.end) });
    log.api.push(`date(${detail.dateFrom})`);
  } else if (published) {
    keyInfo.push({ label: t("date"), value: formatEventDate(published, locale) });
    log.api.push("date(publishedAt)");
  }
  if (detail.schedules > 1) log.notes.push(`${detail.schedules} schedules, first used`);
  if (detail.venue) {
    keyInfo.push({ label: t("venue"), value: detail.venue });
    log.api.push("venue(schedules)");
  } else {
    log.absent.push("venue(no location field)");
  }

  const contacts = api.contacts ?? [];
  // The board draws the contact CTA under the rail's rows.
  keyInfo.push(...contacts.map(({ label, value }) => ({ label, value })));
  if (contacts.length) log.api.push(`contacts(${contacts.length})`);

  // Non-decorative, and no fallback alt: a page title names the page, not the
  // picture (media.ts). A rejected hero renders no hero at all.
  const hero = api.hero.slice(0, 1).map((ref) => toMediaAsset(ref));
  const heroes = hero.flatMap((h) => ("asset" in h ? [h.asset] : []));
  for (const h of hero) if ("rejected" in h) log.rejected.push(`hero ${h.rejected}`);
  if (heroes.length) log.api.push("hero");

  const intro = api.heroText ? plainText(api.heroText).text : "";
  if (intro) log.api.push("heroText");

  const sections: Section[] = [];
  if (detail.body) {
    // A news item's body is one untitled block of prose in `detail`, not a
    // section; it opens the article, before any titled section.
    const body = plainParagraphs(detail.body).text;
    if (body) {
      sections.push({
        id: "section-body",
        page: pageId,
        order: 0,
        type: "text",
        title: "",
        body,
        links: [],
        contacts: [],
        items: [],
      });
      log.api.push("body(detail.body)");
    }
  }
  const apiSections = [...api.sections].sort((a, b) => a.orderIndex - b.orderIndex);
  let fromSections = 0;
  for (const as of apiSections) {
    if (as.type !== "SPECIFIC") {
      log.notes.push(`"${as.title ?? as.id}": ${as.structuredContentType?.key ?? as.type} section dropped (no card slot on an article)`);
      continue;
    }
    const section = toSection(as, pageId, log);
    if (section) {
      sections.push(section);
      fromSections++;
    }
  }
  if (fromSections) log.api.push(`sections(${fromSections})`);

  // The typed detail's links (live stream, registration, apply) join the first
  // section's column-4 slot — where the Convocation board draws "Watch the live
  // stream". With no section to carry them they are logged, not rendered.
  if (detail.links.length) {
    const first = sections[0];
    const links: Link[] = detail.links.map(({ key, url }) => ({
      id: `link-detail-${key}`,
      label: t(key),
      targetType: "external",
      url,
    }));
    if (first) {
      sections[0] = { ...first, links: [...first.links, ...links] };
      log.api.push(`detailLinks(${links.length})`);
    } else {
      log.notes.push(`detail links dropped (no section): ${detail.links.map((l) => l.key).join(",")}`);
    }
  }
  if (!sections.some((s) => s.links.length)) log.absent.push("sectionLinks(A4)");
  if (!sections.some((s) => s.image)) log.absent.push("sectionImages(5.2)");
  if (detail.unused.length) log.notes.push(`detail unused: ${detail.unused.join(", ")}`);

  const seoTitle = str(api.seo?.metaTitle);
  const seoDescription = str(api.seo?.metaDescription);
  if (seoTitle || seoDescription) log.api.push("seo");
  if (api.publishedAt) log.api.push("publishedAt");

  return {
    page: {
      id: pageId,
      title,
      slug: api.slug,
      parent: PAGE_ID.newsEvents,
      template: "secondary",
      utility: "back",
      keyInfo,
      hero: heroes,
      ...(intro ? { intro } : {}),
      sections: sections.map((s, i) => ({ ...s, order: i + 1 })),
      contacts: [],
      ...(seoTitle ? { seoTitle } : {}),
      ...(seoDescription ? { seoDescription } : {}),
      publishedAt: published,
    },
    derived: { menuTree: [], breadcrumb: [], backNav: null, subPageLinks: [], siblingBand: [] },
  };
}

/** The next article in the feed after `slug`, newest first, wrapping. */
function nextInFeed(items: CardRef[], slug: string): CardRef | undefined {
  const at = items.findIndex((i) => i.slug === slug);
  for (let k = 1; k <= items.length; k++) {
    const item = items[(at + k) % items.length];
    if (item && item.slug !== slug) return item;
  }
  return undefined;
}

/** One article as the PageResponse the renderer consumes, or null for a slug the
 *  route does not build. */
export const getArticle = cache(async (slug: string): Promise<PageResponse | null> => {
  const index = await articleFeed();
  if (!index.slugs.has(slug)) return null;
  const path = articlePath(slug);
  const card = index.items.find((i) => i.slug === slug);
  const fixture = ARTICLES[slug];

  // Only a slug the feed lists is asked for: a fixture-only slug has no document
  // to fetch, and asking would print a 404 warning on every build.
  const api = card ? await cmsFetch(`/public/content/${slug}`, isPublicContentResponse) : null;

  const [locale, t] = await Promise.all([getLocale(), getTranslations("Article")]);
  const log: Log = { api: [], absent: [], notes: [], rejected: [] };

  let response: PageResponse;
  let source: string;
  if (api) {
    response = toArticle(api, card, t, locale, log);
    source = fixture ? "fixture=replaced" : "fixture=none";
  } else if (fixture) {
    response = fixture;
    source = card ? "fixture (api document unavailable)" : "fixture (no api document)";
  } else {
    // In the feed, so the listing links here, but the document did not arrive
    // (a warning above says why). The card's own fields keep the route from
    // becoming a 404 behind a live link; the next build fills it in.
    response = toArticle(
      { ...card!, hero: [], seo: null, sections: [], contacts: [], navigation: null, heroText: card!.heroText },
      card,
      t,
      locale,
      log,
    );
    source = "listing card only (api document unavailable)";
  }

  // "More news": one sibling and the listing. A fixture keeps the sibling its
  // board draws; an API article takes the next item in the feed.
  const next = api || !fixture ? nextInFeed(index.items, slug) : undefined;
  const sibling = next
    ? [{ id: `article-${next.slug}`, title: next.title, href: articlePath(next.slug) }]
    : response.derived.siblingBand;
  const all = { id: PAGE_ID.newsEvents, title: t("allNews"), href: PARENT };
  // A5: a document has no parent, so the back link is the route's own parent,
  // named by its destination — never "Back".
  const backLabel = routeTitle(PARENT) ?? "News & Events";
  const derived = {
    ...response.derived,
    backNav: { label: backLabel, href: PARENT },
    siblingBand: [...sibling.filter((s) => s.href !== path), all],
  };

  const gated = gatePage({ ...response, derived });
  if (api || !fixture) {
    const reject = [...new Set(log.rejected)];
    console.info(
      `[cms] ${path}: api=${log.api.join(",") || "none"}` +
        ` · static=backNav,${next ? "siblingLink(feed)" : "siblingLink(none)"},allNewsLink` +
        (log.absent.length ? ` · absent=${log.absent.join(",")}` : "") +
        (reject.length ? ` · media rejected ${log.rejected.length} (${reject.join("; ")})` : "") +
        (log.notes.length ? ` · ${log.notes.join(" · ")}` : "") +
        ` · ${source} · ${auditSummary(gated.audit)}`,
    );
  } else {
    console.info(`[cms] ${path}: ${source} · all slots static · ${auditSummary(gated.audit)}`);
  }
  logMissingRoutes(path, gated.audit);
  return gated.response;
});
