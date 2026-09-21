// The seam for everything that is on EVERY page: the header menu and the four
// footer columns. Same discipline as getHome — per unit, API over static, with
// the reason for each fallback in one `[cms] chrome:` line — but the units here
// are the menu, the two footer link columns, the contacts, the social row and
// the collaboration logos.
//
// Four requests at most per build, all of them shared by every page through
// cache() and cmsFetch()'s own cache(). The menu comes out of the home document
// the page already fetched rather than /public/navigation/header, which serves
// the identical tree — one request fewer for the same bytes.
//
// No NavItem carries a `path`, so every route is DERIVED from its CMS slug
// through pathOfCmsSlug() — sitemap.json's routes, never a guess from the slug.
// Without that, every child and then every section dropped, and the whole menu
// and footer fell back without a word.
//
// Labels reach the components through the same synthetic-key trick Home uses:
// Footer renders `t(link.labelKey)`, so an API label is stored under an
// `api.*` key that the page's translator resolves first. No component changes.
import { cache } from "react";
import { cmsFetch } from "@/lib/api/client";
import {
  isContactDetails,
  isContentItems,
  isPublicContentResponse,
  isSiteConfig,
  type NavItem,
} from "@/lib/api/types";
import { toMediaAsset } from "@/lib/api/media";
import { pathOfCmsSlug } from "@/lib/content/pages";
import { MENU_SECTIONS, type NavSection } from "@/lib/nav-content";
import {
  FOOTER,
  type Collaborator,
  type ContactLink,
  type FooterContent,
  type SocialLink,
  type SocialPlatform,
} from "@/lib/footer-content";

export interface SiteChrome {
  menu: NavSection[];
  footer: FooterContent;
  /** Resolved API labels, keyed by the synthetic `api.*` keys in `footer`. */
  copy: Record<string, string>;
}

const PLATFORMS: SocialPlatform[] = ["x", "facebook", "instagram", "youtube"];

/** Rendered heights from the export's footer grid, keyed by the CMS slug. The
 *  API sends no height (correctly — it is presentation), and the marks must not
 *  be stretched to a common box, so each one keeps its own. */
const LOGO_HEIGHT: Record<string, number> = {
  "skill-india": 36,
  "india-gov-in": 32,
  "make-in-india": 30,
  "startup-india": 39,
  "ministry-of-women-and-child-development": 45,
  "khelo-india": 37,
};
const LOGO_HEIGHT_DEFAULT = 36;

/** Intrinsic pixel sizes for the same six marks. next/image in the footer needs
 *  width and height, and every API thumbnail arrives with widthPx/heightPx
 *  null; this is the stand-in until the real files are imported (the media
 *  manifest asks for them). A logo with neither is dropped rather than
 *  rendered at a guessed aspect. */
const LOGO_INTRINSIC: Record<string, { width: number; height: number }> = {
  "skill-india": { width: 43, height: 36 },
  "india-gov-in": { width: 51, height: 32 },
  "make-in-india": { width: 600, height: 274 },
  "startup-india": { width: 1080, height: 1080 },
  "ministry-of-women-and-child-development": { width: 1200, height: 800 },
  "khelo-india": { width: 571, height: 350 },
};

/** The footer's second column. The CMS serves the footer as one flat list; the
 *  design has two, and nothing in a NavItem says which one it belongs to. Until
 *  the API grows `navigation.footerSecondary`, these slugs are the tail. */
const FOOTER_SECONDARY_SLUGS = new Set([
  "right-to-information",
  "privacy-policy",
  "terms-and-conditions",
  "sitemap",
]);

const byOrder = (a: NavItem, b: NavItem) => a.orderIndex - b.orderIndex;
const routeOf = (item: NavItem) => item.path ?? pathOfCmsSlug(item.slug);

/** A nav item with no route and no children is neither a link nor a disclosure
 *  heading — it names a page the site has no route for, so the menu drops it
 *  instead of rendering a row that goes nowhere. The menu is two levels deep,
 *  so a grandchild (About NID › Campuses › Ahmedabad) has no row to live in: it
 *  is reported, never silently flattened into its parent's list. */
