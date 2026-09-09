import clsx from "clsx";
import { Cta } from "@/components/spine/Cta";
import { Overline } from "@/components/home/parts";
import type { GridStart } from "@/components/layout/GridItem";
import type { LabelValue, Link } from "@/lib/content-model";
import { ctaProps } from "@/lib/content/links";

/** Calculate explicit column start placement for cells in a section's title row. */
export function startOf(index: number): GridStart | undefined {
  if (index === 0) return undefined;
  const laptop = index % 2 === 0;
  const desktop = index % 3 === 0;
  if (laptop && desktop) return 2;
  if (laptop) return "2-laptop";
  if (desktop) return "2-desktop";
  return undefined;
}

/** Calculate explicit column start placement for cells on a row below a lead card. */
export function startBelowLead(index: number): GridStart | undefined {
  return index % 2 === 0 ? "2-laptop" : undefined;
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
 * Contact or key-value rail list. Values that are paths render as CTAs.
 */
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
