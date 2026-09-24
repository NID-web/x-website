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

/** A section body: plainText per authored paragraph, joined by the blank line
 *  that ClampedProse and SectionBody split on. Carries across the breaks an
 *  editor wrote and invents none — never a sentence splitter. Single-paragraph
 *  fields (a standfirst, a tile's statement) stay on plainText. */
export function plainParagraphs(html: string): { text: string; tags: string[]; breaks: number } {
  const parts = html.split(PARAGRAPH_BREAK).map(plainText);
  const kept = parts.filter((p) => p.text);
  return {
    text: kept.map((p) => p.text).join("\n\n"),
    tags: [...new Set(parts.flatMap((p) => p.tags))],
    breaks: kept.length - 1,
  };
}
