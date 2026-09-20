// The Home seam. Home is a bespoke tile grid, not a content-model page, so it
// has its own door beside getPage(). The CMS now serves every tile, so the
// merge runs the other way round from the first pass: the API's sections, in
// the API's order, are the page — and HOME_TILES is the FALLBACK and the
// completeness check. A static tile that survives the merge means the backend
// is missing a section, and the log line says so by name.
//
// No CMS, or a failed fetch, returns HOME_TILES untouched — the page is then
// byte-identical to the static one. Nothing outside src/lib/content/ may import
// HOME_TILES (scripts/lint-fixtures.mjs).
import { cache } from "react";
import { HOME_TILES, type HomeTile } from "@/lib/home-content";
import { cmsFetch } from "@/lib/api/client";
import { isPublicContentResponse, type Section } from "@/lib/api/types";
import { heroDraft, KIND_ADAPTERS, type Copy, type TileDraft } from "@/lib/content/home-adapters";

export interface HomeContent {
  tiles: HomeTile[];
  copy: Copy;
  seo: { title: string; description?: string };
}

const STATIC_TITLE = "National Institute of Design";

/** Where the craft patterns sit, counted in CONTENT tiles — read off
 *  HOME_TILES, where they are array indexes 7, 13 and 16. Counting content
 *  tiles rather than array positions is what keeps them in place when the CMS
 *  adds or drops a section. They are presentation, so they are never a gap. */
const PATTERN_SLOTS: { after: number; id: string; seed: number }[] = [
  { after: 7, id: "pattern-3", seed: 3 },
  { after: 12, id: "pattern-1", seed: 1 },
  { after: 14, id: "pattern-2", seed: 2 },
];

/** A Section carries no key, slug or code — only id, kind and title. `kind` +
 *  title is therefore the most stable identifier available, and the title is
 *  preferred over the referenced card's slug because the card is the
 *  *featured pick* ("Sujata Keshavan") and changes when an editor swaps it,
 *  which would silently cost that tile its styling. Both are still editorial
 *  strings: asking for a real `key` is the first line of the backend report.
 *  Never matched by orderIndex or array position. */
function sectionKey(section: Section): string {
  const ref = (section.blocks ?? []).find((b) => b.referencedItem)?.referencedItem;
  return `${section.kind}:${section.title?.trim() || ref?.slug || ""}`;
}

const KEY_TO_STATIC_ID: Record<string, string> = {
  "statement:": "statement",
  "linkList:Study at NID": "study",
  "calendar:Academic Calendar": "academic",
  "news:News & Events": "news",
  "feature:Institute of National Importance": "national-importance",
  "portrait:Notable Alumni": "alumni",
  "mediaCard:Workshop": "drawing-dialogues",
  "portrait:Pride of NID": "pride",
  "mediaCard:Campuses": "campuses",
  "mediaCard:Call for Papers": "shifting-paradigms",
  "quote:Director’s Note": "director",
  "roster:Faculty Stalwarts": "faculty",
  "mediaCard:Research & Publications": "research",
  "mediaCard:Young Designers": "young-designers",
  "spine:Knowledge Management Centre": "kmc",
};

/** Appearance stays with the front end (the backend says so): the API tile
 *  takes the matched static tile's styling and its id, so the CMS can reorder
 *  and reword a section without it changing how it looks. */
function withStyling(tile: HomeTile, from: HomeTile | undefined): HomeTile {
  if (!from || from.kind !== tile.kind) return tile;
  switch (tile.kind) {
    case "linkList":
      return { ...tile, id: from.id, ...(from.kind === "linkList" && from.gradient ? { gradient: true } : {}) };
    case "portrait":
      return { ...tile, id: from.id, ...(from.kind === "portrait" && from.bed ? { bed: from.bed } : {}) };
    case "mediaCard": {
      if (from.kind !== "mediaCard") return tile;
      // Which cards flip, curve or carry a scrim is a design decision; the API
      // supplies the back face's words either way.
      const { flip, ...rest } = tile;
      return {
        ...rest,
        id: from.id,
        ...(from.surface ? { surface: from.surface } : {}),
        ...(from.labelPlacement ? { labelPlacement: from.labelPlacement } : {}),
        ...(from.shape ? { shape: from.shape } : {}),
        ...(from.scrim !== undefined ? { scrim: from.scrim } : {}),
        ...(from.flip && flip ? { flip } : {}),
      };
    }
    case "hero":
      // The film is not in the CMS yet, so the static clip stays behind an API
      // still. Reported as a gap; the backend has already said it is coming.
      return {
        ...tile,
        id: from.id,
        ...(!tile.video && from.kind === "hero" && from.video ? { video: from.video } : {}),
      };
    default:
      return { ...tile, id: from.id };
  }
}

