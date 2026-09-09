import type { ReactNode } from "react";
import { PatternField1, PatternField2, PatternField3 } from "@/components/home/patterns";

/**
 * Craft pattern field tile. Renders as a full square pattern or with a centered CTA between pattern rows.
 */
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
