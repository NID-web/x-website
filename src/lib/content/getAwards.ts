// /about/student-awards — the award records, and the one place they are read:
// the gallery renders all of them and About's Student Awards section the two it
// features, so both show the same record (fixtures/student-awards.ts).
//
// The CMS's `student-awards` document has one CURATED section, "All Awards",
// listing the eight in the board's order. A list item carries only the project
// (title) and the detail (heroText); the award's name and the student are on the
// record's own `detail`, one document per row. Those fetches are cmsFetch's, so
// they are made once per build whichever page asks first.
//
// Content is the backend's; the fixture fills only what it does not serve, per
// field and per recipient (the §64 merge rule). Known limitation: a record has
// no destination page (no award route in sitemap.json), so rows do not link.
// Known limitation: `awardYear` is null on every record, so there is one group,
// not one per year.
import type { MediaAsset, PageResponse } from "@/lib/content-model";
import { assertFloor, report } from "@/lib/api/build-mode";
import { cmsFetch } from "@/lib/api/client";
import { mediaExists, toMediaAsset } from "@/lib/api/media";
import { awardDetail, isPublicContentResponse, type CardRef } from "@/lib/api/types";
import { CMS_FLOORS } from "@/lib/content/cms-floors";
import type { AwardEntry } from "@/lib/content/editorial";
import { plainText } from "@/lib/content/format";
import { PAGE_ID, pathOf } from "@/lib/content/pages";
import { auditSummary, gatePage, logMissingRoutes } from "@/lib/content/route-gate";
import { ABOUT_BAND_PARENT, aboutChildrenBand } from "@/lib/content/sibling-bands";
import { AWARD_ENTRIES, AWARDS_SECTION, STUDENT_AWARDS } from "@/lib/content/fixtures/student-awards";
import { routeTitle } from "@/lib/nav-content";

export { AWARDS_SECTION };

export type AwardGroup = { label: string; items: AwardEntry[] };
export type AwardsResponse = Omit<PageResponse, "groupedItems"> & {
  groupedItems: Record<string, AwardGroup[]>;
  siblingBandParent: string;
};

const PATH = pathOf(PAGE_ID.studentAwards)!;
const ABOUT = pathOf(PAGE_ID.about)!;
const DOC = "student-awards";
const ABOUT_AWARDS_SECTION = "section-about-student-awards";

interface Log {
  fromFixture: string[];
  dropped: string[];
  standIn: number;
  rejected: string[];
  missing: number;
  portraitFromFixture: number;
}

/** Portrait ids used by more than one DIFFERENT recipient: the CMS's stand-in
 *  for "no photo yet" (all eight recipients share one today). Derived from the
 *  data, never the filename. One person winning twice with one photo is not a
 *  stand-in. */
function standIns(recipients: Array<CardRef | null>): Set<string> {
  const slugsById = new Map<string, Set<string>>();
  for (const r of recipients) {
    if (!r?.thumbnail) continue;
    const slugs = slugsById.get(r.thumbnail.id) ?? new Set<string>();
    slugs.add(r.slug);
    slugsById.set(r.thumbnail.id, slugs);
  }
  return new Set([...slugsById].filter(([, slugs]) => slugs.size > 1).map(([id]) => id));
}

async function portraitOf(recipient: CardRef, stand: Set<string>, log: Log): Promise<MediaAsset | undefined> {
  const thumb = recipient.thumbnail;
  if (!thumb) return undefined;
  if (stand.has(thumb.id)) {
    log.standIn++;
    return undefined;
  }
  // Not decorative here: About draws the same portrait as a picture with alt
  // text; the gallery row sets its own alt="" beside the name.
  const media = toMediaAsset(thumb);
  if ("rejected" in media) {
    log.rejected.push(`${recipient.slug}: ${media.rejected}`);
    return undefined;
  }
  if (!(await mediaExists(media.asset))) {
    log.missing++;
    return undefined;
  }
  return media.asset;
}

async function liveRows(items: CardRef[], log: Log): Promise<AwardEntry[]> {
  const records = await Promise.all(
    items.map((item) => cmsFetch(`/public/content/${item.slug}`, isPublicContentResponse)),
  );
  const details = records.map((r) => (r ? awardDetail(r) : null));
  const stand = standIns(details.map((d) => d?.recipient ?? null));

  const rows: AwardEntry[] = [];
  for (const [i, item] of items.entries()) {
    const record = records[i];
    const detail = details[i];
    const recipient = detail?.recipient ?? null;
    if (!recipient) {
      log.dropped.push(`${item.slug} (no recipient)`);
      continue;
    }
    const fixture = AWARD_ENTRIES.find((a) => a.slug === recipient.slug);
    const fill = <T,>(field: string, api: T | null | undefined, own: T | undefined): T | undefined => {
      if (api !== null && api !== undefined && api !== "") return api;
      if (own !== undefined) log.fromFixture.push(`${recipient.slug}.${field}`);
      return own;
    };
    const name = fill("name", recipient.title?.trim(), fixture?.title);
    const award = fill("award", detail?.awardName?.trim(), fixture?.award);
    const project = fill("project", (record?.title ?? item.title)?.trim(), fixture?.project);
    const intro = fill("detail", item.heroText ? plainText(item.heroText).text : undefined, fixture?.intro);
    if (!name || !award || !project) {
      log.dropped.push(`${item.slug} (no ${!name ? "name" : !award ? "award" : "project"})`);
      continue;
    }
    let portrait = await portraitOf(recipient, stand, log);
    if (!portrait && fixture?.hero[0]) {
      portrait = fixture.hero[0];
      log.portraitFromFixture++;
    }
    rows.push({
      id: `award-${item.id}`,
      title: name,
      slug: recipient.slug,
      parent: PAGE_ID.studentAwards,
      template: "secondary",
      utility: "back",
      keyInfo: [],
      hero: portrait ? [portrait] : [],
      ...(intro ? { intro } : {}),
      sections: [],
      contacts: [],
      publishedAt: item.publishedAt,
      award,
      project,
    });
  }
  return rows;
}

