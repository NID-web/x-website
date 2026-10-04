// A discipline page (/programmes/{bdes|mdes}/{discipline}, STAGE-0-NOTES §72):
// one per discipline record the B.Des and M.Des pages list. A collection item,
// so — as for articles (§59) — the RECORD owns the page's structure: there is no
// fixture per page, and a slot the record cannot fill does not render. The one
// fixture, Animation Film Design (B.Des), is the board's demo: the whole page in
// FIXTURE builds, and in LIVE only its Resources section, which no record ties
// to a discipline.
//
// Everything is read through cmsFetch, so through the build cache (§71): the
// discipline list and records are the programme pages' own, and each person and
// work record is one request per build however many pages show it.
import { getTranslations } from "next-intl/server";
import type { LabelValue, MediaAsset, PageResponse, Person, Section, UUID } from "@/lib/content-model";
import { cmsFetch } from "@/lib/api/client";
import { toMediaAsset } from "@/lib/api/media";
import {
  disciplineDetail,
  isPublicContentResponse,
  personDetail,
  studentWorkDetail,
  type CardRef,
} from "@/lib/api/types";
import { campusName } from "@/lib/content/campus-names";
import type { EditorialSection, StudentWorkCard } from "@/lib/content/editorial";
import { joinBlocks, plainText, richParagraphs } from "@/lib/content/format";
import { programmeDisciplines, type ProgrammeLevel } from "@/lib/content/getDisciplines";
import { facultyIndex } from "@/lib/content/getFaculty";
import type { PageData } from "@/lib/content/getPage";
import { PAGE_ID, pageIdOf, pathOf, pathOfCmsSlug } from "@/lib/content/pages";
import { registerBuiltParams } from "@/lib/content/links";
import { auditSummary, gatePage, logMissingRoutes } from "@/lib/content/route-gate";
import { routeTitle } from "@/lib/nav-content";
import { DEMO_DISCIPLINE, DEMO_RESOURCES } from "@/lib/content/fixtures/discipline-afd";
import { PROGRAMME_BDES } from "@/lib/content/fixtures/programme-bdes";

// TODO(review): the live NID site's discipline URLs
// (/academics/programmes/bachelor-of-design-bdes/animation-film-design-bdes, the
// suffix kept) have no redirect here yet.
// TODO(review): backend — no record ties a lab (Resources) or social links to a
// discipline, and works carry no film URL; 4 people have no role line (their
// designation shows) and 2 works have no alt text (dropped).
export const DISCIPLINE_ROUTE = {
  bdes: "/programmes/bdes/[discipline]",
  mdes: "/programmes/mdes/[discipline]",
} as const;

const PROGRAMME_PAGE: Record<ProgrammeLevel, UUID> = { bdes: PAGE_ID.programmeBdes, mdes: PAGE_ID.programmeMdes };

/** The route segment: the CMS slug without its `-bdes` / `-mdes` suffix. */
export const disciplineBase = (slug: string, level: ProgrammeLevel) => slug.replace(new RegExp(`-${level}$`), "");

/** A discipline card's page, for the programme pages' cards and the band. */
export function disciplinePath(slug: string, programme: UUID): string | undefined {
  const level = (Object.keys(PROGRAMME_PAGE) as ProgrammeLevel[]).find((l) => PROGRAMME_PAGE[l] === programme);
  return level ? `${pathOf(programme)}/${disciplineBase(slug, level)}` : undefined;
}

/** What one discipline page is made of, from the CMS or the demo fixture. */
export interface DisciplineSource {
  slug: string;
  title: string;
  faculty?: string;
  seats?: number;
  campuses: UUID[];
  hero: MediaAsset[];
  /** Every paragraph of the record's "About" section. */
  overview?: string;
  people: Person[];
  resources?: { subtitle: string; body: string; image?: MediaAsset };
  studentWork: { prose?: string; works: StudentWorkCard[] };
  seoTitle?: string;
  seoDescription?: string;
}

type Card = { slug: string; name: string };

/** Each programme's disciplines in the programme page's card order (faculty,
 *  then name). LIVE: the records; without the CMS, the demo alone, under the
 *  B.Des fixture's card order. Registered with the route gate, so a card or a
 *  band link reaches exactly the pages generateStaticParams builds. */
const index = new Map<ProgrammeLevel, Promise<Card[]>>();
export function disciplineIndex(level: ProgrammeLevel): Promise<Card[]> {
  let pending = index.get(level);
  if (!pending) {
    pending = (async () => {
      const live = await programmeDisciplines(level);
      const cards: Card[] = live
        ? live.groups.flatMap((g) => g.items.map((i) => ({ slug: i.slug, name: i.name })))
        : level === "bdes"
          ? fixtureCards().filter((c) => c.slug === DEMO_DISCIPLINE.slug)
          : [];
      registerBuiltParams(DISCIPLINE_ROUTE[level], cards.map((c) => disciplineBase(c.slug, level)));
      return cards;
    })();
    index.set(level, pending);
  }
  return pending;
}

