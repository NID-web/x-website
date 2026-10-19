"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  THEMES,
  APPEARANCES,
  CONTRAST_APPEARANCE,
  CONTRAST_THEME,
  type Theme,
  type Appearance,
} from "@/lib/theme-constants";

// Re-exported for existing client call sites; Server Components should
// import these directly from @/lib/theme-constants (see that file for why).
export { THEMES, APPEARANCES };
export type { Theme, Appearance };

type ThemeContextValue = {
  /** What the page is painted in — Yoga · Dark while contrast is on. */
  theme: Theme;
  appearance: Appearance;
  setTheme: (theme: Theme) => void;
  setAppearance: (appearance: Appearance) => void;
  /** The Accessibility panel's Dark contrast. */
  contrast: boolean;
  setContrast: (on: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isTheme(value: string | null): value is Theme {
  return value !== null && (THEMES as readonly string[]).includes(value);
}

function paint(theme: Theme, appearance: Appearance) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-appearance", appearance);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The visitor's own choice. Contrast paints over it without replacing it, so
  // switching contrast off returns to exactly this.
  const [theme, setThemeState] = useState<Theme>("peacock");
  const [appearance, setAppearanceState] = useState<Appearance>("light");
  const [contrast, setContrastState] = useState(false);

  // Adopt whatever the inline THEME_SCRIPT already set on <html>. This has to
  // be a useEffect, NOT a lazy useState initializer: `document` does not exist
  // during the server render of this (still SSR'd) client component, so reading
  // it can only happen after mount. Never localStorage during render, only
  // after, so this cannot diverge from what the browser already painted — the
  // one-time hydration-adopt the set-state-in-effect rule has no case for.
  useEffect(() => {
    const root = document.documentElement;
    const contrastOn = root.getAttribute("data-contrast") === "on";
    // Under contrast <html> carries Yoga · Dark, not the visitor's theme, so
    // their own choice is read back from where THEME_SCRIPT read it.
    const currentTheme = contrastOn ? localStorage.getItem("nid-theme") : root.getAttribute("data-theme");
    const currentAppearance = contrastOn
      ? localStorage.getItem("nid-appearance")
      : root.getAttribute("data-appearance");
    if (isTheme(currentTheme)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(currentTheme);
    }
    if (currentAppearance === "light" || currentAppearance === "dark") {
      setAppearanceState(currentAppearance);
    } else if (contrastOn) {
      setAppearanceState(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
    setContrastState(contrastOn);
  }, []);

  // Ends contrast and reports whether it had been on. Picking a theme or an
  // appearance is an explicit choice of palette, so it ends contrast rather
  // than being silently painted over.
  const leaveContrast = useCallback(() => {
    const root = document.documentElement;
    const wasOn = root.getAttribute("data-contrast") === "on";
    root.removeAttribute("data-contrast");
    localStorage.removeItem("nid-contrast");
    document.cookie = "nid-contrast=;path=/;max-age=0;samesite=lax";
    setContrastState(false);
    return wasOn;
  }, []);

  const storeAppearance = useCallback((next: Appearance) => {
    document.documentElement.setAttribute("data-appearance", next);
    localStorage.setItem("nid-appearance", next);
    document.cookie = `nid-appearance=${next};path=/;max-age=31536000;samesite=lax`;
    setAppearanceState(next);
  }, []);

  // Each setter writes only its own attribute: ThemeMenu's light/dark buttons
  // call setTheme then setAppearance in one handler, and a setter that
  // repainted both would put back the theme its closure saw a moment ago.
  const setTheme = useCallback(
    (next: Theme) => {
      // The row "keeps the current appearance", and under contrast the
      // current appearance on screen is dark — keep that one.
      if (leaveContrast()) storeAppearance(CONTRAST_APPEARANCE);
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("nid-theme", next);
      document.cookie = `nid-theme=${next};path=/;max-age=31536000;samesite=lax`;
      setThemeState(next);
    },
    [leaveContrast, storeAppearance],
  );

  const setAppearance = useCallback(
    (next: Appearance) => {
      if (leaveContrast()) document.documentElement.setAttribute("data-theme", theme);
      storeAppearance(next);
    },
    [theme, leaveContrast, storeAppearance],
  );

  const setContrast = useCallback(
    (on: boolean) => {
      if (!on) {
        leaveContrast();
        paint(theme, appearance);
        return;
      }
      document.documentElement.setAttribute("data-contrast", "on");
      localStorage.setItem("nid-contrast", "on");
      document.cookie = "nid-contrast=on;path=/;max-age=31536000;samesite=lax";
      setContrastState(true);
      paint(CONTRAST_THEME, CONTRAST_APPEARANCE);
    },
    [theme, appearance, leaveContrast],
  );

  return (
    <ThemeContext.Provider
      value={{
        theme: contrast ? CONTRAST_THEME : theme,
        appearance: contrast ? CONTRAST_APPEARANCE : appearance,
        setTheme,
        setAppearance,
        contrast,
        setContrast,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

// For panels (e.g. the swatch page's scoped data-theme sections) that render
// their own theme independently of the page-level provider.
export function useThemeOptional(): ThemeContextValue | null {
  return useContext(ThemeContext);
}
