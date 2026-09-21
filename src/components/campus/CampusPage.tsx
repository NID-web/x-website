// The campus detail template (Figma 4119:224215, 4119:227603, 4119:230966):
// Campuses' secondary template with History's key-info rail. One template, three
// thin route files — a `[campus]` folder would make the route gate accept any
// /about/campuses/x and lose its ability to withhold a dead link (§57).
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
import { SectionRenderer, hasContent } from "@/components/sections/SectionRenderer";
import { SiblingBand } from "@/components/sections/SiblingBand";
import { getPage } from "@/lib/content/getPage";

// TODO(review): which bodies clamp, named here as on Charter, History and
// Campuses (STAGE-0-NOTES §52), counted in lines of TEXT per §55. Ahmedabad's
// and Gandhinagar's About boards draw a "See more" over a full text no longer
// than the visible one — eight lines both — so the control appears only when
// the CMS copy runs longer. Bengaluru's About shows its first paragraph, 7 of
// 13 lines (210px); Research Labs 6 of 9 (240px, two blank lines drawn).
// Measured against the board copy at 684px. Gandhinagar's Workshops body has
// no "See more" on the board and gets none.
const CLAMP: Record<string, Clamp> = {
  "section-ahmedabad-about": 8,
  "section-gandhinagar-about": 8,
  "section-bengaluru-about": 7,
  "section-bengaluru-research": 6,
};

// The sections each board draws a photograph for (4141:246838/39, 246905/06,
// 246952/53). None has an asset yet.
const IMAGED = new Set([
  "section-ahmedabad-about",
  "section-ahmedabad-workshops",
  "section-gandhinagar-about",
  "section-gandhinagar-workshops",
  "section-bengaluru-about",
  "section-bengaluru-research",
]);

// Ahmedabad's Centre links run two-up across columns 2–3 (4132:246478).
const TWO_UP_LINKS = new Set(["section-ahmedabad-services"]);

export async function campusMetadata(path: string): Promise<Metadata> {
  const response = await getPage(path);
  if (!response) return {};
  const { page } = response;
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.intro?.slice(0, 160),
  };
}

export async function CampusPage({ path }: { path: string }) {
  const response = await getPage(path);
  if (!response) notFound();
  const { page, derived } = response;
  const t = await getTranslations("Page");

  // Page contacts surface in column 4 of the first text section (the model's
  // placement; Campuses' precedent). Sections with nothing to show are skipped
  // HERE, not only in SectionRenderer, so their separator goes with them — an
  // unroutable links section or a note-only body would otherwise leave two
  // rules in a row.
  const sections = page.sections
    .map((section, i) =>
      i === 0 && section.type === "text" && page.contacts.length > 0
        ? { ...section, contacts: [...section.contacts, ...page.contacts] }
        : section,
    )
    .filter(hasContent);

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      <BrandStrip />
      <PageGrid>
        {/* The boards' gradient triangle / square behind the H1 is the title
            wash §44 removed; closed, §56. */}
        <Title variant="page">{page.title}</Title>

        <BackNav />

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

        {sections.map((section) => {
          const clamp = CLAMP[section.id];
          return (
            <Fragment key={section.id}>
              <Separator />
              <SectionRenderer
                section={section}
                clamp={clamp ? { seeMore: t("seeMore"), seeLess: t("seeLess"), clamp } : undefined}
                imagePlaceholder={IMAGED.has(section.id)}
                pattern={false}
                linksLayout={TWO_UP_LINKS.has(section.id) ? "two-up" : undefined}
              />
            </Fragment>
          );
        })}

        {derived.siblingBand.length > 0 && (
          <>
            <Separator />
            <SiblingBand
              items={derived.siblingBand}
              parentTitle={derived.backNav?.label ?? page.title}
              title={t("otherCampuses")}
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
