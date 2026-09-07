import clsx from "clsx";
import { Cta } from "@/components/spine/Cta";
import { Overline } from "@/components/home/parts";
import type { LabelValue, Link } from "@/lib/content-model";
import { ctaProps } from "@/lib/content/links";

/** A link the server has already resolved to a site path — `derived.subPageLinks`,
 *  breadcrumb and sibling entries — as opposed to an authored `Link`. */
export interface ResolvedLink {
  label: string;
  href: string;
}

// A group of links: a vertical stack on the 24px pitch (NID-CONTEXT.md §7.1),
// two-up across the row at 2 columns (the 768 board's sub-page links).
export function LinkStack({
  links,
  twoUpAtTablet = false,
}: {
  links: Array<Link | ResolvedLink>;
  twoUpAtTablet?: boolean;
}) {
  return (
    <ul
      className={clsx(
        "flex flex-col gap-6",
        twoUpAtTablet && "tablet:max-laptop:grid tablet:max-laptop:grid-cols-2 tablet:max-laptop:gap-x-gutter tablet:max-laptop:gap-y-rowgutter",
      )}
    >
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
