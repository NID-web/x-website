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
import { ContactList } from "@/components/sections/parts";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { SiblingBand } from "@/components/sections/SiblingBand";
import { getPage } from "@/lib/content/getPage";

const PATH = "/about/history";

// TODO(review): which bodies clamp, and how, is named here for the same reason
// as Charter's CLAMPED_SECTION (STAGE-0-NOTES §52) — the model has no field for
// it. Counts are the lines of TEXT each board shows, not its height ÷ 30: the
// board's 300 / 240 / 210px (4361:189675, 4386:185456, 4361:189716) include the
// blank lines it uses between paragraphs, so they are 9, 7 and 4 lines of copy.
// Read at 10 / 8 / 7, all three "See more"s at 768 and up revealed nothing —
// measured, STAGE-0-NOTES §55. Faculty Stalwarts is plain at 1440 and clipped
// to seven lines at 390 (4382:185448), which is exactly `phone-7`; clamped at
// nine everywhere it fits in nine at 1440 and the control was dead. The India
// Report is drawn in a 112px clip around 150px of text with NO "See more" — a
// clip with no disclosure is not a pattern this site has, and the 390 clip
// clips nothing — so it renders whole.
const CLAMP: Record<string, Clamp> = {
  "section-history-origins": 9,
  "section-history-sarabhais": 7,
  "section-history-past-directors": 4,
  "section-history-faculty-stalwarts": "phone-7",
};

// The four sections the boards draw an image for (4140:246860–63). The India
// Report has none, and Faculty Stalwarts has its people instead.
const IMAGED = new Set([
  "section-history-origins",
  "section-history-sarabhais",
  "section-history-convocation",
  "section-history-past-directors",
]);


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
 * History secondary page (Figma 4118:208773, mobile 4184:252521) — Charter's
 * template with key info in the rail and the first `rail` section.
 */
export default async function HistoryPage() {
  const response = await getPage(PATH);
  if (!response) notFound();
  const { page, derived } = response;
  const t = await getTranslations("Page");

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      <BrandStrip />
      <PageGrid>
        <Title variant="page">{page.title}</Title>

        <BackNav />

        {/* 4683:398284: the key-info rail, column 1 beside the hero; a band
            after the title below 3 columns. `start={1}` keeps it out of the
            free cell of row 1, beside the page title. */}
        {page.keyInfo.length > 0 && (
          <GridItem span="full-then-1" start={1}>
            <ContactList contacts={page.keyInfo} />
          </GridItem>
        )}

        <PageHero hero={page.hero} />

        {page.intro && (
          <GridItem span={2} start={2}>
            <Standfirst text={page.intro} seeMore={t("seeMore")} />
          </GridItem>
        )}

        {page.sections.map((section) => {
          const clamp = CLAMP[section.id];
          return (
            <Fragment key={section.id}>
              <Separator />
              <SectionRenderer
                section={section}
                clamp={clamp ? { seeMore: t("seeMore"), seeLess: t("seeLess"), clamp } : undefined}
                imagePlaceholder={IMAGED.has(section.id)}
                // TODO(review): designer — Charter pairs each section image with
                // a craft tile in the rail; History's 1440 board instances none.
                // Meant, or not yet drawn? (STAGE-0-NOTES §50 has the rail cell
                // existing at 3 columns too.)
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
              // No craft tile here either (4315:276234); same TODO as above.
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
