// "July 23 2026" — the card date as the boards set it: long month, day, year,
// no comma.
export function formatDate(iso: string, locale: string): string {
  const parts = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("month")} ${get("day")} ${get("year")}`;
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
