// The secondary template: a child page — title with the back link in column 4,
// the key-info rail in column 1 beside the hero, the standfirst, sections, the
// sibling band. Generalised from the campus template (STAGE-0-NOTES §57, §70):
// the three campus pages and the programme pages render it, each through a thin
// route file — a `[slug]` folder would make the route gate accept any child and
// lose its ability to withhold a dead link (§57). What differs per page is props
// and data, never a branch on which page this is.
import type { Metadata } from "next";
import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageGrid } from "@/components/layout/PageGrid";
import { GridItem } from "@/components/layout/GridItem";
import { BackNav } from "@/components/spine/BackNav";
import { BrandStrip } from "@/components/spine/BrandStrip";
import type { Clamp } from "@/components/spine/ClampedProse";
import { Cta } from "@/components/spine/Cta";
import { Footer } from "@/components/spine/Footer";
import { PageHero } from "@/components/spine/PageHero";
import { Separator } from "@/components/spine/Separator";
import { Standfirst } from "@/components/spine/Standfirst";
import { Title } from "@/components/spine/Title";
import { ContactList } from "@/components/sections/parts";
import { SectionRenderer, hasContent } from "@/components/sections/SectionRenderer";
import { SiblingBand } from "@/components/sections/SiblingBand";
import { getPage, type PageData } from "@/lib/content/getPage";

/** Per-page presentation the model has no field for, named by section id (the
 *  §40 / §52 precedent). */
export interface SecondaryLayout {
  /** Which bodies clamp behind "See more", and at how many lines. */
  clamp?: Record<string, Clamp>;
  /** Sections whose board draws a photograph: the flat placeholder until one lands. */
  imaged?: ReadonlySet<string>;
  /** Links sections laid two-up across columns 2–3. */
  twoUpLinks?: ReadonlySet<string>;
  /** Links sections that are lists of documents: one row each across columns
   *  2–3, contacts in column 4 (§76). */
  documentLists?: ReadonlySet<string>;
  /** A text section whose links render as filled buttons (Apply). */
  filledLinks?: string;
  /** The band's own title where a board names it ("Other campuses"); otherwise
   *  "More in {parent}". */
  siblingTitle?: "otherCampuses";
  /** Where the back link goes with no usable trail (BackNav's fallback). */
  backFallback?: string;
  /** False: no hero, no box — the rail and standfirst close up, and a hero
   *  that 404s is removed too (PageHero's article rule, §59/§63). The campus
   *  boards draw the flat placeholder as a designed empty state, so it stays
   *  on by default. `"stand-in"`: the box while there is no hero, else the
   *  `false` path (the Study pages, §77). */
  heroPlaceholder?: boolean | "stand-in";
  /** A title in column 1 beside the standfirst — the discipline board's
   *  "Overview". The standfirst itself is unchanged. */
  introTitle?: string;
  /** Rail sections three across with the role overline (the discipline
   *  board's Faculty, STAGE-0-NOTES §72). */
  railThreeUp?: boolean;
  /** A text section in the split layout: sub-title and prose beside a photo. */
  split?: string;
}

export async function secondaryMetadata(path: string): Promise<Metadata> {
  const response = await getPage(path);
  if (!response) return {};
  const { page } = response;
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.intro?.slice(0, 160),
  };
}

export async function SecondaryTemplate({
  path,
  clamp = {},
  imaged,
  twoUpLinks,
  documentLists,
  filledLinks,
  siblingTitle,
  backFallback,
  heroPlaceholder = true,
  introTitle,
  railThreeUp = false,
  split,
  response: given,
}: {
  path: string;
  /** The page, when it does not come from getPage (a discipline, getDiscipline.ts). */
  response?: PageData;
} & SecondaryLayout) {
  const response = given ?? (await getPage(path));
  if (!response) notFound();
  const { page, derived } = response;
  const t = await getTranslations("Page");
  // The rail's filled buttons, labelled by the events rail's keys. The labels
  // load only where there are buttons, so a campus page awaits exactly what it
  // always did.
  const railLinks = response.railLinks ?? [];
  const buttons = railLinks.length
    ? await getTranslations("Article").then((ta) => railLinks.map((link) => ({ ...link, label: ta(link.key) })))
    : [];

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

        {/* BackNav is a client component: a fallback prop that is merely
            undefined still reaches its serialized props, so a page without one
            renders the exact element it always did. */}
        {backFallback ? <BackNav fallback={backFallback} /> : <BackNav />}

        {/* The rail: key info, then the filled buttons (the events rail's
            order, §68). Without buttons it is the element the campus pages have
            always rendered. */}
        {buttons.length > 0 ? (
          <GridItem span="full-then-1" start={1} className="flex flex-col gap-6">
            {page.keyInfo.length > 0 && <ContactList contacts={page.keyInfo} />}
            {buttons.map((button) => (
              <Cta key={button.key} variant="filled" label={button.label} href={button.url} external />
            ))}
          </GridItem>
        ) : (
          page.keyInfo.length > 0 && (
            <GridItem span="full-then-1" start={1}>
              <ContactList contacts={page.keyInfo} />
            </GridItem>
          )
        )}

        {/* TODO(review): designer — the B.Des board's hero is 1200:628, its
            photo's own ratio; PageHero keeps the secondary crop (2.2:1 at 1440). */}
        <PageHero hero={page.hero} placeholder={heroPlaceholder} />

        {/* TODO(review): designer — the B.Des board sets the standfirst in
            Body/Large/Bold; Standfirst is Regular from 768 up, as every page. */}
        {/* Without a title, the element every page has always rendered; an
            extra child slot would still reach the RSC payload. */}
        {page.intro &&
          (introTitle ? (
            [
              <Title key="intro-title" variant="section" start={1}>
                {introTitle}
              </Title>,
              <GridItem key="intro" span={2} start={2}>
                <Standfirst text={page.intro} seeMore={t("seeMore")} />
              </GridItem>,
            ]
          ) : (
            <GridItem span={2} start={2}>
              <Standfirst text={page.intro} seeMore={t("seeMore")} />
            </GridItem>
          ))}

        {sections.map((section) => {
          const sectionClamp = clamp[section.id];
          return (
            <Fragment key={section.id}>
              <Separator />
              <SectionRenderer
                section={section}
                clamp={sectionClamp ? { seeMore: t("seeMore"), seeLess: t("seeLess"), clamp: sectionClamp } : undefined}
                imagePlaceholder={imaged?.has(section.id) ?? false}
                pattern={false}
                linksLayout={
                  documentLists?.has(section.id) ? "documents" : twoUpLinks?.has(section.id) ? "two-up" : undefined
                }
                groups={response.groupedItems?.[section.id]}
                filledLinks={section.id === filledLinks}
                railThreeUp={railThreeUp}
                railOverline={railThreeUp}
                split={section.id === split}
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
              title={siblingTitle ? t(siblingTitle) : undefined}
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
