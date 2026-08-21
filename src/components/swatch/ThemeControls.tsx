"use client";

import { APPEARANCES, THEMES, useTheme } from "@/components/theme/ThemeProvider";

// Confirms the runtime path works: changes the real <html data-theme>/
// <html data-appearance> attributes, not just a local preview state. This is
// the whole amount of theme-switcher Stage 0 builds — the real dropdown UI
// is Stage 1+ (CLAUDE.md § Out of scope).
export function ThemeControls() {
  const { theme, appearance, setTheme, setAppearance } = useTheme();

  return (
    <div className="flex flex-wrap items-center gap-6">
      <label className="flex items-center gap-2 font-body text-body text-text-primary">
        Theme
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as (typeof THEMES)[number])}
          className="rounded border border-border-default bg-surface-raised px-3 py-1.5 font-body text-body text-text-primary capitalize"
        >
          {THEMES.map((t) => (
            <option key={t} value={t} className="capitalize">
              {t}
            </option>
          ))}
        </select>
      </label>

      <div
        role="group"
        aria-label="Appearance"
        className="flex overflow-hidden rounded border border-border-default"
      >
        {APPEARANCES.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAppearance(a)}
            aria-pressed={appearance === a}
            className={
              "px-3 py-1.5 font-body text-body capitalize transition-colors duration-150 ease-in-out " +
              (appearance === a
                ? "bg-accent-primary text-text-on-accent"
                : "bg-surface-raised text-text-primary hover:bg-surface-hover")
            }
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}
