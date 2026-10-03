// A programme's disciplines, grouped by faculty ONCE, here, at build (the
// archive's rule, STAGE-0-NOTES §66): the page and the card never sort or bucket.
//
// No document lists them. The records come from the list endpoint, and the
// faculty, campuses and seats are only on each record's own `detail`, so every
// record is one request. Both go through cmsFetch, memoised per worker for the
// whole build, so a record is fetched once however many pages read it — and a
// programme reads only its own records.
import type { UUID } from "@/lib/content-model";
import { assertFloor } from "@/lib/api/build-mode";
import { cmsFetch } from "@/lib/api/client";
import { toMediaAsset } from "@/lib/api/media";
import { disciplineDetail, isContentItems, isPublicContentResponse, type CardRef } from "@/lib/api/types";
import { CMS_FLOORS } from "@/lib/content/cms-floors";
import type { DisciplineCard } from "@/lib/content/editorial";
import { PAGE_ID, pageIdOf, pathOfCmsSlug } from "@/lib/content/pages";

export type ProgrammeLevel = "bdes" | "mdes";

const LIST = "/public/content-items?contentType=discipline&limit=50";

// sitemap.json's disciplineSlugPattern, `{discipline-slug}-{bdes|mdes}`: the
// record carries no programme field, and this suffix is the stated contract.
const PROGRAMME_PAGE: Record<ProgrammeLevel, UUID> = {
  bdes: PAGE_ID.programmeBdes,
  mdes: PAGE_ID.programmeMdes,
};

// The Foundation Programme is the common first year every B.Des student takes,
// not a discipline anyone chooses, so it is not a card among the disciplines.
// TODO(review): content — it is a `discipline` record with its own faculty
// ("Foundation Programme", 128 seats); whether the B.Des page mentions it at
// all, and where, is an editorial call.
const EXCLUDED = new Set(["foundation-programme-bdes"]);

export interface DisciplineGroup {
  label: string;
  items: DisciplineCard[];
}

/** Every discipline record in the list, or null when it did not arrive. The
 *  faculty directory reads the same list (getFaculty.ts, §82): one request,
 *  shared through the build cache. */
export async function disciplineList(): Promise<CardRef[] | null> {
  return listAll();
}

async function listAll(): Promise<CardRef[] | null> {
  const bySlug = new Map<string, CardRef>();
  for (let page = 1; ; page++) {
    const res = await cmsFetch(`${LIST}&page=${page}`, isContentItems);
    if (!res) return null;
    for (const item of res.items) bySlug.set(item.slug, item);
    const total = res.pagination?.total ?? res.items.length;
    if (!res.items.length || bySlug.size >= total || page >= (res.pagination?.totalPages ?? page)) break;
  }
  return [...bySlug.values()];
}

/** The programme's disciplines grouped by faculty, faculties and disciplines
 *  alphabetical, or null when the list did not arrive (no CMS). */
export async function programmeDisciplines(
  level: ProgrammeLevel,
): Promise<{ groups: DisciplineGroup[]; notes: string[] } | null> {
  const listed = await listAll();
  if (!listed) return null;
  const notes: string[] = [];
  const mine = listed.filter((item) => item.slug.endsWith(`-${level}`) && !EXCLUDED.has(item.slug));
  const excluded = listed.filter((item) => EXCLUDED.has(item.slug) && item.slug.endsWith(`-${level}`));
  if (excluded.length) notes.push(`excluded ${excluded.map((e) => e.slug).join(",")}`);

  const records = await Promise.all(
    mine.map((item) => cmsFetch(`/public/content/${item.slug}`, isPublicContentResponse)),
  );
  const byFaculty = new Map<string, DisciplineCard[]>();
  const noImage: string[] = [];
  records.forEach((record, i) => {
    const slug = mine[i]!.slug;
    const detail = record ? disciplineDetail(record) : null;
    if (!record || !detail) {
      notes.push(`dropped ${slug} (${record ? "no detail" : "record unavailable"})`);
      return;
    }
    const faculty = detail.faculty?.title.trim();
    const campuses = detail.campuses.flatMap((c) => {
      const path = pathOfCmsSlug(c.slug);
      const id = path ? pageIdOf(path) : undefined;
      return id ? [id] : [];
    });
    if (!faculty || !campuses.length) {
      notes.push(`dropped ${slug} (${faculty ? "no known campus" : "no faculty"})`);
      return;
    }
    const seats = Number(detail.seats);
    const image = toMediaAsset(record.thumbnail);
    if ("rejected" in image) noImage.push(slug);
    const card: DisciplineCard = {
      id: String(record.id),
      name: detail.shortName?.trim() || (record.title ?? mine[i]!.title),
      slug,
      programme: PROGRAMME_PAGE[level],
      campus: campuses[0]!,
      campuses,
      ...(Number.isFinite(seats) && seats > 0 ? { seats } : {}),
      ...("asset" in image ? { image: image.asset } : {}),
    };
    byFaculty.set(faculty, [...(byFaculty.get(faculty) ?? []), card]);
  });
  if (noImage.length) notes.push(`no image ${noImage.join(",")}`);

  // TODO(review): content — the CMS has no order field for faculties or
  // disciplines, so both are alphabetical (the B.Des board's faculty order is
  // too; its disciplines within a faculty are not).
  const groups = [...byFaculty]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, items]) => ({ label, items: items.sort((a, b) => a.name.localeCompare(b.name)) }));
  const count = groups.reduce((n, g) => n + g.items.length, 0);
  assertFloor(`disciplines ${level}`, CMS_FLOORS.disciplines[level], count, LIST);
  return { groups, notes };
}
