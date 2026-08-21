# NID Website — Build Context

**Source of truth:** Figma file `EAoxODvNK8dNGAeovGI5D7` ("NID Design System" / "Foundations — Colour").
**Target:** a React + Next.js (App Router) implementation of the National Institute of Design website.
**Status of this document:** extracted directly from the Figma file's variables, styles, components, boards and the two reference documents it carries. Every number in here was read out of the file, not estimated. Where the file contradicts itself, both readings are given and the authoritative one is named.

Companion files in this bundle:

| File | What it is |
|---|---|
| `tokens/tokens.json` | Every token, machine-readable. Primitives per theme, semantic tokens resolved for all 20 theme×appearance combinations, type scale per breakpoint, grid, spacing. |
| `tokens/themes.css` | The whole token layer as CSS custom properties. Drop-in; import once. |
| `tokens/tailwind.config.ts` | Tailwind mapped onto those custom properties. No hex values anywhere. |
| `tokens/content-model.ts` | The CMS contract as TypeScript. Compiles clean. |
| `tokens/sitemap.json` | Every route, the menu tree, the footer, and the eight open IA decisions. |

---

## 0. The five things that matter most

1. **Theming is two independent axes, not one.** Ten *themes* (Peacock, Lotus, Indigo, Henna, Yoga, Tanjore, Khadi, Terracotta, Ikkat, Tiger) multiplied by two *appearances* (Light, Dark) = 20 valid colour states. Both are user-selectable at runtime from the header. Nothing in a component may know which one is active.
2. **A page is not a layout.** A page is a handful of fixed fields plus an *ordered list of sections*, and each section declares one of exactly **six types**. The type decides the layout and the shape of its items. This is the single most important architectural idea in the whole project.
3. **One grid, four modes.** Every page — desktop and mobile — sits on the same CSS grid. Mobile is that grid set to one column, *not* a stack of flex containers. Columns drop right-to-left; nothing is ever reordered.
4. **Type scales through variables, not through duplicate styles.** There is one `Heading/2`. It renders 32/36 on desktop and 24/28 on mobile because its size and line-height are bound to breakpoint variables.
5. **The body font is a landmine.** All eight `Body/*` styles reference a family called **Tonos**, which is not resolvable in the Figma environment (see §6.4). Get the real font file before you start, or agree a substitute up front.

---

## 1. What the site is

The National Institute of Design is an Indian public design institute with three campuses (Ahmedabad, Gandhinagar, Bengaluru), around 28 taught disciplines under two main programmes, roughly 120 people to list, and eight research centres. The site is a large, mostly editorial content site: about **110 pages**, **~500 sections**, **~800 links**, **~400 images**. Only one collection — news articles — has continuous editorial churn.

The design language is: a hard four-column grid, generous white space, square corners everywhere except one deliberate exception, Indian craft-derived geometric motifs used as large-scale pattern fields, and a colour system where the *entire site* re-themes from one of ten palettes drawn from Indian craft traditions.

### 1.1 Volumes — design for these, not for more

| Collection | Records | Churn | Note |
|---|---:|---|---|
| Page | ~110 | Low | 44 designed as artboards; the rest are live pages without artboards, mostly the 28 discipline pages. |
| Section | ~500 | Low | Averaging four or five per page. |
| Link | ~800 | Low | 778 counted in the design file alone (971 including component internals). |
| MediaAsset | ~400 | Medium | Heroes are carousels on several pages — up to six per page. |
| Person | ~120 | Medium | 77 faculty plus council, senate, staff, alumni. Annual intake/departures. |
| Discipline | 28 | Very low | 9 under B.Des, 19 under M.Des. |
| Programme | 6 | Very low | |
| Campus | 3 | None | |
| Centre | 8 | Very low | |
| NewsArticle | growing | **High** | The only collection with continuous editorial activity. Design for volume here and nowhere else. |
| Document | ~30 | Medium | Annual reports and handbooks arrive in batches once a year. |
| Event | ~10 | Medium | Seasonal — convocation, festivals, dialogues. |

---

## 2. Recommended stack

Nothing below is mandated by the design file; it is the shape that fits it.

```
Next.js 15 · App Router · React 19 · TypeScript strict
Styling      Tailwind v3 (or CSS Modules — both documented, §5.4)
             + one global stylesheet of CSS custom properties (tokens/themes.css)
Content      Any headless CMS that can express the model in content-model.ts.
             Payload, Sanity and Directus all fit; the polymorphic Section.items[]
             is the deciding feature — pick one that models a discriminated union well.
Rendering    Static generation with on-demand revalidation. Only /about/news-events*
             needs anything shorter than a publish-triggered rebuild.
Images       next/image with a custom loader. MediaAsset carries width/height and a
             normalised focal point — wire the focal point to object-position.
Fonts        next/font/local for Futura PT and Bodoni PT VF (licensed); see §6.4 for
             the body face problem.
Icons        Phosphor Icons (the file uses Phosphor Regular throughout).
```

### 2.1 Route structure

```
app/
  layout.tsx                    <html data-theme data-appearance>  + ThemeProvider
  page.tsx                      01 Home
  [...slug]/page.tsx            every content page, resolved from the Page tree
  about/news-events/
    page.tsx                    the mosaic index
    archive/page.tsx            the archive (Archive Row component)
    [slug]/page.tsx             an article
  people/faculty/page.tsx       ?by=discipline|name|campus|faculty  (one page, four groupings)
  people/faculty/[slug]/page.tsx
  api/revalidate/route.ts
```

A catch-all `[...slug]` is the right primitive because the URL is *derived* by walking `Page.parent` — there is no stored path field, and renaming a parent moves its whole subtree. Resolve the path to a Page id, 404 if unpublished, and render the section list.

---

## 3. The theming system

This is the most distinctive part of the system and the part most likely to be implemented wrongly. Read this section twice.

### 3.1 Three layers, strictly

```
Layer 0   Base            #000000, #FFFFFF. Two values. Never themed.

Layer 1   Primitives      65 variables = 5 ramps × 13 steps.
                          Swapped wholesale by the THEME axis (10 modes).
                          Named  primary | secondary | tertiary | quaternary | pentenary
                                 × 050 100 150 200 250 300 350 400 450 500 550 600 650

Layer 2   Semantic        27 tokens: surface/*, text/*, icon/*, border/*, accent/*.
                          Each one points at a primitive STEP.
                          Swapped by the APPEARANCE axis (Light / Dark) — the
                          appearance axis changes WHICH STEP, never which ramp.
```

The consequence is worth stating plainly: **a component only ever names a layer-2 token.** `text/primary` is `primary/650` in light and `primary/050` in dark; which hex that is depends on the theme. A component that writes `--nid-primary-650` has hard-coded the appearance and will invert wrongly in dark mode. A component that writes a hex has broken all twenty states at once.

### 3.2 The ten themes

| # | Theme | Figma mode id | Character |
|---|---|---|---|
| 1 | Peacock | `3131:3` | Teal / cyan. **The default.** |
| 2 | Lotus | `3131:0` | Pink / magenta. |
| 3 | Indigo | `3131:1` | Blue. |
| 4 | Henna | `3131:2` | Warm brown. |
| 5 | Yoga | `3131:4` | Pure neutral greyscale — every ramp is identical. Replaced an earlier "Grayscale" mode. |
| 6 | Tanjore | `3131:5` | Gold / ochre. |
| 7 | Khadi | `3158:0` | Cool grey-blue, undyed-cloth. |
| 8 | Terracotta | `3161:0` | Burnt orange / red. |
| 9 | Ikkat | `3175:0` | Coral / rust. |
| 10 | Tiger | `3175:1` | Ochre driven to near-black at the dark end. |

Note on **Yoga**: all five ramps carry the same greyscale values, so `accent/secondary` and `accent/primary` are the same colour there. Any UI that relies on hue difference between accents (charts, multi-series legends) must not assume it. Note on **Tiger**: its deep steps run to `#0B0906` — essentially black — deliberately, so that the tiger motif reads as black-on-ochre.

### 3.3 The 27 semantic tokens

