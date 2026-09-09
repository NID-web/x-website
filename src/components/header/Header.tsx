"use client";

import { useEffect, useId, useState } from "react";
import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/components/spine/Wordmark";
import { IconButton } from "@/components/spine/IconButton";
import { ThemeSwitcher } from "@/components/header/ThemeSwitcher";
import { MainMenu } from "@/components/header/MainMenu";
import { APPLY_HREF } from "@/lib/nav-content";

/**
 * Site header component.
 * Sticky header with bilingual/compact wordmark, theme switcher, apply button, and drawer navigation.
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the menu; lock body scroll while menu is open.
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
    <>
    <header
      className={clsx(
        "sticky top-0 z-40 w-full bg-surface-page/1",
        scrolled && "backdrop-blur-lg",
      )}
    >
      <div className="flex h-[50px] items-center gap-3 px-4 tablet:h-[60px] tablet:px-6">
        {/* Left and right frames are both flex-1: two equal side frames are
            what put the theme trigger on the header's exact centre line
            (measured in Figma 1:610 at 768 — both frames 319, trigger 355–413,
            centre 384 against a header centre of 384). Visibility lives on the
            neutral <span> wrappers, not on the marks: the full wordmark sets its
            own `inline-flex`, which would fight a `hidden` placed directly on it
            (display utilities tie on specificity). */}
        <div className="flex flex-1 items-center">
          <Link
            href="/"
            aria-label="National Institute of Design — home"
            className="inline-flex items-center no-underline"
          >
            <span className="hidden tablet:inline-flex">
              <Wordmark variant="full" />
            </span>
            <span className="inline-flex tablet:hidden">
              <Wordmark variant="compact" />
            </span>
          </Link>
        </div>

        {/* Centred at EVERY width by the two flex-1 frames around it. Below
            tablet it used to hug the mark instead (§7.3's Mobile variant groups
            the two as one cluster); centred on the design owner's call
            (docs/STAGE-0-NOTES.md §29). */}
        <div>
          <ThemeSwitcher />
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
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
            // Search index is Stage 5 — the control is present but inert.
            onClick={() => {}}
          />
          <IconButton
            icon={menuOpen ? "close" : "menu"}
            label={menuOpen ? "Close menu" : "Main menu"}
            size="small"
            expanded={menuOpen}
            controls={menuId}
            onClick={() => setMenuOpen((v) => !v)}
          />
        </div>
      </div>

    </header>

    {/* Sibling of <header>, deliberately: once scrolled the header carries
        `backdrop-blur`, and backdrop-filter makes an element a containing block
        for its fixed-position descendants — nested here, the drawer would
        anchor to the 50/60px header band instead of the viewport. It stays
        mounted so it can slide out as well as in. */}
    <MainMenu id={menuId} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
