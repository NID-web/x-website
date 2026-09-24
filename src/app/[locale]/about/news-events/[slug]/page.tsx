import type { Metadata } from "next";
import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { GridItem } from "@/components/layout/GridItem";
import { PageGrid } from "@/components/layout/PageGrid";
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
import { articleSlugs, getArticle } from "@/lib/content/getArticle";

type Params = { params: Promise<{ slug: string }> };

// Exactly the slugs getArticle builds, and nothing else: an unknown slug is a
// 404 at the edge, never a render — the route gate links only these (links.ts).
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await articleSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const response = await getArticle((await params).slug);
  if (!response) return {};
  const { page } = response;
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.intro?.slice(0, 160),
  };
}

/**
 * News & Events article — History's secondary template with the CMS owning the
 * sections (STAGE-0-NOTES §59). One template for every article: the two boards
 * differ only in which optional slots are filled.
 */
export default async function ArticlePage({ params }: Params) {
  const response = await getArticle((await params).slug);
  if (!response) notFound();
  const { page, derived } = response;
  const [t, tArticle] = await Promise.all([getTranslations("Page"), getTranslations("Article")]);
  // Skipped here, not only in SectionRenderer, so the separator goes with it.
  const sections = page.sections.filter(hasContent);

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      <BrandStrip />
      <PageGrid>
        <Title variant="page">{page.title}</Title>

        {/* Always the listing, not the session trail BackNav follows: an
            article is reached from Home, About and its siblings as often as from
            its listing, and the boards name the parent (A5). */}
        {derived.backNav && (
          <GridItem span="full-then-1" place="page-utility">
            <Cta variant="primary" icon="arrow-left" label={derived.backNav.label} href={derived.backNav.href} />
          </GridItem>
        )}

        {page.keyInfo.length > 0 && (
          <GridItem span="full-then-1" start={1}>
            <ContactList contacts={page.keyInfo} />
          </GridItem>
        )}

        <PageHero hero={page.hero} placeholder={false} />

        {page.intro && (
          <GridItem span={2} start={2}>
            <Standfirst text={page.intro} seeMore={t("seeMore")} />
          </GridItem>
        )}

        {sections.map((section) => (
          <Fragment key={section.id}>
            <Separator />
            <SectionRenderer
              section={section}
              // TODO(review): every article body clamps at ClampedProse's
              // existing nine lines — the model has no clamp field and an API
              // section has no id to name, so the per-page CLAMP table other
              // pages use cannot reach it. The control hides itself when nothing
              // is clipped. The boards draw theirs at 7 and 9 lines; that is
              // not taken as a spec.
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
              title={tArticle("moreNews")}
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
