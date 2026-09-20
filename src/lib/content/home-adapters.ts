// One adapter per SECTION KIND the CMS serves for Home. Each is pure: an API
// section in, a tile and its copy out — or the reason the section is unusable.
// A kind the backend adds is a new entry in KIND_ADAPTERS; no tile component,
// HomeGrid or page changes.
//
// The adapters produce CONTENT only. Styling the backend has said stays in the
// front end (gradient, surface, labelPlacement, shape, scrim, bed, the flip
// card's two faces) is copied onto the tile by getHome from the matching static
// tile — which is also how a section the CMS reorders keeps its appearance.
//
// API strings reach tiles through synthetic `api.*` copy keys, which HomeGrid's
// translator resolves before next-intl ever sees them — the tiles keep taking
// keys, exactly as they do for messages/en.json. That indirection is the reason
// eleven tile components have gone untouched across three passes.
import type {
  CalendarRow,
  CopyKey,
  HomeCta,
  HomeLink,
  HomeTile,
  NewsRow,
} from "@/lib/home-content";
import type { MediaAsset } from "@/lib/content-model";
import type { CardRef, MediaRef, PublicContentResponse, Section } from "@/lib/api/types";
import { configArray, configCta, configString } from "@/lib/api/types";
import { toMediaAsset } from "@/lib/api/media";
import { formatDate, plainText } from "@/lib/content/format";

export type Copy = Record<CopyKey, string>;

export interface TileDraft {
  /** `id` is the section's stable key — getHome maps it to a static tile. */
  tile: HomeTile;
  copy: Copy;
  /** Parts the API left empty that the fallback fills, or accepted with a
   *  caveat. Each one is a line in the backend report. */
  gaps: string[];
}

export type KindResult = TileDraft | { skip: string };
export type KindAdapter = (section: Section, key: string, locale: string) => KindResult;

// The tile is display type, squared at laptop and up, and holds six lines.
// Measured at 1024/1100/1280/1440: a 60-character sentence fills six exactly;
// 64 already wraps to seven at 1280, and a 71-character one is seven
// everywhere — the tile does not clip, it grows (350px tall on a 309px column at
// 1024) and drags the hero's row with it. The boards' copy is 55.
export const STATEMENT_MAX = 60;

// ── small shared helpers ───────────────────────────────────────────────────

/** Copy keys are namespaced by section id, so two sections of the same kind
 *  can never collide on one. */
function bag(section: Section) {
  const copy: Copy = {};
  const put = (field: string, value: string): CopyKey => {
    const key = `api.${section.id}.${field}`;
    copy[key] = value;
    return key;
  };
  return { copy, put };
}

const title = (section: Section) => section.title?.trim() || "";

function blocksOf(section: Section, type: string) {
  return (section.blocks ?? []).filter((b) => b.blockType === type);
}

/** The first TEXT block's prose. Blocks are HTML even when they look plain. */
function firstText(section: Section): string {
  const block = blocksOf(section, "TEXT").find((b) => b.text?.trim());
  return block?.text ? plainText(block.text).text : "";
}

/** The nth CONTENT_REFERENCE block's card. */
function refAt(section: Section, index: number): CardRef | null {
  return blocksOf(section, "CONTENT_REFERENCE")[index]?.referencedItem ?? null;
}

/** A rejected image leaves the tile's slot empty and records why — a tile never
 *  borrows the static photo for an API card, or the two disagree silently.
 *  "no dimensions" is not logged: it is true of most placeholders today and
 *  belongs in the media manifest, not in every build's log line. */
function image(
  ref: MediaRef | null | undefined,
  gaps: string[],
  label: string,
  opts: { decorative?: boolean; altFallback?: string } = {},
): MediaAsset | undefined {
  const result = toMediaAsset(ref, opts);
  if ("rejected" in result) {
    gaps.push(`${label}: ${result.rejected}`);
    return undefined;
  }
  for (const note of result.notes) {
    if (note !== "no dimensions") gaps.push(`${label}: ${note}`);
  }
  return result.asset;
}

/** config.cta — the only place a CTA's label comes from now. */
function cta(
  section: Section,
  put: (field: string, value: string) => CopyKey,
  gaps: string[],
): HomeCta | undefined {
  const found = configCta(section.config);
  if (!found) {
    gaps.push("config.cta missing");
    return undefined;
  }
  return { labelKey: put("cta", found.label), href: found.path };
}

/** A card's own route, else the section CTA's. Null on both is a gap: the link
 *  is dropped, the tile stays. */
function hrefOf(card: CardRef | null, fallback: HomeCta | undefined, gaps: string[]) {
  if (card?.path) return card.path;
  if (fallback) return fallback.href;
  gaps.push(`${card?.slug ?? "card"}: no path and no config.cta`);
  return undefined;
}

// ── the adapters ───────────────────────────────────────────────────────────

const statement: KindAdapter = (section, key) => {
  const { copy, put } = bag(section);
  const text = firstText(section);
  if (!text) return { skip: "no TEXT block" };
  if (text.length > STATEMENT_MAX) {
    return { skip: `text is ${text.length} chars, max ${STATEMENT_MAX}` };
  }
  return { tile: { id: key, kind: "statement", textKey: put("text", text) }, copy, gaps: [] };
};

