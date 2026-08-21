"use client";

import { useEffect, useState } from "react";

// Dev-only column ruler: --nid-grid-columns translucent bars, positioned by
// the same shell math as PageGrid so they line up exactly with real content.
// Toggled by pressing "g". Renders null in production.
export function GridOverlay() {
  const [visible, setVisible] = useState(false);
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    function readColumns() {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(
        "--nid-grid-columns",
      );
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n)) setColumns(n);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        const typing =
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable);
        if (!typing) {
          readColumns();
          setVisible((v) => !v);
        }
      }
    }

    readColumns();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", readColumns);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", readColumns);
    };
  }, []);

  if (process.env.NODE_ENV === "production" || !visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 mx-auto w-full max-w-shell px-margin">
      <div className="grid h-full grid-cols-page gap-x-gutter gap-y-rowgutter">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-full bg-accent-quaternary/10" />
        ))}
      </div>
    </div>
  );
}