// cache(): generateMetadata and HomeGrid both call this; the merge, and its
// log line, run once per render.
export const getHome = cache(async (locale: string): Promise<HomeContent> => {
  // `?locale=` reaches the wire at last: the backend ignores unknown query
  // params rather than rejecting them (confirmed 200), so the seam's locale is
  // no longer dropped on the floor.
  const api = await cmsFetch(`/public/content/home?locale=${encodeURIComponent(locale)}`, isPublicContentResponse);
  if (!api) return { tiles: HOME_TILES, copy: {}, seo: { title: STATIC_TITLE } };

  const staticById = new Map(HOME_TILES.map((t) => [t.id, t]));
  const staticContent = HOME_TILES.filter((t) => t.kind !== "pattern");

  const fromApi: string[] = [];
  const fromStatic: string[] = [];
  const isNew: string[] = [];
  const notes: string[] = [];
  let copy: Copy = {};

  const take = (draft: TileDraft, key: string, staticId: string | undefined) => {
    const tile = withStyling(draft.tile, staticId ? staticById.get(staticId) : undefined);
    copy = { ...copy, ...draft.copy };
    fromApi.push(draft.gaps.length ? `${tile.id}(${draft.gaps.join("; ")})` : tile.id);
    if (!staticId) isNew.push(key);
    return tile;
  };

  const tiles: HomeTile[] = [];
  const matched = new Set<string>();

  // ── 1. the API's sections, in the API's order ───────────────────────────
  for (const section of [...api.sections].sort((a, b) => a.orderIndex - b.orderIndex)) {
    const adapter = section.kind ? KIND_ADAPTERS[section.kind] : undefined;
    const key = sectionKey(section);
    const staticId = KEY_TO_STATIC_ID[key];
    if (!adapter) {
      notes.push(`unusable section ${key} (no adapter for kind ${section.kind ?? "null"})`);
      continue;
    }
    const result = adapter(section, staticId ?? key, locale);
    if ("skip" in result) {
      notes.push(`${staticId ?? key}: ${result.skip}`);
      continue;
    }
    if (staticId) matched.add(staticId);
    tiles.push(take(result, key, staticId));
  }

  // ── 2. the hero, which is a document field rather than a section ────────
  const hero = heroDraft(api);
  if ("skip" in hero) {
    notes.push(`hero: ${hero.skip}`);
  } else {
    matched.add("hero");
    // Its place in the order is the front end's: it follows the statement.
    const after = tiles.findIndex((t) => t.id === "statement");
    tiles.splice(after + 1, 0, take(hero, "hero", "hero"));
  }

  // ── 3. static tiles the API has no section for — the backend's gaps ─────
  staticContent.forEach((tile, index) => {
    if (matched.has(tile.id)) return;
    fromStatic.push(`${tile.id}(no api section)`);
    tiles.splice(Math.min(index, tiles.length), 0, tile);
  });

  // ── 4. the craft patterns, which are never CMS content ──────────────────
  // Inserted LAST slot first: `after` counts content tiles, and splicing from
  // the front would shift every later slot by the patterns already inserted
  // (measured: 7/13/16 came out as 7/12/14).
  for (const slot of [...PATTERN_SLOTS].sort((a, b) => b.after - a.after)) {
    if (slot.after > tiles.length) continue;
    tiles.splice(slot.after, 0, { id: slot.id, kind: "pattern", seed: slot.seed });
  }

  const title = api.seo?.metaTitle?.trim();
  const description = api.seo?.metaDescription?.trim();
  if (title || description) fromApi.push("seo");
  else fromStatic.push("seo(no metaTitle or metaDescription)");

  console.info(
    `[cms] home: api=${fromApi.join(",") || "none"} · static=${fromStatic.join(",") || "none"}` +
      ` · order=api · new=${isNew.join(",") || "none"}` +
      (notes.length ? ` · ${notes.join("; ")}` : ""),
  );

  return {
    tiles,
    copy,
    seo: { title: title || STATIC_TITLE, ...(description ? { description } : {}) },
  };
});
