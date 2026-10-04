// /about/news-events/archive — every listed news, event and workshop item, by
// year, newest first. The CMS has no archive document (404 for `archive` and
// `news-events-archive`, 28 Sep 2026), so the rows come from the three list
// endpoints (listedItems in getArticle.ts), and without the CMS from the
// board's fixture.
//
// TODO(review): backend — content-model.ts says grouped data ARRIVES grouped
// (PageResponse.groupedItems) and the client never buckets a flat list. With no
// archive document, this file is the one place the list is grouped: once, at
// build time, into exactly that shape, so the page renders backend-grouped data
// the day it exists with no component change. The ask: an archive document
// whose section is DYNAMIC with a year grouping (GroupBy has no "year"; "month"
// is the mosaic's), or a grouped endpoint.
import type { Link, Page, PageResponse } from "@/lib/content-model";
import { assertFloor, report } from "@/lib/api/build-mode";
import { mediaExists, toMediaAsset } from "@/lib/api/media";
import type { CardRef } from "@/lib/api/types";
import { CMS_FLOORS } from "@/lib/content/cms-floors";
import { yearInIndia } from "@/lib/content/format";
import { LISTED_TYPES, articleFeed, listedItems } from "@/lib/content/getArticle";
import { cardHref } from "@/lib/content/links";
import { PAGE_ID, SAME_STORY, itemPath, pathOf } from "@/lib/content/pages";
import { auditSummary, gatePage, logMissingRoutes } from "@/lib/content/route-gate";
import { ARCHIVE_SECTION, NEWS_ARCHIVE } from "@/lib/content/fixtures/news-archive";
import { NEWS_EVENTS } from "@/lib/content/fixtures/news-events";
import { ABOUT_BAND_PARENT, aboutChildrenBand } from "@/lib/content/sibling-bands";
import { routeTitle } from "@/lib/nav-content";
import { normalise } from "@/lib/nav-trail";

export { ARCHIVE_SECTION };

export type ArchiveGroup = { label: string; items: Page[] };
// Omit + restate: an intersection with PageResponse's own `unknown[]` items
// would leave the rows `unknown` to the page.
export type ArchiveResponse = Omit<PageResponse, "groupedItems"> & {
  groupedItems: Record<string, ArchiveGroup[]>;
  /** The band is "More in About NID": the archive's band is its parent's
   *  siblings, so it is named for the parent's parent. */
  siblingBandParent: string;
};

const PATH = pathOf(PAGE_ID.newsArchive)!;
const PARENT = normalise(pathOf(PAGE_ID.newsEvents)!);
/** The listing's Archive row, whose year links are this page's years. */
const LISTING_ARCHIVE_SECTION = "section-news-archive";

