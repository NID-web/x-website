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
import { ABOUT } from "@/lib/content/fixtures/about";
import { CHARTER } from "@/lib/content/fixtures/charter";
import { NEWS_EVENTS } from "@/lib/content/fixtures/news-events";
import { OUR_THEMES } from "@/lib/content/fixtures/our-themes";

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
};

// cache(): generateMetadata and the page both call this; one fetch and one log
// line per render.
export const getPage = cache(async (path: string): Promise<PageResponse | null> => {
  const fixture = FIXTURES[path];
  if (!fixture) return null;
  const config = PAGE_CONFIG[path];
  if (!config) return fixture;

  const api = await cmsFetch(`/public/content/${config.slug}`, isPublicContentResponse);
  if (!api) return fixture;

  const { response, sources } = toPageResponse(api, fixture, config);
  console.info(
    `[cms] ${path}: api=${sources.api.join(",") || "none"} · static=${sources.static.join(",") || "none"}` +
      (sources.notes.length ? ` · ${sources.notes.join(" · ")}` : ""),
  );
  return response;
});
