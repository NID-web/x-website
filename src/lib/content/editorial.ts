import type { Page, Section } from "@/lib/content-model";

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

/**
 * A student award as a cards item: the model's cards union carries `Page`, so
 * the student's name, the detail and the portrait ride on Page.title,
 * Page.intro and Page.hero[0] (as About's Student Awards section always has),
 * and the award and the project ride here. Front-end only, like the pull quote.
 * Known limitation: the model has no field for either.
 */
export type AwardEntry = Page & { award: string; project: string };

export function awardOf(item: Page): { award: string; project: string } | undefined {
  const { award, project } = item as Partial<AwardEntry>;
  return award && project ? { award, project } : undefined;
}
