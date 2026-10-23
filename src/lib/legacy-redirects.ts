// nid.edu's old URLs → their homes on this site, for when it takes over the
// domain (STAGE-0-NOTES §105). Pure data and a builder, read by next.config.ts;
// no page. The first slice of the legacy map: Academics, which the new
// architecture split into Programmes, Study at NID and Research.
//
// KMC is not here, on purpose: /academics/kmc IS KMC's own URL on nid.edu, and
// §85 points every KMC link at it. Whoever hosts KMC at the domain switch
// decides where it lives; a rule here would loop those links.
import { disciplineBase } from "./content/discipline-route";
import { LEGACY_LAB_IDS, RESOURCES_PATH, labPath } from "./content/resources";

const BDES = "/academics/programmes/bachelor-of-design-bdes";
const MDES = "/academics/programmes/master-of-design-mdes";
const RESOURCE = "/academics/resource";

/** nid.edu's Academics pages with one home each. */
const FIXED: ReadonlyArray<readonly [legacy: string, target: string]> = [
  ["/academics", "/programmes"],
  ["/academics/programmes", "/programmes"],
  [BDES, "/programmes/bdes"],
  [MDES, "/programmes/mdes"],
  ["/academics/programmes/ph-d", "/programmes/phd"],
  ["/academics/international-programmes", "/programmes/international"],
  [RESOURCE, RESOURCES_PATH],
  ["/academics/centre-for-teaching-and-learning/detail", "/programmes/ctl"],
  ["/academics/nid-press/detail", "/research/nid-press"],
  ["/academics/academic-notifications/detail", "/study/notifications"],
  ["/academics/curriculum-objectives/detail", "/programmes/curriculum-objectives"],
];

/** nid.edu's discipline slugs, as its sitemap.xml lists them (23 Oct 2026). A
 *  frozen set: nid.edu is being replaced, so no slug is added. The target is
 *  the slug less its -bdes/-mdes suffix, the rule the discipline pages use; it
 *  holds for `lifestyle-accessory-design`, which nid.edu writes with no suffix. */
const LEGACY_DISCIPLINES = {
  bdes: [
    "animation-film-design-bdes",
    "ceramic-glass-design-bdes",
    "exhibition-design-bdes",
    "film-and-video-communication-bdes",
    "foundation-programme",
    "furniture-and-interior-design-bdes",
    "graphic-design-bdes",
    "product-design-bdes",
    "textile-design-bdes",
  ],
  mdes: [
    "animation-film-design-mdes",
    "apparel-design-mdes",
    "ceramic-glass-design-mdes",
    "design-for-retail-experience-mdes",
    "digital-game-design-mdes",
    "film-and-video-communication-mdes",
    "furniture-and-interior-design-mdes",
    "graphic-design-mdes",
    "information-design-mdes",
    "interaction-design-mdes",
    "lifestyle-accessory-design",
    "new-media-design-mdes",
    "photography-design-mdes",
    "product-design-mdes",
    "strategic-design-management-mdes",
    "textile-design-mdes",
    "toy-game-design-mdes",
    "transportation-automobile-design-mdes",
    "universal-design-mdes",
  ],
} as const;

/** Disciplines with no page here: the Foundation Programme is excluded from
 *  the B.Des disciplines (§72), so its old URL opens the programme page. */
const NO_PAGE: ReadonlySet<string> = new Set(["foundation-programme"]);

/** The legacy → target rows, explicit rows first, then one fallback per
 *  prefix: an unknown discipline or lab opens its programme page or Resources,
 *  one hop, never a 404. A fallback listed before an explicit row of its prefix
 *  would shadow it; verify-redirects.mjs fails the build if one does. */
export function academicsRows(): Array<readonly [legacy: string, target: string]> {
  const programme = { bdes: [BDES, "/programmes/bdes"], mdes: [MDES, "/programmes/mdes"] } as const;
  const disciplines = (Object.keys(LEGACY_DISCIPLINES) as Array<keyof typeof LEGACY_DISCIPLINES>).flatMap((level) =>
    LEGACY_DISCIPLINES[level].map((slug) => {
      const [prefix, page] = programme[level];
      const target = NO_PAGE.has(slug) ? page : `${page}/${disciplineBase(slug, level)}`;
      return [`${prefix}/${slug}`, target] as const;
    }),
  );
  const labs = Object.entries(LEGACY_LAB_IDS).map(([id, slug]) => [`${RESOURCE}/${id}`, labPath(slug)] as const);
  const fallbacks = [
    [`${BDES}/:rest*`, "/programmes/bdes"],
    [`${MDES}/:rest*`, "/programmes/mdes"],
    [`${RESOURCE}/:rest*`, RESOURCES_PATH],
  ] as const;
  return [...FIXED, ...disciplines, ...labs, ...fallbacks];
}

/** Next redirects for every row: the bare and `.html` forms in one source
 *  (`{.html}?`, nid.edu serves .html and its sitemap lists the bare form), with
 *  and without a locale prefix. The destination carries the locale, so each is
 *  one hop: the proxy would otherwise add it as a second. 307 until the domain
 *  switch (§105): a 308 is cached by browsers for good. */
export function academicsRedirects(locales: readonly string[], defaultLocale: string) {
  const locale = `:locale(${locales.join("|")})`;
  return academicsRows().flatMap(([legacy, target]) => [
    { source: `${legacy}{.html}?`, destination: `/${defaultLocale}${target}`, permanent: false },
    { source: `/${locale}${legacy}{.html}?`, destination: `/:locale${target}`, permanent: false },
  ]);
}
