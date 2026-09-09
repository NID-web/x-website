"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/spine/Icon";
import { IconButton } from "@/components/spine/IconButton";
import { BrandStrip } from "@/components/spine/BrandStrip";
import { MENU_SECTIONS, type NavSection } from "@/lib/nav-content";

/**
 * Drawer navigation menu.
 * Displays expandable nav sections with links, a close action, and the brand strip.
 */
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
            onClick={onNavigate}
            className={clsx(title, "no-underline hover:text-text-primary")}
          >
            {section.title}
          </Link>
          <IconButton
            icon={expanded ? "minus" : "plus"}
            label={`${expanded ? "Hide" : "Show"} ${section.title} links`}
            size="small"
            expanded={expanded}
            controls={panelId}
            onClick={onToggle}
          />
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
          {section.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                className="block py-2 font-primary text-label text-text-secondary no-underline transition-colors duration-150 ease-in-out hover:text-text-primary"
              >
                {link.label}
              </Link>
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
}: {
  id: string;
  open: boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [wasOpen, setWasOpen] = useState(open);
  const closeRef = useRef<HTMLButtonElement>(null);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setExpanded([]);
  }

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <div
      className={clsx("fixed inset-0 z-50", !open && "pointer-events-none")}
      inert={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close menu"
        onClick={onClose}
        className={clsx(
          // surface/inverse is the semantic that reads as "the opposite of the
          // page", so the scrim darkens in light appearance and lightens in dark.
          "absolute inset-0 bg-surface-inverse/40 transition-opacity duration-300 ease-out motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        id={id}
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

          {MENU_SECTIONS.map((section) => (
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
              onNavigate={onClose}
            />
          ))}
        </nav>
      </aside>
    </div>
  );
}
