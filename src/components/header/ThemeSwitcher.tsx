"use client";

import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ThemeMotif } from "@/components/header/ThemeMotif";
import { ThemeMenu } from "@/components/header/ThemeMenu";
import { Icon } from "@/components/spine/Icon";

/**
 * Theme switcher trigger button displaying the active theme motif and opening ThemeMenu.
 */
export function ThemeSwitcher() {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Theme"
        className={clsx(
          "inline-flex h-8 items-center gap-0.5 rounded-pill px-1",
          "text-icon-primary transition-colors duration-150 ease-in-out hover:bg-surface-raised",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong",
        )}
      >
        <ThemeMotif theme={theme} />
        <Icon
          name="caret-down"
          className={clsx(
            "size-4 transition-transform duration-150 ease-in-out",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        // Centred ON THE TRIGGER, not anchored to its left edge. The trigger
        // sits on the header's centre line at every width (§29), so a
        // left-anchored 284px menu hangs 113px to the right of it — invisible
        // on a desktop, but off the screen by 60px at 390 and 40px at 430.
        <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2">
          <ThemeMenu id={menuId} />
        </div>
      )}
    </div>
  );
}