async function loadAwards(): Promise<AwardsResponse> {
  const fixture = STUDENT_AWARDS;
  const doc = await cmsFetch(`/public/content/${DOC}`, isPublicContentResponse);
  const log: Log = { fromFixture: [], dropped: [], standIn: 0, rejected: [], missing: 0, portraitFromFixture: 0 };

  let groups: AwardGroup[];
  let apiLine = "api=none";
  if (doc) {
    const source = `/public/content/${DOC}`;
    assertFloor(`document ${DOC}: sections`, CMS_FLOORS.documentSections[DOC] ?? 0, doc.sections.length, source);
    const section = doc.sections.find(
      (s) => s.type === "STRUCTURED" && s.structuredContentType?.key === "student_award",
    );
    const items = section?.items ?? [];
    const rows = await liveRows(items, log);
    assertFloor("student-awards rows (records with a recipient)", CMS_FLOORS.awardItems, rows.length, source);
    groups = rows.length ? [{ label: section?.title?.trim() || "All Awards", items: rows }] : [];
    apiLine = `api=title,seo,section "${section?.title ?? "none"}"(${items.length}),records(${rows.length})`;
  } else {
    groups = fixture.groupedItems[AWARDS_SECTION] ?? [];
  }

  const rows = groups.flatMap((g) => g.items);
  const response: PageResponse = {
    page: {
      ...fixture.page,
      title: doc?.title?.trim() || fixture.page.title,
      ...(doc?.seo?.metaTitle ? { seoTitle: doc.seo.metaTitle } : {}),
      seoDescription: doc?.seo?.metaDescription ?? fixture.page.seoDescription,
      sections: fixture.page.sections.map((s) =>
        s.id === AWARDS_SECTION && s.type === "cards" ? { ...s, items: rows } : s,
      ),
    },
    derived: {
      ...fixture.derived,
      backNav: { label: routeTitle(ABOUT) ?? "About NID", href: ABOUT },
      siblingBand: aboutChildrenBand(),
    },
  };
  const gated = gatePage(response);

  console.info(
    `[cms] ${PATH}: ${apiLine}` +
      ` · rows ${rows.length}` +
      (doc
        ? ` · portrait stand-in ${log.standIn}, portrait missing ${log.missing}, portrait from fixture ${log.portraitFromFixture}` +
          (log.rejected.length ? `, portrait rejected ${log.rejected.length} (${log.rejected.join("; ")})` : "") +
          ` · from fixture ${log.fromFixture.length}${log.fromFixture.length ? ` (${log.fromFixture.join(", ")})` : ""}` +
          ` · dropped ${log.dropped.length}${log.dropped.length ? ` (${log.dropped.join(", ")})` : ""}`
        : "") +
      ` · static=backNav,siblingBand · fixture=${doc ? "per-field fallback" : "all rows"}` +
      ` · no row links (no award route) · ${auditSummary(gated.audit)}`,
  );
  report({ t: "awards", rows: rows.length, live: Boolean(doc), standIn: log.standIn, fromFixture: log.fromFixture.length });
  logMissingRoutes(PATH, gated.audit);

  return {
    ...gated.response,
    groupedItems: { [AWARDS_SECTION]: groups },
    siblingBandParent: ABOUT_BAND_PARENT,
  };
}

// Memoised per process, like the archive: the gallery and About both read it.
let awards: Promise<AwardsResponse> | undefined;

export function getAwards(): Promise<AwardsResponse> {
  return (awards ??= loadAwards());
}

/** About's Student Awards section: its own selection (which students), the
 *  gallery's records (who they are). A featured slug with no record keeps the
 *  fixture item it has. */
export async function withAwardRecords(response: PageResponse): Promise<PageResponse> {
  const rows = ((await getAwards()).groupedItems[AWARDS_SECTION] ?? []).flatMap((g) => g.items);
  const sections = response.page.sections.map((s) =>
    s.id === ABOUT_AWARDS_SECTION && s.type === "cards"
      ? { ...s, items: s.items.map((item) => ("slug" in item && rows.find((r) => r.slug === item.slug)) || item) }
      : s,
  );
  return { ...response, page: { ...response.page, sections } };
}
