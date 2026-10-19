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

// The Accessibility panel's settings (NID-CONTEXT §12). Dark contrast is a
// theme — Yoga in its dark appearance, the closest existing high-contrast
// palette — so ThemeProvider owns it and swaps data-theme/data-appearance.
// The other toggles and the text size are attributes on <html> that the panel
// modes at the end of globals.css read. THEME_SCRIPT applies all of them
// before first paint, from these lists, so the two can never disagree.
export const CONTRAST_THEME: Theme = "yoga";
export const CONTRAST_APPEARANCE: Appearance = "dark";

export const A11Y_TOGGLES = ["invert", "saturation", "links", "images", "cursor"] as const;
export type A11yToggle = (typeof A11Y_TOGGLES)[number];

// Percent of the designed size. 100 is the default and is never written.
export const TEXT_SIZES = ["87.5", "100", "125", "150"] as const;
export type TextSize = (typeof TEXT_SIZES)[number];
