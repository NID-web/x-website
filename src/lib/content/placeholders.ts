// The Study at NID pages draw the boards' flat placeholder in every image slot
// the CMS has not filled yet, so the page keeps the board's layout while the
// photos are pending (STAGE-0-NOTES §77). A real image always wins over its box.
//
// LAUNCH: turn this off, or replace every placeholder with a real photo. Off,
// every Study page returns exactly to its closed-up §76 output. A constant, not
// an env value, so turning it off is a reviewed commit rather than a deploy
// setting that can silently put empty boxes on the live site.
export const SHOW_IMAGE_PLACEHOLDERS: boolean = true;

/** A route's `heroPlaceholder`: the stand-in box, or today's no-hero rule. */
export const HERO_STAND_IN = SHOW_IMAGE_PLACEHOLDERS ? "stand-in" : false;

/** A route's `imaged`: the sections whose board draws a photograph. Off, no set
 *  at all — the prop the page passed before §77. */
export function imagedSections(...ids: string[]): ReadonlySet<string> | undefined {
  return SHOW_IMAGE_PLACEHOLDERS ? new Set(ids) : undefined;
}
