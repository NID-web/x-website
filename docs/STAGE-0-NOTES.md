# Stage 0 notes — deviations, fixes, and things the next session needs

This records what changed and why, so `design/generate.py` isn't run again without
folding these back in, and so nobody "fixes" a deliberate quirk later.

## 1. The four `themes.css` corrections — now folded into `generate.py`

`src/styles/themes.css` is a corrected copy of `design/tokens/themes.css`. **All four
edits below are folded into `generate.py`** (as of the commit that added this update) —
running it from fresh Figma extracts reproduces the correction automatically; nothing
needs re-applying by hand. Proven, not just asserted: `python3 design/generate.py` in a
scratch copy reproduced `src/styles/themes.css` **byte-identical**; running it for real
against `design/` made `design/tokens/themes.css` byte-identical to `src/styles/themes.css`
too, so the bundle and the app no longer diverge. `design/tokens/tokens.json` is untouched
by this (confirmed by diff) — the four edits are CSS-emit-only, as designed. `design/verify.py`
still passes 25/25, and `npm run verify:tokens` still passes 591/591, after the regeneration.

The four edits, for reference (all in `design/generate.py`):

1. **Font families** (the `font families` block): swap the display
   names (`"Futura PT"`, `"Bodoni PT VF"`, `"Tonos"`) for the Typekit CSS family names
   (`"futura-pt"`, `"bodoni-pt-variable"`, `"tonos"`), add `--nid-font-primary-display`,
   fix Bodoni's fallback from `sans-serif` to `serif`, and add the ten `--nid-weight-*`
   tokens.
2. **Tracking `%` → `em`** (the `tracking_css()` helper, applied at `s["tracking"]`
   emission): every `--nid-type-*-tracking` value divided by 100 and suffixed `em`.
   **`tokens.json`'s own `tracking` field stays `%`** — it mirrors the Figma source; only
   the CSS-emit step converts, the same way `generate.py` already treats `size`/`lh` as
   px-only at emit time.
3. **`font-weight` per type class** (the `weight_var()`/`is_italic()` helpers, applied in
   the `.nid-*` class loop): one `font-weight` added to each of the 22 classes, plus
   `font-style: italic` on `.nid-display-quote`, `.nid-body-base-italic`,
   `.nid-body-caption-italic`. The mapping from Figma's `weight` field isn't a flat 1:1
   lookup — Tonos (`font: "body"`) only ships two cuts, so *every* body style collapses
   onto `--nid-weight-body` or `--nid-weight-body-bold` regardless of its Figma name
   (`Body/Large/Regular`'s `"Light"` and `Body/Base/Regular`'s `"Regular"` are both just
   `--nid-weight-body`; anything with `"Bold"` in the name, including `"SemiBold"`, is
   `--nid-weight-body-bold`). Primary and secondary styles map their Figma name directly
   (`"Heavy"` → `--nid-weight-heavy`, `"Subhead Italic"` → `--nid-weight-serif-subhead` +
   `font-style: italic`). Verified against the 22 corrected classes in
   `src/styles/themes.css` before writing the helper, not derived from assumption.
