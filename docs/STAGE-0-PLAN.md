# Stage 0 — NID front-end foundations

## Context

`/Users/sohrabsheikh/Desktop/NID-web` currently holds only `CLAUDE.md` and the `design/`
bundle — no `package.json`, no git repo. The design system exists as verified data
(`themes.css`, `tokens.json`) but has never been executed in a browser, and it ships four
defects that fail silently: `letter-spacing` in `%` (invalid CSS, dropped), no `font-weight`
on any type class (whole scale renders at 400), a serif family falling back to `sans-serif`,
and no shell-width token (so `max-w-content` + `px-margin` double-counts the page margin).

The goal of Stage 0 is a repo where the token layer is *provably* correct — 540 semantic
assertions and the grid arithmetic checked in a real browser — so Stage 1 components can be
written against it without re-litigating colour or spacing. No page content, no CMS wiring,
no components beyond the grid primitives.

### Baseline already established (read-only checks, this session)

- `design/` is complete and matches §0.1. Node 20 reached EOL 2026-03-24; current LTS is
  **24.19.0 "Krypton"**. Confirmed clean against it: `next@16.3.2` (`engines: >=20.9.0`),
  `@playwright/test@1.62.1` (`>=20`), `next-intl@4.13.7` (no upper bound) — build on 24.
- `themes.css` contains exactly **18** `%` occurrences, all on `--nid-type-*-tracking` lines
  → a substitution scoped to `-tracking:` is safe, and the post-edit `grep '%'` → 0 holds.
- Semantics are declared on `:root, [data-appearance="light"]` / `[data-appearance="dark"]`
  and primitives on `:root, [data-theme="…"]` — plain attribute selectors, so scoped
  `data-theme` panels work. **Grid tokens are `:root`-only inside media queries**, so a
  scoped panel inherits the page grid. That is correct, not a bug.
- `tokens.json` → `semantic.byThemeAndAppearance` is keyed by **capitalised** theme name
  (`"Peacock"`) → `{light,dark}` → `{"surface/page": "#FAFFFF", …}`, 27 entries. The verify
  script must lowercase the key and map `a/b` → `--nid-a-b`.
- `design/verify.py` passes **25/25** once its paths resolve (confirmed via in-memory exec).
- Both `design/verify.py` and `design/generate.py` hardcode `ROOT = "/root/nid-context"`.
- **The type scale has 22 styles, not the 23 the brief's §6.6e claims.** `verify.py` asserts
  22, `tokens.json` carries 22. The specimen renders 22.

---

## Build steps

Init git first (`git init`, `.gitignore` including `.DS_Store` before the first add).
One commit per numbered step.

### 1. Scaffold

`create-next-app@latest` **into the scratchpad, then move the generated files in** — it
refuses a directory containing `CLAUDE.md`/`design/`. Flags: `--typescript --tailwind
--eslint --app --src-dir --import-alias "@/*"`. Pins: `next@16.3.2`, `react@19`,
`tailwindcss@4.3.3` + `@tailwindcss/postcss`, `next-intl@4.13.7`, `@playwright/test@1.62.1`.
`design/` and `CLAUDE.md` must be byte-identical afterwards. `.nvmrc` → `24.19.0`.

Copy this plan document itself into `docs/STAGE-0-PLAN.md` and include it in this step's
commit — it is the reference for why the build deviates from `NID-CONTEXT.md` in the four
places §0's baseline and the amendments below identify, and it should live in the repo
history from the first commit, not be reconstructed from memory later.

### 2. `next-intl`

Follow the **installed** package's docs; the shape confirmed against next-intl 4.13 today:

- `src/i18n/routing.ts` — `defineRouting({locales:["en"],defaultLocale:"en"})`, plus the
  one-line comment that adding `"hi"` here + `messages/hi.json` is the whole change.
- `src/i18n/navigation.ts` — `createNavigation(routing)`.
- `src/i18n/request.ts` — `getRequestConfig` reading `await rootParams.locale()` from
  `next/root-params` (default-on in Next 16.3+), guarded by `hasLocale`, else `notFound()`.
  This is the current path; `setRequestLocale` is the deprecated fallback.
- `src/proxy.ts` — `createMiddleware(routing)` + matcher (Next 16's rename of
  `middleware.ts`). Use `middleware.ts` only if the installed version still documents it.
- `next.config.ts` — `createNextIntlPlugin()`.
- `messages/en.json` — one real namespace covering the swatch page's own headings only.