const segmentOf = (item: CardRef) => itemPath(item.slug).replace(/^.*\//, "");

function toRow(item: CardRef & { publishedAt: string }): { row: Page; thumb: "ok" | "none" | string } {
  // Decorative, as Home's news rows: the headline sits beside the photo inside
  // the same link, so alt text would read the headline twice. A row thumbnail is
  // not content the way an article hero is (getArticle keeps heroes strict).
  const media = toMediaAsset(item.thumbnail, { decorative: true });
  return {
    row: {
      id: `archive-${item.id}`,
      title: item.title,
      // The row opens the item's page, news or event, under
      // /about/news-events (itemPath, §85). The slug is that page's segment.
      slug: segmentOf(item),
      parent: PAGE_ID.newsEvents,
      template: "secondary",
      utility: "back",
      keyInfo: [],
      hero: "asset" in media ? [media.asset] : [],
      sections: [],
      contacts: [],
      publishedAt: item.publishedAt,
    },
    thumb: "asset" in media ? "ok" : item.thumbnail ? media.rejected : "none",
  };
}

/** THE grouping: newest year first, newest item first within it. A stable sort,
 *  so items stamped the same instant keep the list endpoints' order. */
function groupByYear(rows: Page[]): ArchiveGroup[] {
  const time = (p: Page) => Date.parse(p.publishedAt!);
  const groups = new Map<string, Page[]>();
  for (const row of [...rows].sort((a, b) => time(b) - time(a))) {
    const year = yearInIndia(row.publishedAt!);
    groups.set(year, [...(groups.get(year) ?? []), row]);
  }
  return [...groups].map(([label, items]) => ({ label, items }));
}

// TODO(review): the date and the year are publishedAt for every type, as on the
// listing's cards — for an event that is the ANNOUNCEMENT, not the event (A2),
// and several records carry a seed timestamp (B4), which piles them into 2026.
// TODO(review): designer — every item is listed, including those the listing
// page already shows (the board's 2026 repeats two). Should the archive leave
// them out?
async function loadArchive(): Promise<ArchiveResponse> {
  const [feed, listed] = await Promise.all([articleFeed(), listedItems()]);
  const live = listed.ok;

  const noDate: string[] = [];
  /** A row's CMS record; a fixture row is its own (its slug). */
  const recordOf = new Map<Page, string>();
  const thumbs = { rejected: [] as string[], none: 0 };
  let groups: ArchiveGroup[];
  if (live) {
    const rows: Page[] = [];
    for (const item of listed.items) {
      // Never "1970": an undated item has no year to sit under.
      if (!item.publishedAt || Number.isNaN(Date.parse(item.publishedAt))) {
        noDate.push(item.slug);
        continue;
      }
      const { row, thumb } = toRow({ ...item, publishedAt: item.publishedAt });
      recordOf.set(row, item.slug);
      if (thumb === "none") thumbs.none++;
      else if (thumb !== "ok") thumbs.rejected.push(`${item.slug}: ${thumb}`);
      rows.push(row);
    }
    groups = groupByYear(rows);
  } else {
    groups = NEWS_ARCHIVE.groupedItems[ARCHIVE_SECTION] ?? [];
  }

  // No dead links and no dead rows: a row is kept only when the page it opens
  // is built — and is ITS page. A slug the article route refused can still
  // resolve to a built page (an item slugged "archive" would link here), and a
  // same-story duplicate resolves to its canonical record's page, which that
  // record's own row already opens: one story, one row (§68).
  const noPage: string[] = [];
  const duplicate: string[] = [];
  groups = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => {
        const record = recordOf.get(item) ?? item.slug;
        const path = cardHref(item);
        const page = path ? feed.pages.get(path) : undefined;
        if (page && page.slug !== record && SAME_STORY[record]) duplicate.push(record);
        else if (!page || page.slug !== record) noPage.push(record);
        return Boolean(page && page.slug === record);
      }),
    }))
    // CLAUDE.md: no empty section — a year with nothing left has no heading.
    .filter((g) => g.items.length > 0);

  // A thumbnail whose file does not serve is absent, so the row draws its
  // placeholder square, not a broken image. Only surviving rows are asked, and
  // only CMS files: one HEAD each per build (media.ts).
  const missing: string[] = [];
  groups = await Promise.all(
    groups.map(async (g) => ({
      ...g,
      items: await Promise.all(
        g.items.map(async (item) => {
          const thumb = item.hero[0];
          if (!thumb || (await mediaExists(thumb))) return item;
          missing.push(item.slug);
          return { ...item, hero: [] };
        }),
      ),
    })),
  );

  const rows = groups.flatMap((g) => g.items);
  if (live) {
    assertFloor("archive rows (listed items with an article)", CMS_FLOORS.archiveItems, rows.length, "/public/content-items");
  }

  const fixture = NEWS_ARCHIVE;
  const response: PageResponse = {
    page: {
      ...fixture.page,
      sections: fixture.page.sections.map((s) =>
        s.id === ARCHIVE_SECTION && s.type === "cards" ? { ...s, items: rows } : s,
      ),
    },
    derived: {
      ...fixture.derived,
      // The route's parent, named by its destination, as on the article page.
      // TODO(review): designer — the board labels it "Back to Latest"; CLAUDE.md
      // says a back link names its destination, which is News & Events.
      backNav: { label: routeTitle(PARENT) ?? NEWS_EVENTS.page.title, href: PARENT },
      // About's children, shared with the gallery (sibling-bands.ts).
      siblingBand: aboutChildrenBand(),
    },
  };
  const gated = gatePage(response);

  const reject = thumbs.rejected.length ? `, thumb rejected ${thumbs.rejected.length} (${thumbs.rejected.join("; ")})` : "";
  console.info(
    `[cms] ${PATH}: ` +
      (live
        ? `api=items(${LISTED_TYPES.map((t) => `${t} ${listed.served[t]}`).join(", ")})`
        : "api=none") +
      ` · years=${groups.map((g) => `${g.label}(${g.items.length})`).join(",") || "none"}` +
      ` · dropped: ${live ? `calendar ${listed.calendar}, ` : ""}no article page ${noPage.length}, same story ${duplicate.length}${duplicate.length ? ` (${duplicate.join(", ")})` : ""}, no publishedAt ${noDate.length}` +
      (noDate.length ? ` (${noDate.join(", ")})` : "") +
      (live ? ` · thumb none ${thumbs.none}, thumb missing ${missing.length}${reject}` : "") +
      ` · static=title,backNav,siblingBand · fixture=${live ? "none" : "all rows"}` +
      ` · ${auditSummary(gated.audit)}`,
  );
  report({ t: "archive", rows: rows.length, years: groups.map((g) => g.label), noPage: noPage.length, noDate: noDate.length, live });
  logMissingRoutes(PATH, gated.audit);

  return {
    ...gated.response,
    groupedItems: { [ARCHIVE_SECTION]: groups },
    siblingBandParent: ABOUT_BAND_PARENT,
  };
}

// Memoised per process, like the article feed: the archive page and the
// listing's Archive row both need it, and it reads only build-time data.
let archive: Promise<ArchiveResponse> | undefined;

export function getArchive(): Promise<ArchiveResponse> {
  return (archive ??= loadArchive());
}

// TODO(review): designer — "Older" opens the whole archive. Should it be its
// own group, or a year range?
/** The listing's Archive row with a link to each archive year below the newest
 *  one in the data, then its authored "Older". The newest year is skipped by
 *  the DATA, not the clock, so a build on 1 January renders what 31 December
 *  did. With no older year (the fixture today) only "Older" remains. */
export async function withArchiveYears(response: PageResponse): Promise<PageResponse> {
  const groups = (await getArchive()).groupedItems[ARCHIVE_SECTION] ?? [];
  const years: Link[] = groups.slice(1).map((g) => ({
    id: `link-news-${g.label}`,
    label: g.label,
    targetType: "page",
    page: `${PAGE_ID.newsArchive}#${g.label}`,
  }));
  const sections = response.page.sections.map((s) =>
    s.id === LISTING_ARCHIVE_SECTION && s.type === "links" ? { ...s, items: [...years, ...s.items] } : s,
  );
  return { ...response, page: { ...response.page, sections } };
}
