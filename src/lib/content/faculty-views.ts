// The faculty directory's views: one Person collection grouped four ways
// (sitemap.json's note), each its own static URL. sitemap.json gives them as
// /people/faculty?by=…, but a query string can only select a view at request
// time (`searchParams` makes a page dynamic), so each is a path: the default at
// /people/faculty, the others under /people/faculty/by/ — leaving
// /people/faculty/[slug] free for the member template (STAGE-0-NOTES §82).
//
// It imports nothing, so links.ts registers the built views at module load, as
// it does the research centres (§79).
import type { GroupBy } from "@/lib/content-model";

export const FACULTY_VIEWS = [
  { key: "discipline", groupBy: "department" },
  { key: "name", groupBy: "letter" },
  { key: "campus", groupBy: "campus" },
  { key: "faculty", groupBy: "faculty" },
] as const satisfies ReadonlyArray<{ key: string; groupBy: GroupBy }>;

export type FacultyView = (typeof FACULTY_VIEWS)[number]["key"];

/** The view /people/faculty itself shows. */
export const DEFAULT_FACULTY_VIEW: FacultyView = "discipline";

export const facultyViewPath = (view: FacultyView) =>
  view === DEFAULT_FACULTY_VIEW ? "/people/faculty" : `/people/faculty/by/${view}`;

/** A faculty member's page (§83): which slugs build is the CMS's faculty list,
 *  registered by getFaculty.ts's facultyIndex. */
export const facultyMemberPath = (slug: string) => `/people/faculty/${slug}`;

/** The `[view]` values /people/faculty/by/[view] builds. */
export const FACULTY_VIEW_PARAMS: string[] = FACULTY_VIEWS.map((v) => v.key).filter(
  (key) => key !== DEFAULT_FACULTY_VIEW,
);
