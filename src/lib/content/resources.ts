// Resources and its labs (STAGE-0-NOTES §104): the routes, the build set's
// exclusions, nid.edu's grouping and order, and the legacy ids. Data only; the
// list and the pages are getResources.ts's.

export const RESOURCES_PATH = "/programmes/resources";
export const LAB_ROUTE = "/programmes/resources/[slug]";

/** A lab's route is its CMS slug under /programmes/resources: one rule, no
 *  table, so a lab the CMS adds builds with no code change (the articles'
 *  precedent, §59). */
export const labPath = (slug: string) => `${RESOURCES_PATH}/${slug}`;

/** The slug of a lab path, or undefined for any other path. */
export function labSlugOf(path: string): string | undefined {
  const match = /^\/programmes\/resources\/([^/]+)$/.exec(path);
  return match?.[1];
}

/** `lab_and_facilities` items never built: seed records (generic text, contacts
 *  nid.edu does not list, heroes with no alt text), published with the 21 Sep
 *  seed batch. Named, never guessed by publish date: the list keeps them out,
 *  so a seed un-withheld would build. TODO(review): backend — unpublish them
 *  (RS1). */
export const WITHHELD_LABS: ReadonlySet<string> = new Set(["photography-studio", "wood-workshop"]);

/** The key-info row a lab in a design faculty carries: "Faculty" and the
 *  faculty's name. Other Resources is not a faculty, so it has none. */
export const FACULTY_LABEL = "Faculty";

export interface LabGroup {
  id: string;
  title: string;
  /** The Faculty key-info row's value; none for Other Resources. */
  faculty?: string;
  /** The group's labs by CMS slug, in nid.edu's order. */
  slugs: readonly string[];
}

/** nid.edu's Resources page: five groups, by design faculty, in its order
 *  (academics/resource.html, 23 Oct 2026). The CMS has neither the grouping
 *  nor an order (its list has no orderIndex, and no lab references its
 *  `academic_faculty`), so this table is nid.edu's authored structure, held
 *  here. TODO(review): backend — relate each lab to its academic_faculty and
 *  order the list (RS2). A lab no group names is listed under Other Resources,
 *  last, and logged (getResources.ts). */
export const LAB_GROUPS: readonly LabGroup[] = [
  {
    id: "communication",
    title: "Communication Design",
    faculty: "Communication Design",
    slugs: ["animation-film-design-lab", "exhibition-design-studio-and-lab", "film-and-video-communication-fvc-labs"],
  },
  {
    id: "industrial",
    title: "Industrial Design",
    faculty: "Industrial Design",
    slugs: [
      "design-vision-centre",
      "ceramic-and-glass-design-labs",
      "user-centered-design-lab",
      "toy-and-game-design-studio",
      "clay-studio-cintiq-lab-studio",
      "skill-development-lab-nid-bangalore",
    ],
  },
  {
    id: "it-integrated",
    title: "IT Integrated",
    faculty: "IT Integrated",
    slugs: ["physical-computing-lab", "av-lab-nid-bengaluru"],
  },
  {
    id: "textile",
    title: "Textile, Apparel, Lifestyle & Accessory Design",
    faculty: "Textile, Apparel, Lifestyle & Accessory Design",
    slugs: ["apparel-design-workshop", "textile-design-weaving-labs", "lifestyle-accessory-design-workshop-studio"],
  },
  {
    id: "other",
    title: "Other Resources",
    slugs: [
      "information-technology-it-centre",
      "skill-development-lab-ahmedabad",
      "photography-lab-ahmedabad",
      "dyeing-and-printing-studio-and-lab",
    ],
  },
];

/** The group for unlisted labs. */
export const DEFAULT_LAB_GROUP = LAB_GROUPS[LAB_GROUPS.length - 1]!;

export function labGroupOf(slug: string): LabGroup {
  return LAB_GROUPS.find((g) => g.slugs.includes(slug)) ?? DEFAULT_LAB_GROUP;
}

/** nid.edu's lab ids (academics/resource/<id>.html) → the lab's CMS slug, its
 *  route here. The Academics redirects read this table. */
export const LEGACY_LAB_IDS: Readonly<Record<number, string>> = {
  4: "design-vision-centre",
  9: "apparel-design-workshop",
  10: "information-technology-it-centre",
  11: "animation-film-design-lab",
  12: "ceramic-and-glass-design-labs",
  13: "exhibition-design-studio-and-lab",
  14: "film-and-video-communication-fvc-labs",
  15: "user-centered-design-lab",
  16: "textile-design-weaving-labs",
  17: "lifestyle-accessory-design-workshop-studio",
  18: "toy-and-game-design-studio",
  19: "clay-studio-cintiq-lab-studio",
  20: "physical-computing-lab",
  21: "skill-development-lab-ahmedabad",
  22: "skill-development-lab-nid-bangalore",
  23: "photography-lab-ahmedabad",
  24: "dyeing-and-printing-studio-and-lab",
  25: "av-lab-nid-bengaluru",
};

/** Lab heroes refused by media id (§77): the card photos under 400px wide,
 *  which the 1038px hero crop at 1440 enlarges past legibility (measured: AV
 *  Lab's 225px reads as blocks). A new upload has a new id and shows with no
 *  code change. TODO(review): backend — originals at least 1600px wide (RS6). */
export const REFUSED_LAB_HEROES = [
  "cmuaoouw300007bpdy9eodj2p", // lab-av-lab-nid-bengaluru.png, 225 × 168
  "cmuaoo7eh000020pdvegir163", // lab-physical-computing-lab.png, 369 × 277
  "cmuaon0vl0000rlpd1qhjeipt", // lab-information-technology-it-centre.png, 393 × 295
] as const;
