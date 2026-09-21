// The document ids the front end has to know by name, and their file paths.
// A `Link` with targetType="document" carries only the document's UUID and
// `PageResponse` does not resolve it — the same gap `pages.ts` covers for pages.
// This is the static half of that derivation and goes the day the API resolves
// a document link to a path.
import type { UUID } from "@/lib/content-model";

export const DOCUMENT_ID = {
  nidAct: "document-nid-act-and-statutes",
  indiaReport: "document-the-india-report",
} as const;

/** The paths themselves. Exported because a PAGE-level document link has no
 *  `Link` to resolve: `Page` has no link slot, so Charter's Act row rides on
 *  `Page.contacts` as a value (see the note on `contactCta` in links.ts). */
export const DOCUMENT_PATH = {
  nidAct: "/documents/nid-act-and-statutes.pdf",
  indiaReport: "/documents/the-india-report.pdf",
} as const;

const PATH: Record<UUID, string> = {
  [DOCUMENT_ID.nidAct]: DOCUMENT_PATH.nidAct,
  [DOCUMENT_ID.indiaReport]: DOCUMENT_PATH.indiaReport,
};

export function documentPath(id: UUID | undefined): string | undefined {
  return id === undefined ? undefined : PATH[id];
}
