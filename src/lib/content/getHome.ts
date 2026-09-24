// The Home seam. Home is a bespoke tile grid, not a content-model page, so it
// has its own door beside getPage(). HOME_TILES is the page: it owns the ORDER
// and every tile's presentation, and the CMS fills the units it can, one at a
// time, with the reason for every fallback in one log line.
//
// Static owns the order because the document describes 4 sections where Home
// has 16 content tiles: its orderIndex (statement, campuses, news, film) is
// nothing like the page, and building the page from it drags tiles to the tail
// and lands the craft patterns beside the wrong neighbours. When the document
// serves every tile, the order can move to the API again.
//
// No CMS, or a failed fetch, returns HOME_TILES with only the route gate
// applied (route-gate.ts) — the same gate the CMS-fed page goes through. Nothing outside src/lib/content/ may import
// HOME_TILES (scripts/lint-fixtures.mjs).
import { cache } from "react";
import { HOME_TILES, type HomeTile } from "@/lib/home-content";
import { cmsFetch } from "@/lib/api/client";
import { isPublicContentResponse, type Section } from "@/lib/api/types";
import {
  filmFrom,
  heroStill,
  newsAdapter,
  statementAdapter,
  type Copy,
} from "@/lib/content/home-adapters";
import { articleFeed } from "@/lib/content/getArticle";
import { auditSummary, gateHome, logMissingRoutes } from "@/lib/content/route-gate";

export interface HomeContent {
  tiles: HomeTile[];
  copy: Copy;
  seo: { title: string; description?: string };
}

const STATIC_TITLE = "National Institute of Design";

/** Which API section feeds which tile. A Section's only machine identifier is
 *  `structuredContentType.key`, and only a STRUCTURED section has one — so a
 *  SPECIFIC section can only be found by its TITLE, which an editor can rename,
 *  silently costing the tile its data. Asking for a stable `key` is the first
 *  line of the backend report. Never matched by orderIndex or position.
 *
 *  "Our Campuses" (STRUCTURED, key `campus`) is deliberately absent. It sends
 *  three campus pages; Home has ONE arch-shaped card with its own photograph,
 *  and the generic section carries no media of its own — so the only things it
 *  could supply are the word "Campuses" and a link the tile already has. A
 *  three-up campus treatment on Home is a design decision nobody has made. It is
 *  logged as unused, which is the whole job. */
const SECTION_SOURCES: { staticId: string; structuredKey?: string; titles?: string[] }[] = [
  { staticId: "statement", titles: ["Position Statement"] },
  { staticId: "news", structuredKey: "news" },
  // The film, folded into the hero tile beside the document's hero[0] still.
  { staticId: "hero", titles: ["NID Film"] },
];

/** Lowercased, punctuation and whitespace collapsed: "NID  Film", "NID-Film"
 *  and "nid film" are one title; a reworded one is not, and says so in the log. */
const normalise = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

function findSection(sections: Section[], source: (typeof SECTION_SOURCES)[number]) {
  if (source.structuredKey) {
    return sections.find(
      (s) =>
        s.type === "STRUCTURED" && s.structuredContentType?.key === source.structuredKey,
    );
  }
  const titles = (source.titles ?? []).map(normalise);
  return sections.find(
    (s) => s.type === "SPECIFIC" && titles.includes(normalise(s.title ?? "")),
  );
}

// cache(): generateMetadata and HomeGrid both call this; the merge, and its
// log line, run once per render.
export const getHome = cache(async (locale: string): Promise<HomeContent> => {
  // The backend ignores `?locale=` (the response is byte-identical without it)
  // but never rejects it, so the seam's locale reaches the wire for the day it
  // is honoured.
  // articleFeed(): the news rows link /about/news-events/[slug], and the gate
  // links only the slugs that route builds (getArticle.ts).
  const [api] = await Promise.all([
    cmsFetch(`/public/content/home?locale=${encodeURIComponent(locale)}`, isPublicContentResponse),
    articleFeed(),
  ]);
  if (!api) {
    // The route gate runs on the static page too; see route-gate.ts.
    const { tiles, audit } = gateHome(HOME_TILES);
    logMissingRoutes("/", audit);
    return { tiles, copy: {}, seo: { title: STATIC_TITLE } };
  }

  const bySource = new Map<string, Section>();
  for (const source of SECTION_SOURCES) {
    const section = findSection(api.sections, source);
    if (section) bySource.set(source.staticId, section);
  }

  const fromApi: string[] = [];
  const fromStatic: string[] = [];
  let copy: Copy = {};

  const merged = HOME_TILES.map((tile): HomeTile => {
    if (tile.kind === "pattern") return tile;
    const section = bySource.get(tile.id);

    if (tile.kind === "hero") {
      // Two sources, each its own unit: the still (hero[0]) and the film (a
      // VIDEO section). Either can fall back without costing the other.
      const got: string[] = [];
      const kept: string[] = [];
      let { media, video } = tile;
      const still = heroStill(api);
      if ("keep" in still) kept.push(`still: ${still.keep}`);
      else {
        media = still.media;
        got.push("still from api");
      }
      const film = section
        ? filmFrom(section, tile.video?.title ?? "")
        : { keep: "no api section" };
      if ("keep" in film) kept.push(`film: ${film.keep}`);
      else {
        video = film;
        got.push("film from api");
      }
      if (got.length) fromApi.push(`hero(${[...got, ...kept].join("; ")})`);
      else fromStatic.push(`hero(${kept.join("; ")})`);
      return { ...tile, media, ...(video ? { video } : {}) };
    }

    if (!section) {
      fromStatic.push(`${tile.id}(no api section)`);
      return tile;
    }
    const result =
      tile.kind === "statement"
        ? statementAdapter(section, tile)
        : tile.kind === "news"
          ? newsAdapter(section, tile, locale)
          : { keep: `no adapter for a ${tile.kind} tile` };
    if ("keep" in result) {
      fromStatic.push(`${tile.id}(${result.keep})`);
      return tile;
    }
    copy = { ...copy, ...result.copy };
    fromApi.push(result.notes.length ? `${tile.id}(${result.notes.join("; ")})` : tile.id);
    return result.tile;
  });

  const used = new Set([...bySource.values()].map((s) => s.id));
  const unused = api.sections
    .filter((s) => !used.has(s.id))
    .map((s) => {
      const count =
        s.type === "STRUCTURED" ? (s.items?.length ?? 0) : (s.blocks?.length ?? 0);
      const what = s.type === "STRUCTURED" ? "items" : "blocks";
      return `unused api section "${s.title ?? ""}" (${s.structuredContentType?.key ?? "SPECIFIC"}, ${count} ${what})`;
    });

  const title = api.seo?.metaTitle?.trim();
  const description = api.seo?.metaDescription?.trim();
  if (title || description) fromApi.push("seo");
  else fromStatic.push("seo(no metaTitle or metaDescription)");

  const { tiles, audit } = gateHome(merged);
  console.info(
    `[cms] home: api=${fromApi.join(",") || "none"} · static=${fromStatic.join(",") || "none"}` +
      ` · order=static` +
      (unused.length ? ` · ${unused.join("; ")}` : "") +
      ` · ${auditSummary(audit)}`,
  );
  logMissingRoutes("/", audit);

  return {
    tiles,
    copy,
    seo: { title: title || STATIC_TITLE, ...(description ? { description } : {}) },
  };
});
