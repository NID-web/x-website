"use client";

import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ThemeMotif } from "@/components/header/ThemeMotif";
import { ThemeMenu } from "@/components/header/ThemeMenu";
import { Icon } from "@/components/spine/Icon";

// The theme trigger (§3.5): a 58×32 button showing the CURRENT theme's motif
// plus a caret, opening the ThemeMenu dropdown beneath it. Self-contained —
// owns open state, outside-click and Escape. The motif reads the active accent
// tokens, so it always renders in the current theme without scoping.
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
        <div className="absolute left-0 top-full z-50 mt-2">
          <ThemeMenu id={menuId} />
        </div>
      )}
    </div>
  );
}
