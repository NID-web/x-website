// The least a LIVE build may receive from the CMS before it refuses to ship
// (build-mode.ts). Each number is the live count on 24 Sep 2026, with a margin
// where the count is a list that editors grow and prune. Section counts carry
// no margin: a section is a whole unit of a page, and one fewer is a page with
// a part missing.
//
// LOWERING A FLOOR IS A DECISION, NOT A FIX. A build that fails here received
// less than the site is built to show. Lower the number only when that drop is
// intended (an article unpublished on purpose, a section retired), and say so
// in the commit.
export const CMS_FLOORS = {
  /** Routable items in the news-events document: the article routes built from
   *  the feed, and every news card's link. Live: 11. */
  articleFeed: 10,

  /** Rows /about/news-events/archive renders: listed news, events and
   *  workshops, calendar entries out, each with a built article. Live: 13. Two
   *  below it, one more than the feed's margin, because the archive also loses
   *  a row when an item lacks publishedAt — a CMS edit, not a lost response. */
  archiveItems: 11,

  /** Sections per document, keyed by slug. `our-themes` is 0 because the
   *  document has none yet; raise it when its sections land. */
  documentSections: {
    home: 4,
    "about-nid": 2,
    campuses: 2,
    "ahmedabad-campus": 2,
    "gandhinagar-campus": 1,
    "bengaluru-campus": 1,
    charter: 2,
    "directors-message": 2,
    history: 2,
    "news-events": 4,
    "our-themes": 0,
  } as Record<string, number>,

  /** Listed records across a document's STRUCTURED sections, where the page
   *  shows them as cards. Live: about-nid 5 (news), campuses 3. */
  documentItems: {
    "about-nid": 4,
    campuses: 3,
  } as Record<string, number>,

  /** The header menu's top-level sections (home document). Live: 7. */
  menuSections: 7,
  /** The footer's link list (home document). Live: 11. */
  footerLinks: 10,
  /** Featured collaboration logos. Live: 6. */
  collaborations: 5,
} as const;
