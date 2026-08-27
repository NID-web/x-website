import { GridItem } from "@/components/layout/GridItem";
import { Overline } from "@/components/home/parts";
import { TileImage } from "@/components/home/TileImage";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";
import { HOME_FOOTER, type HomeLink, type Translate } from "@/lib/home-content";

// The four footer tiles. Rendered as direct GridItem children of the page's one
// PageGrid (never a nested grid — CLAUDE.md § Layout). Footer tiles are not
// square; they take their natural height.

function LinkColumn({ links, t }: { links: HomeLink[]; t: Translate }) {
  return (
    <ul className="flex flex-col">
      {links.map((link) => (
        <li key={link.labelKey}>
          <Link
            href={link.href}
            className="block border-b border-border-faint py-2.5 font-body text-body text-text-primary no-underline transition-colors duration-150 ease-in-out hover:text-accent-primary"
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
        <LinkColumn links={HOME_FOOTER.secondaryLinks} t={t} />
      </GridItem>

      <GridItem span={1}>
        <Overline>{t(HOME_FOOTER.contactOverlineKey)}</Overline>
        <ul className="mt-4 flex flex-col gap-1.5">
          {HOME_FOOTER.contacts.map((contact) => (
            <li key={contact.href}>
              <a
                href={contact.href}
                className="font-body text-body text-text-secondary no-underline transition-colors duration-150 ease-in-out hover:text-accent-primary"
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
        {/* One pre-composed strip — its own baked heading + partner logos. */}
        <TileImage
          media={HOME_FOOTER.collaborations}
          className="relative aspect-[330/161] w-full max-w-[330px]"
          sizes="(min-width: 768px) 24vw, 96vw"
          fit="contain"
          backer={false}
        />
      </GridItem>
    </>
  );
}