function toNavSection(item: NavItem, dropped: string[], deeper: string[]): NavSection | null {
  const links = [...(item.children ?? [])].sort(byOrder).flatMap((child) => {
    if (child.children?.length) deeper.push(`${item.slug}/${child.slug}(${child.children.length})`);
    const href = routeOf(child);
    if (!href) {
      dropped.push(`${item.slug}/${child.slug}`);
      return [];
    }
    return [{ label: child.label, href }];
  });
  const href = routeOf(item);
  if (!links.length && !href) {
    dropped.push(item.slug);
    return null;
  }
  return { id: item.slug, title: item.label, ...(href ? { href } : {}), links };
}

/** A dialable tel: href, or null. A value holding two numbers ("+91 79 2662
 *  9500 / 2662 9600", as the CMS stores it today) is not one: stripped naively
 *  it becomes tel:+917926629500/26629600, which a phone dials as garbage. */
function telHref(value: string): string | null {
  const digits = value.replace(/[\s-]/g, "");
  return /^\+?[0-9]{6,15}$/.test(digits) ? `tel:${digits}` : null;
}

export const getSiteChrome = cache(async (locale: string): Promise<SiteChrome> => {
  const api = [
    "/public/content/home",
    "/public/site-config",
    "/public/contact-details",
    "/public/content-items",
  ] as const;

  const [home, config, contacts, collaborations] = await Promise.all([
    cmsFetch(`${api[0]}?locale=${encodeURIComponent(locale)}`, isPublicContentResponse),
    cmsFetch(api[1], isSiteConfig),
    cmsFetch(api[2], isContactDetails),
    cmsFetch(
      `${api[3]}?contentType=collaboration&isFeatured=true&sort=orderIndex:asc`,
      isContentItems,
    ),
  ]);

  const fromApi: string[] = [];
  const fromStatic: string[] = [];
  const notes: string[] = [];
  const copy: Record<string, string> = {};

  const label = (key: string, value: string) => {
    copy[`api.footer.${key}`] = value;
    return `api.footer.${key}`;
  };

  // ── header menu: one unit, API wholesale ───────────────────────────────
  let menu = MENU_SECTIONS;
  const dropped: string[] = [];
  const deeper: string[] = [];
  const apiMenu = [...(home?.navigation?.header ?? [])]
    .sort(byOrder)
    .flatMap((item) => toNavSection(item, dropped, deeper) ?? []);
  if (apiMenu.length) {
    menu = apiMenu;
    fromApi.push(`menu(${apiMenu.length} sections, paths from slugs)`);
    if (dropped.length) notes.push(`menu dropped ${dropped.join(",")} (no route in sitemap.json)`);
    if (deeper.length) notes.push(`menu has no third level for ${deeper.join(",")}`);
    const lost = MENU_SECTIONS.filter((s) => !apiMenu.some((a) => a.title === s.title));
    if (lost.length) notes.push(`menu lacks ${lost.map((s) => s.id).join(",")}`);
  } else {
    fromStatic.push("menu(no header navigation)");
  }

  // ── footer link columns: one flat API list, split on a frontend tail ────
  const footerDropped: string[] = [];
  const column = (items: NavItem[], name: string) => {
    const links = [...items].sort(byOrder).flatMap((item) => {
      const href = routeOf(item);
      if (!href) {
        footerDropped.push(item.slug);
        return [];
      }
      return [{ labelKey: label(`${name}.${item.id}`, item.label), href }];
    });
    return links.length ? links : null;
  };

  const flat = home?.navigation?.footer ?? [];
  const primaryLinks = column(
    flat.filter((i) => !FOOTER_SECONDARY_SLUGS.has(i.slug)),
    "primary",
  );
  const secondaryLinks = column(
    flat.filter((i) => FOOTER_SECONDARY_SLUGS.has(i.slug)),
    "secondary",
  );
  if (primaryLinks) fromApi.push("footer.primary");
  else fromStatic.push("footer.primary(api empty)");
  if (secondaryLinks) fromApi.push("footer.secondary(split from navigation.footer)");
  else fromStatic.push("footer.secondary(api empty)");
  if (footerDropped.length) {
    notes.push(`footer dropped ${footerDropped.join(",")} (no route in sitemap.json)`);
  }

  // ── contacts: the API sends label/type/value, the href is ours ──────────
  let contactLinks: ContactLink[] | null = null;
  if (contacts?.length) {
    contactLinks = [...contacts]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .flatMap((c) => {
        const href = c.type === "EMAIL" ? `mailto:${c.value}` : telHref(c.value);
        if (!href) {
          notes.push(`contact "${c.value}" dropped (not one dialable number)`);
          return [];
        }
        return [{ label: c.value, href }];
      });
    if (contactLinks.length) fromApi.push("contacts");
    else {
      contactLinks = null;
      fromStatic.push("contacts(no usable entry)");
    }
  } else {
    fromStatic.push("contacts(api empty)");
  }

  // ── social: one JSON setting ───────────────────────────────────────────
  let social: SocialLink[] | null = null;
  const setting = config?.settings.find((s) => s.key === "social_links")?.value;
  const rawSocial = typeof setting === "string" ? safeJson(setting) : setting;
  if (Array.isArray(rawSocial)) {
    const unknown: string[] = [];
    social = rawSocial.flatMap((raw) => {
      const entry = raw as { platform?: unknown; href?: unknown };
      const platform = typeof entry.platform === "string" ? entry.platform.toLowerCase() : "";
      if (typeof entry.href !== "string" || !PLATFORMS.includes(platform as SocialPlatform)) {
        unknown.push(String(entry.platform));
        return [];
      }
      return [{ platform: platform as SocialPlatform, href: entry.href }];
    });
    if (unknown.length) notes.push(`social dropped ${unknown.join(",")} (no icon)`);
    if (social.length) fromApi.push("social");
    else {
      social = null;
      fromStatic.push("social(no usable platform)");
    }
  } else {
    fromStatic.push("social(no social_links setting)");
  }

  // ── collaboration logos ────────────────────────────────────────────────
  let partners: Collaborator[] | null = null;
  if (collaborations?.items.length) {
    const noDims: string[] = [];
    const unknownSlug: string[] = [];
    partners = collaborations.items.flatMap((item) => {
      const media = toMediaAsset(item.thumbnail, { altFallback: item.title });
      if ("rejected" in media) {
        notes.push(`collaboration ${item.slug}: ${media.rejected}`);
        return [];
      }
      const intrinsic = LOGO_INTRINSIC[item.slug];
      if (!media.asset.width || !media.asset.height) {
        if (!intrinsic) {
          notes.push(`collaboration ${item.slug}: no dimensions and no known mark`);
          return [];
        }
        noDims.push(item.slug);
      }
      if (!LOGO_HEIGHT[item.slug]) unknownSlug.push(item.slug);
      return [
        {
          name: item.title,
          logo: {
            ...media.asset,
            width: media.asset.width || intrinsic?.width || 0,
            height: media.asset.height || intrinsic?.height || 0,
          },
          height: LOGO_HEIGHT[item.slug] ?? LOGO_HEIGHT_DEFAULT,
        },
      ];
    });
    if (noDims.length) notes.push(`collaborations sized from static: ${noDims.join(",")}`);
    if (unknownSlug.length) {
      notes.push(`collaborations at ${LOGO_HEIGHT_DEFAULT}px (unknown slug): ${unknownSlug.join(",")}`);
    }
    if (partners.length) fromApi.push("collaborations");
    else {
      partners = null;
      fromStatic.push("collaborations(no usable logo)");
    }
  } else {
    fromStatic.push("collaborations(api empty)");
  }

  if (home || config || contacts || collaborations) {
    console.info(
      `[cms] chrome: api=${fromApi.join(",") || "none"} · static=${fromStatic.join(",") || "none"}` +
        (notes.length ? ` · ${notes.join("; ")}` : ""),
    );
  }

  return {
    menu,
    copy,
    footer: {
      ...FOOTER,
      ...(primaryLinks ? { primaryLinks } : {}),
      ...(secondaryLinks ? { secondaryLinks } : {}),
      ...(contactLinks ? { contacts: contactLinks } : {}),
      ...(social ? { social } : {}),
      ...(partners ? { collaborations: partners } : {}),
    },
  };
});

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
