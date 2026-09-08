import { ThemeMotif } from "@/components/header/ThemeMotif";
import { GridItem } from "@/components/layout/GridItem";
import type { Theme } from "@/lib/theme-constants";

// One theme card on the Our Themes page (Figma 4818:705744) — a full-width
// surface drawn in its OWN theme: motif, name, and the palette's story.
//
// `data-theme` alone is the whole scoping mechanism. themes.css re-declares the
// semantic layer for a scoped descendant that does not set its own appearance,
// so the card resolves this theme's primitives in the VISITOR's light/dark
// choice — which a server component cannot know (docs/STAGE-0-NOTES.md §46).
// Adding data-appearance here would pin the card to one appearance and break
// dark mode.
//
// TODO(review): the body has NO text style in Figma — NID-CONTEXT.md Appendix B
// lists the ten Our Themes paragraphs as a casualty of the Tonos failure, so
// the board rendered them in Futura PT Medium. Their metrics (16/28, 0.01em)
// are exactly Body/Base/Regular, so the body face is used here. Tonos is wider,
// and six of the ten paragraphs run to four lines rather than the board's
// three, making those cards 160 tall instead of 132. Confirm the face, or
// shorten the copy to three Tonos lines.
//
// The inner parts are plain flex, deliberately NOT a `GridItem subgrid`: the
// card's 24px padding shifts them 24px left of the page's column origins (title
// at 354 against column 2 at 378), so snapping them to the grid would move them
// off the board.
//
// The three-part row is FOUR COLUMNS ONLY. Its bases are the board's own widths
// and sum, with the two gutters, to 1344 — exactly the card's content box at
// 1440. Three columns gives it 928, far too little, so at 3 columns the card
// takes the same stacked shape it has at 2 and 1: motif and name on one line,
// body beneath (docs/STAGE-0-NOTES.md §46).
//
// `desktop:flex-nowrap` is what makes the row a row. The container must wrap
// below 4 columns — that is how the body gets its own line — but a wrapping
// flex line WRAPS BEFORE IT SHRINKS, so between 1280 and 1439, where the box is
// narrower than 1344, the body broke onto a second line and the motif slot grew
// to swallow the slack. Suppressing the wrap at 4 columns lets the three shrink
// in proportion instead, which is what the board's widths are for.
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
