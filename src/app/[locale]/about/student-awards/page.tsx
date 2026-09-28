import type { Metadata } from "next";
import { AwardRow } from "@/components/cards/AwardRow";
import { RowGroup } from "@/components/cards/RowGroup";
import { GridItem } from "@/components/layout/GridItem";
import { PageGrid } from "@/components/layout/PageGrid";
import { BrandStrip } from "@/components/spine/BrandStrip";
import { Cta } from "@/components/spine/Cta";
import { Footer } from "@/components/spine/Footer";
import { Separator } from "@/components/spine/Separator";
import { Title } from "@/components/spine/Title";
import { SiblingBand } from "@/components/sections/SiblingBand";
import { AWARDS_SECTION, getAwards } from "@/lib/content/getAwards";

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await getAwards();
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription,
  };
}

/**
 * Student Awards Gallery — the archive's template with award rows, from the
 * four gallery boards (NID-CONTEXT §5.5). The records arrive grouped
 * (getAwards.ts); nothing here sorts or buckets.
 */
export default async function StudentAwardsPage() {
  const { page, derived, groupedItems, siblingBandParent } = await getAwards();
  const groups = groupedItems[AWARDS_SECTION] ?? [];

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      <BrandStrip />
      <PageGrid>
        {/* Before the title in the DOM, as on the archive (STAGE-0-NOTES §66). */}
        {derived.backNav && (
          <GridItem span="full-then-1" place="page-utility">
            <Cta variant="primary" icon="arrow-left" label={derived.backNav.label} href={derived.backNav.href} />
          </GridItem>
        )}

        <Title variant="page">{page.title}</Title>

        {groups.map((group, i) => (
          <RowGroup key={group.label} title={group.label} id={`awards-${i + 1}`}>
            {group.items.map((item) => (
              <AwardRow key={item.id} item={item} />
            ))}
          </RowGroup>
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
