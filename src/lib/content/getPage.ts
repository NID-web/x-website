// The one content seam. A page render is one call — the Page, its sections in
// order, items resolved and already grouped (NID-CONTEXT.md §8.4). A page with
// a PAGE_CONFIG entry is merged from the CMS over its fixture
// (src/lib/content/page-adapter.ts); every other page is its fixture. Nothing
// outside src/lib/content/ may import a fixture (scripts/lint-fixtures.mjs).
import { cache } from "react";
import type { PageResponse } from "@/lib/content-model";
import { cmsFetch } from "@/lib/api/client";
import { isPublicContentResponse } from "@/lib/api/types";
import { toPageResponse, type PageMergeConfig } from "@/lib/content/page-adapter";
import { auditSummary, gatePage, logMissingRoutes } from "@/lib/content/route-gate";
import { ABOUT } from "@/lib/content/fixtures/about";
import { CHARTER } from "@/lib/content/fixtures/charter";
import { NEWS_EVENTS } from "@/lib/content/fixtures/news-events";
import { OUR_THEMES } from "@/lib/content/fixtures/our-themes";
import { PAGE_ID } from "@/lib/content/pages";

const FIXTURES: Record<string, PageResponse> = {
  "/about": ABOUT,
  "/about/charter": CHARTER,
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
  const { response, audit } = gatePage(merged?.response ?? fixture);
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
