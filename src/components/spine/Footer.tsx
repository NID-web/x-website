import clsx from "clsx";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { GridItem } from "@/components/layout/GridItem";
import { Overline } from "@/components/home/parts";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";
import { FOOTER, type FooterLink } from "@/lib/footer-content";

// The four footer blocks (design/NID-CONTEXT.md §5.2 ROW f; sitemap.json
// "footer"), rendered as direct GridItem children of the page's ONE PageGrid —
// a page places <Footer /> inside its grid rather than the layout wrapping
// every page in a second one, because column 1 is the label rail all the way
// down and a nested grid would double the shell margin (STAGE-0-NOTES.md §6).
// Footer blocks are not square; they take their natural height.

type Translate = Awaited<ReturnType<typeof getTranslations<"Footer">>>;

function LinkColumn({
  links,
  t,
  /** Primary column is Heavy, secondary is Medium (the export's
   *  `Futura_PT:Medium` = 500). text-h6 carries Heavy in its own token, so this
   *  must override it — which only works because Tailwind emits font-weight
   *  utilities after text-* ones, not because of class order in the string. */
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

// `collaborations` is the one place the boards disagree, so it is the one prop.
// The About and News & Events boards draw the partner block ONE COLUMN wide at
// 1024 and 768; the Home board runs it the full row below 1024 (STAGE-0-NOTES
// §23). That difference used to be resolved by giving every page Home's
// version — which quietly put the editorial pages at odds with their own
// boards. `column` is the default because the editorial template is the common
// case; Home opts back out.
export async function Footer({
  collaborations = "column",
}: {
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

      {/* `row`: six marks in a 4-column grid do not fit a 2-column layout's
          single column, so below 1024 the block takes the whole row (§23).
          `column`: one column, as the editorial boards draw it — except at
          three columns, where the other three blocks fill row one and this one
          is alone on row two, so it spreads and the six marks make one line. */}
      <GridItem span={fullRow ? "full-then-1" : "full-at-laptop"}>
        {/* No background of its own: the export's bg-white is a Figma frame
            fill on a white page, and painting it turns the block into a white
            slab the moment the surface is dark. */}
        {/* The internal grid follows the block. Widening the block alone made
            things worse, not better (§23): at 720px with 4 columns the marks
            went four across at 168px and stranded two beside a half-empty row,
            so the full-row form goes six across and only there. A one-column
            block is four across at every width. Base plus breakpoint-scoped
            overrides, so the media range decides, not emit order. */}
        <div
          className={clsx(
            "grid grid-cols-4 gap-4",
            // Six across wherever the block has the whole row, four wherever it
            // is one column — which is the opposite breakpoint in each form.
            fullRow
              ? "tablet:grid-cols-6 laptop:grid-cols-4"
              : "laptop:grid-cols-6 desktop:grid-cols-4",
          )}
        >
          <h2 className="col-span-full font-primary text-overline uppercase text-text-tertiary">
            {t(FOOTER.collaborationsOverlineKey)}
          </h2>
          {FOOTER.collaborations.map((partner) => (
            // Each mark gets its own light plate in dark appearance: these are
            // full-colour logos with baked-in dark ink, and surface/inverse is
            // the one sanctioned dark pairing. The padding and radius apply in
            // BOTH appearances so nothing resizes when the appearance toggles.
            <span
              key={partner.name}
              className="flex items-center justify-center rounded-lg p-2 dark:bg-surface-inverse"
            >
              <Image
                src={partner.logo.file}
                alt={partner.name}
                width={partner.logo.width}
                height={partner.logo.height}
                // The image endpoint refuses SVG unless dangerouslyAllowSVG is set.
                unoptimized={partner.logo.file.endsWith(".svg")}
                // Height drives the size; the width follows the mark's own aspect.
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
