// The article seam, /about/news-events/[slug] and /events/[slug] — the routes
// where the CMS owns page STRUCTURE (STAGE-0-NOTES §59, §68). One projection
// for both: news items build under the first, events and workshops under the
// second (itemPath in pages.ts). Every other page merges the API over a
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
import { assertFloor, report, strictBuild } from "@/lib/api/build-mode";
import { cmsFetch } from "@/lib/api/client";
import { toMediaAsset } from "@/lib/api/media";
import {
  isContentItems,
  isPublicContentResponse,
  type CardRef,
  type PublicContentResponse,
  type Section as ApiSection,
} from "@/lib/api/types";
import { formatEventDate, joinBlocks, plainText, richParagraphs } from "@/lib/content/format";
import { registerBuiltParams } from "@/lib/content/links";
import { PAGE_ID, SAME_STORY, isEventType, itemPath, pageIdOf, pathOf } from "@/lib/content/pages";
import { auditSummary, gatePage, logMissingRoutes } from "@/lib/content/route-gate";
import { CMS_FLOORS } from "@/lib/content/cms-floors";
import { RAIL_LINK_ORDER, type RailLink } from "@/lib/content/editorial";
import { ARTICLE_CMS_SLUG, ARTICLES, EVENT_ARTICLES, type ArticleFixture } from "@/lib/content/fixtures/articles";
import { routeTitle } from "@/lib/nav-content";
import { normalise } from "@/lib/nav-trail";

export const NEWS_ROUTE = "/about/news-events/[slug]";
export const EVENTS_ROUTE = "/events/[slug]";
export type ArticleRoute = typeof NEWS_ROUTE | typeof EVENTS_ROUTE;
const PARENT = normalise(pathOf(PAGE_ID.newsEvents) ?? "/about/news-events");
const BASE: Record<ArticleRoute, string> = { [NEWS_ROUTE]: PARENT, [EVENTS_ROUTE]: pathOf(PAGE_ID.events)! };
/** The listing document whose items are the articles the site links to. */
const FEED_SLUG = "news-events";
/** A slug that can be one URL segment as-is. The CMS derives slugs from titles
 *  (A3); anything else — a slash, a space, an uppercase letter — is dropped
 *  rather than escaped into a URL nobody authored. */
const SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const articlePath = (slug: string) => `${PARENT}/${slug}`;

/** The collections /about/news-events lists, and the archive's order of them. */
export const LISTED_TYPES = ["news", "event", "workshop"] as const;
export type ListedType = (typeof LISTED_TYPES)[number];

// TODO(review): backend — the academic calendar's thirty entries are `event`
// records slugged `calendar-NN-…`, with no thumbnail, a date range for heroText
// and a seed publishedAt (2026-01-01). They are calendar rows, not news, so
// neither the archive nor the article route takes them. A `calendar` content
// type (or a flag) would let this prefix go.
export const CALENDAR_SLUG_PREFIX = "calendar-";

const LIST_LIMIT = 50; // the API rejects more

export interface Listed {
  /** Every non-calendar item of every listed type, one per slug, in
   *  LISTED_TYPES order. Empty when the CMS is off. */
  items: CardRef[];
  /** Items served per type, calendar entries included (pagination.total). */
  served: Record<ListedType, number>;
  calendar: number;
  /** False when any type did not arrive: the archive then renders its fixture. */
  ok: boolean;
}

/** Every item of one type, across pages. Null when the CMS is off or a page
 *  did not arrive (in a LIVE build cmsFetch has already thrown). */
