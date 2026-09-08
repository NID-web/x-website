import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageGrid } from "@/components/layout/PageGrid";
import { BackNav } from "@/components/spine/BackNav";
import { BrandStrip } from "@/components/spine/BrandStrip";
import { Footer } from "@/components/spine/Footer";
import { Title } from "@/components/spine/Title";
import { ThemeCard } from "@/components/themes/ThemeCard";
import { getPage } from "@/lib/content/getPage";
import { THEME_LABELS } from "@/lib/nav-content";
import { THEMES, type Theme } from "@/lib/theme-constants";

const PATH = "/about/our-themes";

// Which message holds each palette's story. Typed against Theme, so adding an
// eleventh theme to THEMES fails the build here rather than shipping a card
// with no copy — and a stray key that is not a theme fails too. The prose
// itself lives in messages/en.json because it is translatable: this page is
// code-owned (see the fixture's TODO), so it follows Home's split rather than
// the fixture-prose rule that applies to CMS pages (STAGE-0-NOTES §33).
const BODY_KEY: Record<Theme, string> = {
  peacock: "peacock",
  lotus: "lotus",
  indigo: "indigo",
  henna: "henna",
  yoga: "yoga",
  tanjore: "tanjore",
  khadi: "khadi",
  terracotta: "terracotta",
  ikkat: "ikkat",
  tiger: "tiger",
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

// Our Themes (Figma 4800:347502) — the secondary-page template with a
// code-owned body: the ten palettes, each card drawn in its own theme.
//
// The board has no separators and no sibling band, unlike News & Events, so
// neither is rendered. THEMES is the single source of which themes exist and in
// what order; this page never keeps its own list, or it would drift from the
// theme switcher the day an eleventh lands. Static: no cookies()/headers().
export default async function OurThemesPage() {
  const response = await getPage(PATH);
  if (!response) notFound();
  const { page } = response;
  const t = await getTranslations("OurThemes");

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      <BrandStrip />
      <PageGrid>
        <Title variant="page" subtitle={page.intro}>
          {page.title}
        </Title>

        <BackNav />

        {THEMES.map((theme) => (
          <ThemeCard
            key={theme}
            theme={theme}
            label={THEME_LABELS[theme]}
            body={t(BODY_KEY[theme])}
          />
        ))}

        <Footer />
      </PageGrid>
      <BrandStrip logo />
    </main>
  );
}
