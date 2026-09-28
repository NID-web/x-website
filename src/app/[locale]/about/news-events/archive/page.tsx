import type { Metadata } from "next";
import { Fragment } from "react";
import { getLocale } from "next-intl/server";
import { ArchiveRow } from "@/components/cards/ArchiveRow";
import { GridItem } from "@/components/layout/GridItem";
import { PageGrid } from "@/components/layout/PageGrid";
import { BrandStrip } from "@/components/spine/BrandStrip";
import { Cta } from "@/components/spine/Cta";
import { Footer } from "@/components/spine/Footer";
import { Separator } from "@/components/spine/Separator";
import { Title } from "@/components/spine/Title";
import { SiblingBand } from "@/components/sections/SiblingBand";
import { ARCHIVE_SECTION, getArchive } from "@/lib/content/getArchive";

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await getArchive();
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription,
  };
}

/**
 * News & Events Archive — every item by year, from the four Archive boards
 * (NID-CONTEXT §5.5). The years arrive grouped (getArchive.ts); nothing here
 * sorts or buckets.
 */
export default async function NewsArchivePage() {
  const [{ page, derived, groupedItems, siblingBandParent }, locale] = await Promise.all([
    getArchive(),
    getLocale(),
  ]);
  const years = groupedItems[ARCHIVE_SECTION] ?? [];

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      <BrandStrip />
      <PageGrid>
        {/* Before the title in the DOM: at 2 and 1 columns the boards draw the
            back link ABOVE it (STAGE-0-NOTES §66). At 3 and 4 the page-utility
            pin puts it in row 1's last column, so nothing moves visually there.
            TODO(review): the article, News & Events, Our Themes and Director's
            Message pages still render it below the title at 2 and 1 columns;
            they probably should follow this board. */}
        {derived.backNav && (
          <GridItem span="full-then-1" place="page-utility">
            <Cta variant="primary" icon="arrow-left" label={derived.backNav.label} href={derived.backNav.href} />
          </GridItem>
        )}

        <Title variant="page">{page.title}</Title>

        {years.map((year, i) => (
          <Fragment key={year.label}>
            {i > 0 && <Separator />}
            <Title variant="section" id={year.label} anchored start={1}>
              {year.label}
            </Title>
            {/* span="hero" reuses the GEOMETRY — full, then 2 of 3 columns, then
                3 of 4 — not the meaning. These rows are not a hero; no other
                span has this shape, and adding a duplicate would not change a
                pixel. */}
            <GridItem as="ul" span="hero" start={2} aria-labelledby={year.label} className="flex flex-col gap-6">
              {year.items.map((item) => (
                <ArchiveRow key={item.id} item={item} locale={locale} />
              ))}
            </GridItem>
          </Fragment>
        ))}

        {derived.siblingBand.length > 0 && (
          <>
            <Separator />
            {/* TODO(review): SiblingBand is two-up from 2 columns; the 1024
                board stacks these one per row. Shared component, left alone. */}
            <SiblingBand items={derived.siblingBand} parentTitle={siblingBandParent} pattern={false} />
          </>
        )}

        <Separator />
        <Footer />
      </PageGrid>
      <BrandStrip logo />
    </main>
  );
}
