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
  "ministry-women-child-development": 45,
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
  "ministry-women-child-development": { width: 1200, height: 800 },
  "khelo-india": { width: 571, height: 350 },
};

/** A nav item with no path and no children is neither a link nor a disclosure
 *  heading — it names a page the CMS does not have yet, so the menu drops it
 *  instead of rendering a row that goes nowhere. */
function toNavSection(item: NavItem, dropped: string[]): NavSection | null {
  const links = (item.children ?? []).flatMap((child) => {
    if (!child.path) {
      dropped.push(`${item.slug}/${child.slug}`);
      return [];
    }
    return [{ label: child.label, href: child.path }];
  });
  if (!links.length && !item.path) {
    dropped.push(item.slug);
    return null;
  }
  return {
    id: item.slug,
    title: item.label,
    ...(item.path ? { href: item.path } : {}),
    links,
  };
}

function telHref(value: string) {
  return `tel:${value.replace(/[\s-]/g, "")}`;
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
  const apiMenu = (home?.navigation?.header ?? [])
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .flatMap((item) => toNavSection(item, dropped) ?? []);
  if (apiMenu.length) {
    menu = apiMenu;
    fromApi.push(`menu(${apiMenu.length} sections)`);
    if (dropped.length) notes.push(`menu dropped ${dropped.join(",")} (no path, no children)`);
    const lost = MENU_SECTIONS.filter((s) => !apiMenu.some((a) => a.title === s.title));
    if (lost.length) notes.push(`menu lacks ${lost.map((s) => s.id).join(",")}`);
  } else {
    fromStatic.push("menu(no header navigation)");
  }

  // ── footer link columns ────────────────────────────────────────────────
  const column = (items: NavItem[] | undefined, name: string) => {
    const links = (items ?? [])
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .flatMap((item) =>
        item.path
          ? [{ labelKey: label(`${name}.${item.id}`, item.label), href: item.path }]
          : [],
      );
    return links.length ? links : null;
  };

  const primaryLinks = column(home?.navigation?.footer, "primary");
  if (primaryLinks) fromApi.push("footer.primary");
  else fromStatic.push("footer.primary(api empty)");

  const secondaryLinks = column(home?.navigation?.footerSecondary, "secondary");
  if (secondaryLinks) fromApi.push("footer.secondary");
  else fromStatic.push("footer.secondary(api empty)");

  // ── contacts: the API sends label/type/value, the href is ours ──────────
  let contactLinks: ContactLink[] | null = null;
  if (contacts?.length) {
    contactLinks = contacts
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((c) => ({
        label: c.value,
        href: c.type === "EMAIL" ? `mailto:${c.value}` : telHref(c.value),
      }));
    fromApi.push("contacts");
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