| Token | Light → | Dark → | Purpose |
|---|---|---|---|
| `surface/page` | primary/050 | primary/650 | Page background. |
| `surface/raised` | primary/100 | primary/600 | Cards, panels, dropdown rows. |
| `surface/hover` | primary/150 | primary/550 | One step stronger than raised. Hover of subtly-filled controls. |
| `surface/inverse` | primary/650 | primary/050 | Inverted blocks. |
| `text/primary` | primary/650 | primary/050 | Body and headings. |
| `text/secondary` | primary/550 | primary/150 | Default CTA label, secondary copy. |
| `text/tertiary` | primary/450 | primary/250 | |
| `text/quaternary` | primary/350 | primary/350 | ⚠ **A11y-exempt** faint/disabled tier; intentionally below WCAG AA for normal text. To restore AA, map Light→primary/450, Dark→primary/250. |
| `text/on-accent` | primary/050 | primary/650 | Label on a filled accent. |
| `icon/primary` | = text/primary | = text/primary | Aliases the text tier. |
| `icon/secondary` | = text/secondary | = text/secondary | |
| `icon/tertiary` | = text/tertiary | = text/tertiary | |
| `icon/quaternary` | = text/quaternary | = text/quaternary | **Default icon colour on CTAs.** Inherits the a11y exemption. |
| `icon/on-accent` | = text/on-accent | = text/on-accent | |
| `border/faint` | primary/100 | primary/600 | |
| `border/subtle` | primary/150 | primary/550 | **The default CTA underline.** |
| `border/default` | primary/400 | primary/300 | **The CTA underline on hover.** |
| `border/strong` | primary/550 | primary/250 | |
| `border/primary` | = accent/primary | = accent/primary | |
| `accent/subtle` | primary/150 | primary/550 | Theme-card backgrounds. |
| `accent/muted` | primary/350 | primary/250 | Icon-button glyphs. |
| `accent/primary` | primary/450 | primary/300 | The safe accent — meets 3:1. |
| `accent/strong` | primary/550 | primary/250 | Button hover fill; gradient stops. |
| `accent/secondary` | secondary/350 | secondary/250 | ⚠ Decorative; not guaranteed 3:1 on light surfaces. |
| `accent/tertiary` | tertiary/300 | tertiary/200 | ⚠ Decorative. |
| `accent/quaternary` | quaternary/250 | quaternary/150 | ⚠ Decorative. Icon-button hover fill. |
| `accent/pentenary` | pentenary/300 | pentenary/200 | ⚠ Decorative only — site pattern fields. 5th hue, outside the standard palette, exempt from contrast rules. |

> **The contrast rule, stated once.** `accent/primary` is the only accent guaranteed to clear 3:1 against light surfaces. `accent/secondary`, `tertiary`, `quaternary` and `pentenary` are tuned for vibrancy and variety. For any *informational* graphic — a chart series, a status dot, an icon that carries meaning — use `accent/primary`, or map the light value one step darker to step 400. For decoration, use whatever reads best.

### 3.4 Implementing it in Next.js

`tokens/themes.css` already contains every block. Import it once in the root layout. Then:

