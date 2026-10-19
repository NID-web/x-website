"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import clsx from "clsx";
import { Link, usePathname } from "@/i18n/navigation";
import { Icon } from "@/components/spine/Icon";
import { IconButton } from "@/components/spine/IconButton";
import { BrandStrip } from "@/components/spine/BrandStrip";
import { MAIN_ID } from "@/components/spine/Main";
import { SiteLink } from "@/components/spine/SiteLink";
import type { NavSection } from "@/lib/nav-content";

/**
 * Drawer navigation menu.
 * Displays expandable nav sections with links, a close action, and the brand strip.
 */

// Never content, so never made inert: silencing them changes nothing.
const NOT_CONTENT = new Set(["SCRIPT", "STYLE", "LINK", "TEMPLATE", "NOSCRIPT"]);

function Section({
  section,
  expanded,
  onToggle,
  onNavigate,
}: {
  section: NavSection;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const panelId = `menu-${section.id}`;
  const title =
    "min-w-0 flex-1 font-primary text-h5 text-text-secondary transition-colors duration-150 ease-in-out";

  // §7.4 says a menu title is NOT a link, and eight of the nine still are not.
  // About NID is the exception the design owner asked for (STAGE-0-NOTES §34):
  // where a section has a landing page the row splits — the title navigates and
  // the plus/minus alone works the disclosure. Splitting also lets the glyph be
  // a real IconButton; in the single-control form it has to stay a <span>,
  // since a <button> cannot nest. Either way no rule, no underline, colour-only
  // hover.
  return (
    <div className="flex flex-col">
      {section.href ? (
        <div className="flex w-full items-center gap-2 py-2">
          <Link
            href={section.href}
            // The menu publishes the sitemap ahead of the build, so most of its
            // targets have no page yet; prefetching ~48 of them only queues
            // requests (content links go through builtHref instead).
            prefetch={false}
            onClick={onNavigate}
            className={clsx(title, "no-underline hover:text-text-primary")}
          >
            {section.title}
          </Link>
          {/* A section the CMS serves with no children is a page, not a set:
              a plus that expands an empty list promises something that is not
              there. */}
          {section.links.length > 0 && (
            <IconButton
              icon={expanded ? "minus" : "plus"}
              label={`${expanded ? "Hide" : "Show"} ${section.title} links`}
              size="small"
              expanded={expanded}
              controls={panelId}
              onClick={onToggle}
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="group flex w-full items-center gap-2 py-2 text-left"
        >
          <span className={clsx(title, "group-hover:text-text-primary")}>
            {section.title}
          </span>
          {/* Icon Button geometry (§7.2 Small): 24 box, 4px padding, 16 glyph,
              icon/quaternary — which is exactly what the export's literal fill
              resolves to. (Do not paste that hex into a comment: lint-tokens
              greps comments too.) */}
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full p-1 text-icon-quaternary transition-colors duration-150 ease-in-out group-hover:bg-accent-quaternary">
            <Icon name={expanded ? "minus" : "plus"} className="size-4" />
          </span>
        </button>
      )}

      {expanded && (
        <ul id={panelId} className="flex flex-col gap-1">
          {/* By position: two CMS nav items can resolve to one route, and the
              list is never reordered on the client. */}
          {section.links.map((link, i) => (
            <li key={i}>
              {/* An external row (KMC on nid.edu, Alpavirama) opens in a new
                  tab; SiteLink drops prefetch there, an <a> has none. */}
              <SiteLink
                href={link.href}
                external={link.external}
                prefetch={false}
                onClick={onNavigate}
                className="block py-2 font-primary text-label text-text-secondary no-underline transition-colors duration-150 ease-in-out hover:text-text-primary"
              >
                {link.label}
              </SiteLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MainMenu({
  id,
  open,
  onClose,
  sections,
  returnFocusTo,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  /** The header toggle: focus goes back to it when the drawer closes. */
  returnFocusTo: RefObject<HTMLButtonElement | null>;
  /** Resolved by the server layout (src/lib/content/getSiteChrome.ts): a
   *  "use client" module must not reach for the static fallback itself, or the
   *  CMS menu would never reach the browser. */
  sections: NavSection[];
}) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [wasOpen, setWasOpen] = useState(open);
  const closeRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // False only when a link closed the drawer: the page is changing under it,
  // and focus belongs to the new page, not to the menu button of the one
  // being left.
  const restoreFocus = useRef(true);
  const focusNextMain = useRef(false);
  const pathname = usePathname();

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setExpanded([]);
  }

  // Modal while open. The drawer covers the page and the header toggle, so
  // everything outside it goes inert (out of the tab order and the
  // accessibility tree) rather than letting Tab walk on into the page under
  // the scrim, which it did. Inert goes on the drawer's siblings at every
  // level up to <body>, so this holds whatever the layout wraps it in, and only
  // what this effect silenced is restored, never something already inert for
  // its own reason. On close, focus returns to the toggle that opened it.
  useEffect(() => {
    if (!open) return;
    restoreFocus.current = true;
    focusNextMain.current = false;
    // The same button whether it reads "Main menu" or "Close menu".
    const toggle = returnFocusTo.current;
    closeRef.current?.focus();
    const silenced: Element[] = [];
    for (let node: HTMLElement | null = rootRef.current; node?.parentElement; node = node.parentElement) {
      if (node === document.body) break;
      for (const sibling of node.parentElement.children) {
        if (sibling === node || sibling.hasAttribute("inert") || NOT_CONTENT.has(sibling.tagName)) {
          continue;
        }
        sibling.setAttribute("inert", "");
        silenced.push(sibling);
      }
    }
    return () => {
      for (const element of silenced) element.removeAttribute("inert");
      if (restoreFocus.current) toggle?.focus();
      // After a link, focus goes to the page's <main>, as the skip link sends
      // it. Left alone it stayed on the followed link, now inert inside the
      // closed drawer, and the next Tab ran on from there to the end of the
      // document instead of into the new page. This <main> serves a link that
      // stays on this page or opens a new tab; the effect below re-aims at the
      // new page's own <main>, which replaces this one when the route changes.
      else document.getElementById(MAIN_ID)?.focus({ preventScroll: true });
    };
  }, [open, returnFocusTo]);

  useEffect(() => {
    if (!focusNextMain.current) return;
    focusNextMain.current = false;
    document.getElementById(MAIN_ID)?.focus({ preventScroll: true });
  }, [pathname]);

  const navigate = () => {
    restoreFocus.current = false;
    focusNextMain.current = true;
    onClose();
  };

  return (
    <div
      ref={rootRef}
      className={clsx("fixed inset-0 z-50", !open && "pointer-events-none")}
      inert={!open}
    >
      {/* Hidden from assistive technology: a pointer target only. The
          drawer's own close button is the one to announce. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        aria-label="Close menu"
        onClick={onClose}
        className={clsx(
          // surface/inverse is the semantic that reads as "the opposite of the
          // page", so the scrim darkens in light appearance and lightens in dark.
          "absolute inset-0 bg-surface-inverse/40 transition-opacity duration-300 ease-out motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={clsx(
          "absolute inset-y-0 right-0 flex w-full max-w-[400px] flex-col overflow-y-auto bg-surface-page",
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <nav aria-label="Main menu" className="flex flex-col gap-4 px-6 pb-8">
          <div className="flex h-14 shrink-0 items-center gap-2">
            <IconButton
              ref={closeRef}
              icon="close"
              label="Close menu"
              size="medium"
              tone="primary"
              onClick={onClose}
            />
            <BrandStrip flush className="h-12 min-w-0 flex-1" />
          </div>

          {sections.map((section) => (
            <Section
              key={section.id}
              section={section}
              expanded={expanded.includes(section.id)}
              onToggle={() =>
                setExpanded((ids) =>
                  ids.includes(section.id)
                    ? ids.filter((s) => s !== section.id)
                    : [...ids, section.id],
                )
              }
              onNavigate={navigate}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
