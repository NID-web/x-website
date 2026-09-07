import type { Metadata } from "next";
import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageGrid } from "@/components/layout/PageGrid";
import { GridItem } from "@/components/layout/GridItem";
import { TileImage } from "@/components/home/TileImage";
import { BrandStrip } from "@/components/spine/BrandStrip";
import { Footer } from "@/components/spine/Footer";
import { Separator } from "@/components/spine/Separator";
import { Standfirst } from "@/components/spine/Standfirst";
import { Title } from "@/components/spine/Title";
import { ContactList, LinkStack } from "@/components/sections/parts";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { getPage } from "@/lib/content/getPage";

const PATH = "/about";

export async function generateMetadata(): Promise<Metadata> {
  const response = await getPage(PATH);
  if (!response) return {};
  const { page } = response;
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.intro?.slice(0, 160),
  };
}

// The About NID landing (Figma 3754:240099) — the first page through the
// content model, and the shape every primary page takes (NID-CONTEXT.md §5.2):
// title, sub-page links in the rail beside the hero, the standfirst, then the
// sections and the footer, all direct children of one PageGrid. Static: no
// cookies()/headers().
export default async function AboutPage() {
  const response = await getPage(PATH);
  if (!response) notFound();
  const { page, derived } = response;
  const t = await getTranslations("Page");
  const hero = page.hero[0];

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      <BrandStrip className="mb-[calc(2*var(--nid-grid-row-gap))]" />
      <PageGrid>
        <Title variant="page">{page.title}</Title>

        {derived.subPageLinks.length > 0 && (
          <GridItem span="full-then-1" start={1} as="nav" aria-label={t("subPages")}>
            <LinkStack
              links={derived.subPageLinks.map((link) => ({
                id: link.href,
                label: link.label,
                targetType: "external" as const,
                url: link.href,
              }))}
              twoUpAtTablet
            />
          </GridItem>
        )}

        {hero && (
          <GridItem span="hero">
            {/* The one rounded corner on the page (NID-CONTEXT.md §8.6); the
                crop steps 2.2:1 → 2:1 → 16:9 → 4:3 with the column count (§5.3). */}
            <TileImage
              media={hero}
              priority
              className="relative aspect-[4/3] w-full rounded-tl-hero tablet:aspect-video laptop:aspect-[2/1] desktop:aspect-[2.2/1]"
              sizes="(min-width: 1280px) 1038px, (min-width: 1024px) 64vw, 96vw"
            />
          </GridItem>
        )}

        {page.intro && (
          <GridItem span={2} start={2}>
            <Standfirst text={page.intro} seeMore={t("seeMore")} />
          </GridItem>
        )}
        {page.contacts.length > 0 && (
          <GridItem span={1}>
            <ContactList contacts={page.contacts} />
          </GridItem>
        )}

        {page.sections.map((section) => (
          <Fragment key={section.id}>
            <Separator />
            <SectionRenderer section={section} />
          </Fragment>
        ))}

        <Separator />
        <Footer />
      </PageGrid>
      <BrandStrip className="mt-[calc(2*var(--nid-grid-row-gap))]" logo />
    </main>
  );
}
