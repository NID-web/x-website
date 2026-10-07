// Regulatory's children: the one list every Regulatory page's band and the
// band's unbuilt-row rule read (STAGE-0-NOTES §86). It imports nothing, as
// research-centres.ts does, so a band never reaches a fixture through it.
//
// There is no /regulatory page and none is planned: the back link falls back
// to About NID, where nid.edu files these pages, and the band is named by the
// section's title rather than by a parent page.

/** sitemap.json §11's section title. */
export const REGULATORY_TITLE = "Regulatory";

/** sitemap.json §11's three children, in its order, by its names. An unbuilt
 *  one stays an unlinked row in the band until its route joins BUILT_ROUTES. */
export const REGULATORY_CHILDREN = [
  { path: "/regulatory/nid-act", title: "NID Act, Rules, Ordinances & Statutes" },
  { path: "/regulatory/annual-reports", title: "Annual Reports" },
  { path: "/regulatory/rti", title: "Right To Information" },
] as const;
