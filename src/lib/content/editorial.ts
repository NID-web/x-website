import type { Discipline, MediaAsset, Page, Section, UUID } from "@/lib/content-model";

/**
 * A section as an editorial page may carry it: the model's Section plus a pull
 * quote rendered above its body (STAGE-0-NOTES §60). Front-end only, NOT a
 * change to content-model.ts — the model has no quote block, so the quote rides
 * on the fixture and survives the adapter's `{ ...section, body }` merge. The
 * name is the field the backend is asked for; delete this type the day
 * `Section` carries it.
 */
export type EditorialSection = Section & { pullQuote?: string; subtitle?: string };

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

/** A page-level link the article/event rail draws as a filled button, in this
 *  order: an item's apply, registration and live-stream links (§68). The model
 *  has no page-level link slot, so it rides beside the PageResponse. The label
 *  is a UI string, keyed. */
export const RAIL_LINK_ORDER = ["apply", "register", "liveStream"] as const;
export type RailLink = { key: (typeof RAIL_LINK_ORDER)[number]; url: string };

/**
 * A discipline as a Thumb card on a programme page: the model's Discipline, plus
 * every campus it is offered at — the model's `campus` holds one, and the meta
 * line names them all. Front-end only, like AwardEntry. `campus` is the first.
 */
export type DisciplineCard = Discipline & { campuses: UUID[] };

export function isDisciplineCard(item: unknown): item is DisciplineCard {
  return typeof item === "object" && item !== null && "programme" in item && "campuses" in item;
}

/** A section's sub-title above its body — the discipline board's Resources ("The
 *  Animation Film Lab"). Front-end only, like the pull quote. */
export function subtitleOf(section: Section): string | undefined {
  return (section as EditorialSection).subtitle;
}

/**
 * A student work as a cards item on a discipline page: the first is the feature,
 * the rest thumbs. The model's cards union has no work; front-end only, like
 * AwardEntry. `description` and `url` render only with text / a real URL.
 */
export interface StudentWorkCard {
  id: string;
  title: string;
  student?: string;
  description?: string;
  url?: string;
  image?: MediaAsset;
  work: true;
}

export function isStudentWorkCard(item: unknown): item is StudentWorkCard {
  return typeof item === "object" && item !== null && (item as { work?: unknown }).work === true;
}

/**
 * A notice row as a cards item — /study's Academic Notifications (STAGE-0-NOTES
 * §73). The rows are academic-calendar event records, which no section type
 * carries; front-end only, like StudentWorkCard. `date` is a display string,
 * never parsed: no `<time>` and no link until the record brings a machine date
 * and a URL (the backend ask in academic-calendar.ts).
 */
export interface NoticeEntry {
  id: string;
  title: string;
  date: string;
  notice: true;
}

export function isNoticeEntry(item: unknown): item is NoticeEntry {
  return typeof item === "object" && item !== null && (item as { notice?: unknown }).notice === true;
}
