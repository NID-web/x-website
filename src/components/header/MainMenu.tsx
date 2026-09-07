"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/spine/Icon";
import { IconButton } from "@/components/spine/IconButton";
import { BrandStrip } from "@/components/spine/BrandStrip";
import { MENU_SECTIONS, type NavSection } from "@/lib/nav-content";

// The primary menu (design/NID-CONTEXT.md §7.4, node 1:178). Measured from the
// Figma frame, it is a 400×900 panel — a right-hand DRAWER over the page, not
// the full-screen grid this used to be. Geometry, all read off 1:178:
//
//   panel 400 wide · 24px side padding → a 352 content column
//   "Frame 44" 56 tall: close IconButton 32 (Medium) · gap 8 · Brand Strip 48
//     — both children centre on y=32, so the row is items-center
//   nine sub-menus, 40 tall each (py-8 over a Heading/5 line-height of 24),
//     gap 16 between them and after Frame 44
//   expanded: header row + a Links list, gap 4, each link py-8 over a
//     Label/Small line-height of 20 → 36. About NID (5 links) measures
//     40 + 5×36 + 4×4 = 236, which is what the Expanded variant reports.
//
// Each sub-menu is a disclosure COLLAPSED by default. The section header is a
// <button aria-expanded>, NOT a link — only the nested page links navigate
// (§7.4 / §13). Expand/collapse is INSTANT — no height animation. Nothing here
// is underlined in any state, and hover is a colour change only.
//
// The disclosure glyph is plus / minus (Figma "Minus" 743:42490), not a caret,
// and it is drawn as a <span> rather than an IconButton: it lives INSIDE the
// section's own button and a nested <button> is invalid. The nested links carry
// no arrow — the collapsed export shows one only on the section row.
//
// The panel slides; the sections do not. The whole drawer stays mounted so it
// can animate out as well as in, and is `inert` while closed so nothing in it
// is tabbable or announced.

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

  return (
    <div className="flex flex-col">
      {/* Menu Title — button, not a link; no rule, colour-only hover. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="group flex w-full items-center gap-2 py-2 text-left"
      >
        <span className="min-w-0 flex-1 font-primary text-h5 text-text-secondary transition-colors duration-150 ease-in-out group-hover:text-text-primary">
          {section.title}
        </span>
        {/* Icon Button geometry (§7.2 Small): 24 box, 4px padding, 16 glyph,
            icon/quaternary — the export's literal fill is primary-350, which
            is exactly what icon/quaternary resolves to. (Do not paste the hex
            into a comment: lint-tokens greps comments too.) */}
        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full p-1 text-icon-quaternary transition-colors duration-150 ease-in-out group-hover:bg-accent-quaternary">
          <Icon name={expanded ? "minus" : "plus"} className="size-4" />
        </span>
      </button>

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

  // Every open starts from all-collapsed. Adjusted during render off a
  // previous-value flag rather than in an effect — an effect that setStates
  // renders the stale expansion for a frame first (and react-hooks flags it).
  // Reset on OPEN, not on close: resetting on close would collapse the
  // sections in view while the panel is still sliding out.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setExpanded([]);
  }

  // Focus is a DOM effect, so it stays one.
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <div
      className={clsx("fixed inset-0 z-50", !open && "pointer-events-none")}
      inert={!open}
    >
      {/* Scrim. surface/inverse is the semantic that reads as "the opposite of
          the page", so it darkens in light appearance and lightens in dark. */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close menu"
        onClick={onClose}
        className={clsx(
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
          {/* "Frame 44" — close button, then the brand strip filling the rest. */}
          <div className="flex h-14 shrink-0 items-center gap-2">
            <IconButton
              ref={closeRef}
              icon="close"
              label="Close menu"
              size="medium"
              // icon/primary here, not §7.2's default quaternary — the
              // instance in Frame 44 overrides it (get_variable_defs 679:45552).
              tone="primary"
              onClick={onClose}
            />
            <BrandStrip className="h-12 min-w-0 flex-1" />
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
