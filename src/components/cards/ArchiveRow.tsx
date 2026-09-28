import clsx from "clsx";
import { TileImage } from "@/components/home/TileImage";
import { ImagePlaceholder } from "@/components/spine/ImagePlaceholder";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";
import type { Page } from "@/lib/content-model";
import { formatArchiveDate } from "@/lib/content/format";
import { cardHref } from "@/lib/content/links";

/**
 * One archive row: the whole row is the link. Three layouts by breakpoint, one
 * DOM order — thumb, [date, title], arrow:
 *
 *   4 columns     date (132) · thumb 80 · title · arrow   — the text wrapper is
 *                 `display: contents` and the date takes `order` to lead
 *   2–3 columns   thumb 80 · date over title · arrow
 *   1 column      thumb 64 · date over title · arrow, gap 16
 *
 * The thumb square is drawn in every row, as the flat placeholder when there is
 * no photo or its file does not serve (getArchive.ts), so the titles align.
 *
 * Plain flex inside its GridItem, NOT a subgrid: at 1440 the thumb lands at
 * x 534 and the title at x 638, and neither is a column origin (732), so the
 * row's parts are sized from the row, as Our Themes' card is (STAGE-0-NOTES §46).
 *
 * Rows grow. The board's text box is a fixed height that clips at 2 and 1
 * columns; a wrapped headline here makes the row taller instead.
 */
export function ArchiveRow({ item, locale }: { item: Page; locale: string }) {
  // getArchive keeps only rows whose article is built; nothing reaches here
  // without a destination, and a row with none is not drawn.
  const href = cardHref(item);
  if (!href || !item.publishedAt) return null;
  const thumb = item.hero[0];

  return (
    <li>
      <Link
        href={href}
        className={clsx(
          // 8 / 80 / 7 + the 1px rule = the board's 96 (80 on the phone, thumb
          // 64): the rule is inside the row's height, as Cta's primary row does
          // it, so the 120 pitch holds.
          "group flex min-h-20 items-center gap-4 border-b border-border-subtle pt-2 pb-1.75 no-underline",
          "transition-colors duration-150 ease-in-out hover:border-border-default",
          "tablet:min-h-24 tablet:gap-6",
        )}
      >
        {/* The square is always there: a list reads as a column, and a title
            that jumped 104px sideways on a row without a photo would break it.
            TODO(review): this is the opposite of the article rule, where a
            missing hero draws NO box (STAGE-0-NOTES §59) — there the box would
            read as a broken photograph above the text; here it holds the
            column every other row is aligned to. */}
        {thumb ? (
          <TileImage media={thumb} sizes="80px" className="relative size-16 shrink-0 tablet:size-20" />
        ) : (
          <span className="size-16 shrink-0 tablet:size-20">
            <ImagePlaceholder className="h-full" />
          </span>
        )}
        <span className="flex min-w-0 flex-1 flex-col gap-1 desktop:contents">
          {/* TODO(review): designer — the component sets the date in
              text/quaternary at 2 and 1 columns, which is below AA by design
              (CLAUDE.md). A date carries meaning, so it is text/tertiary at
              every width. */}
          <time
            dateTime={item.publishedAt}
            className="font-primary text-micro text-text-tertiary tablet:text-meta desktop:order-first desktop:w-33 desktop:shrink-0"
          >
            {formatArchiveDate(item.publishedAt, locale)}
          </time>
          <span
            className={clsx(
              "font-primary text-h6 text-text-secondary transition-colors duration-150 ease-in-out tablet:text-h5",
              // TODO(review): designer — the component draws the title
              // text/primary at 4 columns and text/secondary at 2 and 1. Kept
              // as drawn, not resolved.
              "desktop:min-w-0 desktop:flex-1 desktop:text-text-primary",
              // Restated at desktop, or desktop:text-text-primary would
              // outrank the hover colour there.
              "group-hover:text-accent-primary desktop:group-hover:text-accent-primary",
            )}
          >
            {item.title}
          </span>
        </span>
        <span className="flex size-6 shrink-0 items-center justify-center">
          <Icon
            name="arrow-up-right"
            className="size-4 text-icon-quaternary transition-colors duration-150 ease-in-out group-hover:text-icon-secondary"
          />
        </span>
      </Link>
    </li>
  );
}
