import type { Section } from "@/lib/content-model";

/**
 * A section as an editorial page may carry it: the model's Section plus a pull
 * quote rendered above its body (STAGE-0-NOTES §60). Front-end only, NOT a
 * change to content-model.ts — the model has no quote block, so the quote rides
 * on the fixture and survives the adapter's `{ ...section, body }` merge. The
 * name is the field the backend is asked for; delete this type the day
 * `Section` carries it.
 */
export type EditorialSection = Section & { pullQuote?: string };

export function pullQuoteOf(section: Section): string | undefined {
  return (section as EditorialSection).pullQuote;
}
