import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { GridItem } from "@/components/layout/GridItem";
import { PageGrid } from "@/components/layout/PageGrid";
import { BackNav } from "@/components/spine/BackNav";
import { BrandStrip } from "@/components/spine/BrandStrip";
import { Cta } from "@/components/spine/Cta";
import { Footer } from "@/components/spine/Footer";
import { PageHero } from "@/components/spine/PageHero";
import { Separator } from "@/components/spine/Separator";
import { Standfirst } from "@/components/spine/Standfirst";
import { Title } from "@/components/spine/Title";
import { ContactList } from "@/components/sections/parts";
import { SectionRenderer, hasContent } from "@/components/sections/SectionRenderer";
import { SiblingBand } from "@/components/sections/SiblingBand";
import type { ArticleResponse } from "@/lib/content/getArticle";

/**
 * The article template: a news article (/about/news-events/[slug]) and an
 * event (/events/[slug]) are the same slot anatomy — title, a rail in column 1
 * beside the hero, titled sections with the See-more clamp — so both routes
 * render this, with the differences as props and data (STAGE-0-NOTES §59, §68).
 * Every article body clamps at ClampedProse's nine lines; the model has no
 * clamp field and an API section no id to name.
 */
export async function ArticleTemplate({
  response,
  title,
  subtitle,
  standfirst = "always",
  siblingTitle,
  trailBack,
}: {
  response: ArticleResponse;
  /** Replaces page.title as the h1 — an event's title split at its colon. */
  title?: string;
  subtitle?: string;
  /** "without-sections": show the intro only when the page has no sections to
   *  open it (the event board has no standfirst; a thin event has nothing else). */
  standfirst?: "always" | "without-sections";
  siblingTitle?: string;
  /** Use the session-trail back link (BackNav) instead of the route's fixed
   *  parent, falling back to this route when there is no previous page. Events:
   *  reached from Home, the archive, the listing, with no landing of their own. */
  trailBack?: string;
}) {
  const { page, derived, railLinks } = response;
  const [t, tArticle] = await Promise.all([getTranslations("Page"), getTranslations("Article")]);
  // Skipped here, not only in SectionRenderer, so the separator goes with it.
  const sections = page.sections.filter(hasContent);
  const intro = page.intro && (standfirst === "always" || sections.length === 0) ? page.intro : undefined;
  // The rail's rows, then its buttons, then its contacts (the event board). A
  // news article carries its contacts among the rows and has no buttons, so it
  // renders the one list it always has.
  const railExtras = railLinks.length > 0 || page.contacts.length > 0;
  const heading = (
    <Title key="title" variant="page" subtitle={subtitle}>
      {title ?? page.title}
    </Title>
  );

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      <BrandStrip />
      <PageGrid>
        {/* Before the h1, as the archive's (§66). The static HTML carries no
            label: the trail is per tab, so the link fills in after hydration.
            One child slot for both, so a page without it (every news article)
            keeps the exact tree — and useId values — it always had. */}
        {trailBack ? [<BackNav key="back" fallback={trailBack} />, heading] : heading}

        {/* Always the route's parent, not the session trail BackNav follows:
            an article is reached from Home, About and its siblings as often as
            from its listing, and the boards name the parent (A5). */}
        {derived.backNav && (
          <GridItem span="full-then-1" place="page-utility">
            <Cta variant="primary" icon="arrow-left" label={derived.backNav.label} href={derived.backNav.href} />
          </GridItem>
        )}

        {(page.keyInfo.length > 0 || railExtras) && (
          <GridItem span="full-then-1" start={1} className={railExtras ? "flex flex-col gap-6" : undefined}>
            {page.keyInfo.length > 0 && <ContactList contacts={page.keyInfo} />}
            {railLinks.map((link) => (
              <Cta key={link.key} variant="filled" label={tArticle(link.key)} href={link.url} external />
            ))}
            {page.contacts.length > 0 && <ContactList contacts={page.contacts} />}
          </GridItem>
        )}

        <PageHero hero={page.hero} placeholder={false} />

        {intro && (
          <GridItem span={2} start={2}>
            <Standfirst text={intro} seeMore={t("seeMore")} />
          </GridItem>
        )}

        {sections.map((section) => (
          <Fragment key={section.id}>
            {/* TODO(review): designer — the event board draws no separators;
                every other page, articles included, has them, and it is the
                same template. One line to drop them for events. */}
            <Separator />
            <SectionRenderer
              section={section}
              clamp={{ seeMore: t("seeMore"), seeLess: t("seeLess") }}
              pattern={false}
            />
          </Fragment>
        ))}

        {derived.siblingBand.length > 0 && (
          <>
            <Separator />
            <SiblingBand
              items={derived.siblingBand}
              parentTitle={derived.backNav?.label ?? page.title}
              title={siblingTitle ?? tArticle("moreNews")}
              pattern={false}
            />
          </>
        )}

        <Separator />
        <Footer />
      </PageGrid>
      <BrandStrip logo />
    </main>
  );
}
