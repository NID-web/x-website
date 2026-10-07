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

  /** Award rows on /about/student-awards (records with a recipient), which
   *  also feed About's two. Live: 8, all curated in one section. */
  awardItems: 7,

  /** Sections per document, keyed by slug. `our-themes` is 0 because the
   *  document has none yet; raise it when its sections land. */
  documentSections: {
    // The generic home document: its own static content only ("Position
    // Statement", "NID Film"); structured content comes from
    // /public/content-items (backend decision, 7 Oct 2026). Was 4.
    home: 2,
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
    programmes: 2,
    bdes: 2,
    mdes: 2,
    phd: 1,
    fdp: 1,
    international: 3,
    "curriculum-objectives": 1,
    "student-awards": 1,
    "study-at-nid": 2,
    "admission-process": 2,
    "pm-vidyalaxmi-scheme": 2,
    "life-at-nid": 8,
    "academic-notifications": 1,
    "young-designers": 3,
    "research-publications": 3,
    "consulting-and-entrepreneurship": 4,
    people: 4,
    faculty: 1,
    // The research centres that build (§79): one "About" section each.
    "innovation-center-natural-fiber": 1,
    icic: 1,
    bamboo: 1,
    "railway-design-center": 1,
    handloom: 1,
    ipr: 1,
    "nid-press": 1,
    // Regulatory (§86): About and Documents.
    "nid-act": 2,
    // Reports (§87).
    "annual-reports": 1,
    // About and Key Documents (§89).
    "right-to-information": 2,
    // About and Resources (§92).
    "integrated-design-services": 2,
  } as Record<string, number>,

  /** Listed records across a document's STRUCTURED sections, where the page
   *  shows them as cards. Live: about-nid 5 (news), campuses 3,
   *  research-publications 7 (the centres, §78). */
  documentItems: {
    "about-nid": 4,
    campuses: 3,
    "research-publications": 7,
    // The faculty directory's people (§82). Live 3 Oct 2026: 65.
    faculty: 65,
  } as Record<string, number>,

  /** LINK blocks across a document's sections, where a section is a list of
   *  documents (§76) — the rows are LINK blocks, not STRUCTURED items, so
   *  documentItems cannot see them. Counted as sent, before a file that 404s
   *  is dropped. Live 7 Oct 2026: nid-act 8, annual-reports 10,
   *  right-to-information 16, integrated-design-services 5 (the FAQ and
   *  four resources). */
  documentLinkBlocks: {
    "nid-act": 7,
    "annual-reports": 9,
    "right-to-information": 15,
    "integrated-design-services": 4,
  } as Record<string, number>,

  /** A programme's discipline records that become cards (getDisciplines.ts):
   *  live 30 Sep 2026, B.Des 8 (the Foundation Programme excluded), M.Des 19. */
  disciplines: { bdes: 8, mdes: 19 },

  /** Faculty-list people the discipline records place in at least one
   *  discipline (the directory's by-Discipline view, §82). Live: 64 of 65. */
  facultyGrouped: 60,

  /** Faculty member pages built (the faculty list), and of them with a bio
   *  (§83). Live 4 Oct 2026: 65 and 65. */
  facultyMembers: 60,
  facultyMembersWithBio: 60,

  /** News items Home's news tile can read: the featured list and the news list
   *  together, by slug (§88). A CMS that stops sending news fails the build
   *  rather than shipping a tile with no rows. Live 7 Oct 2026: 6. */
  homeNews: 1,

  /** The header menu's top-level sections (home document). Live: 7. */
  menuSections: 7,
  /** The footer's link list (home document). Live: 11. */
  footerLinks: 10,
  /** Featured collaboration logos. Live: 6. */
  collaborations: 5,
} as const;

// Which CMS response each named floor counts: a document by slug, or a list
// endpoint by its contentType ("items:…"). documentSections, documentItems and
// documentLinkBlocks are keyed by slug already. Read only to name the floors a document that never
// arrived leaves unchecked (client.ts, STAGE-0-NOTES §84) — the build fails
// either way. A floor counted across many documents (the member bios, one
// record each) has no single source and is not listed.
const FLOOR_SOURCES: Partial<Record<keyof typeof CMS_FLOORS, string[]>> = {
  articleFeed: ["news-events"],
  archiveItems: ["items:news", "items:event", "items:workshop"],
  awardItems: ["student-awards"],
  disciplines: ["items:discipline"],
  facultyGrouped: ["faculty"],
  facultyMembers: ["faculty"],
  homeNews: ["items:news"],
  menuSections: ["home"],
  footerLinks: ["home"],
  collaborations: ["items:collaboration"],
};

/** The floors counted against the response at a CMS path, named with their
 *  values: `documentSections.faculty ≥ 1`, `facultyMembers ≥ 60`. */
export function floorsFor(path: string): string[] {
  const url = new URL(path, "http://cms");
  const slug = /^\/public\/content\/([^/]+)$/.exec(url.pathname)?.[1];
  const type =
    url.pathname === "/public/content-items" ? url.searchParams.get("contentType") : null;
  const source = slug ?? (type ? `items:${type}` : null);
  if (!source) return [];
  const named: string[] = [];
  if (slug && CMS_FLOORS.documentSections[slug] !== undefined)
    named.push(`documentSections.${slug} ≥ ${CMS_FLOORS.documentSections[slug]}`);
  if (slug && CMS_FLOORS.documentItems[slug] !== undefined)
    named.push(`documentItems.${slug} ≥ ${CMS_FLOORS.documentItems[slug]}`);
  if (slug && CMS_FLOORS.documentLinkBlocks[slug] !== undefined)
    named.push(`documentLinkBlocks.${slug} ≥ ${CMS_FLOORS.documentLinkBlocks[slug]}`);
  for (const [key, sources] of Object.entries(FLOOR_SOURCES)) {
    if (!sources?.includes(source)) continue;
    const value = CMS_FLOORS[key as keyof typeof CMS_FLOORS];
    named.push(
      typeof value === "number" ? `${key} ≥ ${value}` : `${key} ${JSON.stringify(value)}`,
    );
  }
  return named;
}