4. **Shell width token** (`generate.py`'s grid block): add
   `--nid-grid-shell-width: calc(var(--nid-grid-content-width) + 2 * var(--nid-grid-page-margin))`
   once, in the base `:root` block — it needs no per-breakpoint override.

## 2. Two hardcoded path fixes in `design/`

Both `design/verify.py` and `design/generate.py` hardcoded `ROOT = "/root/nid-context"` —
the environment they were authored in. Both now derive `ROOT` from
`Path(__file__).resolve().parent`, so they work from any checkout. `generate.py` matters
more: it's what regenerates `themes.css`, so it has to actually run for the §1 corrections
to ever be folded in — see §1 for the byte-identical proof, now that they are.

## 3. `[locale]` is the true root layout — there is no `src/app/layout.tsx`

next-intl's `next/root-params` support (default-on in Next 16.3+) detects root params by
walking the route's loader tree **until it hits the first layout module, then stops**.
An `app/layout.tsx` wrapping `[locale]` — even a pass-through — sits above `[locale]` in
that walk and is found first, so the walk returns before ever seeing the `locale` param:
`next/root-params` reports zero root params and `request.ts` crashes. Removing
`app/layout.tsx` entirely (so `[locale]/layout.tsx` is Next's actual root layout) fixes
it. `src/app/not-found.tsx` still needs its own `<html>` since there's nothing above it.
Both `<html>` trees share `src/app/head-shell.tsx`'s `HeadShell`/`THEME_SCRIPT` so they
can't diverge. `/en` builds as `●` (SSG via `generateStaticParams`) — the static category
for a parameterized route; `ƒ` (dynamic) would have been the failure to watch for.

## 4. Known limitation: the global not-found can flash the wrong theme

`src/app/not-found.tsx` is reached only when `[locale]/layout.tsx` itself throws
`notFound()` — an invalid or absent locale segment on a request the proxy's matcher
didn't rewrite (e.g. a path with a dot, like `/some-file.xyz`, which the matcher
deliberately excludes so it doesn't intercept static-asset requests). In that one case,
Next can't stream the response's real `<html>` as the initial document — the layout that
*defines* `<html>` is the very thing that failed — so it sends a generic bootstrap shell
(`<html id="__next_error__">`) and reconciles the real tree client-side. React never
executes a `<script>` tag reached by client-side reconciliation (confirmed via console:
*"Scripts inside React components are never executed when rendering on the client"*), so
`THEME_SCRIPT` genuinely cannot run on this path — no CPU-throttling trick fixes it,
because it isn't a timing problem. What still holds: the page resolves to a valid default
(Peacock/Light, via `themes.css`'s `:root` fallback) rather than rendering unstyled, and it
still shows its own content. `scripts/verify-tokens.mjs` asserts exactly that, and
documents why it can't assert more. Fixing this properly would mean giving the app a
non-dynamic root layout again, which reopens the `next/root-params` breakage in note 3 —
a real architectural tension, not an oversight. Revisit only if this path proves reachable
in normal (non-malicious, non-crawler) traffic; it requires a request that never comes
through valid locale-prefixed navigation.

## 5. `--nid-grid-shell-width` is a `calc()` — don't read it with `getPropertyValue`

`getComputedStyle(el).getPropertyValue('--custom-prop')` returns a custom property's
*specified* value verbatim — custom properties are raw token streams, not resolved
values, so `calc()` is never reduced to a number there. Only when a real layout property
(`max-width: var(--nid-grid-shell-width)`, as `PageGrid` does via `--container-shell`)
consumes the `var()` does the browser actually evaluate the `calc()`. Both
`EnvironmentReadout` and `GridProof` measure a real `[data-nid-shell]` element's rendered
`getBoundingClientRect()` instead of parsing the variable's text. The same applies to
deriving the actual column width below the 1440px reference viewport: at, say, 1280px,
the shell has not yet hit its `max-width` cap, so the real content box is narrower than
the `--nid-grid-content-width` token (which only equals the *rendered* width exactly at
the breakpoint's reference viewport). `GridProof` derives content width from the measured
shell rect, not from the token.

## 6. A page is one grid — don't nest `PageGrid`

Caught by measuring, not eyeballing: an early draft of the swatch page wrapped the
grid-proof section's content in its own `<PageGrid>`, nested inside a `<GridItem>` of the
page's outer `<PageGrid>`. That doubled the shell's `px-margin` (column 1 measured at
48px, not 24). `GridProofCells` now returns flat `GridItem` siblings, placed directly in
the swatch page's single top-level `PageGrid` — exactly the "one grid" rule in
`CLAUDE.md`.

## 7. The type scale has 22 styles, not 23

`design/verify.py` asserts `22`, and `design/tokens/tokens.json → typography.styles` has
22 keys. `NID-CONTEXT.md`'s own build-brief reference to "23 Figma styles" doesn't match
its source data; the swatch page's type specimen renders all 22.

## 8. `next lint` is removed in Next 16

`"lint"` runs `eslint .` directly (plus `scripts/lint-tokens.mjs`), not `next lint`.

## 9. Node version

`.nvmrc` pins `24.19.0` ("Krypton"), the current LTS — Node 20 reached end-of-life
2026-03-24. Confirmed clean against all three pinned dependencies: `next@16.3.2`
(`engines: >=20.9.0`), `@playwright/test@1.62.1` (`>=20`), `next-intl@4.13.7` (no upper
bound).

## 10. Fonts loaded fine here — still confirm the kit's domain allowlist

`scripts/verify-fonts.mjs` passed all three families (futura-pt, tonos,
bodoni-pt-variable) and detected a working `opsz` axis on `bodoni-pt-variable` in this
build/test environment, so kit `svx1oks` was not domain-locked against this machine's
network. That doesn't guarantee every environment (CI runners, corporate networks) can
reach `use.typekit.net` the same way — if fonts don't load elsewhere, check the kit's
allowed-domains list before suspecting the code (CLAUDE.md §2.10).

**The `opsz` axis isn't bound anywhere in CSS — it's a one-off measurement, not a token.**
`scripts/verify-fonts.mjs` creates two throwaway `<span>`s with
`font-variation-settings: 'opsz' 8` and `'opsz' 60` purely to compare rendered glyph
widths and confirm the axis exists, then discards them. Nothing in `themes.css` or
`globals.css` sets `opsz`, so this is *not* a fifth edit needing folding into
`generate.py` — §1 above remains exactly four. Binding `opsz` to something real (e.g. a
`--nid-type-*-opsz` token switched per style, the way `Display Demi` vs `Subhead Regular`
are meant to differ optically) is Stage 1+ work, not done here.
