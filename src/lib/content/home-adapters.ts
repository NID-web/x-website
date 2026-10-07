// What the CMS's generic content document can feed on Home, one pure function
// per unit: an API section (the document's hero, or a content-items list, §88)
// in, the tile's content and
// copy out — or the reason to keep the static tile. There is one adapter per
// thing the deployed document actually carries and nothing for what it does
// not; a tile the CMS learns to serve is a new function here plus a row in
// getHome's SECTION_SOURCES.
//
// API strings reach tiles through synthetic `api.*` copy keys, which HomeGrid's
// translator resolves before next-intl ever sees them — the tiles keep taking
// keys, exactly as they do for messages/en.json. That indirection is why the
// tile components have not changed across three shapes of this API.
import type { CopyKey, HomeTile, HomeVideo, NewsRow } from "@/lib/home-content";
import type { MediaAsset } from "@/lib/content-model";
import type { CardRef, PublicContentResponse, Section } from "@/lib/api/types";
import { mediaHosts, toMediaAsset } from "@/lib/api/media";
import { formatArchiveDate, plainText } from "@/lib/content/format";
import { itemPath } from "@/lib/content/pages";

export type Copy = Record<CopyKey, string>;

export type AdapterResult =
  | { tile: HomeTile; copy: Copy; notes: string[] }
  | { keep: string };

type Tile<K extends HomeTile["kind"]> = Extract<HomeTile, { kind: K }>;

// The tile is display type, squared at laptop and up, and holds six lines.
// Measured at 1024/1100/1280/1440: a 60-character sentence fills six exactly;
// 64 already wraps to seven at 1280, and a 71-character one is seven
// everywhere — the tile does not clip, it grows (350px tall on a 309px column at
// 1024) and drags the hero's row with it. The boards' copy is 55. Over the limit
// the static line stays: truncating an editor's sentence is worse than not
// showing it.
export const STATEMENT_MAX = 60;

const NEWS_ROWS = 3;

/** Copy keys are namespaced by section id (or a unit's own name), so two
 *  sources can never collide. */
function bag(id: number | string) {
  const copy: Copy = {};
  const put = (field: string, value: string): CopyKey => {
    const key = `api.${id}.${field}`;
    copy[key] = value;
    return key;
  };
  return { copy, put };
}

const blocksOf = (section: Section, type: string) =>
  (section.blocks ?? []).filter((b) => b.blockType === type);

export function statementAdapter(section: Section, tile: Tile<"statement">): AdapterResult {
  const block = blocksOf(section, "TEXT").find((b) => b.text?.trim());
  const text = block?.text ? plainText(block.text).text : "";
  if (!text) return { keep: "no TEXT block" };
  if (text.length > STATEMENT_MAX) {
    return { keep: `text is ${text.length} chars, max ${STATEMENT_MAX}` };
  }
  const { copy, put } = bag(section.id);
  return { tile: { ...tile, textKey: put("text", text) }, copy, notes: [] };
}

/** Home's news rows from the content-items lists, not the home document: since
 *  7 Oct 2026 that document carries only its own static content, and structured
 *  content comes from /public/content-items (STAGE-0-NOTES §88). The backend's
 *  recipe: the featured news, in the API's order (newest first), topped up to
 *  NEWS_ROWS with the newest non-featured news. A row is offered only when its
 *  article page is built, so every row links — the archive's rule — and one
 *  story is one row (same-story records resolve to one path). Never a static
 *  row: with fewer items the tile shows what exists. Selection is editorial,
 *  display order is by date: the rows chosen are shown newest first, so a
 *  featured item never sits above a newer one (§88). */
export function newsFromItems(
  featured: CardRef[],
  latest: CardRef[],
  tile: Tile<"news">,
  locale: string,
  built: (path: string) => boolean,
): { tile: Tile<"news">; copy: Copy; notes: string[] } {
  const { copy, put } = bag("news");
  const notes: string[] = [];
  const picked: Array<{ item: CardRef & { publishedAt: string }; href: string }> = [];
  const taken = new Set<string>();
  const counts = { featured: 0, latest: 0 };
  const newest = [...latest].sort((a, b) => Date.parse(b.publishedAt ?? "") - Date.parse(a.publishedAt ?? ""));
  for (const [from, items] of [["featured", featured], ["latest", newest]] as const) {
    for (const item of items) {
      if (picked.length === NEWS_ROWS) break;
      // TODO(review): backend — a seed timestamp (convocation-2026's 21 Sep)
      // renders as sent; only a missing or unparseable date drops a row.
      if (!item.publishedAt || Number.isNaN(Date.parse(item.publishedAt))) {
        notes.push(`${item.slug}: no publishedAt, row dropped`);
        continue;
      }
      const href = itemPath(item.slug);
      if (taken.has(href)) continue;
      if (!built(href)) {
        notes.push(`${item.slug}: no article page, row dropped`);
        continue;
      }
      taken.add(href);
      picked.push({ item: { ...item, publishedAt: item.publishedAt }, href });
      counts[from]++;
    }
  }
  const rows: NewsRow[] = picked
    .sort((a, b) => Date.parse(b.item.publishedAt) - Date.parse(a.item.publishedAt))
    .map(({ item, href }) => {
      // Decorative: the headline beside it says everything the photo would, so
      // "" is the right alt and a null altText is not a gap. A rejected
      // thumbnail leaves the row's image box empty — it never borrows a static
      // row's photo, which would show one story's picture beside another's.
      const thumb = toMediaAsset(item.thumbnail, { decorative: true });
      if ("rejected" in thumb) notes.push(`${item.slug} thumbnail: ${thumb.rejected}`);
      return {
        headlineKey: put(`headline.${item.id}`, item.title),
        date: formatArchiveDate(item.publishedAt, locale),
        href,
        ...("asset" in thumb ? { thumbnail: thumb.asset } : {}),
      };
    });
  notes.unshift(`featured ${counts.featured} + latest ${counts.latest}`);
  if (rows.length < NEWS_ROWS) notes.push(`${rows.length} of ${NEWS_ROWS} rows`);
  // The overline and "All news" are the static tile's.
  return { tile: { ...tile, rows }, copy, notes };
}

/** The film is a VIDEO block in its own SPECIFIC section. It is not an image,
 *  so toMediaAsset's alt rules do not apply — its accessible name is the play
 *  button's label, built from `title` — but it goes through the same host
 *  allowlist, or next/image and <video> would trust different origins. */
export function filmFrom(section: Section, fallbackTitle: string): HomeVideo | { keep: string } {
  const media = blocksOf(section, "VIDEO")[0]?.media;
  if (!media) return { keep: "no VIDEO block" };
  let url: URL;
  try {
    url = new URL(media.url);
  } catch {
    return { keep: `unparseable url ${media.url}` };
  }
  if (!mediaHosts().includes(url.host)) return { keep: `host ${url.host}` };
  if (!media.mimeType?.startsWith("video/")) return { keep: `mimeType ${media.mimeType}` };
  return {
    src: url.href,
    title: media.altText?.trim() || media.title?.trim() || fallbackTitle,
  };
}

/** `hero[0]` is the still. A hero has no card, so there is no honest alt to
 *  fall back to: the document's own title ("NID Home") describes the PAGE, not
 *  the photograph, and announcing a forest as "NID Home" is worse than keeping
 *  the static still whose alt is right. */
export function heroStill(api: PublicContentResponse): { media: MediaAsset } | { keep: string } {
  const still = toMediaAsset(api.hero[0]);
  return "rejected" in still ? { keep: still.rejected } : { media: still.asset };
}
