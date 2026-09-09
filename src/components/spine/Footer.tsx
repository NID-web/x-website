import clsx from "clsx";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { GridItem } from "@/components/layout/GridItem";
import { Overline } from "@/components/home/parts";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";
import { FOOTER, type FooterLink } from "@/lib/footer-content";

/**
 * Site footer blocks, rendered directly as GridItems within the PageGrid.
 */
type Translate = Awaited<ReturnType<typeof getTranslations<"Footer">>>;

function LinkColumn({
  links,
  t,
  weight = "heavy",
}: {
  links: FooterLink[];
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

export async function Footer({
  collaborations = "column",
}: {
  /** Display format for collaboration logos: "column" (default for editorial) or "row" (Home). */
  collaborations?: "row" | "column";
} = {}) {
  const t = await getTranslations("Footer");
  const fullRow = collaborations === "row";
  return (
    <>
      {/* Two link landmarks in the same footer need distinguishing names, or a
          screen reader offers "navigation" twice with nothing to choose by. */}
      <GridItem span={1} as="nav" aria-label={t("primaryNav")}>
        <LinkColumn links={FOOTER.primaryLinks} t={t} />
      </GridItem>

      <GridItem span={1} as="nav" aria-label={t("secondaryNav")}>
        <LinkColumn links={FOOTER.secondaryLinks} t={t} weight="medium" />
      </GridItem>

      <GridItem span={1}>
        <Overline withRule={false} dark={true}>
          {t(FOOTER.contactOverlineKey)}
        </Overline>
        <ul className="mt-4 flex flex-col gap-1.5">
          {FOOTER.contacts.map((contact) => (
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
          {FOOTER.social.map((social) => (
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

      <GridItem span={fullRow ? "full-then-1" : "full-at-laptop"}>
        <div
          className={clsx(
            "grid grid-cols-4 gap-4",
            fullRow
              ? "tablet:grid-cols-6 laptop:grid-cols-4"
              : "laptop:grid-cols-6 desktop:grid-cols-4",
          )}
        >
          <h2 className="col-span-full font-primary text-overline uppercase text-text-tertiary">
            {t(FOOTER.collaborationsOverlineKey)}
          </h2>
          {FOOTER.collaborations.map((partner) => (
            <span
              key={partner.name}
              className="flex items-center justify-center rounded-lg p-2 dark:bg-surface-inverse"
            >
              <Image
                src={partner.logo.file}
                alt={partner.name}
                width={partner.logo.width}
                height={partner.logo.height}
                unoptimized={partner.logo.file.endsWith(".svg")}
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
