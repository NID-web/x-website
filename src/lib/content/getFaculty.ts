// The faculty directory (/people/faculty, four views), grouped ONCE, here, at
// build (§66's rule): the page and the cards never sort or bucket.
//
// No single CMS source has the groupings. The `faculty` document lists the
// people (name, role line, portrait); the person records carry no campus or
// design faculty, and the list endpoint sends no detail at all (§81). The
// DISCIPLINE records do: each names its campus, its design faculty and its
// faculty members. So a person's discipline, campus and design faculty are
// read from the disciplines that list them — data the CMS holds, never a
// hand-made table (STAGE-0-NOTES §82). The discipline list and the programme
// records are the programme pages' own requests, shared through the build cache
// (§71); this adds the faculty document and the Foundation Programme's record.
import { cache } from "react";
import { getTranslations } from "next-intl/server";
import type { Person, Section, UUID } from "@/lib/content-model";
import { assertFloor } from "@/lib/api/build-mode";
import { cmsFetch } from "@/lib/api/client";
import { toMediaAsset } from "@/lib/api/media";
import { disciplineDetail, isPublicContentResponse } from "@/lib/api/types";
import { campusName } from "@/lib/content/campus-names";
import { CMS_FLOORS } from "@/lib/content/cms-floors";
import {
  FACULTY_VIEWS,
  facultyViewPath,
  type FacultyView,
} from "@/lib/content/faculty-views";
import {
  FACULTY_FIXTURE,
  type FacultyDisciplineSource,
  type FacultyPersonSource,
} from "@/lib/content/fixtures/faculty";
import { disciplineList } from "@/lib/content/getDisciplines";
import type { PageData } from "@/lib/content/getPage";
import { PAGE_ID, pageIdOf, pathOfCmsSlug } from "@/lib/content/pages";
import { auditSummary, gatePage, logMissingRoutes } from "@/lib/content/route-gate";

const DOCUMENT = "/public/content/faculty";

/** A group as the rail renders it: the model's `{ label, items }` plus the
 *  discipline view's second line (its campus). Front-end only; still the
 *  model's shape where `groupedItems` is typed. */
export interface FacultyGroup {
  label: string;
  sublabel?: string;
  items: Person[];
}

interface Directory {
  title: string;
  people: Person[];
  disciplines: FacultyDisciplineSource[];
  live: boolean;
  notes: string[];
}

// The site's campus order — the campus pages' and the menu's.
const CAMPUS_ORDER: UUID[] = [PAGE_ID.campusAhmedabad, PAGE_ID.campusGandhinagar, PAGE_ID.campusBengaluru];

/** Sorting only: a leading "Dr"/"Dr." is ignored, never removed from display. */
const sortKey = (name: string) => name.replace(/^dr\.?\s+/i, "").trim();
const byName = (a: Person, b: Person) => sortKey(a.name).localeCompare(sortKey(b.name));

function toPerson(source: FacultyPersonSource): Person {
  return {
    id: source.slug,
    name: source.name,
    slug: source.slug,
    role: "faculty",
    ...(source.role ? { designation: source.role } : {}),
    ...(source.photo ? { photo: source.photo } : {}),
  };
}