/** The B.Des fixture's cards, in its board order: the demo's band without the CMS. */
function fixtureCards(): Card[] {
  const groups = (PROGRAMME_BDES.groupedItems?.["section-bdes-disciplines"] ?? []) as Array<{
    items: Array<{ slug: string; name: string }>;
  }>;
  return groups.flatMap((g) => g.items.map((i) => ({ slug: i.slug, name: i.name })));
}

export async function disciplineSlugs(level: ProgrammeLevel): Promise<string[]> {
  return (await disciplineIndex(level)).map((c) => disciplineBase(c.slug, level));
}

const textOf = (card: CardRef) => card.heroText?.trim() || undefined;

/** The role above a person's name: the card's role line with exactly
 *  ", {this discipline's title}" removed from its end; the whole line when it
 *  does not end so; the record's designation when there is no line. Nothing
 *  else is parsed. */
function overline(card: CardRef, title: string, designation: string | null): string | undefined {
  const line = textOf(card);
  if (!line) return designation?.trim() || undefined;
  const suffix = `, ${title}`;
  return line.endsWith(suffix) ? line.slice(0, -suffix.length) : line;
}

/** The record as a source, or null if it did not arrive. */
async function fromCms(slug: string, log: string[]): Promise<DisciplineSource | null> {
  const record = await cmsFetch(`/public/content/${slug}`, isPublicContentResponse);
  const detail = record ? disciplineDetail(record) : null;
  if (!record || !detail) return null;
  const title = detail.shortName?.trim() || record.title?.trim() || slug;

  const about = record.sections.find(
    (s) => s.type === "SPECIFIC" && ["about", "overview"].includes((s.title ?? "").trim().toLowerCase()),
  );
  const paragraphs = [...(about?.blocks ?? [])]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .flatMap((b) => (b.blockType === "TEXT" && b.text?.trim() ? [richParagraphs(b.text).text] : []));
  const overview = joinBlocks(paragraphs.filter(Boolean)).body || undefined;

  const [people, works] = await Promise.all([
    Promise.all(
      detail.facultyMembers.map(async (card): Promise<Person> => {
        const person = await cmsFetch(`/public/content/${card.slug}`, isPublicContentResponse);
        const pd = person ? personDetail(person) : null;
        const photo = toMediaAsset(card.thumbnail, { altFallback: card.title });
        const role = overline(card, title, pd?.designation ?? null);
        return {
          id: String(card.id),
          name: card.title,
          slug: card.slug,
          role: "faculty",
          ...(role ? { designation: role } : {}),
          ...("asset" in photo ? { photo: photo.asset } : {}),
          ...(pd?.email?.trim() ? { email: pd.email.trim() } : {}),
        };
      }),
    ),
    Promise.all(
      detail.studentWorks.map(async (card): Promise<StudentWorkCard | null> => {
        const image = toMediaAsset(card.thumbnail);
        // The alt-text rule: a work whose image has none is not shown.
        if ("rejected" in image) {
          log.push(`work ${card.slug} dropped (${image.rejected})`);
          return null;
        }
        const work = await cmsFetch(`/public/content/${card.slug}`, isPublicContentResponse);
        const student = work ? studentWorkDetail(work)?.studentName?.trim() : undefined;
        return { id: String(card.id), title: card.title, ...(student ? { student } : {}), image: image.asset, work: true };
      }),
    ),
  ]);
  const shown = works.filter((w): w is StudentWorkCard => w !== null);
  // The record's description belongs to the feature: the first work.
  const description = detail.studentWorkDescription?.trim();
  if (description && shown[0]) shown[0] = { ...shown[0], description: plainText(description).text };

  const hero = record.hero.flatMap((ref) => {
    const media = toMediaAsset(ref);
    return "asset" in media ? [media.asset] : [];
  });
  // As getDisciplines.ts: the campus's route from the stated slug table.
  const campuses = detail.campuses.flatMap((c) => {
    const path = pathOfCmsSlug(c.slug);
    const id = path ? pageIdOf(path) : undefined;
    return id ? [id] : [];
  });
  const seats = Number(detail.seats);
  return {
    slug,
    title,
    ...(detail.faculty?.title ? { faculty: detail.faculty.title } : {}),
    ...(Number.isFinite(seats) && seats > 0 ? { seats } : {}),
    campuses,
    hero,
    ...(overview ? { overview } : {}),
    people,
    studentWork: { works: shown },
    ...(record.seo?.metaTitle ? { seoTitle: record.seo.metaTitle } : {}),
    ...(record.seo?.metaDescription ? { seoDescription: record.seo.metaDescription } : {}),
  };
}

