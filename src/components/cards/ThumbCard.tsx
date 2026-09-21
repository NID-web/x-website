// The library's Thumb card as the campus boards instance it (4260:264431):
// square image on the left, half the card; title and a short meta line on the
// right. NID-CONTEXT §7.6 — the `Minimal` variant, meta in one string.
import { TileImage } from "@/components/home/TileImage";
import { Link } from "@/i18n/navigation";
import type { Page } from "@/lib/content-model";
import { cardHref } from "@/lib/content/links";

export function ThumbCard({ item }: { item: Page }) {
  const image = item.hero[0];
  // Unlinked, not dropped, when the record has no built route (links.ts) —
  // which is every discipline today.
  const href = cardHref(item);
  return (
    <article className="group/thumb relative flex items-center gap-4">
      {image ? (
        <TileImage
          media={image}
          className="relative aspect-square flex-1"
          sizes="(min-width: 1280px) 157px, (min-width: 668px) 24vw, 48vw"
        />
      ) : (
        <span aria-hidden="true" className="block aspect-square flex-1 bg-accent-subtle" />
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <h3 className="font-primary text-h6 text-text-primary">
          {href ? (
            <Link
              href={href}
              className="no-underline transition-colors duration-150 ease-in-out after:absolute after:inset-0 group-hover/thumb:text-text-secondary"
            >
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </h3>
        {item.intro && (
          <p className="font-primary text-micro text-text-secondary">{item.intro}</p>
        )}
      </div>
    </article>
  );
}
