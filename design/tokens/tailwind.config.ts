/**
 * NID Design System — Tailwind v3 configuration.
 *
 * Every colour maps onto a CSS custom property declared in tokens/themes.css.
 * Nothing here contains a literal hex value: the theme (10 options) and the
 * appearance (light/dark) are swapped at runtime by setting data-theme and
 * data-appearance on <html>, and Tailwind classes follow automatically.
 *
 * If you find yourself adding a hex to this file, the token is missing —
 * add it to themes.css instead.
 */
import type { Config } from "tailwindcss";

/** Layer-2 semantic tokens. These are the ONLY colours a component may use. */
const semantic = {
  surface: {
    page: "var(--nid-surface-page)",
    raised: "var(--nid-surface-raised)",
    hover: "var(--nid-surface-hover)",
    inverse: "var(--nid-surface-inverse)",
  },
  text: {
    primary: "var(--nid-text-primary)",
    secondary: "var(--nid-text-secondary)",
    tertiary: "var(--nid-text-tertiary)",
    quaternary: "var(--nid-text-quaternary)",
    "on-accent": "var(--nid-text-on-accent)",
  },
  icon: {
    primary: "var(--nid-icon-primary)",
    secondary: "var(--nid-icon-secondary)",
    tertiary: "var(--nid-icon-tertiary)",
    quaternary: "var(--nid-icon-quaternary)",
    "on-accent": "var(--nid-icon-on-accent)",
  },
  border: {
    faint: "var(--nid-border-faint)",
    subtle: "var(--nid-border-subtle)",
    DEFAULT: "var(--nid-border-default)",
    strong: "var(--nid-border-strong)",
    primary: "var(--nid-border-primary)",
  },
  accent: {
    subtle: "var(--nid-accent-subtle)",
    muted: "var(--nid-accent-muted)",
    primary: "var(--nid-accent-primary)",
    strong: "var(--nid-accent-strong)",
    secondary: "var(--nid-accent-secondary)",
    tertiary: "var(--nid-accent-tertiary)",
    quaternary: "var(--nid-accent-quaternary)",
    pentenary: "var(--nid-accent-pentenary)",
  },
};