```tsx
// app/layout.tsx
import "@/styles/themes.css";
import "@/styles/globals.css";

const THEME_SCRIPT = `
(function () {
  try {
    var t = localStorage.getItem("nid-theme") || "peacock";
    var a = localStorage.getItem("nid-appearance");
    if (!a) a = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    var r = document.documentElement;
    r.setAttribute("data-theme", t);
    r.setAttribute("data-appearance", a);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning because the inline script mutates <html> before React hydrates
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

The inline script must run **before first paint**, in `<head>`, synchronously. Anything else — a `useEffect`, a provider, a cookie read in middleware alone — produces a flash of the default theme. If you also want the server to render the right theme (no flash even with JS disabled), read a `nid-theme` cookie in `middleware.ts` and set the attributes server-side; keep the inline script as the client-side fallback so localStorage stays authoritative.

```tsx
// components/theme/ThemeProvider.tsx
"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const THEMES = ["peacock","lotus","indigo","henna","yoga",
                       "tanjore","khadi","terracotta","ikkat","tiger"] as const;
export type Theme = (typeof THEMES)[number];
export type Appearance = "light" | "dark";

type Ctx = {
  theme: Theme; appearance: Appearance;
  setTheme: (t: Theme) => void; setAppearance: (a: Appearance) => void;
};
const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("peacock");
  const [appearance, setAppearanceState] = useState<Appearance>("light");

  // adopt whatever the inline script already put on <html>
  useEffect(() => {
    const r = document.documentElement;
    setThemeState((r.getAttribute("data-theme") as Theme) ?? "peacock");
    setAppearanceState((r.getAttribute("data-appearance") as Appearance) ?? "light");
  }, []);

  const setTheme = useCallback((t: Theme) => {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("nid-theme", t);
    document.cookie = `nid-theme=${t};path=/;max-age=31536000;samesite=lax`;
    setThemeState(t);
  }, []);

  const setAppearance = useCallback((a: Appearance) => {
    document.documentElement.setAttribute("data-appearance", a);
    localStorage.setItem("nid-appearance", a);
    document.cookie = `nid-appearance=${a};path=/;max-age=31536000;samesite=lax`;
    setAppearanceState(a);
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, appearance, setTheme, setAppearance }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => {
  const c = useContext(ThemeCtx);
  if (!c) throw new Error("useTheme must be used inside ThemeProvider");
  return c;
};
```

**Scoped themes.** In Figma, individual nodes can pin their own theme mode — the "Our Themes" page has ten cards, each pinned to a different theme, all visible at once. Because layer-1 primitives are declared on `[data-theme="…"]`, this works in CSS for free: put `data-theme="tanjore"` on a `<section>` and everything inside re-themes. Keep that capability; it is used by the theme dropdown (each row shows its own motif in its own colours) and by the Our Themes page.

### 3.5 The theme switcher UI

Figma nodes: trigger inside `Header` (`1:610` / `176:4111`), dropdown `4641:354567`, row `4640:566636`, motifs `Motif/<Theme>` `3225:*`.

- **Trigger:** 58×32, horizontal, 4px side padding, 2px gap. Contains the 32×32 motif of the *current* theme and a caret. Sits between the wordmark and the right-hand cluster on desktop; in the mobile header it is grouped with the logo in a "Brand & Utility" cluster.
- **Dropdown:** 284×568, vertical, 8px padding, 2px gap, background `surface/page`, ten rows plus a footer.
- **Row:** 268×48, horizontal, padding `[8,8,8,12]`, 12px gap. Motif 32×32 → theme name (`text/primary`) → a "Modes" cluster of two 24px icon buttons (sun / moon) with an 8px gap. Row hover fills `surface/raised`. The row has four states: `Default`, `Hover`, `Light Hover`, `Dark Hover` — the last two are for hovering the individual light/dark buttons inside an already-hovered row.
- **Footer:** a `Type=Tertiary` CTA reading *"Learn more about the themes"*, linking to `/about/our-themes`.

Each row's motif renders in **its own theme's colours** while the rest of the page stays in the active theme. In CSS: `<li data-theme="lotus">` around the motif only.

---

## 4. Colour reference

Full values are in `tokens/tokens.json` (`primitives` and `semantic.byThemeAndAppearance`) and as custom properties in `tokens/themes.css`. The tables below are the anchors most often needed by hand.

### 4.1 The primary ramp, all ten themes

| Step | Peacock | Lotus | Indigo | Henna | Yoga | Tanjore | Khadi | Terracotta | Ikkat | Tiger |
|---|---|---|---|---|---|---|---|---|---|---|
| 050 | `#FAFFFF` | `#FFFAFC` | `#FAFDFF` | `#FFFCFA` | `#FCFCFC` | `#FFFDFA` | `#FBFCFE` | `#FFFCFA` | `#FFFBFA` | `#FFFDFA` |
| 100 | `#CDFCFF` | `#FFEBF4` | `#E7F3FF` | `#FDEEE5` | `#F2F2F2` | `#FFF0D4` | `#EEF2F7` | `#FFEBE3` | `#FFEDE9` | `#FFF0D4` |
| 150 | `#A6EAF2` | `#FFCBE4` | `#CADDFF` | `#E7D9D2` | `#DFDFDF` | `#FDD792` | `#D8DDE4` | `#FFD0C2` | `#FFD0C7` | `#FAD896` |
| 200 | `#7DDAE5` | `#FCADD5` | `#ABCAFF` | `#D9C4B8` | `#CCCCCC` | `#F2C162` | `#C3CAD2` | `#FFB49C` | `#FFB3A6` | `#EEC269` |
| 250 | `#53C6D2` | `#EB92C0` | `#8FB3F3` | `#C9AC9B` | `#B4B4B4` | `#E0A82C` | `#ACB3BD` | `#FF906D` | `#FD907E` | `#DDAA3B` |
| 300 | `#20B1BE` | `#D77AAB` | `#769DE1` | `#BA947E` | `#9B9B9B` | `#C99200` | `#969EA8` | `#F27147` | `#EA7664` | `#C89300` |
| 350 | `#009AA6` | `#BD6795` | `#6187CB` | `#AB7D63` | `#828282` | `#AE7E00` | `#818892` | `#DB592D` | `#CE6353` | `#AD7F00` |
| 400 | `#00828D` | `#A1577E` | `#4D72B4` | `#956950` | `#696969` | `#946B00` | `#6D747C` | `#C2420F` | `#B05346` | `#936B00` |
| 450 | `#006C75` | `#864768` | `#3A5E9C` | `#7B5742` | `#525252` | `#7B5800` | `#5A6067` | `#A53200` | `#924439` | `#7A5900` |
| 500 | `#005A61` | `#6F3A56` | `#2C4D86` | `#654837` | `#3E3E3E` | `#664900` | `#4A4F55` | `#892800` | `#7A382E` | `#463508` |
| 550 | `#004B51` | `#5D3048` | `#223F73` | `#543C2D` | `#2C2C2C` | `#563C00` | `#3D4147` | `#742000` | `#662E25` | `#28200B` |
| 600 | `#003F45` | `#4F283D` | `#1B3563` | `#473226` | `#1E1E1E` | `#493200` | `#34373B` | `#631A00` | `#57261F` | `#141108` |
| 650 | `#00353A` | `#432133` | `#162C54` | `#3B2A20` | `#0F0F0F` | `#3D2A00` | `#2B2E32` | `#541500` | `#4A1F19` | `#0B0906` |

The other four ramps follow the same 13-step shape; see `tokens.json`. Every ramp is monotonic — 050 is always the lightest — so `surface/page` is always near-white in light and near-black in dark, in every theme.

### 4.2 Worked example — Peacock, light

```
surface/page        #FAFFFF      text/primary       #00353A
surface/raised      #CDFCFF      text/secondary     #004B51
surface/hover       #A6EAF2      text/on-accent     #FAFFFF
border/subtle       #A6EAF2      accent/primary     #006C75
border/default      #00828D      accent/strong      #004B51
                                 accent/secondary   #009D91
                                 accent/quaternary  #B9A1FC
```

---

## 5. Grid and layout

### 5.1 The four breakpoints

These are the *only* four. They are Figma variable modes in the `Breakpoint` collection, and every layout and type value resolves from them.

| | Desktop · 4 col | Laptop · 3 col | Tablet · 2 col | Mobile · 1 col |
|---|---:|---:|---:|---:|
| Viewport | ≥ 1280 | 1024–1279 | 768–1023 | < 768 |
| Reference artboard | 1440 | 1024 | 768 | 390 |
| Columns | 4 | 3 | 2 | 1 |
| Page margin | 24 | 24 | 24 | 16 |
| Column gap | 24 | 24 | 20 | 16 |
| Row gap | 24 | 24 | 20 | 16 |
| Content width | 1392 | 976 | 720 | 358 |
| Column width | 330 | 309 | 350 | 358 |

A note on the 3-column case: 976 − (2 × 24) = 928, which divided by three is **309.33**, not 309. The Figma spec prints 309. Use `minmax(0, 1fr)` and let the browser hold the third of a pixel; do not hard-code 309 or the last column will be a pixel short of the right margin. `tokens.json` carries both under `grid.columnWidth` and `grid.columnWidthExact`.

Column origins at 1440: **24, 378, 732, 1086**. Every element on every desktop page starts on one of those four x-positions — the fastest way to QA a layout.

Span reference at 1440: 1 col = 330 (section title, key info, contacts, links, one footer part) · 2 cols = 684 (page title, body text, section image, intro) · 3 cols = 1038 (hero image) · 4 cols = 1392 (separator, full-bleed rules).

### 5.2 Page anatomy — the vertical order

```
Header                                        sticky · full-bleed
Pattern strip                                 full-bleed
ROW 0   Page title (cols 1–2)                 Utility slot (last col: back-nav or filter)
ROW 1   Key info (col 1)                      Hero image (cols 2–4, 64px TOP-LEFT radius)
ROW 2   Intro / standfirst (cols 2–3, measure capped at 684)
        ── separator, span 4 ──
ROW n   Section title (col 1)  Body (cols 2–3)  Section info / CTA stack (col 4)
ROW n+1 Section image (cols 2–3, square corners)      ← omitted when the section has no image
        (repeats per section)
ROW f   Footer 1 (col 1)  Footer 2 (col 2)  Footer 3 (col 3)  Footer 4 (col 4)
Brand strip                                   full-bleed · closes every page
```

Column 1 is the **label rail** throughout; columns 2–4 are the content field.

### 5.3 How each element moves

| Element | 4 & 3 columns | 2 columns | 1 column |
|---|---|---|---|
| Page title | spans columns 1–2 | full width | full width |
| Utility slot | last column of row 1 | leaves the row — back-link above the title, filter below | same; filter sticks under the header |
| Key info | column 1 | band directly under the title | same — stays above the fold |
| Hero | columns 2–4, then 2–3 | full width within the margin · 16:9 | full width · 4:3 · height-capped |
| Intro | columns 2–3 | full width, capped at 684 | full width |
| Section title | column 1 rail | band above the section | band above the section |
| Section image | columns 2–3 | full width | full width |
| Contacts and links | column 4 | stack after the body | stack after the body |
| Cards | three across | two across | one across — **portraits stay two** |
| Separators | shown | shown | **omitted entirely** |
| Footer | four across | 3 across, 4th wraps · then 2 × 2 | stacked 1 → 4 |
| Hero ratio | 2.2 : 1 | 2 : 1 | 16:9 → 4:3, height-capped |

Two rules that are easy to miss: at one column the separators between sections are **omitted entirely**, and the utility slot **leaves row 1**.

### 5.4 Implementing the grid

The whole page is one grid. Do not nest per-section flex containers — you lose the rail alignment that the entire design depends on.

**Tailwind**

```tsx
// components/layout/PageGrid.tsx
export function PageGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-content px-margin">
      <div className="grid grid-cols-page gap-x-gutter gap-y-gutter">{children}</div>
    </div>
  );
}

// a text section
<h2 className="col-span-1 font-primary text-h2 text-text-primary">{title}</h2>
<div className="col-span-1 tablet:col-span-2 laptop:col-span-2 font-body text-body text-text-primary">
  {body}
</div>
<aside className="col-span-1 flex flex-col gap-6">{links}</aside>
```

**CSS Modules** — identical result, closer to the Figma component boundaries.

```css
/* PageGrid.module.css */
.shell {
  width: 100%;
  max-width: var(--nid-grid-content-width);
  margin-inline: auto;
  padding-inline: var(--nid-grid-page-margin);
}
.grid {
  display: grid;
  grid-template-columns: repeat(var(--nid-grid-columns), minmax(0, 1fr));
  column-gap: var(--nid-grid-column-gap);
  row-gap: var(--nid-grid-row-gap);
}
/* a span that clamps itself as columns disappear */
.span2 { grid-column: span min(2, var(--nid-grid-columns)); }
.span3 { grid-column: span min(3, var(--nid-grid-columns)); }
.span4 { grid-column: 1 / -1; }
```

```css
/* TextSection.module.css */
.title { grid-column: span 1; }
.body  { grid-column: span 2; max-width: 684px; }
.rail  { grid-column: span 1; display: flex; flex-direction: column; gap: var(--nid-space-24); }

@media (max-width: 1023px) {           /* 2 columns and below */
  .title, .body, .rail { grid-column: 1 / -1; }
  .separator { display: none; }        /* separators are omitted below 3 columns */
}
```

`grid-column: span min(2, var(--nid-grid-columns))` is the trick that makes one declaration behave correctly at every breakpoint: a 2-span becomes a full row at 2 columns and a single row at 1.

### 5.5 The responsive boards that already exist

Four page families have been laid out at every breakpoint. Use them as the reference implementation.

| Page | 1440 | 1024 · 3 col | 768 · 2 col | 390 · 1 col |
|---|---|---|---|---|
| 01 Home — Landing | `28:2175` | `4990:368207` | `4997:381054` | `4999:393901` |
| 02 About NID — Landing | `3754:240099` | `4296:269561` | `4334:185219` | `4175:246865` |
| News & Events / Archive | `4454:185408` | `4491:202427` | `4493:205837` | `4496:212659` |
| Student Awards Gallery | `4480:195581` | `4492:202427` | `4494:209249` | `4496:349444` |

Conventions those boards follow, which the code should too:

- 1024 and 768 keep the desktop header (60px). 390 uses `Header Variant=Mobile` (50px).
- The board hugs its content height; every shell child fills the width.
- Grid padding, column gap and row gap are **bound to the Breakpoint tokens**, not typed in.
- Content tiles are square at every breakpoint: 330 → 309 → 350 → 358.
- Footers get their own rows: at 3 columns, three footer blocks on one row and the fourth alone below; at 2 columns, 2 × 2; at 1 column, stacked in order.
- The Home hero statement spans 1 column at 4/3 col and goes **full width** at 2 and 1 columns, hugging its height rather than filling a square.

---

## 6. Typography

### 6.1 The three families

| Role | Family | Used for |
|---|---|---|
| Primary | **Futura PT** | All headings and labels — the entire UI voice. |
| Secondary | **Bodoni PT VF** | Editorial display titles, card serif titles, pull quotes. |
| Body | **Tonos** | Running copy. See §6.4 — this one is a problem. |

### 6.2 The scale — size / line-height per breakpoint

Tracking is in percent, so it scales with the size on its own and needs no variable.

| Style | Family · weight | Tracking | 4 col | 3 col | 2 col | 1 col | Used for |
|---|---|---|---|---|---|---|---|
| Display/Serif | Bodoni · Display Demi | −1% | 28 / 26 | 26 / 26 | 24 / 24 | 22 / 23 | Editorial display titles |
| Display/Serif Card | Bodoni · Subhead Regular | −1% | 28 / 29.5 | 26 / 28 | 24 / 26 | 22 / 24 | Serif titles inside news cards |
| Display/Quote | Bodoni · Subhead Italic | −2% | 25 / 32 | 24 / 31 | 22 / 29 | 20 / 27 | Pull quotes |
| Heading/1 | Futura · Heavy | −3% | 60 / 60 | 52 / 54 | 40 / 44 | 32 / 36 | Largest editorial headline |
| Heading/2 | Futura · Heavy | 0 | 32 / 36 | 30 / 34 | 26 / 30 | 24 / 28 | Page title · section titles |
| Heading/3 | Futura · Heavy | 0 | 27 / 35 | 26 / 34 | 24 / 32 | 22 / 30 | Card and campus titles |
| Heading/4 | Futura · Heavy | 0 | 24 / 30 | 23 / 29 | 21 / 27 | 20 / 26 | Sub-headings · title standfirst |
| Heading/5 | Futura · Heavy | 0 | 20 / 24 | 20 / 24 | 19 / 24 | 18 / 24 | Link headings · CTA labels |
| Heading/6 | Futura · Heavy | 1% | 16 / 20 | 16 / 20 | 16 / 20 | 16 / 20 | Small headings inside components |
| Label/Overline | Futura · Heavy | 16% ᴜᴘᴘᴇʀ | 12 / 12 | — | — | — | Eyebrow above a title |
| Label/Meta | Futura · Demi | 2% | 14 / 18 | — | — | — | Dates, bylines, categories |
| Label/Small | Futura · Medium | 4% | 14 / 20 | — | — | — | Filters, meta rows, menu links |
| Label/Button | Futura · Bold | 10% ᴜᴘᴘᴇʀ | 14 / 16 | — | — | — | Buttons and CTAs |
| Label/Micro | Futura · Medium | 4% | 12 / 15.5 | — | — | — | Captions inside components |
| Body/Large/Regular | Tonos · Light | −1% | 20 / 30 | 18 / 27 | 18 / 27 | 16 / 24 | Section introduction text |
| Body/Large/Bold | Tonos · SemiBold | 2% | 20 / 30 | 18 / 27 | 18 / 27 | 16 / 24 | Emphasis within an introduction |
| Body/Base/Regular | Tonos · Regular | 1% | 16 / 28 | 16 / 28 | 16 / 26 | 16 / 26 | Default running copy |
| Body/Base/Bold | Tonos · Bold | 1% | 16 / 26 | — | — | — | Emphasis within running copy |
| Body/Base/Italic | Tonos · Regular Italic | 1% | 16 / 26 | — | — | — | Titles of works, foreign terms |
| Body/Caption/Regular | Tonos · Regular | 2% | 12 / 18 | — | — | — | Image captions |
| Body/Caption/Bold | Tonos · Bold | 1% | 12 / 18 | — | — | — | Caption lead-ins |
| Body/Caption/Italic | Tonos · Regular Italic | 1% | 12 / 18 | — | — | — | Credits |

*(— means the value is identical at every breakpoint.)*

**The scaling philosophy, in the file's own words:** labels and captions hold their size at every breakpoint — they are already at the smallest comfortable reading size, and shrinking them costs legibility without buying meaningful space. Body copy holds 16px and only tightens its leading. Everything above 20px scales, and the larger it is, the harder it falls: the page title drops 47%, an introduction 25%.

### 6.3 Two documented discrepancies

The Figma file's typography *reference page* and its actual *variable values* disagree in two places. **The variables are authoritative** — they are what renders — and this document's table above uses them.

1. The reference page lists Body/Large at 24/36 desktop; the variable says 20/30. Likewise Body/Large tracking is documented as 2% but the style carries −1%.
2. The reference page names the body family **Merriweather Sans**; the variable `Font/Body` now says **Tonos**. Tonos is the newer decision.
3. The reference page names Heading/1 "Futura PT Demi" and Heading/2 "Futura PT Medium"; both styles actually carry **Heavy**.

### 6.4 The Tonos problem — read before you start

All eight `Body/*` styles bind their family to the variable `Font/Body` = **Tonos**. In the Figma environment this font cannot be loaded at all: it is not in the available family list, `loadFontAsync` fails, and as a result no body text can be created or edited programmatically, and no component containing body text can be instanced by script. The design file has been progressing around this limitation.

Practical consequences for the build:

- **Confirm the licence and get the web files (woff2) before writing any body styles.** If Tonos is not licensed for web, decide the substitute now, not at QA.
- Merriweather Sans is the previous choice and is freely available; it is the natural fallback and the metrics in the reference page were written for it.
- Whatever you choose, declare it once in `--nid-font-body` and never again. The fallback stack in `themes.css` is already `"Tonos", "Merriweather Sans", system-ui, sans-serif`.
- Futura PT and Bodoni PT VF are commercial (Adobe/Monotype). Budget for a web licence sized to the traffic, and self-host via `next/font/local` rather than a CDN so the FOUT is controlled.

### 6.5 Type in code

**Tailwind:** `font-primary text-h2`, `font-body text-body`, `font-secondary text-display-quote italic`. The `fontSize` map in `tailwind.config.ts` points at the same custom properties, so a class picked once is correct at every breakpoint.

**CSS Modules:** use the generated classes in `themes.css` (`.nid-heading-2`, `.nid-body-base-regular`, …) or compose them:

```css
.sectionTitle { composes: nid-heading-2 from global; color: var(--nid-text-primary); }
```

Either way, **font-size and line-height are declared in exactly one place per style.** A component that sets its own `font-size` has opted out of the responsive scale.

---

## 7. Component inventory

52 component sets plus a set of standalone components. What follows is the full inventory, with the ones you will actually build first specified in detail.

### 7.1 Call to actions — `1:1071`

Every text link and button on the site is one instance of this. **18 variants** across three axes.

- `State` = `Default` | `Hover`
- `Type` = `Primary` | `Button` | `Inline` | `Menu` | `Secondary` | `Tertiary` | `Uppercase` | `Menu Title`
- `Size` = `Medium` | `Small` | `Large`

Text and boolean properties: `Icon Left` (default **false**), `Icon Right` (default **true**), `Text` (default `"Main Menu CTA Text"`).

| Type · Size | Box | Layout | Padding | Fill | Border | Label style | Label colour |
|---|---|---|---|---|---|---|---|
| Primary · Medium | h 40 | row, gap 8 | 8 / 0 | — | bottom 2px `border/subtle` | Heading/5 | `text/secondary` |
| Primary · Medium · **hover** | h 40 | row, gap 8 | 8 / 0 | — | bottom 2px `border/default` | Heading/5 | `text/primary` |
| Secondary · Medium | h 44 | row, gap 4 | 12 / 0 | — | bottom 2px `border/subtle` → `default` | Heading/6 | `text/secondary` |
| Tertiary · Medium | h 44 | **column**, gap 4 | 12 / 0 | — | bottom 2px `border/subtle` → `default` | Label/Small | `text/secondary` |
| Button · **Large** | h 40 | row, gap 8 | 8 / 16 | `accent/secondary` → hover `accent/strong` | — | Heading/5 | `text/on-accent` |
| Button · **Small** | h 32 | row, gap 8 | 4 / 12 | `surface/page` → hover `surface/raised` | — | Heading/6 | `text/secondary` |
| Inline · Medium | h 40 | row, gap 8 | 8 / 0 | — | — | (inherits) | `text/secondary` |
| Menu · Medium | h 36 | row, gap 4 | 8 / 0 | — | **none** | Label/Small | `text/secondary` → `text/primary` |
| Uppercase · Medium | h 32 | row, gap 8 | 4 / 8 | — | bottom 2px `border/subtle` → `default` | Label/Button | `text/secondary` → `text/primary` |
| Menu Title · Medium | h 40 | row, gap 8 | 8 / 0 | — | **none** (hover rule explicitly hidden) | Heading/5 | `text/secondary` → `text/primary` |

Notes that will save you a day each:

- **`Button · Small` is the time-critical CTA** — "Apply", "Register". It is a pill (`border-radius: 24px`) filled with `surface/page`, hovering to `surface/raised`. It is what sits in the header. `Button · Large` is the filled accent pill.
- **`Menu` and `Menu Title` carry no underline.** They exist precisely so navigation lists have none. `Menu Title` is `Primary` minus the rule; its hover rule node exists but is set invisible.
- The corner radius on both Button sizes is **24px**, i.e. a pill at these heights.
- Every CTA hosts its arrow through an **Icon Button** instance, not a bare SVG.
- The `Icon Left` slot defaults to a *YouTube logo* glyph. That is a legacy default; always set the icon explicitly.

**Icon rules — non-negotiable.** The icon is a promise about what happens next, so it is chosen by destination and never by taste.

| Kind | Icon | Left | Right | Example label |
|---|---|---|---|---|
| Back-navigation | ArrowLeft (Phosphor regular) | ✔ | ✘ | `About NID` |
| Link to a page | ArrowUpRight | ✘ | ✔ | `Campuses` |
| Document or external | ArrowUpRight | ✘ | ✔ | `B.Des Handbook 2026–27` |
| Email or telephone | none | ✘ | ✘ | `info@nid.edu` |

The **label never contains an arrow character**. The arrow is an icon in its own slot so screen readers and the CMS receive clean text. A back-navigation link **names its destination** — "About NID", "All Programmes" — rather than opening with the word "Back": the arrow already carries that meaning.

Two or more links in a group sit in a vertical stack with the gap bound to `Spacing/24`, and each link **hugs its content vertically**. The hug matters: pinned to a fixed height, a label long enough to wrap ("Innovation Centre for Natural Fibre") is clipped mid-descender rather than pushing the frame taller.

As built in the file today: 971 links, of which 29 have a left icon (27 back-navigation plus Instagram and YouTube, which borrow the configuration for a brand mark), 899 forward, 43 contact.

**React shape**

```tsx
type CTAType = "primary" | "button" | "inline" | "menu" | "secondary"
             | "tertiary" | "uppercase" | "menuTitle";

export interface CTAProps {
  children: React.ReactNode;          // clean text — no arrow glyphs
  type?: CTAType;                     // default "primary"
  size?: "small" | "medium" | "large";
  href?: string;
  targetType?: "page" | "document" | "external" | "email" | "phone";
  isBackNav?: boolean;
  iconLeft?: boolean;                 // derived from targetType/isBackNav by default
  iconRight?: boolean;
}
```

Derive `iconLeft`/`iconRight` from `targetType` by default (see `linkIcon()` in `content-model.ts`) and only allow an override for the two brand-mark cases.

**Tailwind**

```tsx
const base = "inline-flex items-center gap-2 font-primary transition-colors";
const styles: Record<CTAType, string> = {
  primary:   "h-10 py-2 text-h5 text-text-secondary border-b-2 border-border-subtle hover:text-text-primary hover:border-border",
  secondary: "h-11 py-3 gap-1 text-h6 text-text-secondary border-b-2 border-border-subtle hover:border-border",
  tertiary:  "h-11 py-3 gap-1 flex-col items-start text-label text-text-secondary border-b-2 border-border-subtle hover:border-border",
  button:    "h-10 px-4 py-2 rounded-pill bg-accent-secondary text-text-on-accent hover:bg-accent-strong",
  inline:    "h-10 py-2 text-text-secondary",
  menu:      "h-9 py-2 gap-1 text-label text-text-secondary hover:text-text-primary",
  uppercase: "h-8 px-2 py-1 text-button uppercase text-text-secondary border-b-2 border-border-subtle hover:text-text-primary hover:border-border",
  menuTitle: "h-10 py-2 text-h5 text-text-secondary hover:text-text-primary",
};
// size="small" + type="button"  →  "h-8 px-3 py-1 rounded-pill bg-surface-page text-h6 text-text-secondary hover:bg-surface-raised"
```

**CSS Modules**

```css
.cta { display: inline-flex; align-items: center; gap: var(--nid-space-8);
       font-family: var(--nid-font-primary); transition: color .15s, border-color .15s, background-color .15s; }

.primary { height: 40px; padding-block: var(--nid-space-8);
           font-size: var(--nid-type-heading-5-size); line-height: var(--nid-type-heading-5-lh);
           color: var(--nid-text-secondary);
           border-bottom: 2px solid var(--nid-border-subtle); }
.primary:hover { color: var(--nid-text-primary); border-bottom-color: var(--nid-border-default); }

.buttonSmall { height: 32px; padding: var(--nid-space-4) var(--nid-space-12);
               border-radius: var(--nid-radius-pill);
               background: var(--nid-surface-page); color: var(--nid-text-secondary); }
.buttonSmall:hover { background: var(--nid-surface-raised); }

.menu, .menuTitle { border-bottom: 0; }        /* navigation never carries a rule */
```

### 7.2 Icon Button — `271:6117`

Circular icon-only button. Four variants: `Size` = `Medium` (32×32, 24px glyph) | `Small` (24×24, 16px glyph), `State` = `Default` | `Hover`.

Padding 4px all round, `border-radius: 16px` (a circle at these sizes). Default has **no fill**; hover fills `accent/quaternary`. Glyph colour comes from `icon/quaternary`.

**The icon-colour trap.** An icon swapped into the slot brings its own colour binding from its own source component and ignores whatever the parent specifies. Changing the icon colour on `Call to actions` will appear to do nothing. Fix it in the icon library and republish. In React this maps to: the icon component must accept `currentColor` and never hard-code a fill — then `color` on the button governs it, which is what the Figma behaviour was trying and failing to achieve.

740 instances of this exist in the file. It is consumed by `Call to actions` for its left/right arrows and used standalone in the header, cards and controls.

### 7.3 Header — `99:8595`

Two variants. Sticky, full-bleed, background is `surface/page` at **1% opacity** (a near-transparent wash over the page, not an opaque band — do not "fix" this to opacity 1).

**`Variant=Default`** — 60px tall, horizontal, padding `[16,24,16,24]`, gap 12, aligned start / centre.
```
[ NID bilingual wordmark, 213×30 ]   [ Theme trigger 58×32 ]   … flex …   [ Apply CTA ][ search 24 ][ menu 24 ]
```
The right cluster ("Frame 101") is right-aligned, gap 8: an `Apply` CTA (`Type=Button, Size=Small`, padding `[4,12,4,12]`, `surface/page` fill, `text/secondary` label), a 24px MagnifyingGlass icon button, and a 24px List icon button.

**`Variant=Mobile`** — 320×50 at reference, padding `[16,16,16,16]`, `justify-content: space-between`.
```
[ Brand & Utility: NID mark 32×25 + theme trigger 58×32 ]        [ Apply ][ search ][ menu ]
```
The mobile logo is the compact mark, not the full bilingual wordmark, and it binds to `accent/strong`.

The desktop wordmark's vectors bind to `icon/primary`, so it inverts correctly in dark mode. Ship it as an inline SVG with `fill="currentColor"`.

### 7.4 Main menu — `1:178` and nine sub-menu sets

The primary menu is 656px tall with all nine sub-menus **collapsed by default**. Each sub-menu is a two-variant component set (`Collapsed` / `Expanded`) with an **instant** transition — no animation. Titles are **not clickable**; only the nested page links navigate. Nothing in the menu is underlined.

| Section | Set id | Links |
|---|---|---|
| About NID | `740:42727` | History · Charter · Campuses · News & Events · Our Themes |
| Programmes | `740:43131` | Curriculum Objectives · Bachelor of Design · Master of Design · Ph.D · Faculty Development Programme · Industry & Online Programmes · International and Collaborative Programmes |
| Study at NID | `743:42528` | Admission Process · Life at NID · Admission Notifications · PM Vidyalaxmi Scheme · Young Designers |
| Research & Publications | `743:42529` | Innovation Center for Natural Fiber · International Centre for Indian Crafts (ICIC) · Center for Bamboo Initiatives · Railway Design Center · Smart Handloom Innovation Centre · Design Research & Innovation Centre for Nation Building · NID Press · Intellectual Property Rights Cell |
| Consulting & Entrepreneurship | `743:42776` | Integrated Design Services · Outreach Programmes · National Design Business Incubator |
| Knowledge Management Centre | `743:42939` | Design Classics Collection · KMC Database · Services · e-Resources |
| People | `743:43470` | Visitor/President of India · Founding Faculty · Governing Council · NID Senate · Faculty · Staff · Notable Alumni |
| Events | `743:43574` | Alpavirama · Drawing Dialogues · Shifting Paradigms |
| Industry Connect | `743:43729` | Industry MoUs · Placements · Shifting Paradigms |

Section headers use `Type=Menu Title`; nested links use `Type=Menu`. Neither carries a rule, including on hover. The expanded header's hover shows a colour change only.

**There is no menu table.** This tree is `Page.parent` filtered to published pages. Build it as one recursive query and cache it; do not hand-maintain the list above in code.

### 7.5 Title — `617:28704`

Three variants: `Type` = `Page` | `Section` | `Sub Section`. Booleans: `Subtext` (default true), `Plus Button` (default false).

`Type=Section` is vertical, gap 8, hugging, with a `Section Subtext` slot wired to the `Subtext` boolean. This is the component that replaced ad-hoc title/subtitle blocks across the People pages — use it anywhere a section needs a title plus an optional standfirst, and never hand-build the pair.

### 7.6 Thumb — `619:28710`

The card used in `type=cards` sections. `Type` = `Decorative` | `Minimal`, `State` = `Default` | `Hover`. Booleans: `Campus`, `Seats`, `Show Subtext`.

`Minimal` no longer carries a separate campus/seats line — that information goes in the **subtitle**. `Campus` is retained as a boolean only because `Decorative` still uses it. In code, model the meta line as one string composed from the record (`"4 years at Ahmedabad"`, `"2 years at Ahmedabad, Gandhinagar & Bangalore"`).

### 7.7 The rest of the library

| Component | Node | Axes / properties |
|---|---|---|
| Information | `614:21286` | `Type` General·Important × `State` Default·Hover × `Alignment` Vertical·Horizontal. The Key-info rail block is `Important · Vertical`, stack gap `Spacing/32`. |
| Person | `646:47958` | `Show Title`, `Show Subtitle` booleans. Circular portrait — supply a square original. |
| News Article | `3767:260302` | `Variant` 1 Column · 2 Column · 3 Column · News Thumb, × Default/Hover. The mosaic's wide card alternates sides row to row. |
| Archive Row | `4451:318678` | `Columns` 3·2·1 × `State`. Text props `Date`, `Title`; boolean `Thumb`. One entry in the News archive; 1px closing rule; year heading above a group uses a 2px rule. |
| Award Row | `4479:328863` | `Columns` 3·2·1 × `State`. Props `Award`, `Student`, `Project`, `Detail` (clamped to two lines). Circular portrait. |
| Footer Single Block | `96:7586` | `Device` Desktop·Mobile. |
| Brand Strip | `3551:55871` | `Device` Desktop·Mobile·Only Pattern. Full-bleed strip that opens and closes every page. |
| Slideshow | `4862:584301` | `Count` 1–5 × `Media` Image·Video. 1392×597; stage 1038 + caption slot 330. Controls hidden at Count=1; `Media=Video` shows the play affordance. Caption slot takes a Content Information instance. |
| Image | `717:43244` | 1 · 2 · 3 up. |
| Photo Album Thumb | `795:56836` | |
| Header (card) | `771:43923` | `Type` Plain·Vibrant × `State`; booleans `Text`, `Button`. This is the *card* header, unrelated to the site header. |
| Theme Option | `4640:566636` | `State` Default · Hover · Light Hover · Dark Hover. 90 instances. |
| Theme Dropdown | `4641:354567` | 10 rows + footer CTA. 17 instances. |
| NID Logo | `176:4206` | Two variants. |
| Corners | `3646:228458` | |
| Motif/⟨Theme⟩ | `3225:49127` … `3225:53279` | Ten 32×32 craft motifs, one per theme. |
| Play | `4862:355154` | 24×24, for the video slideshow. |
| Pattern / Patternimate-* / animation-unit | `404:12482`, `569:*`, `671:*`, `677:*` | The large-scale decorative pattern fields and their animated variants. |

Home-page content tiles are components too — `Study at NID` `771:43937`, `Academic Notifications` `771:43996`, `News & Events` `771:43960`, `National Importance` `549:38575`, `Notable Alumni` `549:37812`, `Drawing Dialogues` `257:12880`, `Pride of NID` `549:37847`, `Campuses` `558:38728`, `Shifting Paradigms` `271:6018`, `Director's Note` `558:38594`, `History` `424:94546`, `Research` `556:38585`, `Card` `558:38711`, `KMC` `558:38676`, `Notification` `549:37596`, `Book` `271:6157`.

---

## 8. The content model

Full TypeScript in `tokens/content-model.ts`. The summary here is the part a front-end developer needs in their head.

### 8.1 The spine

Four tables carry the whole site: **Page**, **Section**, **Link**, **MediaAsset**. Everything else is a collection that hangs off `Section.items[]`.

```
Page  1 ──⇅── n  Section  1 ──── n  Link
 │                   │
 │                   └── items[]  polymorphic, shape decided by Section.type
 └── hero[] → MediaAsset
```

**Page** — one record per URL. `title`, `slug`, `parent`, `template` (`primary` | `secondary`), `utility` (`back` | `filter` | `none`), `keyInfo[]`, `hero[]`, `intro`, `sections[]` (≥1, ordered), `contacts[]`, `seoTitle`, `seoDescription`, `publishedAt`.

The tree formed by `parent` **is** the navigation, the breadcrumb and the sitemap. There is no separate menu table. `slug` is unique among *siblings*, not globally; the full path is built by walking `parent`. Renaming a parent moves its whole subtree — store a redirect from the old path on every slug change, because the site is old enough that inbound links exist for most of it.

**Section** — `order` (ordered; reordering is an editorial act and must be preserved), `type`, `title`, `body`, `image`, `links[]`, `contacts[]`, `groupBy`, `items[]`.

**Link** — `label` (must not contain arrow characters), `targetType`, and exactly one of `page` / `document` / `url` / `address`. `icon` and `newTab` are **derived**, never authored.

**MediaAsset** — `file`, `alt` (**required at upload**, not at use, otherwise it never gets written), `caption` (section images only; heroes take no caption), `credit`, `focal` (normalised 0–1), `width`, `height` (captured at upload, needed to reserve layout space).

### 8.2 The six section types

`type` is a **closed set**. Resist a seventh — check first whether the content is a text section with a different field filled in.

| type | Renders as | `items[]` resolves to | Fields read |
|---|---|---|---|
| `text` | Prose in columns 2–3, optional image row beneath, links in column 4 | — none — | title, body, image, links[], contacts[] |
| `links` | A list of destinations, wrapping two-up on the 330 line | Link | title, items[] — stack gap `Spacing/24` |
| `cards` | Thumb cards, three across the content field | Discipline · Programme · Page | title, items[] — each needs image, title, meta, target |
| `files` | Download rows, contacts in column 4 | Document | title, items[], contacts[] |
| `rail` | Grouped directory; the group label stays with its group | Person | title, **groupBy**, items[] |
| `mosaic` | Editorial index; the wide card alternates sides row to row | NewsArticle | title, **groupBy**, items[] — featured lead, max 3 |

Plus one thing that is *not* a section: **Key info** is a page-level field (`Page.keyInfo[]`), which is why it sits in the rail beside the hero rather than in the flow.

**Why `items[]` is one field and not six.** It would be possible to give Section a `cards[]`, a `files[]`, a `people[]`. Do not. An editor changing a section from `cards` to `links` would then have to move content between fields, and every consumer would have to know which field to read. One polymorphic list keyed by `type` means the section is a single switch and the front end asks one question — *what type is this* — rather than six.

**Grouping.** `groupBy` applies only to `rail` and `mosaic`. For `rail` it takes `department` | `letter` | `campus` | `faculty` — the four faculty index pages are this one field taking four values, not four page templates. For `mosaic` it takes `month`. **When `groupBy` is set, the response should arrive already grouped.** The front end must not sort a flat list into buckets, because the group label is a rendered element with its own place in the grid.

### 8.3 Section rendering — the switch

```tsx
// components/sections/Section.tsx
import type { Section } from "@/lib/content-model";

export function SectionRenderer({ section }: { section: Section }) {
  // The front end MUST refuse to render an empty section.
  if (!hasContent(section)) return null;

  switch (section.type) {
    case "text":   return <TextSection   {...section} />;
    case "links":  return <LinkGrid      {...section} />;
    case "cards":  return <CardGrid      {...section} />;
    case "files":  return <FileList      {...section} />;
    case "rail":   return <DirectoryRail {...section} />;
    case "mosaic": return <NewsMosaic    {...section} />;
  }
}

function hasContent(s: Section) {
  return Boolean(s.body?.trim()) || Boolean(s.image) || s.links.length > 0 || s.items.length > 0;
}
```

That `hasContent` guard is an editorial rule, not a defensive one: *an empty scaffold is worse than an absent section, because it reads as neglect rather than as brevity.* And if omitting it leaves the page with nothing, the page should not have been published.

### 8.4 Derived data — compute, never store

| What | Computed from | Used by |
|---|---|---|
| Menu tree | `Page.parent`, published only | Header menu, sitemap |
| Breadcrumb | ancestry to root | Utility slot, page metadata (depth reaches four under Programmes) |
| Back-nav label | `parent.title` | Utility slot on secondary pages |
| Sub-page links | `children(page)`, ordered | Column 1, row 2 of every overview page (five to eight is the observed range) |
| Sibling band | `siblings(page)` minus self | "More in this section", before the footer. **Must not render at all when empty** |
| Faculty views | `Person where role`, grouped by `groupBy` | The faculty directory — four groupings of one collection |
| News mosaic | NewsArticle, featured first then by date | News & Events index. Featured capped at three; remainder grouped by month, newest first |
| Link icon | `Link.targetType` | Every link on the site |
| Search index | title, intro, section bodies | Header search. Rebuild on publish; exclude unpublished pages |

**The one query that matters most.** A page render should be **one request**: the Page, its sections in order, and each section's items already resolved and already grouped. If the front end has to make a second call to find out what a section contains, or a third to group them, the model has leaked into the client. The polymorphic `items[]` exists precisely so the server can answer that in one pass. In Next.js terms: one `getPage(path)` in the server component, no client-side fetching for content.

### 8.5 Validation

**The CMS must refuse to save:** a page with no sections · a section with no title · a `rail` or `mosaic` with no `groupBy` · a link whose label contains an arrow character · a link whose target fields do not match its `targetType` (exactly one of page/document/url/address) · an image with no alt text · a fourth featured article while three exist · a slug that duplicates a sibling's · a person with `role=faculty` and no `discipline` (the by-discipline grouping would silently drop them).

**The front end must refuse to render:** a section with no content (§8.3).

### 8.6 Images

Hero images on **secondary** pages take a **64px radius on the top-left corner only**. Every other image on the site is square-cornered — there are no exceptions. The rule exists so the corner reads as a marker of the page's opening rather than as decoration.

```css
.hero { border-top-left-radius: var(--nid-radius-hero); }   /* 64px, secondary pages only */
```

Heroes crop to a different ratio at each breakpoint (2.2:1 → 2:1 → 16:9 → 4:3 height-capped), so `MediaAsset.focal` is not optional in practice: supply it for anything whose subject is not centred, and wire it to `object-position`.

```tsx
<Image
  src={asset.file} alt={asset.alt}
  width={asset.width} height={asset.height}
  style={{ objectFit: "cover",
           objectPosition: `${(asset.focal?.x ?? 0.5) * 100}% ${(asset.focal?.y ?? 0.5) * 100}%` }}
  sizes="(min-width:1280px) 1038px, (min-width:1024px) 976px, (min-width:768px) 720px, 358px"
/>
```

---

## 9. Information architecture

Full tree, every route, and the eight open decisions: `tokens/sitemap.json`.

Thirteen top-level areas: Home · About NID · Programmes · Study at NID · Research & Publications · Consulting & Entrepreneurship · Knowledge Management Centre · People · Events · Industry Connect · Regulatory · Miscellaneous · Contact.

**The section a page belongs to is not a field** — it is the first segment of its ancestry, derived by walking `parent` to the root.

### 9.1 Six places the live site and the architecture disagree

Each of these changes a page's parent and therefore its URL, so each needs a human decision before the tree is built.

1. **NID Press** sits under `/academics` on the live site but belongs to Research & Publications.
2. **Academic Notifications** sits under `/academics` but belongs to Study at NID.
3. **Knowledge Management Centre** sits under `/academics` but is a top-level section in the architecture.
4. **Charter** has no live page; the content that answers to it is **Mandate**. One page or two?
5. **Director's Message** is live but absent from the architecture.
6. **Continuing Education Programme** is live but absent from the architecture, and it absorbs what the architecture calls **Industry & Online Programmes**.

Two further open questions: whether the four faculty indexes remain four pages or become one page with a filter (the model supports either; the URLs differ), and **whether the site needs Hindi alongside English** — the logo is bilingual, nothing else is, and retrofitting localisation after launch is materially harder than allowing for it now. If there is any chance of Hindi, put `next-intl` and a `[locale]` segment in from day one.

### 9.2 Legacy paths worth normalising

`/studyofnid` · `/research_&_developments` (contains a literal ampersand — normalise it) · `/service` for Consulting · `/academics/programmes` · `/academics/kmc`.

---

## 10. The Home page, in full

Node `28:2175` (1440×900 as drawn; the real page is much taller). Structure: `Header` → `Brand Strip` → the page grid (4 columns, 23 children) → `Brand Strip`.

The grid holds **19 content tiles then 4 footer blocks**. Almost every tile is a square that fills one column (330×330 at 1440). Two exceptions: the position statement, and one span-2 hero card.

| # | Tile | Content |
|---|---|---|
| 0 | **Position Statement** | "Curiosity. / Craft. / Purpose. / Design that shapes tomorrow." — Heading/1, with each full stop tinted `accent/secondary`. |
| 1 | **Card** (hero) | Campus photograph, spans 2 columns. |
| 2 | Study at NID | Programme list: B.Des · 4 years at Ahmedabad; M.Des · 2 years at Ahmedabad, Gandhinagar & Bangalore; Ph.D · Ahmedabad; FDP · 2 years at Ahmedabad. Diagonal gradient field. |
| 3 | Academic Notifications | "academic calendar" overline + four dated entries + "ALL NEWS". |
| 4 | News & Events | "news & events" overline + three articles with thumbnails + "ALL NEWS". |
| 5 | National Importance | "Institute of National Importance / Passed unanimously by Parliament, a first for Indian design" + "read the act" CTA, on a circular field. |
| 6 | Notable Alumni | Portrait + "Sujata Keshavan / GD Class of 1984…" |
| 7 | Just a tile | Pattern field (decorative). |
| 8 | Drawing Dialogues | "workshop" overline · title · "Oct 30 & 31 2026". |
| 9 | Pride of NID | Portrait + "Dr. Lakshmi Murthy / From ceramics to menstrual health…" |
| 10 | Campuses | Campus photograph with title overlay. |
| 11 | Shifting Paradigms | "call for papers" · title · "Feb 23–25 2027". |
| 12 | Director's Note | Pull quote in Display/Quote + "director's note". |
| 13 | Just a tile | Pattern field. |
| 14 | History | "Faculty Stalwarts" + the Sarabhai/Jayakar/Ranjan/Vyas/Patel/Upadhyaya paragraph + "learn more". |
| 15 | Research | "Research & Publications" over a map field. |
| 16 | Just a tile | Pattern field. |
| 17 | Card | "young designers" · "Hybrid Board Game for Business Thinking" · "Manish Yadav". |
| 18 | KMC | Eleven book spines with rotated titles + "Knowledge Management Centre". |
| 19 | Primary Footer | Careers · Integrated Design Services · Placements · Young Designers · NID Alumni Data Registration · Tenders · PM Vidyalaxmi Scheme |
| 20 | Secondary Footer | Right to Information · Privacy Policy · Terms & Conditions · Sitemap |
| 21 | Tertiary Footer | CONTACT — info@nid.edu · cmr@nid.edu · +91 79 2662 9500 · +91 79 2662 9600 |
| 22 | Footer Quaternary | COLLABORATIONS — partner logo strip |

### 10.1 How it reflows

| | 4 col (1440) | 3 col (1024) | 2 col (768) | 1 col (390) |
|---|---|---|---|---|
| Tile size | 330 × 330 | 309 × 309 | 350 × 350 | 358 × 358 |
| Position Statement | 1 col, square | 1 col, hugs height (~324) | **full width**, hugs (~176) | **full width**, hugs (~180) |
| Hero card | span 2 | span 2 | span 1, beside nothing | 1 col |
| Hero type | 60/60 | 52/54 | 40/44 | 32/36 |
| Rows | 6 | 9 | 12 | 23 |
| Footers | 4 across, row 5 | 3 across row 7, 4th alone row 8 | 2 × 2, rows 10–11 | stacked, rows 19–22 |
| Board height | 900 (as drawn) | 3053 | 4238 | 7996 |

The reflow rule that keeps it honest: **no empty cells.** At 2 columns the tile count is odd, so the position statement is given a 2-span to make the total even and every row closes. At 3 columns the last content row is closed by giving the "Hybrid Board Game" card a 2-span, so the footer block starts on a clean row rather than sharing one with content tiles.

The mobile board is ~8000px tall because all 19 tiles stack. The three decorative "Just a tile" pattern fields are the obvious candidates to drop at one column if that needs shortening — they carry no content.

---

## 11. Motion and interaction

The file is deliberately restrained.

- **Menu expand/collapse is instant.** No animation on any of the nine sub-menus. This was an explicit decision.
- **Hover states are colour changes**, occasionally a background fill, never a transform. Suggested transition: `150ms ease` on `color`, `background-color`, `border-color`. Nothing else.
- **The expanded-menu headers have no bottom rule on hover** — the rule node exists but is invisible. Do not re-introduce it.
- **Theme changes are instant.** Because the switch is a data-attribute swap, browsers repaint in one frame. Do not add a cross-fade — with 65 custom properties changing at once it will judder. If you want polish, add `transition: background-color 120ms` to `body` only.
- **Slideshow** has prev/next controls and dot indicators; controls are hidden when `Count=1`.

**`prefers-reduced-motion`**: the only animated things in the file are the decorative pattern components (`Patternimate-*`, `animation-unit`). Gate those behind the media query and render the static `Pattern` variant otherwise.

---

## 12. Accessibility

The system is mostly well set up for this; three things need care.

1. **`text/quaternary` and `icon/quaternary` are intentionally below WCAG AA** for normal text. They are the faint/disabled/decorative tier. They are also, unfortunately, the **default icon colour on every CTA**. Audit any place where an arrow icon is the sole indicator of interactivity. The documented revert is: map light → `primary/450`, dark → `primary/250`.
2. **Only `accent/primary` is guaranteed 3:1** against light surfaces. `secondary`, `tertiary`, `quaternary` and `pentenary` are decorative. Never use them for an icon or graphic that carries information.
3. **Link labels contain no arrow glyphs** — this exists precisely so screen readers announce clean text. Keep it. Render arrows as `<svg aria-hidden="true">`, and for external/document links add a visually-hidden "(opens in a new tab)".

Also: portraits are circular crops of square originals — set `alt` from `Person.name` and never from the file name. The nine sub-menu sections are disclosure widgets — use `<button aria-expanded>` on the header and a real `<ul>` beneath; the header is not a link and must not be focusable as one.

---

## 13. Assets

- **Motifs** — ten 32×32 vector motifs, one per theme (`Motif/Peacock` `3225:49127` through `Motif/Yoga` `3225:53279`). Export as SVG with `fill="currentColor"` where possible so they pick up the row's theme; where a motif is genuinely multi-colour (Tiger's stripes, Ikkat), bind the paths to the theme's ramp steps and let `data-theme` scope handle it.
- **Pattern fields** — the large decorative geometry (`Pattern` `404:12482` and its animated siblings). These are big; export as optimised SVG and consider rendering them as CSS backgrounds rather than DOM.
- **Brand strip** — full-bleed pattern band that opens and closes every page. Three variants (Desktop / Mobile / Only Pattern).
- **Logo** — bilingual (Devanagari + Latin) wordmark, 213×30 desktop; a compact 32×25 mark for mobile. Both are vector groups bound to `icon/primary` / `accent/strong` — ship as inline SVG using `currentColor`.
- **Icons** — Phosphor, regular weight. `ArrowUpRight`, `ArrowLeft`, `MagnifyingGlass`, `List`, `Plus`, `Play`, `Sun`, `Moon`.

---

## 14. Traps — things that have already gone wrong once

Collected from the build of the Figma file itself. Most translate directly.

1. **Binding a colour token is not the same as setting it.** In Figma, a hand-built paint bound to a variable renders black unless it also carries the resolved colour. The web analogue: `var(--nid-text-primary)` with no fallback resolves to nothing if the custom property is undefined — always import `themes.css` before any component CSS, and consider `color: var(--nid-text-primary, #00353A)` on the `body` reset only.
2. **The header background is 1% opacity, not opaque.** It was accidentally set to opacity 1 once and turned a transparent wash into a solid band.
3. **The `Icon Left` slot's default glyph is a YouTube logo.** Always set icons explicitly.
4. **Swapped icons keep their own colour.** Only `currentColor` icons obey the parent.
5. **Menu titles are not links.** Only the nested page links navigate.
6. **Nothing in the menu is underlined**, in any state.
7. **Verify destinations, not counts.** A pass that checked reaction *counts* missed three menu headers still pointing at an underlined variant. The web analogue: snapshot the rendered `href`s, not the number of anchors.
8. **`text/quaternary` is the same value in light and dark** (`primary/350`). If you are generating contrast reports, it will look like a bug. It is not.
9. **Yoga's five ramps are identical.** Any code that assumes accents differ by hue must not break there.
10. **The 64px radius applies to exactly one corner of exactly one image on a page.** It is not a card style.

---

## 15. Suggested build order

Mirrors the CMS build order in the Figma reference, which is sequenced so that something is visible as early as possible.

**Stage 0 — foundations.** Import `themes.css`. Wire `ThemeProvider` + the no-flash inline script. Build the theme dropdown and prove all 20 theme×appearance states on a swatch page. Load the three fonts (and settle the Tonos question). Build `PageGrid` and prove the four breakpoints against the four Home boards.

**Stage 1 — the spine.** Page, Section, Link, MediaAsset. Build `Call to actions`, `Icon Button`, `Title`, `Header`, `Brand Strip`, `Footer`. Implement `type=text` and `type=links` only. *Most of the site renders at this point.*

**Stage 2 — small stable collections.** Campus, Programme, Discipline. Build `Thumb` and `type=cards`. Getting these keys right early avoids a migration later.

**Stage 3 — People.** The largest collection and the one that proves the model: four index views from one dataset and one `groupBy` field. Build `Person`, `type=rail`, and the faculty page with its four groupings.

**Stage 4 — Centre and Document.** Straightforward once the spine exists. `type=files` unblocks the regulatory and admissions file lists.

**Stage 5 — News and Events.** Last, because they are the only collections with ongoing editorial load. Build `News Article`, `type=mosaic`, `Archive Row`, `Slideshow`. Build them when editors are ready to use them, not before.

---

## 16. Out of scope

The design file explicitly does not cover: authentication and roles for the CMS itself; form handling (admissions runs on a separate subdomain today); search implementation beyond the index contents; analytics; and the alumni-registration and tender workflows, which are transactional rather than editorial and probably do not belong in this CMS at all.

---

## Appendix A — Figma node index

**Variable collections**

| Collection | Id | Modes |
|---|---|---|
| Theme | `VariableCollectionId:3131:51211` | 10 |
| Appearance | `VariableCollectionId:3009:43998` | Light `3009:0`, Dark `3009:1` |
| Breakpoint | `VariableCollectionId:4217:263825` | `4217:0` Desktop·4col, `4217:1` Laptop·3col, `4217:2` Tablet·2col, `4217:3` Mobile·1col |
| Typography | `VariableCollectionId:3468:51984` | 1 — `Font/Primary`, `Font/Secondary`, `Font/Body` |
| Spacing | `VariableCollectionId:3540:51822` | 1 — 0·2·4·8·12·16·24·32·48·56·64 |
| Base | `VariableCollectionId:3636:55900` | 1 — Neutral/Black, Neutral/White |

**Semantic token ids** — `surface/page` `3009:43999` · `surface/raised` `3009:44000` · `surface/inverse` `3009:44001` · `surface/hover` `4566:359205` · `text/primary` `3009:44002` · `text/secondary` `3009:44003` · `text/tertiary` `3028:44058` · `text/quaternary` `3028:44059` · `text/on-accent` `3009:44004` · `icon/primary` `3016:43999` · `icon/secondary` `3016:44000` · `icon/tertiary` `3028:44060` · `icon/quaternary` `3028:44061` · `icon/on-accent` `3016:44001` · `border/faint` `3011:43998` · `border/subtle` `3009:44005` · `border/default` `3016:43998` · `border/strong` `3056:51693` · `border/primary` `3056:51694` · `accent/subtle` `3056:51695` · `accent/muted` `3173:51291` · `accent/primary` `3009:44006` · `accent/strong` `3056:51696` · `accent/secondary` `3009:44007` · `accent/tertiary` `3009:44008` · `accent/quaternary` `3069:51016` · `accent/pentenary` `3107:51428`

**Grid tokens** — `Grid/Columns` `4217:263870` · `Grid/Page margin` `4217:263871` · `Grid/Column gap` `4217:263872` · `Grid/Row gap` `4217:263873` · `Grid/Content width` `4217:263874`

**Documentation pages inside the file** — `📄 Website Pages` `3594:46040` · `✅ Build Checklist & Library` `3750:57762` · `Page Patterns — Design & CMS Reference` `4144:246874` · `CMS & Data Model — Backend Reference` `4338:188698` · `🎨 Theme Picker` `4662:612406` · `Patterns` `1000:45482` · `Garage` `320:11613` · `Slides` `746:43825`

**Key boards** — Home `28:2175` (+ `4990:368207`, `4997:381054`, `4999:393901`) · About NID landing `3754:240099` (+ `4296:269561`, `4334:185219`, `4175:246865`) · Our Themes `4800:347502` · News archive `4454:185408` · Student Awards `4480:195581` · Faculty by Discipline `3860:106964` · Member template `4043:120597` · Article template `4125:240913` · Primary Menu `1:178` · Menus section `4180:303896`

---

## Appendix B — Known incomplete work in the Figma file

So that a developer does not mistake these for requirements.

- The **Slideshow caption slot is empty** — a Content Information instance could not be placed because of the Tonos font failure.
- The ten **Our Themes paragraphs have no text style applied**, for the same reason.
- **25 of 44 menu sub-links have no destination page** yet; those pages have not been designed.
- Five **"Line 6 (Stroke)" gradients still start on `surface/page`** rather than a defined stop, so they blend into the background.
- The **theme dropdown's "Learn more about the themes" CTA has no prototype destination** — it should link to `/about/our-themes`.
- **12 menu headers lack hover states.**
- The **Our Themes page has no "Section siblings" block**.
- On the **Our Themes** page the ten theme cards are filled with `surface/raised` — except **Lotus**, which is filled with `surface/page`. One of the two is wrong; `surface/raised` is the majority.
- The **desktop Home hero is hardcoded at 50px** while `Type/Heading 1` says 60; the three responsive boards are bound to the token (52 / 40 / 32). In code, bind all four — use Heading/1 throughout.
