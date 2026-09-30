// "July 23 2026" — the card date as the boards set it: long month, day, year,
// no comma.
//
// Pinned to India's zone: the build runs in UTC on CI, and an article the CMS
// stamps 00:30 IST (19:00 UTC the day before) would otherwise print the wrong
// day. The date an NID reader sees is the date in India, wherever it is built.
export function formatDate(iso: string, locale: string): string {
  const parts = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("month")} ${get("day")} ${get("year")}`;
}

function dayMonthYear(iso: string, locale: string) {
  const parts = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return { day: get("day"), month: get("month"), year: get("year") };
}

/** "04 February 2026" — an archive row's date as its board sets it: the article
 *  rail's order with a two-digit day. Same India pinning as formatDate. */
export function formatArchiveDate(iso: string, locale: string): string {
  const { day, month, year } = dayMonthYear(iso, locale);
  return `${day.padStart(2, "0")} ${month} ${year}`;
}

/** The year an NID reader sees for this instant — the year formatArchiveDate
 *  prints, so a row never sits under a year its own date contradicts. */
export function yearInIndia(iso: string): string {
  return dayMonthYear(iso, "en").year;
}

/** "22 January 2026", or a range — "30–31 October 2026", "30 October – 2
 *  November 2026" — the article rail's Date row as both boards set it: day
 *  first, which is not the cards' "July 23 2026". Same India pinning as
 *  formatDate. */
export function formatEventDate(start: string, locale: string, end?: string | null): string {
  const a = dayMonthYear(start, locale);
  const one = `${a.day} ${a.month} ${a.year}`;
  if (!end) return one;
  const b = dayMonthYear(end, locale);
  if (a.year !== b.year) return `${one} – ${b.day} ${b.month} ${b.year}`;
  if (a.month !== b.month) return `${a.day} ${a.month} – ${b.day} ${b.month} ${b.year}`;
  return a.day === b.day ? one : `${a.day}–${b.day} ${b.month} ${b.year}`;
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/** TEXT blocks are HTML. A Standfirst renders plain text, so tags go and
 *  entities are decoded; the tag names come back so the log can say what went. */
export function plainText(html: string): { text: string; tags: string[] } {
  const tags = [
    ...new Set([...html.matchAll(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi)].map((m) => m[1]!.toLowerCase())),
  ];
  const text = html
    // A block boundary becomes a space; an inline tag (<strong>) goes without
    // one, or "<strong>NID</strong>." would read "NID ."
    .replace(/<\/?(p|div|br|li|ul|ol|h[1-6]|blockquote)\b[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, e: string) => ENTITIES[e.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
  return { text, tags };
}

// An authored paragraph break, and nothing else:
//   a blank line          — two or more newlines with only whitespace between
//   `</p>` then `<p>`     — whitespace between allowed
//   two or more `<br>`s   — whitespace between allowed
// A LONE `<br>` stays a space, as in plainText: a section body renders
// paragraphs only, with no in-paragraph line break to carry it to, and turning
// it into a paragraph would invent a boundary the author did not write. Single
// newlines, other block tags and every inline tag are plainText's, unchanged.
const PARAGRAPH_BREAK = /\n[^\S\n]*\n\s*|<\/p\s*>\s*<p\b[^>]*>|(?:<br\s*\/?>\s*){2,}/gi;

// ── Rich section bodies ────────────────────────────────────────────────────
// A section body may carry a closed set of tags, rendered by Prose.tsx and
// nothing else: p, ul, ol, li, strong, em. We set the list ourselves (the
// backend is frozen). The CMS sends only <strong> and <em> inline, and lists
// as runs of "- " TEXT blocks (joinBlocks below); no document uses <ul>.
//
// The body STRING is markup-safe: text between allowed tags is entity-escaped
// (&, <, >), so a literal "<strong>" typed as text stays text. Prose decodes
// exactly those entities after it has parsed the tags.

const INLINE = new Set(["strong", "em"]);
const escapeText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** One authored paragraph of CMS HTML as body markup: <strong>/<em> kept
 *  (attributes dropped), every other tag dropped, script and style with their
 *  content, text decoded then re-escaped. Whitespace as plainText. */
function richText(html: string): { text: string; tags: string[] } {
  const tags = new Set<string>();
  const cleaned = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, (_, t: string) => {
    tags.add(t.toLowerCase());
    return " ";
  });
  let out = "";
  let last = 0;
  for (const m of cleaned.matchAll(/<(\/?)([a-z][a-z0-9]*)\b[^>]*>/gi)) {
    out += escapeText(decodeRaw(cleaned.slice(last, m.index)));
    const name = m[2]!.toLowerCase();
    tags.add(name);
    if (INLINE.has(name)) out += `<${m[1]}${name}>`;
    else out += /^(p|div|br|li|ul|ol|h[1-6]|blockquote)$/.test(name) ? " " : "";
    last = m.index! + m[0].length;
  }
  out += escapeText(decodeRaw(cleaned.slice(last)));
  // Collapse whitespace as plainText does, then pull it out of the tag edges
  // ("<strong> NID</strong>" reads the same, and keeps the output stable).
  const text = out
    .replace(/\s+/g, " ")
    .replace(/<(strong|em)> /g, " <$1>")
    .replace(/ <\/(strong|em)>/g, "</$1> ")
    .replace(/\s+/g, " ")
    .replace(/<(strong|em)><\/\1>/g, "")
    .trim();
  return { text, tags: [...tags] };
}

/** Entities decoded, tags untouched (there are none in a text run). */
function decodeRaw(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, e: string) => ENTITIES[e.toLowerCase()] ?? m);
}

/** A section body: each authored paragraph (PARAGRAPH_BREAK) as body markup,
 *  <strong>/<em> kept, joined by the blank line Prose splits on. Carries
 *  across the breaks an editor wrote and invents none — never a sentence
 *  splitter. Single-paragraph fields (a standfirst, a tile's statement) stay
 *  on plainText. */
export function richParagraphs(html: string): { text: string; tags: string[]; breaks: number } {
  const parts = html.split(PARAGRAPH_BREAK).map(richText);
  const kept = parts.filter((p) => p.text);
  return {
    text: kept.map((p) => p.text).join("\n\n"),
    tags: [...new Set(parts.flatMap((p) => p.tags))],
    breaks: kept.length - 1,
  };
}

const LIST_ITEM = /^(?:-|•)\s+/;

/** TEXT blocks (each already richParagraphs'd) joined into one body. A run of
 *  TWO or more consecutive single-paragraph blocks led by "- " or "• " is one
 *  <ul>, markers stripped: that is how the CMS authors a list. A lone dash-led
 *  block stays a paragraph — one is not a list, and it may be a dash. No
 *  numbering is ever inferred. */
export function joinBlocks(texts: string[]): { body: string; lists: number } {
  const out: string[] = [];
  let lists = 0;
  for (let i = 0; i < texts.length; ) {
    let j = i;
    while (j < texts.length && LIST_ITEM.test(texts[j]!) && !texts[j]!.includes("\n\n")) j++;
    if (j - i >= 2) {
      out.push(`<ul>${texts.slice(i, j).map((t) => `<li>${t.replace(LIST_ITEM, "")}</li>`).join("")}</ul>`);
      lists++;
      i = j;
    } else {
      out.push(texts[i]!);
      i++;
    }
  }
  return { body: out.filter(Boolean).join("\n\n"), lists };
}
