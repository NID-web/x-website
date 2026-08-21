# NID website — front-end

Stage 0 foundations for the National Institute of Design site redesign: the token
system, theming, grid, and typography, proven correct before any component or page
content is built on top of them.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 ·
next-intl · Node 24

See [`CLAUDE.md`](CLAUDE.md) for the full set of rules this repo enforces, and
[`docs/STAGE-0-PLAN.md`](docs/STAGE-0-PLAN.md) / [`docs/STAGE-0-NOTES.md`](docs/STAGE-0-NOTES.md)
for why this build deviates from `design/NID-CONTEXT.md` in a few places.

## Getting started

```bash
nvm use            # Node 24.19.0, see .nvmrc
npm install
npm run dev         # http://localhost:3000/en/swatch
```

`/en/swatch` is the Stage 0 acceptance surface — every token, every theme, every
breakpoint, on one page. It's the fastest way to see whether a token change was correct.

## The two theming axes

Two independent CSS attributes on `<html>`, set by an inline script in `<head>`
(`src/app/head-shell.tsx`) before first paint, so there's no flash of the wrong theme:

- `data-theme` — one of 10 themes: `peacock` (default) `lotus` `indigo` `henna` `yoga`
  `tanjore` `khadi` `terracotta` `ikkat` `tiger`. Selects the **layer-1 primitive** ramps
  (65 hex values, `--nid-<ramp>-<step>`).
- `data-appearance` — `light` (default) or `dark`. Selects which primitive step each
  **layer-2 semantic token** (27 of them, `--nid-<semantic>`) points at.

`src/components/theme/ThemeProvider.tsx` is the runtime: it adopts whatever the inline
script already set (never reads `localStorage` during render — `document` doesn't exist
during this client component's server render, so that has to happen in a `useEffect`),
and `setTheme`/`setAppearance` write the attribute, `localStorage`, and a cookie for a
future SSR pass to read.

**Scoped themes work for free.** Because primitives are declared on
`[data-theme="…"]` (not just `:root`), putting `data-theme="tanjore"` on any element
re-themes everything inside it independently of the page's own theme — this is how the
20 panels on `/swatch` show every theme×appearance combination at once, and how a future
"Our Themes" page's theme cards will work.

### Adding a theme

Add the theme name to `THEMES` in `src/lib/theme-constants.ts`, and add its 65-primitive
block to `src/styles/themes.css` (or regenerate from `design/generate.py` once the Figma
extracts include it — see `docs/STAGE-0-NOTES.md` §1 for what has to be folded in first).

### Adding a locale

One entry in `src/i18n/routing.ts`'s `locales` array, plus `messages/<locale>.json`. Hindi
also needs a Devanagari fallback in the font stacks — neither Futura PT nor Tonos covers
the script.

## The one rule that matters most: components only name layer-2 tokens

A component may reference `text-text-primary`, `bg-surface-raised`,
`border-border-subtle` — the semantic (layer-2) Tailwind utilities defined in
`src/app/globals.css`'s `@theme inline` block. **Never** a primitive
(`bg-primary-650`) and **never** a literal hex. A primitive hard-codes one theme's
appearance and breaks (or looks wrong) in the other nine; a hex breaks all twenty
theme×appearance states at once. `npm run lint` fails the build on any hex found under
`src/` outside `src/styles/themes.css` (see `scripts/lint-tokens.mjs`).

Primitives (`bg-primary-*` etc.) exist only for foundations/documentation pages — the
`/swatch` page's own primitive-ramp readouts, for instance.

## Layout: `PageGrid` + `GridItem`

**A page is one grid.** `src/components/layout/PageGrid.tsx` renders the shell
(`max-w-shell`, centered, `px-margin` padding) and the grid itself
(`grid-cols-page`, `gap-x-gutter`, `gap-y-rowgutter`). Use exactly one `PageGrid` per
page — nesting a second one inside a `GridItem` doubles the margin (see
`docs/STAGE-0-NOTES.md` §6 for how that actually happened once).

```tsx
<PageGrid>
  <GridItem span={1}>{/* section title */}</GridItem>
  <GridItem span={2}>{/* body copy, max 684px */}</GridItem>
  <GridItem span={4}>{/* full-bleed rule */}</GridItem>
</PageGrid>
```

`GridItem`'s `span` (`1 | 2 | 3 | 4`, default `1`) clamps itself as columns disappear at
narrower breakpoints — `span={3}` becomes full-width at tablet and mobile, without a
`min()` hack (which doesn't work in `grid-column: span`; see `CLAUDE.md` §2.1). Column
counts, margins, and gaps come entirely from the `--nid-grid-*` custom properties, which
change at the four breakpoints — `tablet` 768 · `laptop` 1024 · `desktop` 1280.

`src/components/dev/GridOverlay.tsx` is a translucent column ruler for local dev — press
`g` to toggle it. It renders `null` in production.

## Verification

```bash
npx tsc --noEmit          # strict, noUncheckedIndexedAccess
npm run lint              # eslint + the no-literal-hex rule
npm run build              # [locale] routes must be ○/● (static), never ƒ (dynamic)
npm run verify:tokens     # 591 assertions: 540 semantic + scoped-theme + grid + type,
                          #   in a real (Playwright) browser against a production build
npm run verify:fonts      # confirms all three Typekit families actually loaded
npm run verify:design     # re-checks design/tokens/ itself (python3 design/verify.py)
npm run screenshot        # docs/screenshots/swatch-{1440,1024,768,390}.png
```

Run `verify:tokens` before committing anything that touches `themes.css`, `globals.css`,
`PageGrid`, or `GridItem` — it's the only thing that actually proves a token change
resolves correctly in all 20 theme×appearance states rather than just looking plausible.

## Known deviations from the Figma spec

- **Tonos has no Light or SemiBold cut.** The kit (`svx1oks`) serves Tonos at 400/700
  only. `Body/Large/Regular` and `Body/Large/Bold` are mapped to 400/700 rather than the
  spec's Light (300) / SemiBold (600) — a recorded substitution, not an oversight. Judge
  it yourself on `/swatch`'s type specimen.
- **`[locale]` is the app's actual root layout** — there is no `app/layout.tsx`. Required
  for `next/root-params` to detect the locale param at all; see
  `docs/STAGE-0-NOTES.md` §3.
- **The global `not-found.tsx` can't guarantee no-flash.** Reached only via an edge case
  (an invalid locale segment on a request the proxy didn't rewrite); Next sends a generic
  shell for that response and the inline theme script never runs. See
  `docs/STAGE-0-NOTES.md` §4.
- **22 type styles, not 23.** The build brief's own reference to "23 Figma styles"
  doesn't match `design/tokens/tokens.json`, which has 22 — same count
  `design/verify.py` asserts.
- **Two Tailwind utilities added beyond the brief's `@theme` block**:
  `text-body-italic` and `text-caption-italic`, so all 22 type styles have a `text-*`
  utility and nothing under `src/` ever needs the raw (unlayered) `.nid-*` classes from
  `themes.css`.

## Out of scope for Stage 0

Theme dropdown UI, header, footer, brand strip, motifs, CTA, Icon Button, any section
renderer, any CMS call, real page content, image loaders, search. See `CLAUDE.md` § Build
order for the planned sequence.
