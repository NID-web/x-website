import type { Metadata } from "next";
import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PersonCard } from "@/components/cards/PersonCard";
import { GridItem } from "@/components/layout/GridItem";
import { PageGrid } from "@/components/layout/PageGrid";
import { BackNav } from "@/components/spine/BackNav";
import { Blockquote } from "@/components/spine/Blockquote";
import { BrandStrip } from "@/components/spine/BrandStrip";
import { Footer } from "@/components/spine/Footer";
import { Separator } from "@/components/spine/Separator";
import { Title } from "@/components/spine/Title";
import { SectionBody } from "@/components/sections/parts";
import { SiblingBand } from "@/components/sections/SiblingBand";
import { pullQuoteOf } from "@/lib/content/editorial";
import { getPage } from "@/lib/content/getPage";

const PATH = "/about/directors-message";

// TODO(review): which bodies clamp is named here, as on Charter and History
// (STAGE-0-NOTES §52) — the model has no field for it. Both use ClampedProse's
// existing nine lines; the board draws 270px over full texts of 990 and 1590,
// which is the same nine lines and not taken as a separate spec. The opening
// paragraph never clamps.
const CLAMPED = new Set(["section-dm-body-1", "section-dm-body-2"]);

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
 * Director's Message — a long-read essay in columns 2–3 (STAGE-0-NOTES §60).
 * Column 1 below the title and column 4 throughout are empty by design: no
 * hero, no key-info rail, no pattern tiles.
 */
export default async function DirectorsMessagePage() {
  const response = await getPage(PATH);
  if (!response) notFound();
  const { page, derived } = response;
  const t = await getTranslations("Page");

  // The Person card is the page's key info (role → name) and its only image.
  const director = page.keyInfo[0];
  const portrait = page.hero[0];
  const sections = page.sections.filter((s) => s.body?.trim());

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      <BrandStrip />
      <PageGrid>
        <Title variant="page">{page.title}</Title>

        {/* TODO(review): designer — every other About NID child has "About NID"
            in column 4 of row 1; this board draws nothing there. Rendered as on
            the siblings (the session back link, which only appears when the
            visitor arrived from another page) until the board says otherwise. */}
        <BackNav />

        {/* One subgrid on the page's own tracks, so the essay is a single
            <article> without a second grid or a second margin (§33, §40). */}
        <GridItem subgrid span={4} as="article">
          {director && (
            <GridItem span={1} start={2}>
              <PersonCard
                person={{
                  id: "director",
                  name: director.value,
                  slug: "director",
                  role: "staff",
                  designation: director.label,
                  ...(portrait ? { photo: portrait } : {}),
                }}
                overline
                placeholder={false}
              />
            </GridItem>
          )}

          {sections.map((section) => {
            const quote = pullQuoteOf(section);
            return (
              <Fragment key={section.id}>
                {quote && <Blockquote quote={quote} />}
                <SectionBody
                  body={section.body!}
                  clamp={
                    CLAMPED.has(section.id)
                      ? { seeMore: t("seeMore"), seeLess: t("seeLess") }
                      : undefined
                  }
                />
              </Fragment>
            );
          })}
        </GridItem>

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
