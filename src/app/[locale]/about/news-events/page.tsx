import type { Metadata } from "next";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { PageGrid } from "@/components/layout/PageGrid";
import { BackNav } from "@/components/spine/BackNav";
import { BrandStrip } from "@/components/spine/BrandStrip";
import { Footer } from "@/components/spine/Footer";
import { Separator } from "@/components/spine/Separator";
import { Title } from "@/components/spine/Title";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { SiblingBand } from "@/components/sections/SiblingBand";
import { getPage } from "@/lib/content/getPage";

const PATH = "/about/news-events";

/** The section whose lead card is drawn at feature size (4199:303897). A
 *  presentation choice the model cannot express — see CardsSection's `lead`. */
const FEATURED_SECTION = "section-news-featured";

export async function generateMetadata(): Promise<Metadata> {
  const response = await getPage(PATH);
  if (!response) return {};
  const { page } = response;
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.intro?.slice(0, 160),
  };
}

// News & Events (Figma 4123:240887) — the shape every SECONDARY page takes: the
// back-nav in the page's utility slot beside the title, the sections, then the
// sibling band before the footer. Back-nav and band both come from `derived`,
// never from a section. Static: no cookies()/headers().
//
// Unlike About, no separator divides the title row from the first section: the
// board runs the Featured title straight under it on the row gap alone.
export default async function NewsEventsPage() {
  const response = await getPage(PATH);
  if (!response) notFound();
  const { page, derived } = response;

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      <BrandStrip />
      <PageGrid>
        <Title variant="page">{page.title}</Title>

        <BackNav />

        {page.sections.map((section, i) => (
          <Fragment key={section.id}>
            {i > 0 && <Separator />}
            <SectionRenderer
              section={section}
              lead={section.id === FEATURED_SECTION ? "feature" : "wide"}
            />
          </Fragment>
        ))}

        {/* The separator belongs to the band: with no siblings neither renders,
            and the page does not close on two rules in a row. */}
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
