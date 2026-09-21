import type { Metadata } from "next";
import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageGrid } from "@/components/layout/PageGrid";
import { GridItem } from "@/components/layout/GridItem";
import { BackNav } from "@/components/spine/BackNav";
import { BrandStrip } from "@/components/spine/BrandStrip";
import { Footer } from "@/components/spine/Footer";
import { PageHero } from "@/components/spine/PageHero";
import { Separator } from "@/components/spine/Separator";
import { Standfirst } from "@/components/spine/Standfirst";
import { Title } from "@/components/spine/Title";
import { ContactList } from "@/components/sections/parts";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { SiblingBand } from "@/components/sections/SiblingBand";
import { getPage } from "@/lib/content/getPage";

const PATH = "/about/charter";

// TODO(review): nothing in the model says a body is clamped, so the section is
// named here — the same shape §40 uses for the featured card's lead prominence.
// Deletable the day `Section` carries the field.
const CLAMPED_SECTION = "section-charter-ten-mandates";

// TODO(review): nor which craft field a section rail draws. Seeds index
// PatternTile FIELDS, and design/assets/patterns/home-patterns.json records that
// the numbering is NOT the Figma layer numbering — PatternField1 is
// Patternimate-2 and PatternField3 is Patternimate-1. The band takes the third,
// Patternimate-3 = PatternField2 = seed 1, which SiblingBand already sets.
const SECTION_PATTERN: Record<string, number> = {
  "section-charter-mandate": 0, // 4906:365778, Patternimate-2 -> PatternField1
  "section-charter-ten-mandates": 2, // 4906:362880, Patternimate-1 -> PatternField3
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
 * Charter secondary page — the first built on `Section.type = "text"`
 * (Figma 4118:205415).
 */
export default async function CharterPage() {
  const response = await getPage(PATH);
  if (!response) notFound();
  const { page, derived } = response;
  const t = await getTranslations("Page");
  const clamp = { seeMore: t("seeMore"), seeLess: t("seeLess") };

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      <BrandStrip />
      <PageGrid>
        <Title variant="page">{page.title}</Title>

        <BackNav />

        {/* NID-CONTEXT §5.2's row 1: the rail in column 1, the hero across the
            rest. `start={1}` is load-bearing — without it the rail auto-places
            into the free cell of ROW 1, beside the page title. */}
        {page.contacts.length > 0 && (
          <GridItem span="full-then-1" start={1}>
            <ContactList contacts={page.contacts} />
          </GridItem>
        )}

        <PageHero hero={page.hero} />

        {page.intro && (
          <GridItem span={2} start={2}>
            <Standfirst text={page.intro} seeMore={t("seeMore")} />
          </GridItem>
        )}

        {page.sections.map((section) => (
          <Fragment key={section.id}>
            <Separator />
            <SectionRenderer
              section={section}
              clamp={section.id === CLAMPED_SECTION ? clamp : undefined}
              // Both boards draw a section image (4140:246793, 4140:246794) and
              // neither asset exists yet; same TODO as the hero.
              imagePlaceholder
              patternSeed={SECTION_PATTERN[section.id]}
            />
          </Fragment>
        ))}

        {/* The separator belongs to the band: with no siblings neither renders,
            and the page does not close on two rules in a row (§40). */}
        {derived.siblingBand.length > 0 && (
          <>
            <Separator />
            <SiblingBand
              items={derived.siblingBand}
              parentTitle={derived.backNav?.label ?? page.title}
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
