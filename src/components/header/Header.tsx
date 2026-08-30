"use client";

import { useEffect, useId, useState } from "react";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/components/spine/Wordmark";
import { IconButton } from "@/components/spine/IconButton";
import { ThemeSwitcher } from "@/components/header/ThemeSwitcher";
import { MainMenu } from "@/components/header/MainMenu";
import { APPLY_HREF } from "@/lib/nav-content";

// The site header (design/NID-CONTEXT.md §7.3, node 99:8595). Sticky, full-bleed.
// Background is surface/page at 1% opacity — a near-transparent wash, NOT an
// opaque band (STAGE-0-NOTES trap #2 — do not "fix" it to opacity 1).
//
// One row, justify-between, at two heights: 50px below tablet (Mobile variant),
// 60px from tablet up (1024 and 768 keep the desktop header — §5/§7.3). The only
// responsive swap is the mark: the full bilingual wordmark on desktop, the
// compact "NID" mark below tablet. The Apply / search / menu cluster is shared.
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  // Escape closes the menu; lock body scroll while the full-screen menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-page/1">
      <div className="flex h-[50px] items-center gap-3 px-4 tablet:h-[60px] tablet:px-6">
        {/* Left — "Frame 256", the mark, home-linked. From tablet up this frame is
            flex-1 and mirrors the right cluster's flex-1; two equal side frames
            are what put the theme trigger on the header's exact centre line.
            Measured in Figma 1:610 at 768 wide: both side frames 319, trigger
            spans 355–413 for a centre of 384 against a header centre of 384. */}
        <div className="flex items-center tablet:flex-1">
          <Link
            href="/"
            aria-label="National Institute of Design — home"
            className="inline-flex items-center no-underline"
          >
            {/* Visibility lives on neutral wrappers, not on the marks — the full
                wordmark sets its own `inline-flex`, which would fight a `hidden`
                placed directly on it (display utilities have equal specificity). */}
            <span className="hidden tablet:inline-flex">
              <Wordmark variant="full" />
            </span>
            <span className="inline-flex tablet:hidden">
              <Wordmark variant="compact" />
            </span>
          </Link>
        </div>

        {/* Theme trigger. Centred at tablet+ by the two flex-1 frames around it.
            Below tablet the Mobile variant groups it with the mark as the
            "Brand & Utility" cluster (§7.3), so there it hugs the mark and
            mr-auto pushes the right cluster to the far edge instead. */}
        <div className="mr-auto tablet:mr-0">
          <ThemeSwitcher />
        </div>

        {/* Right — "Frame 101": Apply CTA (Button · Small), search, menu. Right
            aligned, gap 8. flex-1 to balance the left frame (see above). */}
        <div className="flex items-center justify-end gap-2 tablet:flex-1">
          <Link
            href={APPLY_HREF}
            className={clsx(
              "inline-flex h-7 items-center rounded-pill bg-surface-page px-3",
              "font-primary text-h6 text-text-secondary no-underline",
              "transition-colors duration-150 ease-in-out hover:bg-surface-raised",
            )}
          >
            Apply
          </Link>
          <IconButton
            icon="search"
            label="Search"
            size="small"
            onClick={() => {
              /* Search index is Stage 5 — the control is present but inert. */
            }}
          />
          <IconButton
            icon={menuOpen ? "x" : "menu"}
            label={menuOpen ? "Close menu" : "Main menu"}
            size="small"
            expanded={menuOpen}
            controls={menuId}
            onClick={() => setMenuOpen((v) => !v)}
          />
        </div>
      </div>

      {menuOpen && <MainMenu id={menuId} onClose={() => setMenuOpen(false)} />}
    </header>
  );
}
