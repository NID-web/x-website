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

/** Maps each theme to its translation key in the "OurThemes" message namespace. */
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

/**
 * Our Themes secondary landing page presenting all ten theme palettes.
 */
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