/** A discipline page, or null when it is not one this build makes. */
export async function getDiscipline(level: ProgrammeLevel, base: string): Promise<PageData | null> {
  // The faculty index registers the member pages, so the Faculty rail's cards
  // link exactly those that build (§83).
  const [cards] = await Promise.all([disciplineIndex(level), facultyIndex()]);
  const card = cards.find((c) => disciplineBase(c.slug, level) === base);
  if (!card) return null;
  const log: string[] = [];
  const live = await fromCms(card.slug, log);
  const isDemo = card.slug === DEMO_DISCIPLINE.slug;
  // LIVE: the record; the demo adds the board's Resources, which nothing in the
  // CMS ties to a discipline. Without the CMS: the demo fixture, whole.
  // TODO(review): the demo's Resources is a fixture supplement on this one page
  // in LIVE — never a template for the other 26.
  const source: DisciplineSource | null = live
    ? isDemo
      ? { ...live, resources: DEMO_RESOURCES }
      : live
    : isDemo
      ? DEMO_DISCIPLINE
      : null;
  if (!source) return null;

  const [tKey, tSection] = await Promise.all([getTranslations("KeyInfo"), getTranslations("Discipline")]);
  const programmePath = pathOf(PROGRAMME_PAGE[level])!;
  const keyInfo: LabelValue[] = [
    ...(source.faculty ? [{ label: tKey("faculty"), value: source.faculty }] : []),
    { label: tKey("programme"), value: tSection(`programme.${level}`) },
    ...(source.seats ? [{ label: tKey("seats"), value: String(source.seats) }] : []),
    ...(source.campuses.length
      ? [{ label: tKey("campus"), value: source.campuses.flatMap((id) => campusName(id) ?? []).join(", ") }]
      : []),
  ].filter((row) => row.value);

  const pageId = `discipline-${source.slug}`;
  const sections: EditorialSection[] = [];
  if (source.people.length) {
    sections.push({
      id: "section-discipline-faculty",
      page: pageId,
      order: 1,
      type: "rail",
      groupBy: "none",
      title: tSection("faculty"),
      items: source.people,
      links: [],
      contacts: [],
    });
  }
  if (source.resources) {
    sections.push({
      id: "section-discipline-resources",
      page: pageId,
      order: 2,
      type: "text",
      title: tSection("resources"),
      subtitle: source.resources.subtitle,
      body: source.resources.body,
      ...(source.resources.image ? { image: source.resources.image } : {}),
      items: [],
      links: [],
      contacts: [],
    });
  }
  if (source.studentWork.works.length || source.studentWork.prose) {
    sections.push({
      id: "section-discipline-student-work",
      page: pageId,
      order: 3,
      type: "cards",
      title: tSection("studentWork"),
      ...(source.studentWork.prose ? { body: source.studentWork.prose } : {}),
      // StudentWorkCard rides in the cards union as AwardEntry does (editorial.ts).
      items: source.studentWork.works as unknown as Extract<Section, { type: "cards" }>["items"],
      links: [],
      contacts: [],
    });
  }

  const response: PageResponse = {
    page: {
      id: pageId,
      title: source.title,
      slug: disciplineBase(source.slug, level),
      parent: PROGRAMME_PAGE[level],
      template: "secondary",
      utility: "back",
      keyInfo,
      hero: source.hero,
      ...(source.overview ? { intro: source.overview } : {}),
      sections,
      contacts: [],
      seoTitle: source.seoTitle ?? source.title,
      ...(source.seoDescription ? { seoDescription: source.seoDescription } : {}),
      publishedAt: "2026-10-01T00:00:00+05:30",
    },
    derived: {
      menuTree: [],
      breadcrumb: [],
      // The band's parent ("More in Bachelor of Design"), named as the menu
      // and the back link name the programme page.
      backNav: { label: routeTitle(programmePath) ?? programmePath, href: programmePath },
      subPageLinks: [],
      // The programme's other disciplines in its card order; the gate withholds
      // any whose page did not build.
      siblingBand: cards
        .filter((c) => c.slug !== source.slug)
        .map((c) => ({ id: c.slug, title: c.name, href: `${programmePath}/${disciplineBase(c.slug, level)}` })),
    },
  };
  const { response: gated, audit } = gatePage(response);
  const path = `${programmePath}/${base}`;
  console.info(
    `[cms] ${path}: ${live ? "record" : "fixture"}${live && isDemo ? " + demo Resources" : ""} · ` +
      `rail ${keyInfo.length} · faculty ${source.people.length} · works ${source.studentWork.works.length}` +
      (log.length ? ` · ${log.join(" · ")}` : "") +
      ` · ${auditSummary(audit)}`,
  );
  logMissingRoutes(path, audit);
  return gated;
}
