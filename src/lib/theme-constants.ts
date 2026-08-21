// Plain data, deliberately NOT in ThemeProvider.tsx: a "use client" module's
// exports are all wrapped as client references, so a Server Component that
// imports a constant (not a component) from one gets a proxy object instead
// of the array at prerender time. Shared constants live here instead;
// ThemeProvider re-exports them for client-side call sites.
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