const linkList: KindAdapter = (section, key) => {
  const { copy, put } = bag(section);
  const gaps: string[] = [];
  const links: HomeLink[] = [];
  for (const item of section.items ?? []) {
    if (!item.path) {
      gaps.push(`item ${item.slug}: no path, link dropped`);
      continue;
    }
    links.push({
      labelKey: put(`link.${item.id}`, item.label?.trim() || item.title),
      href: item.path,
      ...(item.meta?.trim() ? { metaKey: put(`meta.${item.id}`, item.meta.trim()) } : {}),
    });
  }
  if (!links.length) return { skip: "no items with a path" };
  const heading = title(section);
  return {
    tile: {
      id: key,
      kind: "linkList",
      ...(heading ? { headingKey: put("heading", heading) } : {}),
      links,
    },
    copy,
    gaps,
  };
};

interface ConfigRow {
  label?: unknown;
  displayDate?: unknown;
  path?: unknown;
}

const calendar: KindAdapter = (section, key) => {
  const { copy, put } = bag(section);
  const gaps: string[] = [];
  const overline = title(section);
  if (!overline) return { skip: "no title" };

  const rows: CalendarRow[] = [];
  configArray(section.config, "rows").forEach((raw, i) => {
    const row = raw as ConfigRow;
    const label = typeof row.label === "string" ? row.label.trim() : "";
    const date = typeof row.displayDate === "string" ? row.displayDate.trim() : "";
    if (!label || !date) {
      gaps.push(`config.rows[${i}]: needs both label and displayDate`);
      return;
    }
    rows.push({
      labelKey: put(`row.${i}`, label),
      date,
      ...(typeof row.path === "string" && row.path ? { href: row.path } : {}),
    });
  });
  if (!rows.length) return { skip: "config.rows empty" };

  const link = cta(section, put, gaps);
  return {
    tile: {
      id: key,
      kind: "calendar",
      overlineKey: put("overline", overline),
      rows,
      ...(link ? { cta: link } : {}),
    },
    copy,
    gaps,
  };
};

const NEWS_ROWS = 3;

const news: KindAdapter = (section, key, locale) => {
  const { copy, put } = bag(section);
  const gaps: string[] = [];
  const overline = title(section);
  if (!overline) return { skip: "no title" };

  const rows: NewsRow[] = [];
  for (const item of (section.items ?? []).slice(0, NEWS_ROWS)) {
    if (!item.publishedAt) {
      gaps.push(`item ${item.slug}: no publishedAt, row dropped`);
      continue;
    }
    if (!item.path) {
      gaps.push(`item ${item.slug}: no path, row dropped`);
      continue;
    }
    // A rejected thumbnail leaves the row's image box empty; the row stays.
    const thumb = image(item.thumbnail, gaps, `item ${item.slug} thumbnail`, {
      decorative: true,
    });
    rows.push({
      headlineKey: put(`headline.${item.id}`, item.title),
      date: formatDate(item.publishedAt, locale),
      href: item.path,
      ...(thumb ? { thumbnail: thumb } : {}),
    });
  }
  if (!rows.length) return { skip: "no usable items" };

  const link = cta(section, put, gaps);
  return {
    tile: {
      id: key,
      kind: "news",
      overlineKey: put("overline", overline),
      rows,
      ...(link ? { cta: link } : {}),
    },
    copy,
    gaps,
  };
};

const feature: KindAdapter = (section, key) => {
  const { copy, put } = bag(section);
  const gaps: string[] = [];
  const serif = title(section);
  if (!serif) return { skip: "no title" };
  const sub = firstText(section);
  if (!sub) gaps.push("no TEXT block for the sub-line");
  const link = cta(section, put, gaps);
  return {
    tile: {
      id: key,
      kind: "feature",
      serifKey: put("serif", serif),
      ...(sub ? { subKey: put("sub", sub) } : {}),
      ...(link ? { cta: link } : {}),
    },
    copy,
    gaps,
  };
};

const portrait: KindAdapter = (section, key) => {
  const { copy, put } = bag(section);
  const gaps: string[] = [];
  const person = refAt(section, 0);
  if (!person) return { skip: "no CONTENT_REFERENCE block" };
  const photo = image(person.thumbnail, gaps, `${person.slug} photo`, {
    altFallback: person.title,
  });
  if (!photo) return { skip: "portrait has no usable photo" };

  const link = cta(section, put, gaps);
  const overline = title(section);
  const bio = person.heroText?.trim();
  const href = hrefOf(person, link, gaps);
  return {
    tile: {
      id: key,
      kind: "portrait",
      ...(overline ? { overlineKey: put("overline", overline) } : {}),
      photo,
      nameKey: put("name", person.title),
      ...(bio ? { bioKey: put("bio", bio) } : {}),
      ...(href ? { href } : {}),
    },
    copy,
    gaps,
  };
};