/** The people and the disciplines, from the CMS or the fixture. */
async function directory(): Promise<Directory> {
  const notes: string[] = [];
  const doc = await cmsFetch(DOCUMENT, isPublicContentResponse);
  if (!doc) {
    return {
      title: FACULTY_FIXTURE.title,
      people: FACULTY_FIXTURE.people.map(toPerson),
      disciplines: FACULTY_FIXTURE.disciplines,
      live: false,
      notes,
    };
  }

  const list = doc.sections.find((s) => s.type === "STRUCTURED" && s.structuredContentType?.key === "person");
  const items = list?.items ?? [];
  assertFloor("document faculty: sections", CMS_FLOORS.documentSections.faculty ?? 0, doc.sections.length, DOCUMENT);
  assertFloor("document faculty: listed items", CMS_FLOORS.documentItems.faculty ?? 0, items.length, DOCUMENT);
  const noPhoto: string[] = [];
  const people = items.map((item): Person => {
    // The person's name is the portrait's alt when the CMS gives none (§12).
    const photo = toMediaAsset(item.thumbnail, { altFallback: item.title });
    if ("rejected" in photo) noPhoto.push(item.slug);
    return toPerson({
      slug: item.slug,
      name: item.title,
      ...(item.heroText?.trim() ? { role: item.heroText.trim() } : {}),
      ...("asset" in photo ? { photo: photo.asset } : {}),
    });
  });
  if (noPhoto.length) notes.push(`no portrait ${noPhoto.join(",")}`);

  // The programme records (`-bdes`, `-mdes`), the Foundation Programme among
  // them. Two records carry no programme suffix ("digital-game-design",
  // "film-and-video-communication"): they duplicate the suffixed ones, list
  // nobody those don't, and the first contradicts its -mdes record's design
  // faculty — skipped, never fetched. TODO(review): backend.
  const listed = (await disciplineList()) ?? [];
  const programme = listed.filter((i) => /-(bdes|mdes)$/.test(i.slug));
  const skipped = listed.filter((i) => !/-(bdes|mdes)$/.test(i.slug)).map((i) => i.slug);
  if (skipped.length) notes.push(`skipped ${skipped.join(",")} (no programme suffix)`);
  const records = await Promise.all(
    programme.map((i) => cmsFetch(`/public/content/${i.slug}`, isPublicContentResponse)),
  );
  const disciplines: FacultyDisciplineSource[] = [];
  records.forEach((record, i) => {
    const slug = programme[i]!.slug;
    const detail = record ? disciplineDetail(record) : null;
    const campus = detail?.campuses.flatMap((c) => {
      const path = pathOfCmsSlug(c.slug);
      const id = path ? pageIdOf(path) : undefined;
      return id ? [id] : [];
    })[0];
    const faculty = detail?.faculty?.title.trim();
    if (!record || !detail || !campus || !faculty) {
      notes.push(`discipline ${slug} unused (${!record ? "unavailable" : !detail ? "no detail" : !campus ? "no known campus" : "no faculty"})`);
      return;
    }
    disciplines.push({
      slug,
      name: detail.shortName?.trim() || record.title?.trim() || slug,
      campus,
      faculty,
      members: detail.facultyMembers.map((m) => m.slug),
    });
  });
  return { title: doc.title?.trim() || FACULTY_FIXTURE.title, people, disciplines, live: true, notes };
}

interface Grouped {
  title: string;
  people: Person[];
  views: Record<FacultyView, FacultyGroup[]>;
  live: boolean;
}

/** All four views, built once per build. */
let grouped: Promise<Grouped> | undefined;
function facultyDirectory(): Promise<Grouped> {
  return (grouped ??= (async () => {
    const [d, t] = await Promise.all([directory(), getTranslations("Faculty")]);
    const notes = [...d.notes];
    const bySlug = new Map(d.people.map((p) => [p.slug, p]));

    // A discipline is its name at a campus: the B.Des and M.Des records of one
    // discipline list the same people, and merge here.
    const merged = new Map<string, { name: string; campus: UUID; faculty: string; members: Set<string> }>();
    for (const dsc of d.disciplines) {
      const key = `${dsc.name}\u0000${dsc.campus}`;
      const at = merged.get(key);
      if (at && at.faculty !== dsc.faculty) notes.push(`${dsc.slug}: design faculty "${dsc.faculty}", its pair says "${at.faculty}" (kept)`);
      const entry = at ?? { name: dsc.name, campus: dsc.campus, faculty: dsc.faculty, members: new Set<string>() };
      dsc.members.forEach((m) => entry.members.add(m));
      merged.set(key, entry);
    }
    const disciplines = [...merged.values()];

    // People a discipline lists who are not in the faculty list are not shown.
    const outside = [...new Set(disciplines.flatMap((x) => [...x.members]).filter((m) => !bySlug.has(m)))];
    if (outside.length) notes.push(`not in the faculty list, not shown: ${outside.sort().join(",")}`);

    const membersOf = (slugs: Iterable<string>) =>
      [...slugs].flatMap((s) => bySlug.get(s) ?? []).sort(byName);
    const grouped = new Set(disciplines.flatMap((x) => [...x.members]));
    const ungrouped = d.people.filter((p) => !grouped.has(p.slug)).sort(byName);
    for (const p of ungrouped) notes.push(`"Other faculty": ${p.slug} (in no discipline)`);
    const other: FacultyGroup[] = ungrouped.length ? [{ label: t("otherFaculty"), items: ungrouped }] : [];

    const discipline: FacultyGroup[] = disciplines
      .sort((a, b) => a.name.localeCompare(b.name) || CAMPUS_ORDER.indexOf(a.campus) - CAMPUS_ORDER.indexOf(b.campus))
      .map((x) => ({ label: x.name, sublabel: campusName(x.campus), items: membersOf(x.members) }))
      .filter((g) => g.items.length);

    const campus: FacultyGroup[] = CAMPUS_ORDER.map((id) => ({
      label: campusName(id) ?? id,
      items: membersOf(new Set(disciplines.filter((x) => x.campus === id).flatMap((x) => [...x.members]))),
    })).filter((g) => g.items.length);

    const faculties = [...new Set(disciplines.map((x) => x.faculty))].sort((a, b) => a.localeCompare(b));
    const faculty: FacultyGroup[] = faculties
      .map((f) => ({
        label: f,
        items: membersOf(new Set(disciplines.filter((x) => x.faculty === f).flatMap((x) => [...x.members]))),
      }))
      .filter((g) => g.items.length);

    const letters = new Map<string, Person[]>();
    for (const p of [...d.people].sort(byName)) {
      const letter = sortKey(p.name).charAt(0).toUpperCase();
      letters.set(letter, [...(letters.get(letter) ?? []), p]);
    }
    const name: FacultyGroup[] = [...letters].map(([label, items]) => ({ label, items }));

    if (d.live) {
      const count = discipline.reduce((n, g) => n + g.items.length, 0);
      assertFloor("faculty grouped by discipline", CMS_FLOORS.facultyGrouped, new Set(discipline.flatMap((g) => g.items.map((p) => p.slug))).size, DOCUMENT);
      notes.push(`discipline view ${discipline.length} groups / ${count} cards`);
    }
    // Printed once per build process, not once per view.
    console.info(
      `[cms] /people/faculty (directory): ${d.live ? "faculty document + discipline records" : "fixture"} · ${d.people.length} people` +
        (notes.length ? ` · ${notes.join(" · ")}` : ""),
    );
    return {
      title: d.title,
      people: d.people,
      views: {
        discipline: [...discipline, ...other],
        name,
        campus: [...campus, ...other],
        faculty: [...faculty, ...other],
      },
      live: d.live,
    };
  })());
}

