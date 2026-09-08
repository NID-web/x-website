import type { ReactNode } from "react";
import { PatternField1, PatternField2, PatternField3 } from "@/components/home/patterns";

// The craft pattern fields that punctuate a page (design/NID-CONTEXT.md §13):
// a full square of one field, or — with `cta` — a row of it above and below a
// centred link (About's "Just a tile" 4912:367990).
//
// The rows used to be desktop-only, because below 4 columns the boards drop the
// pattern and keep the link in the rail. That reasoning expired when the link
// left the rail (STAGE-0-NOTES §37): at 3 columns it now sits in the content
// field, where the tile is a tile again and the pattern reads as one. So the
// rows show at every width; only the square proportion stays desktop-only,
// since a square across a 768 half-row or the whole of a 390 is a hole, not a
// tile (§38).
//
// Purely decorative (aria-hidden inside the field), so the decorative accent
// ramp is fine. Shown at every breakpoint on Home (STAGE-0-NOTES.md §20).
const FIELDS = [PatternField1, PatternField2, PatternField3];

export function PatternTile({ seed = 0, cta }: { seed?: number; cta?: ReactNode }) {
  const Field = FIELDS[seed % FIELDS.length] ?? PatternField1;
  if (!cta) {
    return (
      <div className="relative aspect-square overflow-hidden">
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
