import type { ReactNode } from "react";
import { PatternField1, PatternField2, PatternField3 } from "@/components/home/patterns";

/**
 * Craft pattern field tile. Renders as a full square pattern or with a centered CTA between pattern rows.
 */
const FIELDS = [PatternField1, PatternField2, PatternField3];

export function PatternTile({
  seed = 0,
  cta,
  band = false,
}: {
  seed?: number;
  cta?: ReactNode;
  /** Draw as a full-row band below laptop instead of staying square. For a tile
   *  that decorates a RAIL: the rail cell exists at 4 and 3 columns and a square
   *  is right there, but at 2 and 1 there is no rail, and a square across a 768
   *  half-row or the whole of a 390 is a hole rather than a tile (§38 reached
   *  the same place for the `cta` form). Off by default — Home's bento tiles are
   *  square at every width, which is what §38 meant by leaving them untouched;
   *  flipping the default silently reshaped them once (STAGE-0-NOTES §50). */
  band?: boolean;
}) {
  const Field = FIELDS[seed % FIELDS.length] ?? PatternField1;
  if (!cta) {
    return (
      <div
        className={
          band
            ? "relative aspect-[4/1] overflow-hidden laptop:aspect-square"
            : "relative aspect-square overflow-hidden"
        }
      >
        <Field className="block size-full" />
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-center desktop:aspect-square desktop:justify-between">
      <Field className="block aspect-[4/1] w-full" />
      {cta}
      <Field className="block aspect-[4/1] w-full" />
    </div>
  );
}