/** One view of the directory as a page, gated, its groups beside it. cache():
 *  generateMetadata and the page both call it; one log line per render. */
export const getFaculty = cache(async (view: FacultyView): Promise<PageData> => {
  const [dir, t] = await Promise.all([facultyDirectory(), getTranslations("Faculty")]);
  const spec = FACULTY_VIEWS.find((v) => v.key === view)!;
  const sectionId = `section-faculty-${view}`;
  const groups = dir.views[view];
  const items = [...new Map(groups.flatMap((g) => g.items).map((p) => [p.slug, p])).values()];
  const section: Extract<Section, { type: "rail" }> = {
    id: sectionId,
    page: PAGE_ID.peopleFaculty,
    order: 1,
    type: "rail",
    groupBy: spec.groupBy,
    // The groups are the headings; the page title already says "Faculty".
    title: "",
    items,
    links: [],
    contacts: [],
  };
  const path = facultyViewPath(view);
  const label = t(`views.${view}`);
  const { response, audit } = gatePage({
    page: {
      id: PAGE_ID.peopleFaculty,
      title: dir.title,
      slug: "faculty",
      parent: PAGE_ID.people,
      template: "secondary",
      utility: "filter",
      keyInfo: [],
      hero: [],
      sections: [section],
      contacts: [],
      seoTitle: `${dir.title}: ${label}`,
      publishedAt: "2026-10-03T00:00:00+05:30",
    },
    derived: {
      menuTree: [],
      breadcrumb: [],
      backNav: { label: "People", href: "/people" },
      subPageLinks: [],
      // "Browse faculty by": the other views, then all of People.
      siblingBand: [
        ...FACULTY_VIEWS.filter((v) => v.key !== view).map((v) => ({
          id: `faculty-view-${v.key}`,
          title: t(`views.${v.key}`),
          href: facultyViewPath(v.key),
        })),
        { id: PAGE_ID.people, title: t("allPeople"), href: "/people" },
      ],
    },
  });
  console.info(
    `[cms] ${path}: ${groups.length} groups · ${groups.reduce((n, g) => n + g.items.length, 0)} cards (${items.length} people)` +
      ` · ${auditSummary(audit)}`,
  );
  logMissingRoutes(path, audit);
  return { ...response, groupedItems: { [sectionId]: groups } };
});
