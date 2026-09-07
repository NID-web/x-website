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
