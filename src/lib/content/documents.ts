// The document ids the front end has to know by name, and their file paths.
// A `Link` with targetType="document" carries only the document's UUID and
// `PageResponse` does not resolve it — the same gap `pages.ts` covers for pages.
// This is the static half of that derivation and goes the day the API resolves
// a document link to a path.
import type { Link, UUID } from "@/lib/content-model";

export const DOCUMENT_ID = {
  indiaReport: "document-the-india-report",
} as const;

/** The paths themselves. Exported because a PAGE-level document link has no
 *  `Link` to resolve: `Page` has no link slot, so History's India Report row
 *  rides on `Page.contacts` as a value (see the note on `contactCta` in links.ts). */
export const DOCUMENT_PATH = {
  indiaReport: "/documents/the-india-report.pdf",
} as const;

const PATH: Record<UUID, string> = {
  [DOCUMENT_ID.indiaReport]: DOCUMENT_PATH.indiaReport,
};

export function documentPath(id: UUID | undefined): string | undefined {
  return id === undefined ? undefined : PATH[id];
}

/**
 * A document link the CMS made: a LINK block with no url and its file in
 * `media` (Young Designers' "Download Young Designers", STAGE-0-NOTES §76). The
 * model's `document` is the media id, as it should be; the API does not resolve
 * an id to a path (see the header), so the file's URL rides beside it until it
 * does. Front-end only, like editorial.ts's types — not a change to
 * content-model.ts.
 */
export type CmsFileLink = Link & { targetType: "document"; file: string };

/** A document link's href: a known document's path, else a CMS file's URL. */
export function documentHref(link: Link): string | undefined {
  return documentPath(link.document) ?? (link as Partial<CmsFileLink>).file;
}
