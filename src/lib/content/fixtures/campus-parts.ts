// Builders shared by the three campus fixtures (campus-*.ts), so each file is
// only its board's content.
import type { DerivedPageContext, Link, Page, Section } from "@/lib/content-model";
import { PAGE_ID } from "@/lib/content/pages";

export type CampusKey = "ahmedabad" | "gandhinagar" | "bengaluru";

export const CAMPUS_PAGE: Record<CampusKey, string> = {
  ahmedabad: PAGE_ID.campusAhmedabad,
  gandhinagar: PAGE_ID.campusGandhinagar,
  bengaluru: PAGE_ID.campusBengaluru,
};

const NAME: Record<CampusKey, string> = {
  ahmedabad: "Ahmedabad",
  gandhinagar: "Gandhinagar",
  bengaluru: "Bengaluru",
};

export const PUBLISHED = "2026-09-21T00:00:00+05:30";

export function textSection(
  campus: CampusKey,
  id: string,
  order: number,
  title: string,
  paragraphs: string[],
  links: Link[] = [],
): Section {
  return {
    id,
    page: CAMPUS_PAGE[campus],
    order,
    type: "text",
    title,
    ...(paragraphs.length ? { body: paragraphs.join("\n\n") } : {}),
    items: [],
    links,
    contacts: [],
  };
}

/** A Thumb card record. `parent` decides its route: a programme page has one
 *  (/programmes/bdes); a discipline has none yet, so it renders unlinked. */
export function thumb(parent: string, slug: string, title: string, meta: string): Page {
  return {
    id: `${parent}-${slug}`,
    title,
    slug,
    parent,
    template: "secondary",
    utility: "back",
    keyInfo: [],
    hero: [],
    intro: meta,
    sections: [],
    contacts: [],
    publishedAt: PUBLISHED,
  };
}

export function pageLink(id: string, label: string, page: string): Link {
  return { id, label, targetType: "page", page };
}

/** Back-nav, breadcrumb and the "Other campuses" band: the other two. */
export function campusDerived(campus: CampusKey): DerivedPageContext {
  const others = (Object.keys(NAME) as CampusKey[]).filter((c) => c !== campus);
  return {
    menuTree: [],
    breadcrumb: [
      { id: PAGE_ID.about, title: "About NID", path: "/about" },
      { id: PAGE_ID.campuses, title: "Campuses", path: "/about/campuses" },
      { id: CAMPUS_PAGE[campus], title: NAME[campus], path: `/about/campuses/${campus}` },
    ],
    backNav: { label: "Campuses", href: "/about/campuses" },
    subPageLinks: [],
    siblingBand: others.map((c) => ({
      id: CAMPUS_PAGE[c],
      title: NAME[c], // the board labels them by city alone (4315:276801)
      href: `/about/campuses/${c}`,
    })),
  };
}
