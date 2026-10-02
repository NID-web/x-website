// Research & Publications' children: the one list the landing's rail, every
// centre's band, the route gate and /research/[slug]'s generateStaticParams
// read (STAGE-0-NOTES §79). It imports nothing, so links.ts can register the
// built centres at module load — before any page gates a link, whatever page
// that is (the landing, a campus page, an article) — without importing a
// fixture.

/** sitemap.json's eight children, in its order, by its names. */
export const RESEARCH_CHILDREN = [
  { slug: "natural-fiber", title: "Innovation Center for Natural Fiber" },
  { slug: "icic", title: "International Centre for Indian Crafts (ICIC)" },
  { slug: "bamboo", title: "Center for Bamboo Initiatives" },
  { slug: "railway", title: "Railway Design Center" },
  { slug: "handloom", title: "Smart Handloom Innovation Centre" },
  {
    slug: "nation-building",
    title: "Design Research & Innovation Centre for Nation Building",
  },
  { slug: "ipr", title: "Intellectual Property Rights Cell" },
  { slug: "nid-press", title: "NID Press" },
] as const;

/** The centres that build, in the rail's order. A centre builds iff it has a
 *  fixture entry, and the fixture module's type makes the two lists one: a
 *  centre here without an entry, or an entry not here, fails tsc. Adding a
 *  centre is data only: its slug here (and in RESEARCH_CHILDREN if sitemap.json
 *  gains it), its fixture entry, and — only when its CMS slug is not its route
 *  slug — one line in pages.ts's PATH_BY_CMS_SLUG. No route, template or
 *  component changes (DEVELOPER-MANUAL R1d).
 *  Nation Building is withheld: its CMS document and its board are placeholder
 *  copy ("PLACEHOLDER — …", "Content to be supplied by NID"), so it has no
 *  fixture entry, every link to it stays an unlinked row, and its URL is a 404.
 *  TODO(review): add it when real content lands; backend — a draft/published
 *  state, since the API serves the placeholder as published. */
export const BUILT_RESEARCH_CENTRES = [
  "natural-fiber",
  "icic",
  "bamboo",
  "railway",
  "handloom",
  "ipr",
  "nid-press",
] as const;

export type ResearchCentre = (typeof BUILT_RESEARCH_CENTRES)[number];

export const researchPath = (slug: string) => `/research/${slug}`;
