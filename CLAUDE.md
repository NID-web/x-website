# NID website — front-end

React/Next.js implementation of the National Institute of Design site. Large, mostly
editorial: ~110 pages, ~500 sections. A separate developer owns the CMS and APIs.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 ·
next-intl · Node 24 (`.nvmrc` pins `24.19.0`; Node 20 is past EOL)

---

## Source of truth

Design decisions are not in this file. They are in `design/`, and that is what to read:

| Read | When |
|---|---|
| `design/NID-CONTEXT.md` | Anything about theming (§3), the grid (§5), type (§6), a component's spec (§7), the content model (§8), or the traps (§14). Start here. |
| `design/tokens/tokens.json` | You need a token value programmatically. |
| `design/tokens/content-model.ts` | You are typing a page, section or link. **This is the contract with the backend — never edit it unilaterally.** |
| `design/tokens/sitemap.json` | Routes, menu tree, footer. |

`design/tokens/tailwind.config.ts` is **superseded** — it is v3 format. The live mapping is
the `@theme` block in `src/app/globals.css`.

`docs/STAGE-0-NOTES.md` records deliberate deviations from the design file. Read it before
concluding something is a bug.

---

## Rules that break things silently

These fail without an error. Most have already gone wrong once.

**Colour**
- A component may only ever name a **layer-2 semantic token** — `text-text-primary`, `bg-surface-raised`, `border-border-subtle`.
- Never a primitive (`--nid-primary-650`, `bg-primary-650`) — hard-codes the appearance and inverts wrongly in dark mode. Primitives are foundations-pages only.
- Never a literal hex in `src/`. Breaks all twenty theme × appearance states at once. `npm run lint` enforces this.
- Only `accent/primary` clears 3:1. `accent/secondary|tertiary|quaternary|pentenary` are decorative — never for an icon/graphic that carries meaning.
- `text/quaternary` and `icon/quaternary` are **intentionally below WCAG AA**, same value in light and dark. Not a bug.

**Type**
- Font-size/line-height declared in exactly one place per style. Use `text-*` utilities (`text-h2`, `text-body`, `text-display-quote`); a component setting its own `font-size` has opted out of the responsive scale.
- `letter-spacing` values are `em`, never `%` — percentages are invalid and get dropped.

**Layout**
- A page is **one grid**. Use `PageGrid` + `GridItem`. Do not nest per-section flex containers, or a second `PageGrid` inside a `GridItem` — either doubles the shell margin (caught once by measuring, see STAGE-0-NOTES §6).
- Never `grid-column: span min(2, var(--nid-grid-columns))` — `span` needs an integer literal, `min()` there is dropped and every span becomes 1. `GridItem` handles this.
- Columns drop right-to-left; nothing is ever reordered. Four breakpoints only: `tablet` 768 · `laptop` 1024 · `desktop` 1280 — no `sm`/`md`/`lg`.
- Below 3 columns, section separators are **omitted entirely**, and the utility slot leaves row 1.
- `--nid-grid-shell-width` is a `calc()` — `getComputedStyle().getPropertyValue()` on it returns the unevaluated expression, not a number. Measure a real `[data-nid-shell]` element's rect instead (STAGE-0-NOTES §5).

**Content**
- `Section.type` is a closed set of six: `text` `links` `cards` `files` `rail` `mosaic`. Before adding a seventh, check whether it's `text` with a different field filled.
- The front end **refuses to render a section with no content** — an empty scaffold reads as neglect, not brevity.
- `Link.label` never contains an arrow character; arrows are icons in their own slot.
- A back-nav link names its destination ("About NID"), never "Back".
- When `groupBy` is set, the data arrives already grouped — do not sort a flat list into buckets on the client.

**Icons and motion**
- Icons use `currentColor` and `aria-hidden="true"` — an icon with its own fill ignores its parent (a day in Figma).
- Hover states are colour changes only, never a transform, `150ms ease`. The theme swap is instant — no cross-fade, 65 custom properties change at once and it judders.
- Menu titles are **not links**, nothing in the menu is underlined in any state. Gate animated patterns behind `prefers-reduced-motion`.

**Rendering**
- Static by default. Do not call `cookies()`/`headers()` in a layout — opts the whole app out of static rendering. The theme comes from the inline `<head>` script.
- `src/styles/themes.css` is **generated** by `design/generate.py`. The four Stage 0 corrections are folded into it (STAGE-0-NOTES §1) — any *new* edit still needs the same treatment, or the next regeneration reverts it silently.
- **There is no `src/app/layout.tsx`.** `[locale]/layout.tsx` is the real root layout — `next/root-params` stops walking at the first layout module, so a wrapping layout above `[locale]` hides the param. `app/not-found.tsx` needs its own `<html>`; both share `head-shell.tsx`'s `HeadShell`. Exception: the global not-found can't run `THEME_SCRIPT` at all (STAGE-0-NOTES §4).

---

## Commands

```
npm run dev              # dev server
npm run build            # [locale] routes must be ○ or ● (static/SSG), never ƒ (dynamic)
npm run lint             # eslint + scripts/lint-tokens.mjs (no-literal-hex rule)
npm run verify:tokens    # 591 assertions: 540 semantic + scoped-theme + grid + type
npm run verify:fonts     # all 3 Typekit families load + the Bodoni opsz axis
npm run verify:design    # re-checks design/tokens/ itself (python3 design/verify.py)
npm run screenshot       # docs/screenshots/swatch-{1440,1024,768,390}.png
npx tsc --noEmit
```

`/en` and `/en/swatch` build as `●` (SSG via `generateStaticParams`) — the static category
for a parameterized route, same as `○`. Run `verify:tokens` before committing anything
that touches `themes.css`, `globals.css`, `PageGrid`, or `GridItem`. `/en/swatch` is the
fastest way to see whether a token change was correct.

---

## Fonts

Adobe Typekit kit `svx1oks`, loaded via `<link>` in the root layout — not `next/font`.
The kit serves `futura-pt` (300–800), `futura-pt-bold` (700), `bodoni-pt-variable`
(400–800 variable, roman + italic) and `tonos` (400/700 only).

Tonos has no Light or SemiBold cut, so `Body/Large/Regular` and `Body/Large/Bold` use
400/700. That is a recorded deviation, not an oversight.

**Confirmed** (`npm run verify:fonts`): Heavy reads 700, Bold reads 800 — not shifted.
`bodoni-pt-variable` has a working `opsz` axis. Fonts loaded fine here; if they don't
elsewhere, it's the kit's domain allowlist, not the code. Don't substitute a Google font.

---

## Build order

Stage 0 foundations ✅ · **Stage 1 spine** (CTA, Icon Button, Header, Footer, `type=text`,
`type=links`) · Stage 2 cards · Stage 3 people · Stage 4 documents · Stage 5 news.

`NID-CONTEXT.md` §15 has the reasoning. News and Events go last — they are the only
collections with continuous editorial churn.

## Locales

`next-intl` with a `[locale]` segment. Currently `["en"]` only. Adding Hindi is one entry
in `src/i18n/routing.ts` plus `messages/hi.json` — plus a Devanagari fallback in the font
stacks, since neither Futura PT nor Tonos covers the script.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
