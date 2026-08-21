"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const THEMES = [
  "peacock",
  "lotus",
  "indigo",
  "henna",
  "yoga",
  "tanjore",
  "khadi",
  "terracotta",
  "ikkat",
  "tiger",
] as const;

export const APPEARANCES = ["light", "dark"] as const;

export type Theme = (typeof THEMES)[number];
export type Appearance = (typeof APPEARANCES)[number];

type ThemeContextValue = {
  theme: Theme;
  appearance: Appearance;
  setTheme: (theme: Theme) => void;
  setAppearance: (appearance: Appearance) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("peacock");
  const [appearance, setAppearanceState] = useState<Appearance>("light");

  // Adopt whatever the inline THEME_SCRIPT already set on <html> — never read
  // localStorage during render, only after mount, so this can't diverge from
  // what the browser already painted.
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = root.getAttribute("data-theme");
    const currentAppearance = root.getAttribute("data-appearance");
    if (currentTheme && (THEMES as readonly string[]).includes(currentTheme)) {
      setThemeState(currentTheme as Theme);
    }
    if (currentAppearance === "light" || currentAppearance === "dark") {
      setAppearanceState(currentAppearance);
    }
  }, []);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("nid-theme", next);
    document.cookie = `nid-theme=${next};path=/;max-age=31536000;samesite=lax`;
    setThemeState(next);
  }, []);

  const setAppearance = useCallback((next: Appearance) => {
    document.documentElement.setAttribute("data-appearance", next);
    localStorage.setItem("nid-appearance", next);
    document.cookie = `nid-appearance=${next};path=/;max-age=31536000;samesite=lax`;
    setAppearanceState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, appearance, setTheme, setAppearance }}>
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
