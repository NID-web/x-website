"use client";

import clsx from "clsx";
import { useTheme } from "@/components/theme/ThemeProvider";
import { THEMES, THEME_LABELS } from "@/lib/nav-content";
import type { Theme, Appearance } from "@/lib/theme-constants";
import { ThemeMotif } from "@/components/header/ThemeMotif";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";

// The theme switcher dropdown (design/NID-CONTEXT.md §3.5, node 4641:354567).
// 284 wide, surface/page, ten rows + a tertiary footer link. Each row re-themes
// its own motif via a scoped data-theme wrapper while the page stays in the
// active theme. Wired to the live ThemeProvider — this is the real UI that
// replaces the Stage-0 <select> placeholder (ThemeControls).
//
// Interaction model: the row body selects the theme (keeping the current
// appearance); the sun / moon buttons select that theme in light / dark.

function ModeButton({
  mode,
  active,
  onSelect,
}: {
  mode: Appearance;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={mode === "light" ? "Light" : "Dark"}
      className={clsx(
        "inline-flex size-6 items-center justify-center rounded-full p-1",
        "transition-colors duration-150 ease-in-out",
        active
          ? "bg-accent-quaternary text-text-primary"
          : "text-icon-quaternary hover:bg-accent-quaternary",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-strong",
      )}
    >
      <Icon name={mode === "light" ? "sun" : "moon"} className="size-4" />
    </button>
  );
}

export function ThemeMenu({ id }: { id: string }) {
  const { theme, appearance, setTheme, setAppearance } = useTheme();

  const pick = (next: Theme, mode?: Appearance) => {
    setTheme(next);
    if (mode) setAppearance(mode);
  };

  return (
    <div
      id={id}
      role="menu"
      aria-label="Choose a theme"
      className="flex w-71 max-h-[568px] flex-col gap-0.5 overflow-y-auto rounded-pill bg-surface-page p-2 shadow-lg ring-1 ring-border-subtle"
    >
      {THEMES.map((t) => {
        const isActiveTheme = t === theme;
        return (
          <div
            key={t}
            data-theme={t}
            data-appearance={appearance}
            className={clsx(
              "flex h-12 items-center gap-3 rounded-pill py-2 pl-3 pr-2",
              "transition-colors duration-150 ease-in-out hover:bg-surface-raised",
              isActiveTheme && "bg-surface-raised",
            )}
          >
            {/* Row body — selects the theme, keeps the current appearance. The
                data-theme wrapper above scopes the motif to this row's theme. */}
            <button
              type="button"
              role="menuitemradio"
              aria-checked={isActiveTheme}
              onClick={() => pick(t)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong"
            >
              <ThemeMotif />
              <span className="truncate font-primary text-label text-text-primary">
                {THEME_LABELS[t]}
              </span>
            </button>
            {/* Modes cluster — light / dark for this theme. */}
            <span className="flex shrink-0 items-center gap-2">
              <ModeButton
                mode="light"
                active={isActiveTheme && appearance === "light"}
                onSelect={() => pick(t, "light")}
              />
              <ModeButton
                mode="dark"
                active={isActiveTheme && appearance === "dark"}
                onSelect={() => pick(t, "dark")}
              />
            </span>
          </div>
        );
      })}

      {/* Footer — Tertiary CTA (§3.5). Not uppercase; label style, hover rule. */}
      <Link
        href="/about/our-themes"
        role="menuitem"
        className="mt-1 flex items-center gap-1.5 border-t border-border-faint px-3 pt-3 pb-1 font-primary text-label text-text-secondary no-underline transition-colors duration-150 ease-in-out hover:text-text-primary"
      >
        Learn more about the themes
        <Icon name="arrow-up-right" className="size-4 shrink-0" />
      </Link>
    </div>
  );
}
