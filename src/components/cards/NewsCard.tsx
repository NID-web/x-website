import clsx from "clsx";
import { getLocale, getTranslations } from "next-intl/server";
import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import { Overline } from "@/components/home/parts";
import { Link } from "@/i18n/navigation";
import type { Page } from "@/lib/content-model";
import { formatDate } from "@/lib/content/format";
import { pagePath } from "@/lib/content/pages";

// News Article (NID-CONTEXT.md §7.7, node 3767:260302). `wide` is the
// 2-column lead — photo left, overline + headline + date right (3847:86532);
// `square` is the 1-column card, photo over headline (3758:256119). Both
// collapse to the 72px list row on the phone board (4247:264338).
//
// The item is a Page until the cards union carries NewsArticle: title is the
// headline, publishedAt the date, hero[0] the thumbnail.
export async function NewsCard({ item, variant }: { item: Page; variant: "wide" | "square" }) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("Cards")]);
  const wide = variant === "wide";
  const image = item.hero[0];
  const href = pagePath(item);
  const headline = href ? (
    <Link
      href={href}
      className="no-underline transition-colors duration-150 ease-in-out after:absolute after:inset-0 group-hover/tile:text-text-primary"
    >
      {item.title}
    </Link>
  ) : (
    item.title
  );

  return (
    <Tile
      as="article"
      surface="page"
      padding={false}
      radius={false}
      square={wide ? false : "tablet"}
      className={clsx(
        "max-tablet:flex-row max-tablet:items-center max-tablet:gap-4 max-tablet:border-b max-tablet:border-border-subtle",
        // The lead's height is one grid row — the column width — because
        // nothing square shares its row to set it (STAGE-0-NOTES.md §22).
        wide && "tablet:h-grid-column tablet:flex-row tablet:gap-6",
        !wide && "tablet:gap-2",
      )}
    >
      {image && (
        <TileImage
          media={image}
          className={clsx(
            "relative shrink-0 max-tablet:size-18",
            wide ? "tablet:h-full tablet:flex-1" : "tablet:w-full tablet:flex-1",
          )}
          sizes={
            wide
              ? "(min-width: 668px) 48vw, 72px"
              : "(min-width: 1280px) 24vw, (min-width: 668px) 48vw, 72px"
          }
        />
      )}
      <div
        className={clsx(
          "flex min-w-0 flex-1 flex-col max-tablet:gap-0.5",
          "tablet:border-b tablet:border-border-subtle tablet:pb-2",
          wide ? "tablet:h-full tablet:gap-4" : "tablet:gap-1",
        )}
      >
        {wide && (
          <div className="hidden tablet:block">
            <Overline>{t("latest")}</Overline>
          </div>
        )}
        <h3
          className={clsx(
            "font-primary max-tablet:line-clamp-1 max-tablet:text-label max-tablet:text-text-primary tablet:text-text-tertiary",
            wide ? "tablet:text-h4" : "tablet:line-clamp-4 tablet:text-h5",
          )}
        >
          {headline}
        </h3>
        {item.publishedAt && (
          <p className="font-primary max-tablet:text-micro max-tablet:text-text-tertiary tablet:mt-auto tablet:text-label tablet:text-text-quaternary">
            {formatDate(item.publishedAt, locale)}
          </p>
        )}
      </div>
    </Tile>
  );
}
