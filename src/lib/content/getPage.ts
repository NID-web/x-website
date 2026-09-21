// The one content seam. A page render is one call — the Page, its sections in
// order, items resolved and already grouped (NID-CONTEXT.md §8.4). A page with
// a PAGE_CONFIG entry is merged from the CMS over its fixture
// (src/lib/content/page-adapter.ts); every other page is its fixture. Nothing
// outside src/lib/content/ may import a fixture (scripts/lint-fixtures.mjs).
import { cache } from "react";
import type { PageResponse } from "@/lib/content-model";
import { cmsFetch } from "@/lib/api/client";
import { isPublicContentResponse } from "@/lib/api/types";
import { detailSections, toPageResponse, type PageMergeConfig } from "@/lib/content/page-adapter";
import { auditSummary, gatePage, logMissingRoutes } from "@/lib/content/route-gate";
import { ABOUT } from "@/lib/content/fixtures/about";
import { CAMPUSES } from "@/lib/content/fixtures/campuses";
import { CAMPUS_AHMEDABAD } from "@/lib/content/fixtures/campus-ahmedabad";
import { CAMPUS_BENGALURU } from "@/lib/content/fixtures/campus-bengaluru";
import { CAMPUS_GANDHINAGAR } from "@/lib/content/fixtures/campus-gandhinagar";
import { CHARTER } from "@/lib/content/fixtures/charter";
import { HISTORY } from "@/lib/content/fixtures/history";
import { NEWS_EVENTS } from "@/lib/content/fixtures/news-events";
import { OUR_THEMES } from "@/lib/content/fixtures/our-themes";
import { PAGE_ID } from "@/lib/content/pages";

const FIXTURES: Record<string, PageResponse> = {
  "/about": ABOUT,
  "/about/campuses": CAMPUSES,
  "/about/campuses/ahmedabad": CAMPUS_AHMEDABAD,
  "/about/campuses/gandhinagar": CAMPUS_GANDHINAGAR,
  "/about/campuses/bengaluru": CAMPUS_BENGALURU,
  "/about/charter": CHARTER,
  "/about/history": HISTORY,
  "/about/news-events": NEWS_EVENTS,
  "/about/our-themes": OUR_THEMES,
};