**Layout shape (decided — deviates from the brief's §6.1, recorded in STAGE-0-NOTES):**

- `src/app/[locale]/layout.tsx` renders `<html lang={locale} suppressHydrationWarning>` —
  the real root layout for locale routes. `generateStaticParams()` returns
  `routing.locales.map((locale) => ({locale}))`.
- `src/app/layout.tsx` is a pass-through returning `children`.
- `src/app/not-found.tsx` renders its **own** minimal `<html … suppressHydrationWarning>`.
- `src/app/[locale]/not-found.tsx` for in-locale misses.
- `src/app/head-shell.tsx` (or `.ts`) is the **single** module exporting `THEME_SCRIPT` and
  a `<HeadShell/>` component emitting the preconnect, the Typekit stylesheet `<link>` and
  the inline script. Both `<html>` trees import it, so they cannot diverge — a not-found
  page that flashes the wrong theme is still a bug.

`next build` must show `[locale]` routes as `○`. If they come out `ƒ`, fix before step 3.

### 3. Fonts

Typekit kit `svx1oks` via `<link>` in `HeadShell`, ordered preconnect → stylesheet → script.
Not `next/font`. If they fail locally it is the kit's domain allowlist — report, do not
substitute.

### 4. `src/styles/themes.css`

Copy from `design/tokens/themes.css`, then apply **only** the four §3 edits:

1. §3.1 font-family block → the four Typekit families (`serif` fallback for Bodoni) + the
   ten `--nid-weight-*` tokens.
2. §3.2 all 18 `-tracking:` values `%` → `em` (`n/100`). Confirm `grep '%'` returns 0.
3. §3.3 one `font-weight:` per `.nid-*` class (+ `font-style: italic` on `.nid-display-quote`,
   `.nid-body-base-italic`, `.nid-body-caption-italic`). The `weight` field in
   `tokens.json → typography.styles` already carries the Figma name for each of the 22 and
   maps 1:1 onto the §3.3 table — use it as the cross-check.
4. §3.4 `--nid-grid-shell-width: calc(content-width + 2 * page-margin)` after
   `--nid-grid-content-width`.

Nothing else. All 650 primitives and 27 semantic mappings stay untouched.

### 5. `src/app/globals.css`

Verbatim from brief §4, **plus two utilities the brief's block omits** — it maps 20 of the
22 type styles but drops the italic body cuts. Add, alongside `--text-caption` /
`--text-caption-bold`:

```css
--text-body-italic: var(--nid-type-body-base-italic-size);
--text-body-italic--line-height: var(--nid-type-body-base-italic-lh);
--text-body-italic--letter-spacing: var(--nid-type-body-base-italic-tracking);
--text-body-italic--font-weight: var(--nid-weight-body);

--text-caption-italic: var(--nid-type-body-caption-italic-size);
--text-caption-italic--line-height: var(--nid-type-body-caption-italic-lh);
--text-caption-italic--letter-spacing: var(--nid-type-body-caption-italic-tracking);
--text-caption-italic--font-weight: var(--nid-weight-body);
```

With these, all 22 styles have a `text-*` utility and nothing in `src/` ever needs to
reference a `.nid-*` class — closes the gap cleanly rather than mixing the two systems for
two styles, and removes the unlayered-cascade footgun (`.nid-*` classes are undeclared-layer
and out-rank `@layer utilities`, so `text-h1` would silently lose to `.nid-heading-1` on the
same element) since the class layer is simply never reached from application code.
`themes.css`'s `.nid-*` classes stay in the file as the CMS-agnostic fallback the design
system documents, just unused by anything under `src/`.

Generate the four remaining 13-step primitive ramps (secondary/tertiary/quaternary/
pentenary) with a throwaway node script, paste, delete it.

**Verify the emitted CSS after the first build**: `.bg-surface-page` must compile to
`background-color: var(--nid-surface-page)`. If it emits `var(--color-surface-page)` plus a
`:root` indirection, `inline` was dropped.

### 6. Foundation components

- `src/components/theme/ThemeProvider.tsx` — `"use client"`. Per §6.2: export `THEMES`,
  `APPEARANCES`, `Theme`, `Appearance`; adopt initial state from `document.documentElement`
  in `useEffect` (never `localStorage` during render); `setTheme`/`setAppearance` write
  attribute + `localStorage` + cookie (`path=/; max-age=31536000; samesite=lax`); export
  `useThemeOptional()` returning `null` outside a provider, `useTheme()` still throws. No
  transition on the swap.
- `src/components/layout/PageGrid.tsx` — brief §6.3 exactly, but `max-w-shell` (not
  `max-w-content`). Add `data-nid-shell` to the outer element and `data-nid-grid` to the
  grid — the verify script measures the shell by that hook.
- `src/components/layout/GridItem.tsx` — the §6.4 `SPAN` map. `span?: 1|2|3|4` (default 1),
  `className`, `as`, `children`. No `min()` anywhere.
- `src/components/dev/GridOverlay.tsx` — `g` toggles; `accent/quaternary` at low opacity,
  positioned by the same `PageGrid` shell; `fixed`, `pointer-events-none`, `z-50`; returns
  `null` when `process.env.NODE_ENV === "production"`.
- `src/lib/content-model.ts` — copy of `design/tokens/content-model.ts`, unchanged, unused.
  It is self-contained (no imports, no hex) so it will not trip the lint rule.

### 7. `src/app/[locale]/swatch/page.tsx`

Server component with small client leaves, sections a–f per brief §6.6. Internal QA surface,
not a real route: `export const metadata = { robots: { index: false } }` so it doesn't ship
indexable in the production build.

**Read every colour by probe, never by `getPropertyValue`.** Each chip sets
`background-color: var(--nid-<token>)` and reports `getComputedStyle(chip).backgroundColor`
converted to hex. An unresolved property computes to `rgba(0,0,0,0)`, which is exactly the
`UNRESOLVED` signal the page needs — `getPropertyValue('--nid-…')` cannot distinguish that.

- **a.** theme `<select>` (10) + light/dark toggle, both through `ThemeProvider`.
- **b.** environment readout, live on resize: columns, page-margin, column-gap,
  content-width, shell-width, viewport width, active breakpoint.
- **c.** grid proof — four `span={1}` blocks tagged `data-nid-col="1..4"`, then `span={2}`,
  `{3}`, `{4}`; a client leaf printing their `getBoundingClientRect().left` against
  **24 / 378 / 732 / 1086** with ✅/❌; `GridOverlay` inline, always on.
- **d.** 20 panels — ten rows, `<section data-theme={t} data-appearance={a}>`, each with all
  27 semantic chips in §3.3 order + resolved hex, the panel's own `surface/page` hex, a
  `border/subtle`→`border/default` hover strip, an `accent/quaternary` hover pill, and the ⚠
  markers. Label the three deliberate quirks on the page so nobody "fixes" them: identical
  `text/quaternary` across appearances, Yoga's five identical ramps, Tiger's near-black
  deep end. **Describe Tiger's value in words — no hex literal anywhere in `src/`.**
- **e.** type specimen — all **22** styles via the 22 `text-*` utilities from step 5
  (including the two added `text-body-italic` / `text-caption-italic`), each labelled with
  expected desktop size/line-height/tracking/weight. Note where caption-italic's tracking
  (1%) differs from caption-regular's (2%) — easy to typo when eyeballing the ladder. Plus
  the Futura ladder 300→800.
- **f.** 11 spacing bars; `radius-pill` and `radius-hero` (one corner only).

### 8. Verification

`scripts/verify-tokens.mjs` — Playwright, `chromium.launch({ args: ["--hide-scrollbars"] })`.
The flag is required: a classic scrollbar shrinks the layout viewport and would break both
the shell-width and the column-origin assertions.

1. `next build` + `next start` on a fixed port; open `/en/swatch`.
2. 10 themes × 2 appearances: set both attributes on `<html>`, read all 27 via a probe
   element, normalise to uppercase hex, compare to
   `tokens.json → semantic.byThemeAndAppearance[Theme][appearance]`. **540 assertions.**
3. At 1440 / 1024 / 768 / 390: columns 4/3/2/1 · margin 24/24/24/16 · column-gap
   24/24/20/16 · content-width 1392/976/720/358 · `[data-nid-shell]` measured width
   1440/1024/768/390 · h1 size 60/52/40/32 · body 16 everywhere · label 14 everywhere.
   At 1440 the four `data-nid-col` left edges = 24/378/732/1086 (±0.5px).
4. `getComputedStyle(h1).letterSpacing` is a px length, not `normal` (≈ −1.8px at desktop).
5. `getComputedStyle(h1).fontWeight === "700"`.
6. **Scoped-theme assertion — the actual proof `@theme inline` was used, not just declared.**
   Step 2's 540 assertions all set `data-theme`/`data-appearance` on `<html>` and read from
   there; they'd pass identically even if `@theme inline` were dropped and every colour
   silently froze to whatever `<html>` happened to be at load. So: with `<html
   data-theme="peacock" data-appearance="light">`, find the `data-theme="tanjore"` panel
   already on the swatch page (section d, appearance-light half) and probe all 27 tokens
   *inside it*; assert they equal Tanjore/light from `byThemeAndAppearance`, not Peacock's.
   Hard failure, not a warning — a false pass here is the one regression this script exists
   to catch.
7. Summary; non-zero exit on any failure.

`scripts/verify-fonts.mjs` — `document.fonts.ready`, then `check('700 32px futura-pt')`,
`'400 16px tonos'`, `'600 28px bodoni-pt-variable'`. Also measure two Bodoni spans at
`font-variation-settings:'opsz' 8` vs `'opsz' 60`; differing widths prove the axis exists.
On failure, say plainly it is almost certainly the kit's domain allowlist, not the code.

`scripts/verify-design.mjs` (or run directly) — **fix `ROOT` in `design/verify.py` and
`design/generate.py` to derive from `Path(__file__).resolve().parent`** rather than
substituting new absolute paths. `generate.py` matters more: it is what regenerates
`themes.css`, so it must be runnable for the §3 corrections to ever be folded in.

`scripts/screenshot.mjs` → `docs/screenshots/swatch-{1440,1024,768,390}.png`.

**No-flash check**: seed `localStorage` to a non-default theme via `addInitScript`, throttle
CPU through CDP, reload, screenshot, confirm the frame is already correct — and repeat by
hand in a real browser. Also confirm it for `/en/<garbage>` (renders
`[locale]/not-found.tsx`) and for a path the proxy does not rewrite (global
`app/not-found.tsx`) — both share `HeadShell`, so both must paint correctly first frame.

### 9. Hygiene + docs

- `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `@/*` → `src/*`.
- ESLint flat config + Prettier. **`next lint` is removed in Next 16** — scripts are
  `"lint": "eslint . && node scripts/lint-tokens.mjs"`. `scripts/lint-tokens.mjs` fails on
  any literal hex under `src/` except `src/styles/themes.css`.
- `.env.example`, `.gitignore`, `.nvmrc` (`24.19.0` — Node 20 is past EOL; confirmed clean
  against all three pinned dependencies in step 1).
- `README.md`: the two axes and how to add a theme; layer-2-only rule; `PageGrid`/`GridItem`;
  the verify scripts; known deviations (Tonos 400/700 substitution, the `<html>` placement,
  22-vs-23 styles).
- `docs/STAGE-0-NOTES.md`: the four `themes.css` edits verbatim, the two Python path fixes,
  and — prominently — **the four §3 corrections must be folded into `generate.py` before it
  is ever run again**, at these four emit sites: the font-family block (~L166), the
  `-tracking` emission (`s["tracking"]`, ~L232), the `.nid-*` class loop (~L262, add
  `font-weight` keyed off `s["weight"]` and `font-style` for the three italics), and the
  grid block (add `--nid-grid-shell-width`). Note that `tokens.json`'s `tracking` should
  stay `%` — it mirrors Figma; convert only at CSS-emit time.

---

## Deliberately not built (brief §9)

Theme dropdown UI, header, footer, brand strip, motifs, CTA, Icon Button, any section
renderer, any CMS call, page content, image loaders, search index. A plain `<select>` on
the swatch page is the right amount of theme switcher for Stage 0.

---

## Acceptance — run and report item by item

`npm run build` (routes `○`) · `npx tsc --noEmit` · `npm run lint` · `npm run verify:tokens`
(540 + grid + letter-spacing + font-weight + the scoped-theme hard assertion) ·
`npm run verify:fonts` · no-flash on `/en/swatch`, `/en/<garbage>` and the global not-found ·
20 panels distinct with zero `UNRESOLVED` · the scoped `data-theme="tanjore"` panel verified
by script (not just eyeballed) to resolve independently of `<html>`'s own theme ·
`grep -rn "#[0-9a-fA-F]\{3,6\}" src/ --include=*.tsx --include=*.ts` empty · four screenshots.

## Then report back on

1. Futura ladder — does Heavy read 700 and Bold 800, or is the mapping shifted?
2. Whether `bodoni-pt-variable` exposes an `opsz` axis (measured, per §8).
3. Contradictions found and how they were resolved — already known: the `<html>` placement,
   22 vs 23 type styles, the two hardcoded Python paths, `next lint`'s removal.
4. Whether Tonos 400 reads acceptably where the spec wanted Light — shown, not decided.

Finally: update `CLAUDE.md` with confirmed paths, real script names and the verified Futura
mapping; keep it under ~120 lines.
