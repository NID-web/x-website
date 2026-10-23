// Resources and its labs (STAGE-0-NOTES §104): the lab list, and the parts of
// their pages that come from it rather than from one document — the landing's
// groups, a lab's band and its Faculty row. getPage calls these; the pages
// themselves still come from getPage, CMS first, like every page.
import { assertFloor } from "@/lib/api/build-mode";
import { cmsFetch } from "@/lib/api/client";
import { isContentItems } from "@/lib/api/types";
import type { PageResponse } from "@/lib/content-model";
import { CMS_FLOORS } from "@/lib/content/cms-floors";
import { FIXTURE_LABS, labPage, resourcesLanding } from "@/lib/content/fixtures/resources";
import { registerBuiltParams } from "@/lib/content/links";
import type { PageMergeConfig } from "@/lib/content/page-adapter";
import { labPageId } from "@/lib/content/pages";
import {
  DEFAULT_LAB_GROUP,
  FACULTY_LABEL,
  LAB_GROUPS,
  LAB_ROUTE,
  REFUSED_LAB_HEROES,
  RESOURCES_PATH,
  WITHHELD_LABS,
  labGroupOf,
  labPath,
  labSlugOf,
  type LabGroup,
} from "@/lib/content/resources";

const LIST = "/public/content-items?contentType=lab_and_facilities&limit=50";

export interface LabListing {
  slug: string;
  title: string;
}

/** The labs that build: the CMS list minus WITHHELD_LABS, in the list's order
 *  (FIXTURE: the fixture's 18). Registered with the route gate, so the
 *  landing's rows and every band link exactly the pages generateStaticParams
 *  makes — every function that gates a lab link awaits this first (getPage). */
let index: Promise<LabListing[]> | undefined;
export function labIndex(): Promise<LabListing[]> {
  return (index ??= (async () => {
    const list = await cmsFetch(LIST, isContentItems);
    const labs = list
      ? list.items.filter((item) => !WITHHELD_LABS.has(item.slug)).map(({ slug, title }) => ({ slug, title }))
      : FIXTURE_LABS.map(({ slug, title }) => ({ slug, title }));
    if (list) assertFloor("labs (lab_and_facilities, after WITHHELD)", CMS_FLOORS.labs, labs.length, LIST);
    registerBuiltParams(LAB_ROUTE, labs.map((lab) => lab.slug));
    return labs;
  })());
}

/** The labs by nid.edu's groups, in its order. A lab no group names goes last
 *  under Other Resources, logged once per build process. */
let logged = false;
function grouped(labs: readonly LabListing[]): Array<{ group: LabGroup; labs: LabListing[] }> {
  const bySlug = new Map(labs.map((lab) => [lab.slug, lab]));
  const named = new Set(LAB_GROUPS.flatMap((g) => g.slugs));
  const unnamed = labs.filter((lab) => !named.has(lab.slug));
  if (!logged) {
    logged = true;
    for (const lab of unnamed) {
      console.info(`[cms] ${RESOURCES_PATH}: ${lab.slug} has no group, listed under ${DEFAULT_LAB_GROUP.title}`);
    }
  }
  return LAB_GROUPS.map((group) => ({
    group,
    labs: [
      ...group.slugs.flatMap((slug) => bySlug.get(slug) ?? []),
      ...(group === DEFAULT_LAB_GROUP ? unnamed : []),
    ],
  }));
}

/** The fixture for a Resources path not in FIXTURES: the landing, built from
 *  the list, or a lab — its fixture copy, or for a lab the CMS added since, an
 *  empty page its document fills. Undefined for any other path, and for a lab
 *  that does not build. */
export async function resourcesFixture(path: string): Promise<PageResponse | undefined> {
  if (path === RESOURCES_PATH) return resourcesLanding(grouped(await labIndex()));
  const slug = labSlugOf(path);
  if (!slug) return undefined;
  const listing = (await labIndex()).find((lab) => lab.slug === slug);
  if (!listing) return undefined;
  const copy = FIXTURE_LABS.find((lab) => lab.slug === slug);
  return labPage(copy ?? { slug, id: slug, title: listing.title, blocks: [], contacts: [], people: [] });
}

/** One rule for every lab document (§104): no standfirst (heroText is an
 *  excerpt of block 1, logged unused), About whole, the named person a
 *  key-info row, the small heroes refused, and the document's contacts and
 *  heroes whole — empty means empty, never the fixture's. TODO(review): when RS4 brings a
 *  real heroText, `intro: "heroText"`, CTL's way (§103). */
export function labConfig(path: string): PageMergeConfig | undefined {
  const slug = labSlugOf(path);
  if (!slug) return undefined;
  return {
    slug,
    intro: "static",
    namedContacts: "nameRow",
    rejectMedia: REFUSED_LAB_HEROES,
    wholeHero: true,
    sections: { "section-lab-about": { textTitle: "About" } },
  };
}

/** A lab's parts from the list: its Faculty row (none for Other Resources)
 *  ahead of the CMS's key info, and its band, the other labs of its group. */
export async function withLabParts(path: string, response: PageResponse): Promise<PageResponse> {
  const slug = labSlugOf(path);
  if (!slug) return response;
  const group = labGroupOf(slug);
  const peers = grouped(await labIndex()).find((g) => g.group === group)?.labs ?? [];
  const siblingBand = peers
    .filter((lab) => lab.slug !== slug)
    .map((lab) => ({ id: labPageId(lab.slug), title: lab.title, href: labPath(lab.slug) }));
  const keyInfo = group.faculty
    ? [{ label: FACULTY_LABEL, value: group.faculty }, ...response.page.keyInfo]
    : response.page.keyInfo;
  return { ...response, page: { ...response.page, keyInfo }, derived: { ...response.derived, siblingBand } };
}
