import clsx from "clsx";
import Image from "next/image";
import { GridItem } from "@/components/layout/GridItem";
import { Overline } from "@/components/home/parts";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";
import { HOME_FOOTER, type HomeLink, type Translate } from "@/lib/home-content";

// The four footer tiles. Rendered as direct GridItem children of the page's one
// PageGrid (never a nested grid — CLAUDE.md § Layout). Footer tiles are not
// square; they take their natural height.

function LinkColumn({
  links,
  t,
  /** Primary column is Heavy, secondary is Medium (the export's
   *  `Futura_PT:Medium` = 500). text-h6 carries Heavy in its own token, so this
   *  must override it — which only works because Tailwind emits font-weight
   *  utilities after text-* ones, not because of class order in the string. */
  weight = "heavy",
}: {
  links: HomeLink[];
  t: Translate;
  weight?: "heavy" | "medium";
}) {
  return (
    <ul className="flex flex-col">
      {links.map((link) => (
        <li key={link.labelKey}>
          <Link
            href={link.href}
            className={clsx(
              "block border-b-2 border-border-subtle py-3 font-primary text-h6 text-text-secondary no-underline transition-colors duration-150 ease-in-out hover:border-border-default",
              weight === "medium" && "font-medium",
            )}
          >
            {t(link.labelKey)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HomeFooter({ t }: { t: Translate }) {
  return (
    <>
      <GridItem span={1} as="nav">
        <LinkColumn links={HOME_FOOTER.primaryLinks} t={t} />
      </GridItem>

      <GridItem span={1} as="nav">
        <LinkColumn links={HOME_FOOTER.secondaryLinks} t={t} weight="medium" />
      </GridItem>

      <GridItem span={1}>
        <Overline withRule={false} dark={true}>
          {t(HOME_FOOTER.contactOverlineKey)}
        </Overline>
        <ul className="mt-4 flex flex-col gap-1.5">
          {HOME_FOOTER.contacts.map((contact) => (
            <li key={contact.href}>
              <a
                href={contact.href}
                className="font-primary font-medium text-micro text-text-secondary no-underline transition-colors duration-150 ease-in-out hover:text-accent-primary"
              >
                {contact.label}
              </a>
            </li>
          ))}
        </ul>
        <ul className="mt-5 flex items-center gap-4">
          {HOME_FOOTER.social.map((social) => (
            <li key={social.platform}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-text-primary transition-colors duration-150 ease-in-out hover:text-accent-primary"
              >
                <Icon name={social.platform} className="size-5" />
                <span className="sr-only">{social.platform}</span>
              </a>
            </li>
          ))}
        </ul>
      </GridItem>

      <GridItem span={1}>
        {/* Six individual marks in a 4-column grid (export: FooterQuaternary),
            not one baked strip — so the heading is real text and every logo
            carries the organisation's name as its alt.

            No background of its own. The export's frame carries bg-white, but
            the design page is white too, so that fill is invisible there — it
            is a Figma frame fill, not a card. Painting it for real turns it
            into a white slab the moment the surface is dark, so the block sits
            on the page surface and aligns flush with the other footer columns,
            like every other block here. */}
        <div className="grid grid-cols-4 gap-4">
          <h2 className="col-span-4 font-primary text-overline uppercase text-text-tertiary">
            {t(HOME_FOOTER.collaborationsOverlineKey)}
          </h2>
          {HOME_FOOTER.collaborations.map((partner) => (
            <span key={partner.name} className="flex items-center justify-center">
              <Image
                src={partner.logo.file}
                alt={partner.name}
                width={partner.logo.width}
                height={partner.logo.height}
                // Vectors have nothing to optimise, and the image endpoint
                // refuses SVG unless dangerouslyAllowSVG is set.
                unoptimized={partner.logo.file.endsWith(".svg")}
                // Height drives the size and the width follows the mark's own
                // aspect; max-w keeps a wide mark inside its column.
                style={{ maxHeight: partner.height }}
                className="h-auto w-auto max-w-full object-contain"
              />
            </span>
          ))}
        </div>
      </GridItem>
    </>
  );
}
