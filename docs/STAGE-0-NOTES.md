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
still passes 25/25, and `npm run verify:tokens` still passes (593/593 as of §11's body-face
work), after every regeneration.

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
   `.nid-body-caption-italic`. Primary and secondary styles map their Figma name directly
   (`"Heavy"` → `--nid-weight-heavy`, `"Subhead Italic"` → `--nid-weight-serif-subhead` +
   `font-style: italic`); body styles map onto the four `--nid-weight-body-*` tokens
   (§11) — `"Light"` → `-light`, `"Regular"`/`"Regular Italic"` → the base
   `--nid-weight-body`, `"SemiBold"` → `-semibold`, `"Bold"` → `-bold`. Verified against
   the corrected classes in `src/styles/themes.css` before writing the helper, not derived
   from assumption.
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

`scripts/verify-fonts.mjs` passed both Typekit families (futura-pt, bodoni-pt-variable)
and detected a working `opsz` axis on `bodoni-pt-variable` in this build/test
environment, so kit `svx1oks` was not domain-locked against this machine's network. That
doesn't guarantee every environment (CI runners, corporate networks) can reach
`use.typekit.net` the same way — if fonts don't load elsewhere, check the kit's
allowed-domains list before suspecting the code (CLAUDE.md §2.10).

**The `opsz` axis isn't bound anywhere in CSS — it's a one-off measurement, not a token.**
`scripts/verify-fonts.mjs` creates two throwaway `<span>`s with
`font-variation-settings: 'opsz' 8` and `'opsz' 60` purely to compare rendered glyph
widths and confirm the axis exists, then discards them. Nothing in `themes.css` or
`globals.css` sets `opsz`, so this is *not* a fifth edit needing folding into
`generate.py` — §1 above remains exactly four. Binding `opsz` to something real (e.g. a
`--nid-type-*-opsz` token switched per style, the way `Display Demi` vs `Subhead Regular`
are meant to differ optically) is Stage 1+ work, not done here.

## 11. The body face is a single-place swap — briefly Merriweather Sans, now Tonos again, final

