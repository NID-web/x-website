"use client";

import { useState } from "react";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/spine/Icon";
import { MENU_SECTIONS, type NavSection } from "@/lib/nav-content";

// The primary menu (design/NID-CONTEXT.md §7.4, node 1:178). Nine sections, each
// a disclosure widget COLLAPSED by default. The section header is a
// <button aria-expanded>, NOT a link — only the nested page links navigate
// (§7.4 / §13). Expand/collapse is INSTANT — no height animation (explicit
// decision, STAGE-0-NOTES). Nothing here is underlined in any state, and the
// header's hover is a colour change only.
//
// Rendered only while open, so every section starts collapsed on each open.

function Section({ section, onNavigate }: { section: NavSection; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = `menu-${section.id}`;

  return (
    <div className="border-b border-border-faint py-1">
      {/* Menu Title — button, not a link; no rule, colour-only hover. */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-2 py-2 text-left font-primary text-h5 text-text-secondary transition-colors duration-150 ease-in-out hover:text-text-primary"
      >
        {section.title}
        <Icon
          name="caret-down"
          className={clsx(
            "size-5 shrink-0 transition-transform duration-150 ease-in-out",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <ul id={panelId} className="flex flex-col pb-2">
          {section.links.map((link) => (
            <li key={link.href}>
              {/* Menu link — no underline, colour-only hover, arrow in its own slot. */}
              <Link
                href={link.href}
                onClick={onNavigate}
                className="flex items-center gap-1.5 py-2 font-primary text-label text-text-secondary no-underline transition-colors duration-150 ease-in-out hover:text-text-primary"
              >
                {link.label}
                <Icon name="arrow-up-right" className="size-4 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MainMenu({ id, onClose }: { id: string; onClose: () => void }) {
  return (
    <div
      id={id}
      className="fixed inset-0 top-[50px] z-30 overflow-y-auto bg-surface-page tablet:top-[60px]"
    >
      <nav
        aria-label="Main menu"
        className="mx-auto grid w-full max-w-shell grid-cols-1 gap-x-gutter gap-y-1 px-margin py-8 tablet:grid-cols-2 laptop:grid-cols-3"
      >
        {MENU_SECTIONS.map((section) => (
          <Section key={section.id} section={section} onNavigate={onClose} />
        ))}
      </nav>
    </div>
  );
}
