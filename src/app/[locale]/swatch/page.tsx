import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { THEMES, APPEARANCES } from "@/lib/theme-constants";
import { PageGrid } from "@/components/layout/PageGrid";
import { GridItem } from "@/components/layout/GridItem";
import { GridOverlay } from "@/components/dev/GridOverlay";
import { ThemeControls } from "@/components/swatch/ThemeControls";
import { EnvironmentReadout } from "@/components/swatch/EnvironmentReadout";
import { GridProofCells } from "@/components/swatch/GridProof";
import { ThemePanel } from "@/components/swatch/ThemePanel";
import { TypeSpecimen } from "@/components/swatch/TypeSpecimen";
import { SpacingRadius } from "@/components/swatch/SpacingRadius";

// Internal QA surface, not a real page — never indexable.
export const metadata: Metadata = {
  robots: { index: false },
};

export default async function SwatchPage() {
  const t = await getTranslations("Swatch");

  return (
    <ThemeProvider>
      <main className="flex flex-col bg-surface-page py-12 text-text-primary">
        {/* A page is one grid (CLAUDE.md) — everything below is a direct
            child of this single PageGrid, never a nested one. */}
        <PageGrid className="gap-y-12">
          <GridItem span={4} className="flex flex-col gap-2">
            <h1 className="font-primary text-h1 text-text-primary">{t("title")}</h1>
            <p className="font-body text-body text-text-secondary">{t("subtitle")}</p>
          </GridItem>

          <GridItem span={4} className="flex flex-col gap-4">
            <h2 className="font-primary text-h3 text-text-primary">{t("controls")}</h2>
            <ThemeControls />
          </GridItem>

          <GridItem span={4} className="flex flex-col gap-4">
            <h2 className="font-primary text-h3 text-text-primary">{t("environment")}</h2>
            <EnvironmentReadout />
          </GridItem>

          <GridItem span={4} className="flex flex-col gap-2">
            <h2 className="font-primary text-h3 text-text-primary">{t("gridProof")}</h2>
            <p className="font-body text-caption text-text-tertiary">
              Press &quot;g&quot; anywhere on the page to toggle the fixed column ruler; the
              one covering the page right now is always on.
            </p>
          </GridItem>
          <GridProofCells />

          <GridItem span={4} className="flex flex-col gap-6">
            <h2 className="font-primary text-h3 text-text-primary">{t("states")}</h2>
            <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
              {THEMES.map((theme) =>
                APPEARANCES.map((appearance) => (
                  <ThemePanel key={`${theme}-${appearance}`} theme={theme} appearance={appearance} />
                )),
              )}
            </div>
          </GridItem>

          <GridItem span={4} className="flex flex-col gap-4">
            <h2 className="font-primary text-h3 text-text-primary">{t("typeSpecimen")}</h2>
            <TypeSpecimen />
          </GridItem>

          <GridItem span={4} className="flex flex-col gap-4">
            <h2 className="font-primary text-h3 text-text-primary">{t("spacingRadius")}</h2>
            <SpacingRadius />
          </GridItem>
        </PageGrid>
      </main>
      <GridOverlay alwaysOn />
    </ThemeProvider>
  );
}
