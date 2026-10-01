// The academic calendar rows that Home's tile and /study's Academic
// Notifications list both show — one list, so the two pages cannot drift apart.
// Static content, not UI strings: the titles used to sit in messages/en.json.
//
// The rows are the CMS's academic-calendar `event` records calendar-01, -02,
// -03 and -05 (calendar-04, Graduation Jury Week, is not on either board). The
// dates are display strings as Home has always shipped them; nothing parses
// them, and no row carries a machine date or a link (STAGE-0-NOTES §73).
// TODO(review): backend — a `calendar` type or flag, a curated list naming
// which entries a page shows and in what order, and the record in the cards
// union (startDate, endDate?, display date, url?). Until then the rows are
// static, and three of the four are already past.
export interface CalendarEntry {
  id: string;
  title: string;
  date: string;
}

export const ACADEMIC_CALENDAR: readonly CalendarEntry[] = [
  { id: "calendar-01-placement-week", title: "Placement week", date: "June 1 to June 5 2026" },
  {
    id: "calendar-02-orientation-for-m-des-b-des-batch-2026-2027",
    title: "Orientation for M.Des & B.Des Batch 2026-2027",
    date: "July 9 & 10 2026",
  },
  { id: "calendar-03-first-semester-commences", title: "First Semester Commences", date: "Mon, July 13 2026" },
  { id: "calendar-05-faculty-meetings", title: "Faculty Meetings", date: "Fri, Aug 7 2026  &  Fri, Oct 16 2026" },
];