Tonos was retired for a few commits (provisional Merriweather Sans, loaded from Google
Fonts, while the kit's weight coverage was in question), then reinstated — **final, not
provisional** (`design/NID-CONTEXT.md` §6.4, dated note). The kit now carries
300/400/600/700 with italics, so all four spec weights are real cuts, not the historical
two-cut substitution. Whichever face is active, one `BODY_FACE` dict at the top of
`design/generate.py` — family, fallback stack, stylesheet URL (`None` means "served by
the Typekit kit already linked in `HeadShell`"), an optional explicit `preconnect` list,
and the four weight numbers — drives everything:

- `themes.css`: `--nid-font-body` and four `--nid-weight-body-*` tokens
  (`-light`/base/`-semibold`/`-bold` = 300/400/600/700).
- `tokens.json`: `typography.fonts.body`.
- `design/tokens/font-manifest.json`: `{ body: { family, cssFamily, stylesheetUrl,
  preconnect, weights } }` — the one JSON both TypeScript and Node scripts read. For
  Tonos, `stylesheetUrl` and `preconnect` are `null`/`[]`: nothing to add beyond the
  Typekit `<link>` already there.
- `src/app/head-shell.tsx` imports the manifest and only renders a second stylesheet
  link (plus whatever `preconnect` entries it declares) when `stylesheetUrl` isn't
  null — no literal URL, preconnect origin, or family name in the component; with
  Tonos this block renders nothing at all, exercising exactly that null path.
- `scripts/verify-fonts.mjs` reads `design/tokens/font-manifest.json` directly and
  builds its checks from `BODY.family`/`BODY.weights` — no literal `"tonos"` or any
  other family string anywhere in the file (checked with `grep`).

**Demonstrated, not just designed to work:** while Merriweather Sans was active, swapped
`BODY_FACE.family` to a throwaway third family (`"Public Sans"`, real Google Font, same
weight range), re-ran `generate.py`, copied `tokens/{themes.css,font-manifest.json}` into
`src/{styles,lib}/` — the only two files anyone touched. Hashed `scripts/verify-fonts.mjs`
and `src/app/head-shell.tsx` before and after: identical. Ran `verify-fonts.mjs`
unmodified: **6/6 passed against Public Sans** (proof it genuinely re-resolved the new
family rather than silently still checking the old one — if the family were hardcoded
anywhere, checking a font that was never loaded would have failed). Swapped back,
regenerated, recopied, rebuilt: green again. The Tonos reinstatement is the same
single-edit-and-regenerate move for real, not a repeat of the throwaway demo.

**Why not `next/font`:** a `next/font/google` import call names the family as a literal,
which would put it back into TypeScript and break the one-place rule — moot for Tonos
specifically, since it ships in the same Typekit kit as the other two families and was
never a `next/font/google` candidate anyway, but still the reason a future
Google-Fonts-hosted face wouldn't use `next/font` either while still provisional. Once a
body face is both external and final, self-hosting via `next/font/local` is the right
move — removes the CDN dependency and gets font-display control without a second
stylesheet round-trip. That's a `BODY_FACE`/manifest shape change (`stylesheetUrl` → local
file paths) for whenever it's actually needed, not built here.

## 12. §11 had a hole: nothing enforced that the src/ copies actually got made

`design/generate.py` writes into `design/tokens/`; the app reads its own copies under
`src/styles/themes.css` and `src/lib/font-manifest.json`. Every check in §11 — build,
`verify:tokens`, `verify:fonts`, `verify:design` — only ever looks at the `src/` copy, so
none of them could tell a fresh regeneration from a stale one that skipped the copy step.
Skip the copy and every script still goes green, on two different sets of values — exactly
the failure the one-place architecture exists to prevent, undetected by the very suite
meant to catch drift.

Fixed two ways:

- **`scripts/verify-parity.mjs`**: a fast, no-browser byte-compare of each generated file
  against its `src/` copy, hard-fails on any difference. Wired into
  `scripts/verify-tokens.mjs` as the very first thing `main()` does — before starting a
  server, since there's no point spending a minute on a production build and a full
  browser suite for a run that's already known to fail. Verified by deliberately
  appending a stray line to `src/styles/themes.css`: `node scripts/verify-parity.mjs`
  failed in the same run, and `node scripts/verify-tokens.mjs` failed in 0.17s (0
  assertions run) instead of going through build+server+browser first.
- **`npm run generate:tokens`**: `python3 design/generate.py` plus both `cp` steps as one
  command, so the copy can't be forgotten by hand. `npm run verify:parity` is also
  exposed standalone, for a fast check with no build required.

Also fixed in the same pass, then corrected once more: `HeadShell`'s preconnect for the
body face was hardcoded to `fonts.googleapis.com`/`fonts.gstatic.com`, baking
Google-specific knowledge into the one file the whole manifest architecture was built to
keep provider-agnostic. The first fix derived a single preconnect from
`new URL(stylesheetUrl).origin` — generic, but incomplete: Google Fonts serves CSS from
`googleapis.com` and font *binaries* from `gstatic.com`, so dropping the gstatic
preconnect delays first paint of body text by a full connection setup — exactly the cost
`display=swap` exists to avoid. Provider-agnostic and fast are both required, not a
tradeoff to pick one of.

The actual fix: `BODY_FACE` gained a `preconnect` list of `{origin, crossOrigin}` entries
(Google Fonts declares both its hosts, gstatic marked `crossOrigin: True` since font
binaries are CORS-fetched and the CSS host isn't). `resolve_preconnect()` in
`generate.py` uses that list when present, or falls back to a single same-origin entry
derived from `stylesheetUrl` when `BODY_FACE` doesn't set one — so a provider with no
second origin needs zero extra config. The **fully resolved** array — never a bare
origin — is what lands in `font-manifest.json`; `HeadShell` does nothing but `.map()` it
into `<link>` tags, with no URL-parsing or provider knowledge of its own. Verified at the
time (Merriweather Sans active) by curling the rendered page:
`<link rel="preconnect" href="https://fonts.googleapis.com"/>` (no `crossorigin`)
followed by `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>`,
both ahead of the stylesheet link.

Now that the body face is Tonos again (§11) — `stylesheetUrl: None`, no `preconnect` key
set — `resolve_preconnect()` takes its other branch (`if not url: return []`) and
`font-manifest.json` carries `"preconnect": []`. `HeadShell`'s map produces no `<link>`
tags at all, and the whole conditional block is skipped since `stylesheetUrl` is falsy —
real use of the empty-list path, not just the Google Fonts path this feature was built to
handle. `noUncheckedIndexedAccess`/JSON-literal inference makes an empty array infer as
`never[]`; `src/app/head-shell.tsx` now asserts an explicit `FontManifest` type over the
JSON import rather than relying on literal inference, so this doesn't need revisiting the
next time the array's contents change shape.

## 13. `package-lock.json` was out of sync — `npm install` hid it, `npm ci` caught it

Discovered when a CI job ran `npm ci` and refused to install:

```
npm ci can only install packages when your package.json and package-lock.json … are in sync
Missing: @emnapi/runtime@1.11.3 from lock file
Invalid: lock file's @emnapi/wasi-threads@1.2.1 does not satisfy @emnapi/wasi-threads@1.2.3
```

`@emnapi/*` are optional, platform-gated transitive deps (WASM fallbacks behind native
packages like `@swc/core` and `unrs-resolver`). Running `npm install` on macOS arm64
during this build pruned/rewrote some of those entries, because they aren't needed on this
platform — the `package-lock.json` diff for the Prettier install actually showed
`node_modules/@emnapi/core` and `@emnapi/runtime` being *deleted*, and that went
unremarked at the time. `npm install` tolerates the resulting inconsistency; `npm ci`
(correctly, by design) refuses it. So the whole local pipeline stayed green while the
lockfile was quietly unusable for a clean install — by anyone cloning the repo, on a new
machine, or in CI.

Fixed by regenerating from scratch (`rm -rf node_modules package-lock.json && npm
install`), which records all four `@emnapi` entries with their `optional: true` flags
properly. **Verified the way the failure demanded — in a fresh `git clone`, not the
working tree**: cloned the pushed repo into a scratch dir, ran `npm ci` (failed,
reproducing the CI error exactly), regenerated, ran `npm ci` again (passed), then built
clean. Re-ran the full suite afterwards in the working tree: `verify:parity` 2/2,
`verify:tokens` 593/593, `verify:fonts` 6/6, `verify:design` 25/25, tsc and lint clean.

**Lesson for anything that touches `package.json`:** `npm install` succeeding proves
nothing about a clean install. Run `npm ci` — ideally in a clean clone — before assuming a
dependency change is safe. Nothing in `npm run lint`/`verify:*` covers this, because they
all run against an already-populated `node_modules`.

*(This fix was originally made while setting up a GitHub Pages deploy, which has since
been reverted. The lockfile problem was never Pages-specific — that CI run only surfaced
a bug already sitting in the repo — so the fix stays.)*
