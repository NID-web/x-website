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
block to `src/styles/themes.css` — or, once `design/_raw_primitives.txt` has the new
theme's Figma extract, run `npm run generate:tokens` to regenerate `themes.css` (which
already carries the Stage 0 corrections, STAGE-0-NOTES §1) and copy it into `src/` in one
step.

### Adding a locale

One entry in `src/i18n/routing.ts`'s `locales` array, plus `messages/<locale>.json`. Hindi
also needs a Devanagari fallback in the font stacks — neither Futura PT nor the current
body face covers the script.

### Changing the body face

The current body face is **Tonos** — final, not provisional (`design/NID-CONTEXT.md`
§6.4). It ships in the same Adobe Typekit kit as Futura PT and Bodoni PT VF, so
`BODY_FACE.stylesheetUrl` is `null` and no separate `<link>` or preconnect is needed. If
it ever changes again, it's still a single-place edit: change `BODY_FACE` at the top of
`design/generate.py`, then run `npm run generate:tokens` (regenerates *and* copies the
outputs into `src/{styles,lib}/` in one step — don't run `python3 design/generate.py`
directly, or the copy is easy to forget and `npm run verify:parity` will catch the
drift). Nothing else needs touching — `src/app/head-shell.tsx` and
`scripts/verify-fonts.mjs` both read the family/weights/stylesheet URL/preconnect list
from `font-manifest.json` at runtime; `HeadShell` does no URL-parsing of its own, it just
maps the manifest's `preconnect` array to `<link>` tags. If a provider needs more than
one preconnect origin (Google Fonts, for instance, splits its CSS host from its
CORS-fetched font-binary host), declare them explicitly in `BODY_FACE.preconnect` — see
`docs/STAGE-0-NOTES.md` §§11–12 for the mapping details and the demonstrated proofs (a
swap-and-back-again to a throwaway family, and a deliberate drift caught by
`verify:parity`).

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
npm run verify:parity     # design/tokens/* byte-matches its src/ copy — fast, no browser
npm run verify:tokens     # 593 assertions: 540 semantic + scoped-theme + grid + type,
                          #   in a real (Playwright) browser against a production build
                          #   (runs verify:parity first and fails fast if that drifts)
npm run verify:fonts      # confirms every font family (Typekit + the body face) loaded
npm run verify:design     # re-checks design/tokens/ itself (python3 design/verify.py)
npm run screenshot        # docs/screenshots/swatch-{1440,1024,768,390}.png
```

Run `verify:tokens` before committing anything that touches `themes.css`, `globals.css`,
`PageGrid`, or `GridItem` — it's the only thing that actually proves a token change
resolves correctly in all 20 theme×appearance states rather than just looking plausible.

After editing `design/generate.py`, run `npm run generate:tokens` rather than
`python3 design/generate.py` by hand — it regenerates *and* copies the outputs into
`src/{styles,lib}/` in one step, so the app's copy can't be left stale. Nothing else
catches that drift: every other check only ever looks at the `src/` copy.

## Deploying to GitHub Pages

**Not currently deploying — blocked, and the workflow is dormant on purpose.** This repo
is private, and GitHub Pages can't publish from a private repo on the **Free** plan
(Pages is public-repos-only there; private-repo Pages needs Pro/Team/Enterprise). So
`actions/configure-pages` fails with *"Get Pages site failed…"*, and enabling Pages in
Settings does **not** fix it — on Free + private, there's nothing to enable.

`.github/workflows/deploy-pages.yml` is therefore `workflow_dispatch`-only (no `push:`
trigger), so it doesn't put a red X on every push while this is unresolved. **The
workflow itself is correct** and the static export was verified end-to-end locally
(`docs/STAGE-0-NOTES.md` §13). Unblocking it is an account decision, not a code change:

- **Make the repo public** — free, works immediately. Also makes `design/NID-CONTEXT.md`
  (Figma IDs, open IA decisions, incomplete-work notes) public. No credentials in the
  repo; that's been checked.
- **Move to a paid plan** (Pro/Team, ~$4/mo) and keep the source private. Note the
  *published site* is still world-readable either way — access-controlled Pages sites
  need Enterprise Cloud.
- **Host elsewhere** (Vercel / Netlify / Cloudflare Pages) if the site itself shouldn't be
  public — they offer password/SSO protection on free tiers. The static export already
  works; only the workflow would change.

Once unblocked: enable Settings → Pages → Source → "GitHub Actions" if applicable, re-add
the `push:` trigger to the workflow, and it goes live at
`https://nid-web.github.io/NID-website/`.

GitHub Pages is static-only — no Node server, so `src/proxy.ts` can't run there at all
(Next's static-export docs list Proxy under "Unsupported Features"). `next.config.ts`
only switches to `output: "export"` when `GITHUB_PAGES=true` is set
(`npm run build:pages` sets it, with `PAGES_BASE_PATH` defaulting to `/NID-website` for local
testing) — the default `npm run build` and everything in **Verification** above stay
exactly as they are, since `next start` (which the verify scripts all spawn) needs a
normal server build, not a static export. See `docs/STAGE-0-NOTES.md` §13 for what that
mode changes (the root `/` → `/en` redirect moves from the proxy to a plain
`public/index.html`, `trailingSlash: true`) and how it was verified — by actually serving
the exported output from a simulated subpath and clicking through it, not just building
it.

**Also one-time, in the Adobe Fonts dashboard:** add the live `*.github.io` domain to kit
`svx1oks`'s allowed domains, or `futura-pt`/`bodoni-pt-variable`/`tonos` will silently
fall back to system fonts on the deployed site (CLAUDE.md §2.10).

## Known deviations from the Figma spec

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
