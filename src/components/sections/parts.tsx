import clsx from "clsx";
import { Cta } from "@/components/spine/Cta";
import { Overline } from "@/components/home/parts";
import type { GridStart } from "@/components/layout/GridItem";
import type { LabelValue, Link } from "@/lib/content-model";
import { ctaProps } from "@/lib/content/links";

// Column 1 is the label rail the whole page long, so a card or link that opens
// a row of the content field has to name column 2 — flow alone would drop it
// into the rail wherever column 1 happens to be free (§37). The content field
// is 2 wide at 3 columns and 3 wide at 4.

/** Cells that begin on the section's TITLE row: column 1 already holds the
 *  title, so index 0 lands in the field by flow and only wrapping cells pin. */
export function startOf(index: number): GridStart | undefined {
  if (index === 0) return undefined;
  const laptop = index % 2 === 0;
  const desktop = index % 3 === 0;
  if (laptop && desktop) return 2;
  if (laptop) return "2-laptop";
  if (desktop) return "2-desktop";
  return undefined;
}

/** Cells that begin on a FRESH row beneath a lead card, which has taken the
 *  rest of the title row. Index 0 opens that row, so it pins too. At 4 columns
 *  the pinned rail tile already holds column 1 and only the 3-column case
 *  needs the class. */
export function startBelowLead(index: number): GridStart | undefined {
  return index % 2 === 0 ? "2-laptop" : undefined;
}

/** A link the server has already resolved to a site path — `derived.subPageLinks`,
 *  breadcrumb and sibling entries — as opposed to an authored `Link`. */
export interface ResolvedLink {
  label: string;
  href: string;
}

// A group of links: a vertical stack on the 24px pitch (NID-CONTEXT.md §7.1).
// Two named two-up modes, because the two callers need opposite ranges and a
// boolean could not say which:
//   tablet-only  the rail's sub-page links, one column at 3 and 4 columns and
//                a full-width band at 2, where two fit across (About's 768 board)
//   tablet-up    a block that already sits in the content field, two-up from 2
//                columns up — the sibling band (4315:276612)
const TWO_UP = {
  "tablet-only":
    "tablet:max-laptop:grid tablet:max-laptop:grid-cols-2 tablet:max-laptop:gap-x-gutter tablet:max-laptop:gap-y-rowgutter",
  "tablet-up": "tablet:grid tablet:grid-cols-2 tablet:gap-x-gutter tablet:gap-y-rowgutter",
} as const;

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

// Section / page contacts (NID-CONTEXT.md §8.1) in the rail: a label over its
// value. A value that is a site path renders as a link instead — see the
// TODO(review) on Page.contacts in the About fixture.
export function ContactList({ contacts }: { contacts: LabelValue[] }) {
  return (
    <ul className="flex flex-col gap-6">
      {contacts.map((contact) => (
        <li key={contact.label}>
          {contact.value.startsWith("/") ? (
            <Cta variant="primary" label={contact.label} href={contact.value} />
          ) : (
            <>
              <Overline withRule={false}>{contact.label}</Overline>
              <p className="mt-2 font-body text-body text-text-primary">{contact.value}</p>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