const mediaCard: KindAdapter = (section, key) => {
  const { copy, put } = bag(section);
  const gaps: string[] = [];
  const card = refAt(section, 0);
  if (!card) return { skip: "no CONTENT_REFERENCE block" };

  const link = cta(section, put, gaps);
  const photo = image(card.thumbnail, gaps, `${card.slug} image`, { altFallback: card.title });
  const date = configString(section.config, "displayDate");
  const overline = title(section);
  const href = hrefOf(card, link, gaps);
  const body = card.heroText?.trim();

  // The byline is a second reference (Young Designers: the project, then its
  // designer). Only its name and face are used — the card's own title is the
  // project's.
  const byline = refAt(section, 1);
  const avatar = byline
    ? image(byline.thumbnail, gaps, `${byline.slug} avatar`, { altFallback: byline.title })
    : undefined;

  return {
    tile: {
      id: key,
      kind: "mediaCard",
      ...(photo ? { media: photo } : {}),
      ...(overline ? { overlineKey: put("overline", overline) } : {}),
      titleKey: put("title", card.title),
      ...(date ? { date } : {}),
      ...(byline ? { bylineKey: put("byline", byline.title) } : {}),
      ...(avatar ? { bylineAvatar: avatar } : {}),
      ...(href ? { href } : {}),
      // Built whenever the content for a back face exists; getHome drops it
      // again unless the matching static tile is a flip card, because which
      // cards flip is a design decision, not an editorial one.
      ...(body && link ? { flip: { bodyKey: put("flip.body", body), cta: link } } : {}),
    },
    copy,
    gaps,
  };
};

const quote: KindAdapter = (section, key) => {
  const { copy, put } = bag(section);
  const gaps: string[] = [];
  const text = firstText(section);
  if (!text) return { skip: "no TEXT block" };
  const link = cta(section, put, gaps);
  if (!link) return { skip: "config.cta missing — a quote must name its speaker" };
  const speaker = refAt(section, 0);
  const avatar = speaker
    ? image(speaker.thumbnail, gaps, `${speaker.slug} avatar`, { altFallback: speaker.title })
    : undefined;
  return {
    tile: {
      id: key,
      kind: "quote",
      quoteKey: put("quote", text),
      ...(avatar ? { avatar } : {}),
      attribution: link,
    },
    copy,
    gaps,
  };
};

const ROSTER_AVATARS = 6;

const roster: KindAdapter = (section, key) => {
  const { copy, put } = bag(section);
  const gaps: string[] = [];
  const heading = title(section);
  if (!heading) return { skip: "no title" };

  const avatars: MediaAsset[] = [];
  for (const person of (section.items ?? []).slice(0, ROSTER_AVATARS)) {
    const avatar = image(person.thumbnail, gaps, `${person.slug} avatar`, {
      altFallback: person.title,
    });
    if (avatar) avatars.push(avatar);
  }
  if (!avatars.length) return { skip: "no items with a usable avatar" };
  if (avatars.length < ROSTER_AVATARS) {
    gaps.push(`items[] gave ${avatars.length} avatars, the tile shows ${ROSTER_AVATARS}`);
  }

  const body = configString(section.config, "body");
  const link = cta(section, put, gaps);
  return {
    tile: {
      id: key,
      kind: "roster",
      headingKey: put("heading", heading),
      ...(body ? { bodyKey: put("body", body) } : {}),
      avatars,
      ...(link ? { cta: link } : {}),
    },
    copy,
    gaps,
  };
};

const spine: KindAdapter = (section, key) => {
  const { copy, put } = bag(section);
  const gaps: string[] = [];
  const heading = title(section);
  if (!heading) return { skip: "no title" };
  const spines = configArray(section.config, "books")
    .filter((b): b is string => typeof b === "string" && b.trim().length > 0)
    .map((b) => b.trim());
  if (!spines.length) return { skip: "config.books empty" };
  const link = cta(section, put, gaps);
  return {
    tile: {
      id: key,
      kind: "spine",
      headingKey: put("heading", heading),
      spines,
      ...(link ? { href: link.href } : {}),
    },
    copy,
    gaps,
  };
};

export const KIND_ADAPTERS: Record<string, KindAdapter> = {
  statement,
  linkList,
  calendar,
  news,
  feature,
  portrait,
  mediaCard,
  quote,
  roster,
  spine,
};

/** The hero is a document field, not a section — `hero[0]` is the still, and a
 *  second entry with a video mimeType is the film. */
export function heroDraft(api: PublicContentResponse): KindResult {
  const gaps: string[] = [];
  const still = image(api.hero[0], gaps, "hero", { altFallback: api.title ?? "" });
  if (!still) return { skip: gaps[0] ?? "no hero media" };

  const film = api.hero.find((m) => m.mimeType?.startsWith("video/"));
  if (!film) gaps.push("no video in hero[] — film from static");

  return {
    tile: {
      id: "hero",
      kind: "hero",
      media: still,
      ...(film ? { video: { src: film.url, title: film.title?.trim() || "" } } : {}),
    },
    copy: {},
    gaps,
  };
}
