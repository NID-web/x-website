// The page ids the front end has to know by name: card kinds are chosen by an
// item's parent, and card hrefs are built from the parent's path. Both are
// derivable from Page.parent once the API serves the tree (NID-CONTEXT.md
// §8.4); until then this is the static half of that derivation.
//
// TODO(review): PageResponse gives cards items no resolved href. Propose a
// derived `path` on every Page in a response (the way MenuNode and breadcrumb
// entries carry one) so this table can go.
import type { Page, UUID } from "@/lib/content-model";

export const PAGE_ID = {
  about: "page-about",
  charter: "page-about-charter",
  directorsMessage: "page-about-directors-message",
  history: "page-about-history",
  campuses: "page-about-campuses",
  newsEvents: "page-about-news-events",
  ourThemes: "page-about-our-themes",
  studentAwards: "page-about-student-awards",
} as const;

const PATH: Record<UUID, string> = {
  [PAGE_ID.about]: "/about",
  [PAGE_ID.charter]: "/about/charter",
  [PAGE_ID.directorsMessage]: "/about/directors-message",
  [PAGE_ID.history]: "/about/history",
  [PAGE_ID.campuses]: "/about/campuses",
  [PAGE_ID.newsEvents]: "/about/news-events",
  [PAGE_ID.ourThemes]: "/about/our-themes",
  [PAGE_ID.studentAwards]: "/about/student-awards",
};

export function pathOf(id: UUID): string | undefined {
  return PATH[id];
}

/** A page's route: its parent's path plus its own slug. */
export function pagePath(page: Pick<Page, "slug" | "parent">): string | undefined {
  if (page.parent === null) return `/${page.slug}`;
  const parent = PATH[page.parent];
  return parent ? `${parent}/${page.slug}` : undefined;
}

// TODO(review): the cards union is Discipline | Programme | Page, so news
// articles, campuses and award-winning students all arrive as Page and the
// card is chosen by which page they hang off. Adding NewsArticle, Campus and
// Person to the union lets the kind come from the record instead.
export type CardKind = "news" | "campus" | "alumni";

const CARD_KIND_BY_PARENT: Record<UUID, CardKind> = {
  [PAGE_ID.newsEvents]: "news",
  [PAGE_ID.campuses]: "campus",
  [PAGE_ID.studentAwards]: "alumni",
};

export function cardKind(item: Pick<Page, "parent">): CardKind | undefined {
  return item.parent === null ? undefined : CARD_KIND_BY_PARENT[item.parent];
}
