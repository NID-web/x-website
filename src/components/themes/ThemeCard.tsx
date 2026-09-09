import { ThemeMotif } from "@/components/header/ThemeMotif";
import { GridItem } from "@/components/layout/GridItem";
import type { Theme } from "@/lib/theme-constants";

/**
 * Theme card on the Our Themes page displaying a theme's motif, name, and description.
 * Scoped to its own theme via `data-theme`.
 */
export function ThemeCard({
  theme,
  label,
  body,
}: {
  theme: Theme;
  label: string;
  body?: string;
}) {
  return (
    <GridItem span={4}>
      <article
        data-theme={theme}
        className="flex flex-wrap items-center gap-x-gutter gap-y-4 bg-surface-raised px-margin py-6 desktop:flex-nowrap"
      >
        <span className="flex flex-[0_0_auto] items-center justify-center desktop:flex-[1_1_282px]">
          <ThemeMotif theme={theme} size="card" />
        </span>
        <h2 className="flex-[1_1_auto] font-primary text-h2 text-text-tertiary desktop:flex-[0_1_330px]">
          {label}
        </h2>
        {body && (
          <p className="flex-[1_1_100%] font-body text-body text-text-primary desktop:flex-[0_1_684px]">
            {body}
          </p>
        )}
      </article>
    </GridItem>
  );
}
