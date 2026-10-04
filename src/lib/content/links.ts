import { linkIcon, linkNewTab, type LabelValue, type Link } from "@/lib/content-model";
import { documentHref } from "@/lib/content/documents";
import { pagePath, pathOf } from "@/lib/content/pages";
import { BUILT_RESEARCH_CENTRES } from "@/lib/content/research-centres";
import { FACULTY_VIEW_PARAMS } from "@/lib/content/faculty-views";
import { normalise } from "@/lib/nav-trail";
import type { CtaProps } from "@/components/spine/Cta";

type ResolvedCta = Pick<CtaProps, "label" | "href" | "external" | "icon">;

// Every content route that has a page.tsx under src/app/[locale], locale-less.
// A `[param]` segment matches any one segment. Hand-kept on purpose — no
// filesystem scan at runtime — and scripts/lint-routes.mjs fails `npm run lint`
// the moment this list and the app directory disagree in either direction.
export const BUILT_ROUTES = [
  "/",
  "/about",
  "/about/campuses",
  "/about/campuses/ahmedabad",
  "/about/campuses/bengaluru",
  "/about/campuses/gandhinagar",
  "/about/charter",
  "/about/directors-message",
  "/about/history",
  "/about/news-events",
  "/about/news-events/archive",
  "/about/news-events/[slug]",
  "/about/our-themes",
  "/about/student-awards",
  "/consulting",
  "/people",
  "/people/faculty",
  "/people/faculty/[slug]",
  "/people/faculty/by/[view]",
  "/programmes",
  "/programmes/bdes",
  "/programmes/bdes/[discipline]",
  "/programmes/curriculum-objectives",
  "/programmes/fdp",
  "/programmes/international",
  "/programmes/mdes",
  "/programmes/mdes/[discipline]",
  "/programmes/phd",
  "/research",
  "/research/[slug]",
  "/study",
  "/study/admission",
  "/study/life-at-nid",
  "/study/notifications",
  "/study/pm-vidyalaxmi",
  "/study/young-designers",
  "/swatch",
] as const;

const BUILT = BUILT_ROUTES.map((route) => route.split("/").filter(Boolean));

// The values a `[param]` route actually builds, by route. A dynamic route is
// built for exactly its generateStaticParams and nothing else (dynamicParams =
// false), so "any segment" would be a lie: /about/news-events/[slug] matching
// any slug would relink every card whose slug the build did not generate,
// straight to a 404 — the reason the campus pages are three route files and not
// a `[campus]` folder (§57).
// Unregistered means NOT built: a gate that runs before registration withholds
// the link rather than guessing it. Build-time state, set by the route's own
// data module (getArticle.ts) before any page gates its links.
const BUILT_PARAMS = new Map<string, ReadonlySet<string>>();

export function registerBuiltParams(route: (typeof BUILT_ROUTES)[number], values: Iterable<string>) {
  BUILT_PARAMS.set(route, new Set(values));
}

// The research centres are a static list (research-centres.ts), so they are
// registered here, at module load, rather than by a data module a page awaits:
// a campus page or an article links a centre without ever loading the centres'
// data, and a gate that ran first would withhold the link (§79).
registerBuiltParams("/research/[slug]", BUILT_RESEARCH_CENTRES);
// The faculty directory's views, the same way: a static list (faculty-views.ts),
// linked from every view's band and switcher (§82).
registerBuiltParams("/people/faculty/by/[view]", FACULTY_VIEW_PARAMS);