async function listType(type: ListedType): Promise<CardRef[] | null> {
  const bySlug = new Map<string, CardRef>();
  let total = 0;
  for (let page = 1, pages = 1; page <= pages; page++) {
    const res = await cmsFetch(
      `/public/content-items?contentType=${type}&limit=${LIST_LIMIT}&page=${page}`,
      isContentItems,
    );
    if (!res) return null;
    for (const item of res.items) if (!bySlug.has(item.slug)) bySlug.set(item.slug, item);
    total = res.pagination?.total ?? res.items.length;
    pages = res.pagination?.totalPages ?? 1;
  }
  // The order is not stable across pages when dates tie (thirty events share
  // 2026-01-01): page 2 repeated slugs from page 1 when probed, so an item can
  // also be skipped. Deduping hides the repeat; only the count shows the skip.
  // Reported as a floor, and like one it ends a LIVE build: a short list is a
  // silently short archive (STAGE-0-NOTES §65).
  report({ t: "floor", what: `paging ${type}: unique items vs pagination.total`, expected: total, got: bySlug.size, source: type });
  if (bySlug.size !== total) {
    const message =
      `[cms] PAGING SHORT — /public/content-items?contentType=${type}: ${bySlug.size} unique items ` +
      `across pages, pagination.total says ${total}. The API's order moved between pages.`;
    if (strictBuild()) throw new Error(message);
    console.warn(message);
  }
  return [...bySlug.values()];
}

let listed: Promise<Listed> | undefined;

async function loadListed(): Promise<Listed> {
  const lists = await Promise.all(LISTED_TYPES.map(listType));
  const served = Object.fromEntries(
    LISTED_TYPES.map((type, i) => [type, lists[i]?.length ?? 0]),
  ) as Record<ListedType, number>;
  const seen = new Set<string>();
  const items: CardRef[] = [];
  let calendar = 0;
  for (const item of lists.flatMap((l) => l ?? [])) {
    if (item.slug.startsWith(CALENDAR_SLUG_PREFIX)) {
      calendar++;
      continue;
    }
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    items.push(item);
  }
  return { items, served, calendar, ok: lists.every(Boolean) };
}

/** News, events and workshops from the list endpoints: three requests per build
 *  today, memoised per process like the feed. */
export function listedItems(): Promise<Listed> {
  return (listed ??= loadListed());
}

/** One page either route builds: the CMS record it renders, and/or the fixture
 *  that stands in when that record's document does not arrive. */
interface Entry {
  slug: string;
  route: ArticleRoute;
  card?: CardRef;
  fixture?: ArticleFixture;
}

interface Feed {
  /** The listing document's routable items, newest first: "More news". */
  items: CardRef[];
  /** Routable list-endpoint items the document does not carry; built so the
   *  archive can link them, never "More news" siblings. */
  listedOnly: Map<string, CardRef>;
  /** Every page either route builds, by its full path. */
  pages: Map<string, Entry>;
  /** Every other URL that builds, as a 308 to its page: an event's old
   *  /about/news-events/ URL, an event's CMS-slug path where sitemap.json names
   *  a short one, a same-story duplicate, a fixture slug the CMS serves under
   *  its own (§63, §68). */
  redirects: Map<string, string>;
  dropped: string[];
  /** Records that are another record's story (SAME_STORY), so no page. */
  duplicates: string[];
}

// The listing document's items are the article index: every card on
// /about/news-events comes from it, and it alone orders "More news". The
// archive lists more — every news, event and workshop item the list endpoints
// serve — so their non-calendar items are built too (STAGE-0-NOTES §66); a
// calendar entry is not an article and nothing links one. Events and workshops
// build under /events, news under /about/news-events (itemPath, §68).
//
// Memoised per PROCESS, not per render (react `cache`): every article page and
// every gate needs the same list, and one request per page would spend the
// API's 100-a-minute budget on a document that cannot change mid-build. A build
// is a fresh process. Under `next dev` the list is read once per server start —
// restart to see an article added in the CMS.
let feed: Promise<Feed> | undefined;

const typeOf = (card: CardRef) => card.contentType?.key;
const routeOfType = (type: string | undefined): ArticleRoute => (isEventType(type) ? EVENTS_ROUTE : NEWS_ROUTE);

/** Why a record cannot have a page, or null when it can. */
function refusal(slug: string, type: string | undefined): string | null {
  const path = itemPath(slug, type);
  const base = BASE[routeOfType(type)];
  if (!path.startsWith(`${base}/`) || path.slice(base.length + 1).includes("/")) return `routes to ${path}`;
  if (!SEGMENT.test(slug)) return "not a URL segment";
  // A named page under the listing — `archive` is one — is a static segment
  // beside [slug]. Next would prefer the static page anyway; refusing here
  // keeps a CMS item slugged "archive" from being generated and linked at all.
  if (pageIdOf(path)) return "collides with a named page";
  return null;
}

