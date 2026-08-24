// Static reference data for the swatch page. Class name strings are written
// out literally (not built with template interpolation) so Tailwind's
// scanner can find them regardless of how they're looked up at runtime.

export type SemanticToken = {
  name: string; // e.g. "surface/page" — matches design/tokens/tokens.json keys
  className: string; // the bg-* utility for this token
  note?: string; // ⚠ markers from NID-CONTEXT.md §3.3
};

// Order matches NID-CONTEXT.md §3.3 exactly.
export const SEMANTIC_TOKENS: SemanticToken[] = [
  { name: "surface/page", className: "bg-surface-page" },
  { name: "surface/raised", className: "bg-surface-raised" },
  { name: "surface/hover", className: "bg-surface-hover" },
  { name: "surface/inverse", className: "bg-surface-inverse" },
  { name: "text/primary", className: "bg-text-primary" },
  { name: "text/secondary", className: "bg-text-secondary" },
  { name: "text/tertiary", className: "bg-text-tertiary" },
  {
    name: "text/quaternary",
    className: "bg-text-quaternary",
    note: "A11y-exempt — intentionally below WCAG AA, identical in light and dark.",
  },
  { name: "text/on-accent", className: "bg-text-on-accent" },
  { name: "icon/primary", className: "bg-icon-primary" },
  { name: "icon/secondary", className: "bg-icon-secondary" },
  { name: "icon/tertiary", className: "bg-icon-tertiary" },
  {
    name: "icon/quaternary",
    className: "bg-icon-quaternary",
    note: "Default icon colour on CTAs — inherits the a11y exemption.",
  },
  { name: "icon/on-accent", className: "bg-icon-on-accent" },
  { name: "border/faint", className: "bg-border-faint" },
  { name: "border/subtle", className: "bg-border-subtle" },
  { name: "border/default", className: "bg-border-default" },
  { name: "border/strong", className: "bg-border-strong" },
  { name: "border/primary", className: "bg-border-primary" },
  { name: "accent/subtle", className: "bg-accent-subtle" },
  { name: "accent/muted", className: "bg-accent-muted" },
  { name: "accent/primary", className: "bg-accent-primary" },
  { name: "accent/strong", className: "bg-accent-strong" },
  {
    name: "accent/secondary",
    className: "bg-accent-secondary",
    note: "Decorative — not guaranteed 3:1 on light surfaces.",
  },
  {
    name: "accent/tertiary",
    className: "bg-accent-tertiary",
    note: "Decorative.",
  },
  {
    name: "accent/quaternary",
    className: "bg-accent-quaternary",
    note: "Decorative. Icon-button hover fill.",
  },
  {
    name: "accent/pentenary",
    className: "bg-accent-pentenary",
    note: "Decorative only — site pattern fields, exempt from contrast rules.",
  },
];

export type TypeStyle = {
  label: string;
  className: string;
  desktop: { size: number; lh: number; tracking: string; weight: string };
};

// Order matches design/tokens/tokens.json → typography.styles (22 total).
export const TYPE_STYLES: TypeStyle[] = [
  {
    label: "Display/Serif Card",
    className: "font-secondary text-display-serif-card",
    desktop: { size: 28, lh: 29.5, tracking: "-1%", weight: "400 (Subhead Regular)" },
  },
  {
    label: "Display/Serif",
    className: "font-secondary text-display-serif",
    desktop: { size: 28, lh: 26, tracking: "-1%", weight: "600 (Display Demi)" },
  },
  {
    label: "Display/Quote",
    className: "font-secondary text-display-quote italic",
    desktop: { size: 25, lh: 32, tracking: "-2%", weight: "400 (Subhead Italic)" },
  },
  {
    label: "Heading/1",
    className: "font-primary text-h1",
    desktop: { size: 60, lh: 60, tracking: "-3%", weight: "700 (Heavy)" },
  },
  {
    label: "Heading/2",
    className: "font-primary text-h2",
    desktop: { size: 32, lh: 36, tracking: "0", weight: "700 (Heavy)" },
  },
  {
    label: "Heading/3",
    className: "font-primary text-h3",
    desktop: { size: 27, lh: 35, tracking: "0", weight: "700 (Heavy)" },
  },
  {
    label: "Heading/4",
    className: "font-primary text-h4",
    desktop: { size: 24, lh: 30, tracking: "0", weight: "700 (Heavy)" },
  },
  {
    label: "Heading/5",
    className: "font-primary text-h5",
    desktop: { size: 20, lh: 24, tracking: "0", weight: "700 (Heavy)" },
  },
  {
    label: "Heading/6",
    className: "font-primary text-h6",
    desktop: { size: 16, lh: 20, tracking: "1%", weight: "700 (Heavy)" },
  },
  {
    label: "Label/Overline",
    className: "font-primary text-overline uppercase",
    desktop: { size: 12, lh: 12, tracking: "16%", weight: "700 (Heavy)" },
  },
  {
    label: "Label/Meta",
    className: "font-primary text-meta",
    desktop: { size: 14, lh: 18, tracking: "2%", weight: "600 (Demi)" },
  },
  {
    label: "Label/Small",
    className: "font-primary text-label",
    desktop: { size: 14, lh: 20, tracking: "4%", weight: "500 (Medium)" },
  },
  {
    label: "Label/Button",
    className: "font-primary text-button uppercase",
    desktop: { size: 14, lh: 16, tracking: "10%", weight: "800 (Bold)" },
  },
  {
    label: "Label/Micro",
    className: "font-primary text-micro",
    desktop: { size: 12, lh: 15.5, tracking: "4%", weight: "500 (Medium)" },
  },
  {
    label: "Body/Large/Regular",
    className: "font-body text-body-lg",
    desktop: {
      size: 20,
      lh: 30,
      tracking: "-1%",
      weight: "300 (Light)",
    },
  },
  {
    label: "Body/Large/Bold",
    className: "font-body text-body-lg-bold",
    desktop: {
      size: 20,
      lh: 30,
      tracking: "2%",
      weight: "600 (SemiBold)",
    },
  },
  {
    label: "Body/Base/Regular",
    className: "font-body text-body",
    desktop: { size: 16, lh: 28, tracking: "1%", weight: "400 (Regular)" },
  },
  {
    label: "Body/Base/Bold",
    className: "font-body text-body-bold",
    desktop: { size: 16, lh: 26, tracking: "1%", weight: "700 (Bold)" },
  },
  {
    label: "Body/Base/Italic",
    className: "font-body text-body-italic italic",
    desktop: { size: 16, lh: 26, tracking: "1%", weight: "400 (Regular Italic)" },
  },
  {
    label: "Body/Caption/Regular",
    className: "font-body text-caption",
    desktop: { size: 12, lh: 18, tracking: "2%", weight: "400 (Regular)" },
  },
  {
    label: "Body/Caption/Bold",
    className: "font-body text-caption-bold",
    desktop: { size: 12, lh: 18, tracking: "1%", weight: "700 (Bold)" },
  },
  {
    label: "Body/Caption/Italic",
    className: "font-body text-caption-italic italic",
    desktop: {
      size: 12,
      lh: 18,
      tracking: "1%",
      weight:
        "400 (Regular Italic) — note: tracking differs from Caption/Regular (1% vs 2%)",
    },
  },
];

export const SPACING_STEPS = [0, 2, 4, 8, 12, 16, 24, 32, 48, 56, 64] as const;
