import clsx from "clsx";
import { Cta } from "@/components/spine/Cta";
import { Overline } from "@/components/home/parts";
import type { GridStart } from "@/components/layout/GridItem";
import type { LabelValue, Link } from "@/lib/content-model";
import { contactCta, ctaProps } from "@/lib/content/links";

// Column 1 is the rail wherever there is one, and no card may land in it. Where
// the rail exists, the content columns beside it — measured on the rendered
// page, 330 × 4 at 1440 and 309 × 3 at 1024. Below laptop (350 × 2 at 768,
// 358 × 1 at 390) there is no rail: the title is a full-row band, cards flow,
// and nothing is pinned, which every START entry already guarantees by being
// laptop:/desktop:-scoped.
const CONTENT_COLUMNS = { laptop: 2, desktop: 3 } as const;
type RailRange = keyof typeof CONTENT_COLUMNS;

/** The shape of a section's card field, per range that has a rail. */
export interface CardField {
  /** Content cells row 1 leaves open beside the title once its neighbours — a
   *  lead card, a pinned utility slot — are placed. Cards before this index
   *  share the title's row and need no pin: the title holds column 1. */
  open: Record<RailRange, number>;
  /** The first row whose opening card is pinned to column 2. 2 when column 1
   *  of row 2 is free; 3 where a rail tile already holds it. */
  pinFrom: Record<RailRange, number>;
}

/** Cards in a section's title row with no lead and no utility slot. */
export const TITLE_ROW_FIELD: CardField = {
  open: { laptop: CONTENT_COLUMNS.laptop, desktop: CONTENT_COLUMNS.desktop },
  pinFrom: { laptop: 2, desktop: 2 },
};

/** Whether card `index` opens a row that must be pinned at this range. A
 *  function of position, not a list of indices: an editor-set DYNAMIC limit of
 *  7 wraps exactly as one of 4 does. */
function opensPinnedRow(index: number, field: CardField, range: RailRange) {
  const columns = CONTENT_COLUMNS[range];
  const open = Math.max(0, field.open[range]);
  if (index < open) return false;
  const k = index - open;
  return k % columns === 0 && 2 + k / columns >= field.pinFrom[range];
}

/** Explicit column start for card `index` of a section, or undefined to flow. */
export function startIn(index: number, field: CardField): GridStart | undefined {
  const laptop = opensPinnedRow(index, field, "laptop");
  const desktop = opensPinnedRow(index, field, "desktop");
  if (laptop && desktop) return 2;
  if (laptop) return "2-laptop";
  if (desktop) return "2-desktop";
  return undefined;
}

/** Explicit column start for cells in a section's title row. */
export function startOf(index: number): GridStart | undefined {
  return startIn(index, TITLE_ROW_FIELD);
}

/** A link resolved to a site path, or an authored Link. */
export interface ResolvedLink {
  label: string;
  href: string;
}

const TWO_UP = {
  "tablet-only":
    "tablet:max-laptop:grid tablet:max-laptop:grid-cols-2 tablet:max-laptop:gap-x-gutter tablet:max-laptop:gap-y-rowgutter",
  "tablet-up": "tablet:grid tablet:grid-cols-2 tablet:gap-x-gutter tablet:gap-y-rowgutter",
} as const;

/**
 * Vertical or two-up stack of CTA links.
 */
export function LinkStack({
  links,
  twoUp,
}: {
  links: Array<Link | ResolvedLink>;
  twoUp?: keyof typeof TWO_UP;
}) {
  return (
    <ul className={clsx("flex flex-col gap-6", twoUp && TWO_UP[twoUp])}>
      {links.map((link) => {
        const cta = "href" in link ? link : ctaProps(link);
        return (
          cta && (
            <li key={"id" in link ? link.id : link.href}>
              <Cta variant="primary" {...cta} />
            </li>
          )
        );
      })}
    </ul>
  );
}

/**
 * Contact or key-value rail list. A value that resolves to a link renders as a
 * CTA row; anything else renders as the label over plain text.
 */
export function ContactList({ contacts }: { contacts: LabelValue[] }) {
  return (
    <ul className="flex flex-col gap-6">
      {contacts.map((contact) => {
        const cta = contactCta(contact);
        return (
          <li key={contact.label}>
            {cta ? (
              <Cta variant="primary" {...cta} />
            ) : (
              // NOT a fallback to tidy away: a contact that is not a link at all
              // — a postal address, an office name — belongs here, and rendering
              // it as an anchor would ship a dead one.
              <>
                <Overline withRule={false}>{contact.label}</Overline>
                <p className="mt-2 font-body text-body text-text-primary">{contact.value}</p>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
