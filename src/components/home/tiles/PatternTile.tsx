import type { ReactNode } from "react";
import { PatternField1, PatternField2, PatternField3 } from "@/components/home/patterns";

// The craft pattern fields that punctuate a page (design/NID-CONTEXT.md §13):
// a full square of one field, or — with `cta` — a row of it above and below a
// centred link (About's "Just a tile" 4912:367990). The rows are desktop-only:
// the 1024 / 768 / 390 boards keep the link in the rail and drop the pattern.
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
      <Field className="hidden aspect-[4/1] w-full desktop:block" />
      {cta}
      <Field className="hidden aspect-[4/1] w-full desktop:block" />
    </div>
  );
}