/** Layer-1 primitives. Exposed for foundations/documentation pages ONLY. */
const ramp = (name: string) =>
  Object.fromEntries(
    ["050","100","150","200","250","300","350","400","450","500","550","600","650"]
      .map((s) => [s, `var(--nid-${name}-${s})`]),
  );

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: ["variant", '&:where([data-appearance="dark"], [data-appearance="dark"] *)'],
  theme: {
    // The four Figma breakpoints, expressed as min-widths.
    // Figma calls them Desktop · 4 col / Laptop · 3 col / Tablet · 2 col / Mobile · 1 col.
    screens: {
      tablet: "768px",   // 2 columns
      laptop: "1024px",  // 3 columns
      desktop: "1280px", // 4 columns
    },
    extend: {
      colors: {
        ...semantic,
        black: "var(--nid-black)",
        white: "var(--nid-white)",
        primary: ramp("primary"),
        secondary: ramp("secondary"),
        tertiary: ramp("tertiary"),
        quaternary: ramp("quaternary"),
        pentenary: ramp("pentenary"),
      },
      fontFamily: {
        // Futura PT — all headings, labels and UI
        primary: ["var(--nid-font-primary)"],
        // Bodoni PT VF — editorial display and pull quotes
        secondary: ["var(--nid-font-secondary)"],
        // Tonos — running body copy
        body: ["var(--nid-font-body)"],
      },
      spacing: {
        0: "var(--nid-space-0)",
        0.5: "var(--nid-space-2)",
        1: "var(--nid-space-4)",
        2: "var(--nid-space-8)",
        3: "var(--nid-space-12)",
        4: "var(--nid-space-16)",
        6: "var(--nid-space-24)",
        8: "var(--nid-space-32)",
        12: "var(--nid-space-48)",
        14: "var(--nid-space-56)",
        16: "var(--nid-space-64)",
        margin: "var(--nid-grid-page-margin)",
        gutter: "var(--nid-grid-column-gap)",
      },
      borderRadius: {
        none: "var(--nid-radius-none)",
        pill: "var(--nid-radius-pill)",
        full: "var(--nid-radius-circle)",
        hero: "var(--nid-radius-hero)",
      },
      maxWidth: {
        content: "var(--nid-grid-content-width)",
        measure: "684px", // intro / standfirst measure cap
      },
      gridTemplateColumns: {
        page: "repeat(var(--nid-grid-columns), minmax(0, 1fr))",
      },
      gap: {
        grid: "var(--nid-grid-row-gap) var(--nid-grid-column-gap)",
      },
      fontSize: {
        // <style>: [size, { lineHeight, letterSpacing }]
        // Values are var() so they re-resolve per breakpoint from themes.css.
        "display-serif":       ["var(--nid-type-display-serif-size)",       { lineHeight: "var(--nid-type-display-serif-lh)",       letterSpacing: "-0.01em" }],
        "display-serif-card":  ["var(--nid-type-display-serif-card-size)",  { lineHeight: "var(--nid-type-display-serif-card-lh)",  letterSpacing: "-0.01em" }],
        "display-quote":       ["var(--nid-type-display-quote-size)",       { lineHeight: "var(--nid-type-display-quote-lh)",       letterSpacing: "-0.02em" }],
        "h1":                  ["var(--nid-type-heading-1-size)",           { lineHeight: "var(--nid-type-heading-1-lh)",           letterSpacing: "-0.03em" }],
        "h2":                  ["var(--nid-type-heading-2-size)",           { lineHeight: "var(--nid-type-heading-2-lh)",           letterSpacing: "0" }],
        "h3":                  ["var(--nid-type-heading-3-size)",           { lineHeight: "var(--nid-type-heading-3-lh)",           letterSpacing: "0" }],
        "h4":                  ["var(--nid-type-heading-4-size)",           { lineHeight: "var(--nid-type-heading-4-lh)",           letterSpacing: "0" }],
        "h5":                  ["var(--nid-type-heading-5-size)",           { lineHeight: "var(--nid-type-heading-5-lh)",           letterSpacing: "0" }],
        "h6":                  ["var(--nid-type-heading-6-size)",           { lineHeight: "var(--nid-type-heading-6-lh)",           letterSpacing: "0.01em" }],
        "overline":            ["var(--nid-type-label-overline-size)",      { lineHeight: "var(--nid-type-label-overline-lh)",      letterSpacing: "0.16em" }],
        "meta":                ["var(--nid-type-label-meta-size)",          { lineHeight: "var(--nid-type-label-meta-lh)",          letterSpacing: "0.02em" }],
        "label":               ["var(--nid-type-label-small-size)",         { lineHeight: "var(--nid-type-label-small-lh)",         letterSpacing: "0.04em" }],
        "button":              ["var(--nid-type-label-button-size)",        { lineHeight: "var(--nid-type-label-button-lh)",        letterSpacing: "0.10em" }],
        "micro":               ["var(--nid-type-label-micro-size)",         { lineHeight: "var(--nid-type-label-micro-lh)",         letterSpacing: "0.04em" }],
        "body-lg":             ["var(--nid-type-body-large-regular-size)",  { lineHeight: "var(--nid-type-body-large-regular-lh)",  letterSpacing: "-0.01em" }],
        "body":                ["var(--nid-type-body-base-regular-size)",   { lineHeight: "var(--nid-type-body-base-regular-lh)",   letterSpacing: "0.01em" }],
        "caption":             ["var(--nid-type-body-caption-regular-size)",{ lineHeight: "var(--nid-type-body-caption-regular-lh)",letterSpacing: "0.02em" }],
      },
    },
  },
  plugins: [],
} satisfies Config;
