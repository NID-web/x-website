import clsx from "clsx";
import { getLocale, getTranslations } from "next-intl/server";
import { Tile } from "@/components/home/Tile";
import { TileImage } from "@/components/home/TileImage";
import { Overline } from "@/components/home/parts";
import { Link } from "@/i18n/navigation";
import type { Page } from "@/lib/content-model";
import { formatDate } from "@/lib/content/format";
import { pagePath } from "@/lib/content/pages";

/**
 * News Article card supporting feature, wide, and square variants.
 */
export async function NewsCard({
  item,
  variant,
}: {
  item: Page;
  variant: "wide" | "square" | "feature";
}) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("Cards")]);
  const feature = variant === "feature";
  const wide = variant === "wide";
  const spread = wide || feature;
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
      square={spread ? false : "tablet"}
      className={clsx(
        "max-tablet:flex-row max-tablet:items-center max-tablet:gap-4 max-tablet:border-b max-tablet:border-border-subtle",
        wide && "tablet:h-grid-column tablet:flex-row tablet:gap-6",
        feature &&
          "tablet:flex-row tablet:gap-6 tablet:max-laptop:h-grid-column col-span-full laptop:grid laptop:grid-cols-subgrid",
        !spread && "tablet:gap-2",
      )}
    >
      {image && (
        <TileImage
          media={image}
          className={clsx(
            "relative shrink-0 max-tablet:size-18",
            spread ? "tablet:h-full tablet:flex-1" : "tablet:w-full tablet:flex-1",
            feature && "laptop:col-span-1 laptop:aspect-square laptop:h-auto desktop:col-span-2",
          )}
          sizes={
            spread
              ? "(min-width: 668px) 48vw, 72px"
              : "(min-width: 1280px) 24vw, (min-width: 668px) 48vw, 72px"
          }
        />
      )}
      <div
        className={clsx(
          "flex min-w-0 flex-1 flex-col max-tablet:gap-0.5",
          "tablet:border-b tablet:border-border-subtle tablet:pb-2",
          spread ? "tablet:h-full tablet:gap-4" : "tablet:gap-1",
          feature && "laptop:col-span-1",
        )}
      >
        {spread && (
          <div className="hidden tablet:block">
            <Overline>{t("latest")}</Overline>
          </div>
        )}
        <h3
          className={clsx(
            "font-primary max-tablet:line-clamp-1 max-tablet:text-label max-tablet:text-text-primary tablet:text-text-tertiary",
            spread ? "tablet:text-h4" : "tablet:line-clamp-4 tablet:text-h5",
            feature && "laptop:text-h3",
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