// Keys are content-type keys from GET /public/content-types.
const PAGE_CONFIG: Record<string, PageMergeConfig> = {
  "/about": {
    slug: "about-nid",
    subPagesKey: "static",
    sections: {
      "section-about-news": { structuredKey: "news", slugUnderParent: true },
      "section-about-campuses": { structuredKey: "campus" },
      "section-about-student-awards": { structuredKey: "student_award", slugUnderParent: true },
    },
  },
  "/about/campuses": {
    slug: "campuses",
    intro: "heroText",
    // Section 51 (key `campus`) lists the three children; the navigation tree
    // lists the same three today. Same mechanism as About's sub-page rail.
    subPagesKey: "campus",
    sections: {
      // TODO(review): backend — section 50 "About" carries three board
      // sections' prose in one section's five blocks. `blocks` is a shim for
      // the ask to split it (or for a stable Section.key, A1); delete it the day
      // the CMS splits them. `of` is the guard: any other block count and all
      // three fall back to the fixture.
      "section-campuses-about": { textTitle: "About", blocks: [1, 3], of: 5 },
      "section-campuses-three": { textTitle: "About", blocks: [4, 4], of: 5 },
      "section-campuses-visiting": { textTitle: "About", blocks: [5, 5], of: 5 },
    },
  },
  // The three campus pages read a "Campus Detail" document: one SPECIFIC
  // "About" section plus a typed `detail` record, which the adapter turns into
  // key-info values and ordinary sections (STAGE-0-NOTES §57). A detail list
  // with no board slot is logged, never given a section of its own.
  // TODO(review): "Programmes" key-info rows stay static on all three — the
  // API has no programmes summary, and composing one from counted disciplines
  // would invent a figure.
  "/about/campuses/ahmedabad": {
    slug: "ahmedabad-campus",
    intro: "heroText",
    sections: { "section-ahmedabad-about": { textTitle: "About" } },
    detail: {
      keyInfo: { Established: "establishedYear" },
      // TODO(review): backend — which Services & Centres list is authoritative?
      // The CMS's four (Printing & Reprographics, Design Clinic, Integrated
      // Design Services, Continuing Education) is a different list from the
      // board's five, and lacks three that have designed routes (Outreach,
      // Industry & Online, Railway). Held on the fixture so live and fallback
      // render the same; move this key into `lists` to switch.
      hold: { serviceCentres: "section-ahmedabad-services" },
      lists: {
        labAndFacilities: "section-ahmedabad-workshops",
        // TODO(review): the board draws three PROGRAMME cards; the CMS sends
        // seventeen discipline records. The API wins where it has data, so with
        // the CMS on this section lists disciplines and without it the
        // fixture's three programmes — it changes meaning with CMS availability.
        // Delete this one line to keep the programme cards.
        disciplines: "section-ahmedabad-disciplines",
      },
    },
  },
  "/about/campuses/gandhinagar": {
    slug: "gandhinagar-campus",
    intro: "heroText",
    sections: { "section-gandhinagar-about": { textTitle: "About" } },
    detail: {
      keyInfo: { Address: "address" },
      lists: {
        labAndFacilities: "section-gandhinagar-workshops",
        disciplines: "section-gandhinagar-disciplines",
      },
    },
  },
  "/about/campuses/bengaluru": {
    slug: "bengaluru-campus",
    intro: "heroText",
    // The board draws the campus contacts in the key-info rail (4119:230974).
    contactsTo: "keyInfo",
    sections: { "section-bengaluru-about": { textTitle: "About" } },
    detail: {
      keyInfo: { Inaugurated: "establishedYear" },
      lists: { disciplines: "section-bengaluru-disciplines" },
    },
  },
  "/about/charter": {
    slug: "charter",
    // The first SPECIFIC section is the Mandate BODY, not a standfirst —
    // History's shape.
    intro: "heroText",
    sections: {
      // Held off the CMS deliberately, and the page's ONE manual switch — every
      // other fallback here flips itself. The document's "Mandate" section is a
      // single block that also condenses all ten mandates (stating them twice,
      // with the section below) and drops the "Institution of National
      // Importance / NID Act 2014" sentence, so adopting it loses content.
      // TODO(review): backend — restore this line the day the CMS splits
      // "Mandate" into "Mandate" (the two-paragraph statement, Act sentence
      // back) + "The Ten Mandates". Until then the board's copy stands.
      // "section-charter-mandate": { textTitle: "Mandate" },
      // Not in the document yet; switches on by itself when the CMS splits it.
      "section-charter-ten-mandates": { textTitle: "The Ten Mandates" },
    },
  },
  "/about/history": {
    slug: "history",
    // The document's first SPECIFIC section is the Origins BODY, not a
    // standfirst, so the intro is its heroText — which words the page
    // differently from the board (NID-CONTEXT §8.1; see the gap report).
    intro: "heroText",
    // The block beside the hero is the model's keyInfo (the 390 board names
    // it "Key Info"), not a first section's contacts.
    contactsTo: "keyInfo",
    sections: {
      "section-history-origins": { textTitle: "Origins" },
      "section-history-india-report": { textTitle: "The India Report" },
      "section-history-sarabhais": { textTitle: "The Sarabhais" },
      "section-history-convocation": { textTitle: "Convocation Through the Years" },
      "section-history-past-directors": { textTitle: "Past Directors" },
      // TODO(review): backend — `person` or `academic_faculty`? Both are content
      // types (GET /public/content-types); the document sends neither yet.
      "section-history-faculty-stalwarts": { structuredKey: "person" },
    },
  },
  "/about/news-events": {
    slug: "news-events",
    sections: {
      "section-news-featured": { structuredKey: "news", nth: 1, slugUnderParent: true },
      // TODO(review): designer — is this section a year bucket ("2026", the
      // board) or a recency feed ("Latest News", the API, items 2020–2026)? It
      // takes the API's title, so it currently reads "Latest News".
      "section-news-2026": { structuredKey: "news", nth: 2, slugUnderParent: true },
      // section-news-archive: a links section, and sections have no link model (A4).
    },
    // TODO(review): sitemap.json has one item route here, /about/news-events/[slug];
    // events and workshops have none of their own, so they share it (BACKEND-HOME-TASKS A3).
    appendSections: [
      { id: "section-news-events", structuredKey: "event", after: "section-news-2026", itemParent: PAGE_ID.newsEvents, slugUnderParent: true },
      { id: "section-news-workshops", structuredKey: "workshop", after: "section-news-2026", itemParent: PAGE_ID.newsEvents, slugUnderParent: true },
    ],
  },
};

// cache(): generateMetadata and the page both call this; one fetch and one log
// line per render.
export const getPage = cache(async (path: string): Promise<PageResponse | null> => {
  const fixture = FIXTURES[path];
  if (!fixture) return null;
  const config = PAGE_CONFIG[path];
  const api = config ? await cmsFetch(`/public/content/${config.slug}`, isPublicContentResponse) : null;

  // The gate runs on every page, CMS or not: a fixture links to unbuilt routes
  // just as the API does.
  const merged = api && config ? toPageResponse(api, fixture, config) : null;
  const { response, audit } = gatePage(merged?.response ?? fixture, {
    // The campus pages' detail-derived sections list records, so an unbuilt
    // link there stays as an unlinked row (route-gate.ts, STAGE-0-NOTES §58).
    keepUnbuilt: detailSections(config?.detail),
  });
  if (merged) {
    const { sources } = merged;
    console.info(
      `[cms] ${path}: api=${sources.api.join(",") || "none"}` +
        (sources.appended.length ? ` · appended=${sources.appended.join(",")}` : "") +
        ` · static=${sources.static.join(",") || "none"}` +
        (sources.notes.length ? ` · ${sources.notes.join(" · ")}` : "") +
        ` · ${auditSummary(audit)}`,
    );
  }
  logMissingRoutes(path, audit);
  return response;
});