async function loadFeed(): Promise<Feed> {
  const [doc, listed] = await Promise.all([
    cmsFetch(`/public/content/${FEED_SLUG}`, isPublicContentResponse),
    listedItems(),
  ]);
  const bySlug = new Map<string, CardRef>();
  const dropped: string[] = [];
  for (const section of doc?.sections ?? []) {
    if (section.type !== "STRUCTURED") continue;
    for (const item of section.items ?? []) {
      if (bySlug.has(item.slug)) continue;
      const reason = refusal(item.slug, typeOf(item));
      if (reason) {
        dropped.push(`${item.slug} (${reason})`);
        continue;
      }
      bySlug.set(item.slug, item);
    }
  }
  const listedOnly = new Map<string, CardRef>();
  for (const item of listed.items) {
    if (bySlug.has(item.slug)) continue;
    // Built only so the archive can link it, and the archive has no year for
    // an undated item — so it would be a page nothing links to.
    const reason = item.publishedAt ? refusal(item.slug, typeOf(item)) : "no publishedAt, not in the archive";
    if (reason) {
      dropped.push(`${item.slug} (${reason}, listed)`);
      continue;
    }
    listedOnly.set(item.slug, item);
  }
  const time = (item: CardRef) => (item.publishedAt ? Date.parse(item.publishedAt) : -Infinity);
  const items = [...bySlug.values()].sort((a, b) => time(b) - time(a));
  // The case that throws nothing: a 200 whose sections are empty builds two
  // fixture routes and withholds every news link, with exit 0.
  assertFloor("article feed (routable items in news-events)", CMS_FLOORS.articleFeed, items.length, `/public/content/${FEED_SLUG}`);

  const pages = new Map<string, Entry>();
  const redirects = new Map<string, string>();
  const duplicates: string[] = [];
  const records = [...items, ...listedOnly.values()];
  // Canonical records first, so a same-story duplicate never claims the page.
  for (const card of [...records.filter((c) => !SAME_STORY[c.slug]), ...records.filter((c) => SAME_STORY[c.slug])]) {
    const type = typeOf(card);
    const path = itemPath(card.slug, type);
    if (pages.has(path)) duplicates.push(`${card.slug} → ${path}`);
    else pages.set(path, { slug: card.slug, route: routeOfType(type), card });
    if (isEventType(type)) {
      // Its URL before events moved (built until §68), and its own CMS slug
      // under /events where the page is a short path or another record's.
      for (const from of [articlePath(card.slug), `${BASE[EVENTS_ROUTE]}/${card.slug}`]) {
        if (from !== path) redirects.set(from, path);
      }
    }
  }
  // A fixture stands in for its record, or is the page where there is none. One
  // whose story the CMS serves under another slug is a 308 there instead: the
  // fixture path is still linked from outside (§63).
  const fixtures: Array<[string, ArticleFixture, string]> = [
    ...Object.entries(ARTICLES).map(([slug, response]) => [slug, { response }, "news"] as [string, ArticleFixture, string]),
    ...Object.entries(EVENT_ARTICLES).map(([slug, f]) => [slug, f, "workshop"] as [string, ArticleFixture, string]),
  ];
  for (const [slug, fixture, type] of fixtures) {
    const path = itemPath(slug, type);
    const cms = ARTICLE_CMS_SLUG[slug];
    const record = cms ? (bySlug.get(cms) ?? listedOnly.get(cms)) : undefined;
    if (record) {
      redirects.set(path, itemPath(record.slug, typeOf(record)));
      continue;
    }
    const entry = pages.get(path);
    if (entry) entry.fixture = fixture;
    else pages.set(path, { slug, route: routeOfType(type), fixture });
  }
  for (const path of pages.keys()) redirects.delete(path);

  for (const route of [NEWS_ROUTE, EVENTS_ROUTE] as const) {
    const base = `${BASE[route]}/`;
    registerBuiltParams(
      route,
      [...pages.keys(), ...redirects.keys()].filter((p) => p.startsWith(base)).map((p) => p.slice(base.length)),
    );
  }
  return { items, listedOnly, pages, redirects, dropped, duplicates };
}

/** The article index, registered with the route gate. Every page that gates
 *  links awaits this first, so a card to a built article is linked and one to
 *  an unbuilt slug is not. */
