import type { Metadata } from "next";
import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageGrid } from "@/components/layout/PageGrid";
import { GridItem } from "@/components/layout/GridItem";
import { BackNav } from "@/components/spine/BackNav";
import { BrandStrip } from "@/components/spine/BrandStrip";
import type { Clamp } from "@/components/spine/ClampedProse";
import { Footer } from "@/components/spine/Footer";
import { PageHero } from "@/components/spine/PageHero";
import { Separator } from "@/components/spine/Separator";
import { Standfirst } from "@/components/spine/Standfirst";
import { Title } from "@/components/spine/Title";
import { LinkStack } from "@/components/sections/parts";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { SiblingBand } from "@/components/sections/SiblingBand";
import { getPage } from "@/lib/content/getPage";

const PATH = "/about/campuses";

// TODO(review): which bodies clamp — named here, as on Charter and History
// (STAGE-0-NOTES §52), because the model has no field for it. Counted in lines
// of TEXT (§55): About's 300px (4361:189757) is two paragraphs and a blank line,
// nine lines; The Three Campuses' 270px (4361:189798) is two paragraphs, two
// blank lines and the start of a third, seven. Visiting NID is drawn whole.
const CLAMP: Record<string, Clamp> = {
  "section-campuses-about": 9,
  "section-campuses-three": 7,
};

export async function generateMetadata(): Promise<Metadata> {
  const response = await getPage(PATH);
  if (!response) return {};
  const { page } = response;
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.intro?.slice(0, 160),
  };
}

/**
 * Campuses secondary page (Figma 4118:212141) — Charter's template with the
 * child-page rail in row 2 and page contacts in the first section.
 */
export default async function CampusesPage() {
  const response = await getPage(PATH);
  if (!response) notFound();
  const { page, derived } = response;
  const t = await getTranslations("Page");

  // The model surfaces page contacts "in column 4 of the first text section"
  // (content-model.ts, Page.contacts), which is where TextSection draws a
  // section's own contacts — so they are handed to it rather than drawn apart.
  const sections = page.sections.map((section, i) =>
    i === 0 && section.type === "text" && page.contacts.length > 0
      ? { ...section, contacts: [...section.contacts, ...page.contacts] }
      : section,
  );

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      <BrandStrip />
      <PageGrid>
        {/* The board draws a 150px gradient square behind the H1 (4932:576902):
            the page-title wash §44 removed on the design owner's call, not a
            new treatment. Left out, as on Charter (§52). */}
        <Title variant="page">{page.title}</Title>

        <BackNav />

        {/* 4140:246912: the children in column 1 of row 2, About's rail shape.
            `start={1}` keeps it out of row 1 beside the title. Empty — and so
            absent — while the route gate withholds all three unbuilt pages. */}
        {derived.subPageLinks.length > 0 && (
          <GridItem span="full-then-1" start={1} as="nav" aria-label={t("subPages")}>
            <LinkStack links={derived.subPageLinks} twoUp="tablet-only" />
          </GridItem>
        )}

        <PageHero hero={page.hero} />

        {page.intro && (
          <GridItem span={2} start={2}>
            <Standfirst text={page.intro} seeMore={t("seeMore")} />
          </GridItem>
        )}

        {sections.map((section) => {
          const clamp = CLAMP[section.id];
          return (
            <Fragment key={section.id}>
              <Separator />
              <SectionRenderer
                section={section}
                clamp={clamp ? { seeMore: t("seeMore"), seeLess: t("seeLess"), clamp } : undefined}
                // Every section draws a campus photograph (4140:246909–11);
                // none has an asset yet.
                imagePlaceholder
                // No craft tile beside them on this board; History's TODO.
                pattern={false}
              />
            </Fragment>
          );
        })}

        {/* The separator belongs to the band (§40). */}
        {derived.siblingBand.length > 0 && (
          <>
            <Separator />
            <SiblingBand
              items={derived.siblingBand}
              parentTitle={derived.backNav?.label ?? page.title}
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
