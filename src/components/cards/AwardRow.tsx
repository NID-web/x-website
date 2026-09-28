import { LinkedRow, RowHeadline } from "@/components/cards/LinkedRow";
import { Overline } from "@/components/home/parts";
import { TileImage } from "@/components/home/TileImage";
import { ImagePlaceholder } from "@/components/spine/ImagePlaceholder";
import type { Page } from "@/lib/content-model";
import { awardOf } from "@/lib/content/editorial";

const PORTRAIT = "[grid-area:portrait] size-20 rounded-full tablet:size-30 desktop:size-20";

/**
 * One award, on the shared LinkedRow shell. Three layouts, one DOM order —
 * portrait, story, arrow — placed by named grid areas:
 *
 *   4 columns     portrait 80 · story · arrow            row 96, or 114 when
 *   2–3 columns   portrait 120 · story · arrow           the detail wraps; 136
 *   1 column      [portrait 80 ··· arrow] / story        stacked, gap 8
 *
 * Its own grid inside its GridItem, NOT a subgrid: the portrait/story split is
 * not on the page's columns.
 *
 * Known limitation: no award has a page (sitemap.json has no award route), so
 * `href` is never set today and the row renders without a link, arrow or hover.
 * TODO(review): designer — every row on the board carries an arrow; what should
 * a row open? The CMS keeps one document per award, which suggests a page.
 */
export function AwardRow({ item, href }: { item: Page; href?: string }) {
  const award = awardOf(item);
  if (!award) return null;
  const portrait = item.hero[0];

  return (
    <LinkedRow
      href={href}
      className="grid grid-cols-[80px_1fr] gap-x-4 gap-y-2 [grid-template-areas:'portrait_arrow'_'story_story'] tablet:min-h-34 tablet:grid-cols-[120px_1fr_24px] tablet:items-center tablet:gap-x-6 tablet:[grid-template-areas:'portrait_story_arrow'] desktop:min-h-24 desktop:grid-cols-[80px_1fr_24px]"
      arrowClassName="[grid-area:arrow] justify-self-end self-center"
    >
      {/* Decorative: the name beside it says who it is. The circle is always
          drawn — a list reads as a column — as the flat placeholder when there
          is no photo (getAwards.ts treats a stand-in or 404 as none). The
          luminosity blend takes the photo's light and the page surface's hue,
          so the face reads as a greyscale in every theme. */}
      {portrait ? (
        <TileImage
          media={{ ...portrait, alt: "" }}
          sizes="120px"
          backer={false}
          className={`relative mix-blend-luminosity ${PORTRAIT}`}
        />
      ) : (
        <span className={`overflow-hidden ${PORTRAIT}`}>
          <ImagePlaceholder className="h-full" />
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-1 [grid-area:story]">
        {/* TODO(review): designer — the component sets the award in
            text/quaternary, below AA by design (CLAUDE.md); the award name is
            information, so it takes the overline's tertiary tone. */}
        <Overline withRule={false} dark wrap capTrim>
          {award.award}
        </Overline>
        <RowHeadline className="font-primary text-h5 text-text-primary">{item.title}</RowHeadline>
        <span className="font-primary text-meta text-text-secondary">{award.project}</span>
        {/* Clamped on purpose: a summary, as the component specifies; the full
            text belongs on the award's page. */}
        {item.intro && <p className="line-clamp-2 font-body text-caption text-text-tertiary">{item.intro}</p>}
      </div>
    </LinkedRow>
  );
}
