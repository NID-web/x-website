import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { PageGrid } from "@/components/layout/PageGrid";
import { GridItem } from "@/components/layout/GridItem";
import { TileImage } from "@/components/home/TileImage";
import { BackNav } from "@/components/spine/BackNav";
import { BrandStrip } from "@/components/spine/BrandStrip";
import type { Clamp } from "@/components/spine/ClampedProse";
import { Footer } from "@/components/spine/Footer";
import { Separator } from "@/components/spine/Separator";
import { Standfirst } from "@/components/spine/Standfirst";
import { Title } from "@/components/spine/Title";
import { ContactList, LinkStack } from "@/components/sections/parts";
import { SectionRenderer, hasContent } from "@/components/sections/SectionRenderer";
import type { PageResponse } from "@/lib/content-model";

/**
 * The primary template (sitemap.json's `"template": "primary"`): a section
 * landing — title, the sub-page rail in column 1 beside the hero, the
 * standfirst, then separated sections. /about, /programmes, /study and
 * /research render it; every difference is data or a prop (STAGE-0-NOTES §69,
 * §73, §78).
 */
export async function PrimaryTemplate({
  response,
  thumbs,
  thumbMeta,
  clamp = {},
  contactsIn,
  subPages = "beside-hero",
}: {
  response: PageResponse;
  /** How a cards section lays out Thumb cards; see CardsSection. */
  thumbs?: "two-up" | "three-up";
  /** False: Thumb cards without the meta line; see CardsSection. */
  thumbMeta?: boolean;
  /** Which section bodies clamp behind "See more", and at how many lines —
   *  SecondaryTemplate's prop. */
  clamp?: Record<string, Clamp>;
  /** The section whose column 4 holds the page's contacts, instead of the slot
   *  under the standfirst — the board's place for them on Research (§78), the
   *  model's on every secondary page. */
  contactsIn?: string;
  /** Where the sub-page links go: the rail in column 1 beside the hero (every
   *  primary board but one), or three across in columns 2–4 under the
   *  standfirst with column 1 left empty beside the hero (People, §81). */
  subPages?: "beside-hero" | "below-intro";
}) {
  const { page, derived } = response;
  const t = await getTranslations("Page");
  const hero = page.hero[0];
  const moved = contactsIn !== undefined && page.sections.some((s) => s.id === contactsIn);
  // Skipped here, not only in SectionRenderer, so the separator goes with it.
  const sections = page.sections
    .map((s) => (moved && s.id === contactsIn ? { ...s, contacts: [...s.contacts, ...page.contacts] } : s))
    .filter(hasContent);
  const below = subPages === "below-intro";
  const contactSlot = !moved && page.contacts.length > 0 && (
    <GridItem span={1} start="2-laptop">
      <ContactList contacts={page.contacts} />
    </GridItem>
  );

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      <BrandStrip />
      <PageGrid>
        <Title variant="page">{page.title}</Title>

        <BackNav />

        {derived.subPageLinks.length > 0 && !below && (
          <GridItem span="full-then-1" start={1} as="nav" aria-label={t("subPages")}>
            <LinkStack links={derived.subPageLinks} twoUp="tablet-only" />
          </GridItem>
        )}

        {/* Not PageHero: a primary page draws nothing without an asset (no
            placeholder box), and the rail and standfirst close up. */}
        {hero && (
          // Below-intro, column 1 stays empty: with no rail to hold it, the hero
          // would otherwise flow into column 1.
          <GridItem span="hero" start={below ? "2-hero" : undefined}>
            <TileImage
              media={hero}
              priority
              className="relative aspect-[4/3] w-full rounded-tl-hero tablet:aspect-video laptop:aspect-[2/1] desktop:aspect-[2.2/1]"
              sizes="(min-width: 1280px) 1038px, (min-width: 1024px) 64vw, 96vw"
            />
          </GridItem>
        )}

        {/* TODO(review): designer — the Programmes board sets the standfirst in
            Body/Large/Bold; Standfirst is Regular from 768 up (Bold on phones
            only), as About has always shipped. The template wins. */}
        {page.intro && (
          <GridItem span={2} start={2}>
            <Standfirst text={page.intro} seeMore={t("seeMore")} />
          </GridItem>
        )}
        {/* Beside-hero, the slot holds exactly the element it always did: an
            extra child, even an empty one, reaches the RSC payload of every
            primary page (§76). */}
        {below && derived.subPageLinks.length > 0
          ? [
              <Fragment key="contacts">{contactSlot}</Fragment>,
              <GridItem key="sub-pages" span="hero" start="2-hero" as="nav" aria-label={t("subPages")}>
                <LinkStack links={derived.subPageLinks} twoUp="three-up" />
              </GridItem>,
            ]
          : contactSlot}

        {/* TODO(review): designer — the Programmes board sets the Curriculum
            Objectives body in text/secondary; SectionBody uses text/primary
            for every section body (see its note). The template wins. */}
        {sections.map((section) => (
          <Fragment key={section.id}>
            <Separator />
            {/* No craft tile beside a section photo: /study's Life at NID, the
                first primary page with one, draws none. A text section's links
                go by the utility rule, not into a free cell beside it (§73). */}
            <SectionRenderer
              section={section}
              thumbs={thumbs}
              thumbMeta={thumbMeta}
              clamp={clamp[section.id] && { seeMore: t("seeMore"), seeLess: t("seeLess"), clamp: clamp[section.id] }}
              pattern={false}
              utilityLinks
            />
          </Fragment>
        ))}

        <Separator />
        <Footer />
      </PageGrid>
      <BrandStrip logo />
    </main>
  );
}