export function articleFeed(): Promise<Feed> {
  return (feed ??= loadFeed());
}

/** generateStaticParams' slugs for one route — its pages and its 308s — with
 *  the one summary line for the build. */
export async function articleSlugs(route: ArticleRoute): Promise<string[]> {
  const { items, listedOnly, pages, redirects, dropped, duplicates } = await articleFeed();
  const base = `${BASE[route]}/`;
  const own = [...pages].filter(([p]) => p.startsWith(base));
  const moves = [...redirects].filter(([p]) => p.startsWith(base));
  const fromFeed = own.filter(([, e]) => e.card && items.includes(e.card)).length;
  const fromLists = own.filter(([, e]) => e.card && listedOnly.has(e.card.slug)).length;
  const fixtureOnly = own.filter(([, e]) => !e.card).length;
  report({
    t: "routes",
    route,
    count: own.length + moves.length,
    fromFeed,
    fromLists,
    fixtureOnly,
    redirects: moves.map(([from, to]) => `${from} → ${to}`),
  });
  console.info(
    `[cms] ${route}: ${own.length} pages — ${fromFeed} from the api feed, ${fromLists} from the list endpoints only, ` +
      `${fixtureOnly} fixture-only · ${moves.length} redirecting${moves.length ? ` (${moves.map(([f, t]) => `${f} → ${t}`).join(", ")})` : ""}` +
      (route === EVENTS_ROUTE && duplicates.length ? ` · same story, no page: ${duplicates.join(", ")}` : "") +
      (route === NEWS_ROUTE ? ` · dropped ${dropped.length} (no path)${dropped.length ? `: ${dropped.join(", ")}` : ""}` : ""),
  );
  return [...own, ...moves].map(([p]) => p.slice(base.length));
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/** The typed `detail` an item document carries, read defensively: `body` on
 *  news, `schedules` + stream/registration links on events, symposium and
 *  milestone dates + an apply link on workshops. Anything malformed is absent. */
function readDetail(api: PublicContentResponse) {
  const d = isObj(api.detail) ? api.detail : {};
  const schedule = Array.isArray(d.schedules) ? d.schedules.filter(isObj) : [];
  const first = schedule[0];
  const links: RailLink[] = [];
  for (const [field, key] of [
    ["applyLink", "apply"],
    ["registrationLink", "register"],
    ["liveStreamLink", "liveStream"],
  ] as const) {
    const url = str(d[field]);
    if (url && /^https?:\/\//.test(url)) links.push({ key, url });
  }
  const known = new Set([
    "contentItemId", "body", "schedules", "liveStreamLink", "registrationLink", "applyLink",
    "symposiumStartDate", "symposiumEndDate",
    "callForProposalOpenDate", "abstractSubmissionDate", "selectionAnnouncementDate",
  ]);
  return {
    body: str(d.body),
    start: str(first?.startDate) ?? str(d.symposiumStartDate),
    end: str(first?.endDate) ?? str(d.symposiumEndDate),
    dateFrom: first?.startDate ? "schedules" : d.symposiumStartDate ? "symposiumStartDate" : undefined,
    scheduleStart: str(first?.startDate),
    scheduleEnd: str(first?.endDate),
    symposiumStart: str(d.symposiumStartDate),
    symposiumEnd: str(d.symposiumEndDate),
    /** A workshop's milestones, in the order the event board's rail lists them. */
    milestones: ([
      ["callForProposals", str(d.callForProposalOpenDate)],
      ["abstractSubmission", str(d.abstractSubmissionDate)],
      ["selectionAnnouncement", str(d.selectionAnnouncementDate)],
    ] as const).filter((m): m is readonly [(typeof m)[0], string] => Boolean(m[1])),
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
      const text = block.text ? richParagraphs(block.text).text : "";
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
  const { body, lists } = joinBlocks(texts);
  if (lists) log.notes.push(`${name}: ${lists} list${lists === 1 ? "" : "s"} from "- " blocks`);
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

type ArticleKey =
  | "date" | "venue" | "liveStream" | "register" | "apply" | "allNews"
  | "callForProposals" | "abstractSubmission" | "selectionAnnouncement" | "symposium";

/** An article or event page: the PageResponse, plus the detail links the rail
 *  draws as buttons (the model has no slot for a page-level link, §33). */
export type ArticleResponse = PageResponse & { railLinks: RailLink[] };

function toArticle(
  api: PublicContentResponse,
  card: CardRef | undefined,
  t: (key: ArticleKey) => string,
  locale: string,
  log: Log,
  route: ArticleRoute,
): ArticleResponse {
  const pageId = `article-${api.slug}`;
  const detail = readDetail(api);

  const title = str(api.title) ?? card?.title ?? api.slug;
  if (str(api.title)) log.api.push("title");

  const keyInfo: LabelValue[] = [];
  const published = api.publishedAt ?? card?.publishedAt ?? null;
  const contacts = api.contacts ?? [];
  if (route === EVENTS_ROUTE) {
    // An event's rail is its own dates: a schedule's date and venue, or a
    // workshop's milestones and symposium. publishedAt is the ANNOUNCEMENT
    // (A2), never an event's date, so no fallback to it: no data, no row.
    // TODO(review): designer — dates carry the year ("8 May 2026"); the event
    // board omits it, but the archive of events reaches back to 2020.
    // TODO(review): content — the Drawing Dialogues and Shifting Paradigms
    // documents have an "Important Dates" section repeating these rows. The CMS
    // owns an article's sections, so it stays (matching it by title is the
    // fragile pattern).
    if (detail.scheduleStart) {
      keyInfo.push({ label: t("date"), value: formatEventDate(detail.scheduleStart, locale, detail.scheduleEnd) });
      log.api.push("date(schedules)");
    }
    if (detail.schedules > 1) log.notes.push(`${detail.schedules} schedules, first used`);
    if (detail.venue) {
      keyInfo.push({ label: t("venue"), value: detail.venue });
      log.api.push("venue(schedules)");
    }
    for (const [key, date] of detail.milestones) keyInfo.push({ label: t(key), value: formatEventDate(date, locale) });
    if (detail.milestones.length) log.api.push(`milestones(${detail.milestones.length})`);
    if (detail.symposiumStart) {
      keyInfo.push({ label: t("symposium"), value: formatEventDate(detail.symposiumStart, locale, detail.symposiumEnd) });
      log.api.push("symposium");
    }
    if (!keyInfo.length) log.absent.push("dates(no schedules or milestones)");
    // The contacts follow the buttons, so they are the page's, not rail rows.
    if (contacts.length) log.api.push(`contacts(${contacts.length})`);
  } else {
    // TODO(review): an event's Date is its schedule's startDate and a workshop's
    // its symposium dates — the date the board draws (22 January 2026 is the
    // Convocation itself). Everything else falls back to publishedAt, which is
    // the ANNOUNCEMENT date and, on several records, a seed timestamp (B4).
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
    // The board draws the contact CTA under the rail's rows.
    keyInfo.push(...contacts.map(({ label, value }) => ({ label, value })));
    if (contacts.length) log.api.push(`contacts(${contacts.length})`);
  }

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
    const body = richParagraphs(detail.body).text;
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

  // The typed detail's links (apply, registration, live stream) are the rail's
  // filled buttons, in that order, and nowhere else (§68). Before events had
  // their own route they were the first section's column-4 links.
  const railLinks = RAIL_LINK_ORDER.flatMap((key) => detail.links.filter((l) => l.key === key));
  if (railLinks.length) log.api.push(`railLinks(${railLinks.map((l) => l.key).join(",")})`);
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
      parent: route === EVENTS_ROUTE ? PAGE_ID.events : PAGE_ID.newsEvents,
      template: "secondary",
      utility: route === EVENTS_ROUTE ? "none" : "back",
      keyInfo,
      hero: heroes,
      ...(intro ? { intro } : {}),
      sections: sections.map((s, i) => ({ ...s, order: i + 1 })),
      contacts: route === EVENTS_ROUTE ? contacts.map(({ label, value }) => ({ label, value })) : [],
      ...(seoTitle ? { seoTitle } : {}),
      ...(seoDescription ? { seoDescription } : {}),
      publishedAt: published,
    },
    derived: { menuTree: [], breadcrumb: [], backNav: null, subPageLinks: [], siblingBand: [] },
    railLinks,
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

/** The page a built URL 308s to, or undefined when the URL is its own page. */
export async function articleRedirect(path: string): Promise<string | undefined> {
  return (await articleFeed()).redirects.get(path);
}

/** One article or event page, by its full path, as the renderer consumes it —
 *  or null for a path neither route builds as a page (unknown, or a 308). */
export const getArticle = cache(async (path: string): Promise<ArticleResponse | null> => {
  const index = await articleFeed();
  const entry = index.pages.get(path);
  if (!entry) return null;
  const { card, fixture, route } = entry;
  const events = route === EVENTS_ROUTE;

  // Only a record the feed or lists carry is asked for: a fixture-only page has
  // no document to fetch, and asking would print a 404 warning on every build.
  const api = card ? await cmsFetch(`/public/content/${card.slug}`, isPublicContentResponse) : null;

  const [locale, t] = await Promise.all([getLocale(), getTranslations("Article")]);
  const log: Log = { api: [], absent: [], notes: [], rejected: [] };

  let response: ArticleResponse;
  let source: string;
  if (api) {
    response = toArticle(api, card, t, locale, log, route);
    source = fixture ? "fixture=replaced" : "fixture=none";
  } else if (fixture) {
    response = { ...fixture.response, railLinks: fixture.railLinks ?? [] };
    source = card ? "fixture (api document unavailable)" : "fixture (no api document)";
  } else {
    // Listed, so a card or row links here, but the document did not arrive
    // (a warning above says why). The card's own fields keep the route from
    // becoming a 404 behind a live link; the next build fills it in.
    response = toArticle(
      { ...card!, hero: [], seo: null, sections: [], contacts: [], navigation: null, heroText: card!.heroText },
      card,
      t,
      locale,
      log,
      route,
    );
    source = "listing card only (api document unavailable)";
  }

  let derived: PageResponse["derived"];
  let next: CardRef | undefined;
  if (events) {
    // No fixed back link and no sibling band: /events has no landing to go
    // back to, so the page uses the session-trail link (BackNav) instead (§68).
    derived = { ...response.derived, backNav: null, siblingBand: [] };
  } else {
    // "More news": one sibling and the listing. A fixture keeps the sibling its
    // board draws; an API article takes the next item in the feed. A same-story
    // duplicate is never a sibling (§68).
    next = api || !fixture ? nextInFeed(index.items.filter((i) => !SAME_STORY[i.slug]), card?.slug ?? entry.slug) : undefined;
    // A fixture's own sibling may name a URL that now redirects; link the
    // canonical path so "More news" costs no extra hop.
    const canonical = (href: string) => index.redirects.get(href) ?? href;
    const sibling = next
      ? [{ id: `article-${next.slug}`, title: next.title, href: itemPath(next.slug, typeOf(next)) }]
      : response.derived.siblingBand.map((s) => ({ ...s, href: canonical(s.href) }));
    const all = { id: PAGE_ID.newsEvents, title: t("allNews"), href: PARENT };
    // A5: a document has no parent, so the back link is the route's own parent,
    // named by its destination — never "Back".
    const backLabel = routeTitle(PARENT) ?? "News & Events";
    derived = {
      ...response.derived,
      backNav: { label: backLabel, href: PARENT },
      siblingBand: [...sibling.filter((s) => s.href !== path), all],
    };
  }

  const gated = gatePage({ ...response, derived });
  if (api || !fixture) {
    const reject = [...new Set(log.rejected)];
    console.info(
      `[cms] ${path}: api=${log.api.join(",") || "none"}` +
        (events ? " · static=none" : ` · static=backNav,${next ? "siblingLink(feed)" : "siblingLink(none)"},allNewsLink`) +
        (log.absent.length ? ` · absent=${log.absent.join(",")}` : "") +
        (reject.length ? ` · media rejected ${log.rejected.length} (${reject.join("; ")})` : "") +
        (log.notes.length ? ` · ${log.notes.join(" · ")}` : "") +
        ` · ${source} · ${auditSummary(gated.audit)}`,
    );
  } else {
    console.info(`[cms] ${path}: ${source} · all slots static · ${auditSummary(gated.audit)}`);
  }
  logMissingRoutes(path, gated.audit);
  return { ...gated.response, railLinks: response.railLinks };
});
