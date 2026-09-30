// Builders shared by the programme page fixtures (programme-*.ts), so each file
// is only its page's content.
import type { DerivedPageContext, Section, UUID } from "@/lib/content-model";
import { PAGE_ID, pathOf } from "@/lib/content/pages";
import { programmesBand } from "@/lib/content/sibling-bands";

/** The admissions site. The CMS's own Apply link on Ph.D points here, and the
 *  B.Des and M.Des prose name it; it is the fixture's link for both. */
export const ADMISSIONS_URL = "https://admissions.nid.edu/";

export const PUBLISHED = "2026-09-30T00:00:00+05:30";

export function textSection(page: UUID, id: string, order: number, title: string, body: string): Section {
  return { id, page, order, type: "text", title, body, items: [], links: [], contacts: [] };
}

/** Back-nav target, breadcrumb and the "More in Programmes" band: the six
 *  programme pages in the /programmes rail's order, minus this one. */
export function programmeDerived(id: UUID, title: string): DerivedPageContext {
  const path = pathOf(id)!;
  return {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.programmes, title: "Programmes", path: "/programmes" },
      { id, title, path },
    ],
    backNav: { label: "Programmes", href: "/programmes" },
    subPageLinks: [],
    siblingBand: programmesBand(path),
  };
}