/** Whether a locale-less site path has a page. Query and hash are ignored. */
export function isBuiltRoute(path: string): boolean {
  const segments = normalise(path.split(/[?#]/)[0] ?? "").split("/").filter(Boolean);
  return BUILT.some((route, r) => {
    if (route.length !== segments.length) return false;
    const params = BUILT_PARAMS.get(BUILT_ROUTES[r]!);
    return route.every((part, i) =>
      /^\[.+\]$/.test(part) ? Boolean(params?.has(segments[i]!)) : part === segments[i],
    );
  });
}

// THE route gate. Content links — cards, list rows, CTAs — go through it; the
// header menu and footer do not, because they publish the sitemap ahead of the
// build by design (they only turn prefetch off). A link withheld here relinks
// itself the day its page.tsx lands and joins BUILT_ROUTES.
export function builtHref(href: string | undefined): string | undefined {
  return href && isBuiltRoute(href) ? href : undefined;
}

/** A card's destination, or undefined for a card that renders unlinked. */
export function cardHref(item: Parameters<typeof pagePath>[0]): string | undefined {
  return builtHref(pagePath(item));
}

// A content-model Link as Cta props: the href from whichever target field is
// set, the icon and new-tab flag derived, never authored (NID-CONTEXT.md §7.1).
export function ctaProps(link: Link): ResolvedCta | null {
  const href =
    link.targetType === "page" && link.page
      ? pathOf(link.page)
      : link.targetType === "document"
        ? documentHref(link)
        : link.targetType === "external"
          ? link.url
          : link.targetType === "email"
            ? `mailto:${link.address}`
            : link.targetType === "phone"
              ? `tel:${link.address}`
              : undefined;
  if (!href) return null;
  return {
    label: link.label,
    href,
    external: linkNewTab(link),
    // A document link leads with the file glyph and keeps its trailing arrow;
    // `Cta` reads that off the icon name. `linkIcon` cannot say so — it is in
    // content-model.ts, the backend contract, which is not ours to edit.
    icon: link.targetType === "document" ? "document" : (linkIcon(link) ?? "none"),
  };
}

// A page-level contact as Cta props, with the targetType INFERRED FROM THE
// VALUE. It sniffs strings because `Page.contacts` is `LabelValue[]` and has no
// targetType field — the model gives a page no slot for a Link at all
// (STAGE-0-NOTES §33 proposes `Page.introLinks` for exactly this).
//
// Order matters; first match wins:
//   contains "@"            email  -> mailto:, NO icon (NID-CONTEXT §7.1)
//   leading "+" or digits   phone  -> tel:,    NO icon
//   … that, then "Ext. 115" phone  -> tel:…;ext=115 (RFC 3966), NO icon (§79)
//   "+91 079 …" (trunk 0)    phone  -> NULL, plain text: not dialable (§80)
//   "/…​.pdf"                document -> leading file glyph, trailing arrow, new tab
//   leading "/"             page   -> trailing arrow, locale-prefixed
//
// Anything else returns NULL and the caller falls back to rendering the pair as
// label + plain text. That fallback is the point: a contact is not always a
// link — a postal address, an office name — and a guessed scheme would ship a
// dead anchor rather than a legible line of text.
export function contactCta(contact: LabelValue): ResolvedCta | null {
  const value = contact.value.trim();
  if (value.includes("@") && !value.startsWith("/")) {
    return { label: value, href: `mailto:${value}`, icon: "none" };
  }
  // A trunk 0 after the country code ("+91 079 …") is not a dialable
  // international number, and the value is never rewritten: plain text (§80).
  if (/^\+\d{1,3}\s*0/.test(value)) return null;
  if (/^\+?[\d\s()-]{6,}$/.test(value)) {
    return { label: value, href: `tel:${value.replace(/[\s()-]/g, "")}`, icon: "none" };
  }
  // A number with an extension (the Bamboo centre's "+91 80 2972 5006 Ext.
  // 115"). Only a value that ends in one, so no other contact changes.
  const extension = /^(\+?[\d\s()-]{6,}?)[\s·,]*ext\.?\s*(\d{1,6})$/i.exec(value);
  if (extension) {
    return { label: value, href: `tel:${extension[1]!.replace(/[\s()-]/g, "")};ext=${extension[2]}`, icon: "none" };
  }
  if (!value.startsWith("/")) return null;
  if (value.endsWith(".pdf")) {
    // `external` is what makes Cta emit a plain <a target="_blank"> — right for
    // a file, which is not a locale-prefixed route. Matches linkNewTab().
    return { label: contact.label, href: value, external: true, icon: "document" };
  }
  return { label: contact.label, href: value };
}
