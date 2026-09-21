import { linkIcon, linkNewTab, type LabelValue, type Link } from "@/lib/content-model";
import { documentPath } from "@/lib/content/documents";
import { pagePath, pathOf } from "@/lib/content/pages";
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
  "/about/charter",
  "/about/news-events",
  "/about/our-themes",
  "/swatch",
] as const;

const BUILT = BUILT_ROUTES.map((route) => route.split("/").filter(Boolean));

/** Whether a locale-less site path has a page. Query and hash are ignored. */
export function isBuiltRoute(path: string): boolean {
  const segments = normalise(path.split(/[?#]/)[0] ?? "").split("/").filter(Boolean);
  return BUILT.some(
    (route) =>
      route.length === segments.length &&
      route.every((part, i) => /^\[.+\]$/.test(part) || part === segments[i]),
  );
}

// THE route gate. Content links — cards, list rows, CTAs — go through it; the
// header menu and footer do not, because they publish the sitemap ahead of the
// build by design (they only turn prefetch off). A link withheld here relinks
// itself the day its page.tsx lands and joins BUILT_ROUTES.
// TODO(review): the real fix for most of what this withholds is the news
// article detail route, /about/news-events/[slug] — it needs its own board and
// a per-slug API contract before it can be built.
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
        ? documentPath(link.document)
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
  if (/^\+?[\d\s()-]{6,}$/.test(value)) {
    return { label: value, href: `tel:${value.replace(/[\s()-]/g, "")}`, icon: "none" };
  }
  if (!value.startsWith("/")) return null;
  if (value.endsWith(".pdf")) {
    // `external` is what makes Cta emit a plain <a target="_blank"> — right for
    // a file, which is not a locale-prefixed route. Matches linkNewTab().
    return { label: contact.label, href: value, external: true, icon: "document" };
  }
  return { label: contact.label, href: value };
}
