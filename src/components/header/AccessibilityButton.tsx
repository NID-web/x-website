"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconButton } from "@/components/spine/IconButton";
import { AccessibilityPanel } from "@/components/header/AccessibilityPanel";

// The panel's designed width (w-88) and its clearance from the viewport edge
// and from the header. Needed in JS because the panel is placed BEFORE it is
// shown, when it has no box to measure.
const PANEL_WIDTH = 352;
const EDGE = 16;
const GAP = 8;

/**
 * The header's accessibility button and the panel it opens.
 *
 * The panel is a native popover rather than a positioned child, for two
 * reasons. The top layer renders outside <html>'s filter, which is how the
 * panel stays exempt from Invert and Saturation as the design asks — with an
 * ordinary element no rule could undo saturate(0). And `popovertarget` gives
 * light dismiss (a click outside, Esc) without the trigger reopening the panel
 * it has just closed, the bug a hand-rolled outside-click listener invites.
 *
 * STAGE-0-NOTES §97 records where the panel departs from the board.
 *
 * role="dialog", not a menu: it holds toggle buttons, not menu items, and
 * Tab moves through them in reading order.
 */
export function AccessibilityButton() {
  const t = useTranslations("Accessibility");
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Right-aligned under the trigger, pulled in from the viewport edge when the
  // trigger sits further right than the panel is wide (every phone).
  const place = useCallback(() => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    const width = Math.min(PANEL_WIDTH, viewport - 2 * EDGE);
    const right = Math.max(EDGE, Math.min(viewport - rect.right, viewport - width - EDGE));
    const top = rect.bottom + GAP;
    panel.style.top = `${top}px`;
    panel.style.right = `${right}px`;
    panel.style.maxHeight = `${window.innerHeight - top - EDGE}px`;
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const onBeforeToggle = (event: Event) => {
      if ((event as ToggleEvent).newState === "open") place();
    };
    const onToggle = (event: Event) => {
      const opened = (event as ToggleEvent).newState === "open";
      setOpen(opened);
      if (opened) {
        panel.querySelector<HTMLElement>("[data-a11y-control]")?.focus();
        return;
      }
      // Back to the trigger — unless a click outside already put focus
      // somewhere the visitor chose.
      const active = document.activeElement;
      if (!active || active === document.body || panel.contains(active)) {
        triggerRef.current?.focus();
      }
    };
    panel.addEventListener("beforetoggle", onBeforeToggle);
    panel.addEventListener("toggle", onToggle);
    return () => {
      panel.removeEventListener("beforetoggle", onBeforeToggle);
      panel.removeEventListener("toggle", onToggle);
    };
  }, [place]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open, place]);

  return (
    <>
      <IconButton
        ref={triggerRef}
        icon="person-arms-spread"
        label={t("open")}
        size="small"
        expanded={open}
        controls={panelId}
        haspopup="dialog"
        popoverTarget={panelId}
      />
      {/* No display utility on this element: the UA hides a closed popover
          with display: none, and any display class here would out-rank it
          and leave the panel permanently on screen. Layout is on the child. */}
      <div
        ref={panelRef}
        id={panelId}
        popover="auto"
        role="dialog"
        aria-labelledby={titleId}
        // ThemeMenu's surface, edge and shadow (a ring, so the 352 is all
        // content, as on the board); the board's 12px corner.
        className="inset-auto m-0 w-88 max-w-[calc(100vw-32px)] overflow-y-auto rounded-xl border-0 bg-surface-page p-0 text-text-primary shadow-lg ring-1 ring-border-subtle"
      >
        <AccessibilityPanel titleId={titleId} onClose={() => panelRef.current?.hidePopover()} />
      </div>
    </>
  );
}
