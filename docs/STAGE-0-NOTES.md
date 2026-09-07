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
still passes 25/25, and `npm run verify:tokens` still passes (609/609 as of §11's body-face
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
4. **Shell width token** (`generate.py`'s grid block): add `--nid-grid-shell-width`
   once, in the base `:root` block — it needs no per-breakpoint override. (It was first
   written as `calc(content-width + 2 * page-margin)`, which turned out to re-derive a
   *different* cap in every media query; it is now the flat `1440px` — see §19.)

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

## 5. Never read the shell's width from the token — measure the element

**Corrected in §19.** `--nid-grid-shell-width` used to be a `calc()`; it is now the plain
length `1440px`. The original wording of this note explained the `calc()` trap:
`getComputedStyle(el).getPropertyValue('--custom-prop')` returns a custom property's
*specified* value verbatim — custom properties are raw token streams, not resolved
values, so a `calc()` there is never reduced to a number. That is still true of custom
properties generally, so it is worth knowing; it is just no longer true of this token.

The conclusion is unchanged, and now rests on a simpler fact: **the token is the cap, not
the rendered width.** The shell only reaches 1440 at and above a 1440px viewport; below
that it is fluid, so reading the token over-reports the shell at every narrower viewport.
`EnvironmentReadout` and `GridProof` both measure a real `[data-nid-shell]` element's
`getBoundingClientRect()` instead.

The same applies to deriving the actual column width below 1440: at, say, 1280px the
shell has not hit its cap, so the real content box is narrower than the
`--nid-grid-content-width` token (which equals the *rendered* width only at the
breakpoint's reference viewport). `GridProof` derives content width from the measured
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
`verify:tokens` 609/609, `verify:fonts` 6/6, `verify:design` 25/25, tsc and lint clean.

**Lesson for anything that touches `package.json`:** `npm install` succeeding proves
nothing about a clean install. Run `npm ci` — ideally in a clean clone — before assuming a
dependency change is safe. Nothing in `npm run lint`/`verify:*` covers this, because they
all run against an already-populated `node_modules`.

*(This fix was originally made while setting up a GitHub Pages deploy, which has since
been reverted. The lockfile problem was never Pages-specific — that CI run only surfaced
a bug already sitting in the repo — so the fix stays.)*

---

## 14. The ten motifs are generated from PNG, and Tiger names a primitive on purpose

The `Motif/<Theme>` artwork arrived as ten **32×32 PNGs** (now `design/assets/motifs/`,
the source of record). They are not shipped as images. `npm run generate:motifs`
(`scripts/generate-motifs.py`) vectorises each one into
`src/components/header/motifs/<theme>.tsx`; those `.tsx` files are **generated** — edit the
PNG and regenerate, or the next run reverts a hand edit silently, exactly as with
`themes.css` (§1).

**Why convert rather than ship the PNGs.** Two reasons, the second decisive:

1. The exports are 1×, so at the 32px they are rendered they would be soft on any retina
   display. The conversion is *lossless* — the art is pixel art with alpha strictly 0 or
   255, so the emitted rectangles reproduce it exactly while staying sharp when scaled.
2. Every colour in every motif is a step of **its own theme's ramp**, and those steps are
   the **light**-appearance accent semantics (`primary-450`, `secondary-350`,
   `tertiary-300`, `quaternary-250`, `pentenary-300`). Baked into a raster they would stay
   light-mode coloured in all ten *dark* themes. Emitted as `var(--nid-accent-*)` they
   track both axes for free, which is what §3.5 wants ("each row's motif renders in its own
   theme's colours") and what §13 asks for ("bind the paths to the theme's ramp steps").

Verified, not assumed: each generated SVG was rendered under its own `data-theme` at light
appearance and compared to its source PNG pixel by pixel — **all ten are exact matches**,
0 alpha differences and 0 colour differences across all 1024 pixels.

**The one deviation.** `tiger.tsx` fills its stripes with `var(--nid-quaternary-650)` — a
layer-1 **primitive**, which CLAUDE.md otherwise forbids a component from naming. It is
deliberate and it is the only one:

- No layer-2 token resolves to that step, so there is nothing correct to name.
- The rule exists because a primitive "hard-codes the appearance and inverts wrongly in
  dark mode". Here not inverting is the *requirement*: Tiger's deepest steps are
  deliberately near-black so the motif reads **black-on-ochre** (§3.3). A semantic token
  would turn the stripes pale in dark mode and stop it looking like a tiger.
- Confirmed by rendering Tiger in both appearances: the stripes hold while the ochre
  correctly brightens from `secondary-350` to `secondary-250`.

`generate-motifs.py` prints any colour it has to fall back to a primitive for, so a future
re-export that introduces a second such case cannot pass unnoticed.

**Trap.** The token linter greps for literal hex anywhere outside `themes.css`, **including
in comments** — documenting Tiger's value as a hex string fails `npm run lint`. Name the
step, not the hex.

---

## 15. `verify:tokens` waited for network idle, which the Typekit link never allows

`scripts/verify-tokens.mjs` navigated to `/en/swatch` twice with
`waitUntil: "networkidle"`. That never fires: the Typekit stylesheet keeps the network
from going quiet, so the run died on a 30s navigation timeout **before a single assertion
executed** — the suite was not failing, it was never running. This is the same trap §11
records for app screenshots, reached from a different direction.

Network silence was never the right precondition. Every assertion reads a computed value
(custom properties, `font-size` / `font-weight` / `letter-spacing`, colours) or a
`getBoundingClientRect()` — all of which come from CSS. **None needs the font file to
arrive.**

Both navigations now go through one `gotoSwatch(page)` helper: `domcontentloaded`, then a
`waitForFunction` on the real precondition — `--nid-grid-columns` resolved, `[data-nid-shell]`
present, and at least one `[data-nid-token]` chip rendered. Deterministic, independent of
the network, and *stricter* than waiting for silence: an unstyled page now fails loudly
instead of being silently measured as zeroes.

Measured against the same page: `domcontentloaded` 1.6s, `load` 3.0s, network idle timed
out at 15s — and all three observed the identical state (540 chips, 20 panels,
`--nid-grid-columns: 4`, h1 60px), which is what proves the wait was the only problem.

`npm run verify:tokens` now completes in **~7s with PASS 609**.

**Trap for whoever edits this file next:** don't assert `"networkidle" not in source` after
patching — the explanatory comment names the string it removed, and the check trips on its
own prose. Assert on the executable form, or word the comment around it.

---

## 16. GitHub Pages: `basePath` does not reach `public/` assets

The Pages deploy is back (it was reverted in b97b89f while the repo was private —
Pages is public-repos-only on the Free plan). Four pieces:
`.github/workflows/deploy-pages.yml`, the `GITHUB_PAGES` branch in `next.config.ts`,
`npm run build:pages`, and `public/index.html`.

`output: "export"` applies **only** under `GITHUB_PAGES=true`. `npm run build` stays a
server build, which `verify-{tokens,fonts,screenshot}.mjs` all need — they spawn
`next start`. Confirmed both ways after this change: the server build still emits
`ƒ Proxy (Middleware)`, still serves `/` → `/en`, still routes images through
`/_next/image`, and writes no `out/`.

**Two things the export needs that the server build does not.** Neither existed when the
Pages setup was first written — `/home` and its photography came later, so both are new:

1. **`images: { unoptimized: true }`.** next/image's default loader optimises per request
   and has no server to do it in a static export; the build fails outright without this.
   `TileImage` — every home photo — goes through next/image, so it is load-bearing.

2. **`NEXT_PUBLIC_BASE_PATH`.** This is the subtle one. `basePath` prefixes `_next/*`
   assets and `<Link>` hrefs, but a raw `src` pointing into `public/` is passed through
   **untouched**. The first export produced `src="/home/faculty-6.jpg"` while the
   stylesheet was correctly `/x-website/_next/...` — so under the project-page subpath
   every one of the 20 photos would have 404'd, on a build that exits 0 and looks fine
   locally at `/`. Fixed in `img()` in `src/lib/home-content.ts`, the single place every
   home asset path is built; the workflow passes the same
   `steps.setup_pages.outputs.base_path` to both variables.

**Verified by simulating Pages, not by reading the output.** A tiny static server serves
`out/` under `/x-website/`, then Playwright loads `/x-website/en/home/` and records
failed requests: **20 images, 0 broken**, and `/x-website/` meta-refreshes to
`/x-website/en/`. The only 404s are Next prefetching `<Link>` targets for pages that do
not exist yet (`/en/study/bdes/` etc., Stage 2+) — those 404 in server mode too.

**Still a manual step:** Settings → Pages → Source → **GitHub Actions**. `configure-pages`
fails without it even on a public repo.

**Two things the first CI run exposed (2026-08-30).**

1. **The repo was renamed again** — `NID-web/NID-website` → **`NID-web/x-website`**. The
   GitHub API 301s the old path, so `git push` and the browser still work and the rename is
   easy to miss. It matters because the project-page subpath moves with the name: the
   `build:pages` default is now `/x-website`. CI itself was never at risk — the workflow
   passes `steps.setup_pages.outputs.base_path`, read from the repo's live Pages config —
   but the local default and every doc reference were stale. Verify with
   `curl -sL https://api.github.com/repos/<owner>/<name>` and read `full_name`, not the
   redirect.

2. **`configure-pages` cannot succeed until a Pages site exists.** The run failed with
   "Get Pages site failed … Not Found", which reads like a visibility problem but was not:
   the API reports `private: false, visibility: public, has_pages: false`. The site simply
   had never been created. The step now passes `enablement: true`, which creates it (needs
   the `pages: write` permission the workflow already grants). Enabling it by hand under
   Settings → Pages → Source → "GitHub Actions" is the fallback if an org policy blocks the
   API call.

Re-verified end to end at the new subpath: 20 images, 0 broken, `/x-website/` redirects to
`/x-website/en/`.


---

## 17. The Home position statement is 50px, against NID-CONTEXT.md §14's instruction

`NID-CONTEXT.md` line 1043 flags the desktop Home hero as "hardcoded at 50px" while
`Type/Heading 1` says 60, and concludes: *"In code, bind all four — use Heading/1
throughout."* The tile did exactly that. The design owner has since called it the other
way: the statement is 50px.

That instruction was not arbitrary, and ignoring it naively reintroduces the problem it was
written to prevent. Only the **desktop** board carries 50; the three responsive boards are
bound to the token (52 / 40 / 32). Taking 50 at desktop and leaving the rest on Heading/1
makes the type *grow* as the viewport shrinks — 50px at 1280, 52px at 1279.

So the statement is now its own text style rather than a local `font-size` override on
`text-h1` (which would have opted the element out of the responsive scale entirely — see
CLAUDE.md § Type):

| | desktop | laptop | tablet | mobile |
|---|---|---|---|---|
| `text-statement` | **55 / 55** *(§25)* | **50 / 50** | 40 / 44 | 32 / 36 |
| `text-h1` | 60 / 60 | 52 / 54 | 40 / 44 | 32 / 36 |

Laptop holds at 50 instead of dropping to Heading/1's 52 — that is the one invented value,
and it exists solely so the ramp stays monotonic. Below 1024 the two scales are identical,
so the statement rejoins Heading/1 exactly where the boards already agreed.

**Desktop has since moved to 55** — this table originally read 50 / 50 across the top two
steps. §25 has the reason and the measurements; the short version is that 6 × 55 = 330 is
the 4-column square exactly, and that the monotonicity argument above was superseded by
§24, which retired absolute type size as the invariant in favour of type-to-tile ratio.

Two things deliberately did **not** change. Tracking stays `-0.03em`, which is what the
export's `-1.5px` at 50px works out to. Weight stays **Heavy (700)** even though the export
names the layer `Futura_PT:Demi` — NID-CONTEXT.md §6 note 3 already records that the
reference page mislabels Heading/1 as Demi when the style carries Heavy, and this is the
same mislabel, not a second data point.

`--nid-type-home-statement-*` lives in `src/app/globals.css`, **not** `themes.css`, which
`design/generate.py` rewrites. It is the only type style outside the generated scale; if it
ever becomes a real Figma style, move it into the generator and delete the block.

Verified across all four breakpoints on `/en/home` (computed `font-size`/`line-height`:
50/50 · 50/50 · 40/44 · 32/36) with `PASS 609`.

---

## 18. Home row 1 was 3px taller than every other row, and the cause was 4px of padding

The home grid's rows are auto-height. Every tile is `tablet:aspect-square` in a 330px
column, so each row lands on exactly 330 — *unless* one tile in it is taller, in which case
that tile silently sets the row. Two rows were off:

- **Row 1 → 333px.** `LinkListTile` ("Study at NID") is `square={false} stretch`, so it has
  no 1:1 box to be constrained by; its content height is its height. Content is
  `h3` 35 + `mt-5` 20 + `ul` 258 = **313**, which leaves **17px** of headroom inside a 330
  cell. The `pt-5` (20px) added for top padding spent 20 of those 17, so the row grew to
  333 and the hero image beside it grew with it. Proven by zeroing `padding-top` in the
  browser: the row snapped back to 330. The tile now carries `justify-center` and no
  padding — the design's own treatment — which splits the 17px as 8.5 above and below.
- **Row 6 → 343px.** `SpineTile`'s nav is 7 links × 49px. Nothing to fix — the row is that
  tall because the content is. Hiding the tile drops the row to 198.

The trap is that `stretch` reads like "follow the row" but is `h-full`, which resolves
against a content-sized row — so a stretch tile is a *driver*, not a follower, the moment
its content exceeds its neighbours. Padding on it is therefore not free: it is spent out of
a 17px budget shared with the whole row. Centring has no such budget, which is why the
design uses it and why a fifth link or a wrapped heading is now survivable.

Laptop is a separate matter that centring only softens: at 3 columns the square is 309px
while the content is 313 before any padding at all, so the tile still sets that row — but
at 312 rather than the 328 it reached with `pt-5`. Closing the last 3px needs the content
to shrink, not the spacing.

Measured after the change (`section` height, then the gap above the heading and below the
list): 1440 → 330, 8.5 / 8.5 · 1024 → 312, 0 / 0 · 768 → 350, 20 / 20 · 390 → 308, 0 / 0.

**Superseded in part by §20**, which is the same mechanism taken to its conclusion: "Study
at NID" is no longer `square={false} stretch` but a plain square like every other tile, and
`tablet:aspect-square` is now `aspect-square`. The reasoning above — that a `stretch` tile
is a driver rather than a follower, and that padding on one is spent out of the row's
headroom — is exactly why. It keeps `justify-center` and no padding for the same reason.


---

## 19. The page shell was capped at every breakpoint, not just at 1440

The shell is meant to be **fluid up to 1440 and capped there**: below 1440 the content
fills the viewport minus the page margin, at and above 1440 it stops growing and centres.
It wasn't. `generate.py` emitted

```css
--nid-grid-shell-width: calc(var(--nid-grid-content-width) + 2 * var(--nid-grid-page-margin));
```

once, in `:root` — which *looks* like a single declaration but isn't. `calc()` in a custom
property is re-evaluated wherever it is used, against whatever the referenced properties
resolve to there, and `--nid-grid-content-width` is re-declared in every media query
(1392 / 976 / 720 / 358). So the one declaration silently became four different caps:
1440 / 1024 / 768 / 390 — the *artboard width of each range*.

The effect was dead space at every off-artboard width. At a 1200px window the content
froze at 1024 and centred with 88px of unused margin on each side; at 900 it froze at 768;
on a 430px phone at 390, with 20px wasted on a screen that has none to spare.

Two things had to be true for this to survive as long as it did:

1. **The token read like a derivation, not a cap.** "Content width plus both page margins
   = the reference artboard width" is a true sentence about the *reference* viewport and a
   false one everywhere else. `--nid-grid-content-width` is an artboard reference value
   (it is what `max-w-content` maps to); the shell's cap is a single number. Deriving one
   from the other tied the cap to a value that legitimately changes per breakpoint.
2. **Every test viewport sat exactly on a cap.** `verify-tokens.mjs` measured the shell at
   1440 / 1024 / 768 / 390 — the four artboard widths, which are precisely the four widths
   at which a per-breakpoint cap and a single 1440 cap are indistinguishable. A four-line
   table of four passing assertions, none of which could ever fail.

**The fix.** `generate.py` now emits `--nid-grid-shell-width: 1440px` (from
`GRID["referenceWidth"][0]`, not hand-typed) once in `:root`, and no media query overrides
it. `--nid-grid-content-width` stays per breakpoint, with its comment reworded so it is not
read as a cap again. The regenerated `themes.css` differs by exactly that one declaration.

**The guard.** `verify-tokens.mjs` now also measures four deliberately *off*-artboard
viewports — 1600 (shell 1440, 4 columns), 1200 (shell 1200, 3 columns), 900 (shell 900,
2 columns) and 430 (shell 430, 1 column) — asserting columns, page margin, measured shell
width and absence of horizontal overflow. Content width and the type scale stay bound to
the four artboard widths, since off an artboard the rendered content box is *supposed* to
differ from the token. `PASS 593` → `PASS 609`.

Reverting the fix fails all four new shell assertions and none of the old ones, which is
the point.

## 20. Home's rows are square at every breakpoint, and row 1 reshapes at 1024

Two behaviours in the Home grid were built as explicitly-flagged "Figma-verify
assumptions". The four boards (file `EAoxODvNK8dNGAeovGI5D7`: 1440 `28:2175`, 1024
`4990:368207`, 768 `4997:381054`, 390 `4999:393901`) have now been checked and **both
assumptions were wrong**:

- *"Tiles relax to natural height on phones so a full-bleed square text tile doesn't
  swallow the fold."* The 390 board draws every tile as a 358 square. `Tile` and
  `PatternTile` now carry `aspect-square`, not `tablet:aspect-square`.
- *"Pattern tiles drop below laptop."* All four boards show them. The `hidden laptop:block`
  on their `GridItem` is gone.

The rule the boards actually describe is simple: **within a viewport, every tile row is the
column width** — every tile is a square, and row height follows the column rather than any
fixed pixel value. The exceptions are exactly three: the position statement below 1024, the
hero, and the footer tiles.

| | ≥ 1024 | < 1024 |
|---|---|---|
| Position statement | 1-column square | **full width, natural height** |
| Hero | 2 columns, `h-full` — a row *follower* | 1-column square *(superseded — see §22)* |
| "Study at NID" | square, like every other tile | square |
| Pattern tiles | shown | shown |
| Footer tiles | natural height | natural height |

Row 1 is therefore not a clamp but a **reshape**, and it is the one shape `GridItem`'s
`SPAN` table could not express: the statement goes full → 1 and the hero 1 → 2, both in the
same direction at the same breakpoint. Two named spans now carry it —
`"full-then-1"` (`col-span-full laptop:col-span-1`) and `"1-then-2"`
(`col-span-1 laptop:col-span-2`) — keeping `GridItem` the only place a column class is
written. Both are a base utility plus one breakpoint-scoped override, the shape `SPAN[2]`
already used, so the winner is decided by media range and never by the emit order of two
unscoped utilities from the same family (the same trap `Tile`'s `rounded-pill` /
`rounded-none` comment describes). Source order is untouched — statement, hero, study, … —
so at 768 the statement takes its own full-width row and the hero lands beside "Study at
NID" exactly as the board draws it, by dropping columns rather than reordering.

`Tile`'s `square` and `stretch` props became media *ranges* rather than booleans
(`"laptop"`, `"max-laptop"`) so the hero can be a square below 1024 and a follower above
it. That also let `min-h-56` go: one of the two always gives the hero a height, so the
floor was never load-bearing.

**§18 is the mechanism behind all of this** and still holds: a square page-surface tile's
box is a *floor*, not a cap — `overflow: visible` makes the automatic minimum size
content-based, so content taller than the square grows the tile and with it the row, while
a `stretch` tile in that row follows. Making "Study at NID" a plain square rather than
`square={false} stretch` is the same fact applied: at 1440 its content is 313 in a 330
column and it now simply *is* 330.

**Measured after the change** (production build, every direct child of `[data-nid-grid]`
grouped into rows by `offsetTop`, 11 viewports from 1600 to 390): shell = `min(viewport,
1440)` everywhere, no horizontal overflow at any width, and every tile row equal to the
column width — 330 at 1440, 394.33 at 1279, 368 at 1200, 309.34 at 1024, 477.5 at 1023,
416 at 900, 350 at 768, 735 at 767, 398 at 430, 358 at 390. Nothing is clipped at any
width, including the phone widths that used to be natural-height.

**One tile still exceeds its square, and it needs a design decision.** Between 1024 and
1086 the position statement wraps to 6 lines of `text-statement`, which is **55/55** in
`globals.css`. 6 × 55 = **330** in a 309.33 column at 1024 — +20.7px — so the statement
drives row 1 to 330 and the hero follows it there. (The 1024 board itself draws row 1 at
324 rather than 309, so it is inconsistent in the same direction.) It is self-correcting
above 1086, where the column reaches 330. The fix is not a layout one: §17 documents
`text-statement` as **50/50** at desktop and laptop, and at 50/50 the paragraph measures
300 and the tile snaps to 309.33 exactly — verified by overriding the two custom properties
in the browser. Either the token drifted from §17 or §17 is stale; resolving that is the
design owner's call, not a layout change, so it is left as measured.

## 21. The 1-column layout is for phones — it was claiming everything below 768

The mobile range is the phone layout: one column, 16px margins, the compact 50px header,
the "NID" mark instead of the full bilingual wordmark. It began at **767px and down**,
which is not a phone. A 700px-wide browser window got a single 700px-wide column of
700px-square tiles.

This only became visible once §19 made the shell fluid. Before that, a 767px viewport was
*also* capped at 390 — the same bug, hidden behind 188px of dead space on each side. Fixing
the cap surfaced what the 1-column range actually looked like at full width.

**A range's start is not its artboard width.** That distinction already existed and was
simply not being used: `desktop` has always begun at 1280 while being drawn at 1440. So
`GRID["minViewport"]` moves and `GRID["referenceWidth"]` does not — the tablet range now
begins at **668** and is still drawn at 768, and `design/verify.py`'s grid arithmetic
(which asserts against `referenceWidth`) is untouched. The media-query boundaries in
`generate.py` are now *derived* from `minViewport` rather than hand-typed, because a
literal `767` in the generator and a `--breakpoint-tablet: 768px` in `globals.css` are
exactly the two halves that drift apart.

The Tailwind `tablet:` variant moves with it, deliberately. It carries more than the grid —
the header's 50/60px height and mark swap, `MainMenu`'s column count — and all of it means
"is this a phone?", not "is this narrower than the 768 artboard".

**668 is set by content, not by devices.** The device argument only gives a floor: the
widest phone in portrait is ~430, so anything above ~468 would do. The ceiling comes from
what a 2-column tile can hold, since the narrowest one is `(viewport − 68) / 2`:

| | needs a column of | so the boundary can't go below |
|---|---|---|
| Every text tile's own content (Study at NID, Academic, News, Young Designers) | ~300px | **668** |
| Faculty portrait row (6 × 76px, −40px overlap) | 256px | 580 |
| …the same row *while hovered* (overlap −26px) | 326px | 720 |
| KMC book shelf (11 spines × 28px pitch) | ~~330px~~ **308px** | ~~728~~ **684** |

**Correction:** the shelf row above read 330px for several revisions of this note. 11 × 28 =
**308**, and 330 was a misread of `scrollWidth`, which reports the *container* width
whenever the content fits. The boundary it implies is 684, not 728 — so 668 was 16px short
of clearing the shelf, not 60. It is moot either way now: §27 scales the pitch with the
tile, so the shelf fits at every width.

At 468 — the first value considered — the column is 200px: the shelf loses 4 of its 11
spines and the faculty row pushes 4px of horizontal page scroll (63px hovered). At 600 the
column is 266px, which clears the faculty row but is still short for four text tiles, whose
content then grows the row past the square (§20's sanctioned behaviour, but it means those
rows are no longer square).

**668 gives a 300px column, which is the first width at which every row is square again.**
That is the number that matters: below it the layout still *works* — nothing clips, nothing
overflows — but it stops being the uniform grid §20 describes. It also caps the 1-column
phone layout at a 635px tile instead of 735.

**Measured after the change** (production build, 16 viewports from 1600 to 390): shell =
`min(viewport, 1440)` everywhere, **no horizontal page overflow at any width, hover states
included**, header 60px down to 668 and 50px below it, and **every tile row equal to the
column at every width measured** — 1600 / 1440 / 1279 / 1200 / 1024 / 1023 / 900 / 768 /
700 / 669 / 668 and every 1-column width.

Two things are knowingly left, both much smaller at 668 than they were at 600:

1. **The KMC shelf crops by 8px at 668** *(fixed in §27)*. It wants a 308px column and gets 300, so it loses
   the tail of its eleventh spine — under a third of one 28px pitch, against the 2 whole
   spines it lost at 600. Clear by 700. It is the one tile that clips rather than grows:
   its shelf is `overflow-hidden` by design and the spines truncate the way the Figma frame
   draws them. It also takes a 2px nick at 1024, where the column is 309.33 — that predates
   all of this and is what a 330px shelf in a 309px column has always done.
2. **The faculty row's hover spread exceeds its tile at 1024 and in the 2-column band**
   *(fixed in §27)*.
   Dropping the overlap from 40px to 26px widens the row from 256 to 326, and only the
   desktop column (330) is wide enough. Measured spill into the gutter: 8px each side at
   1024 (which predates this change), 13px at 668, none at 768 or 1440. It never reaches
   the page edge at any width, so there is no horizontal scroll — at 600 there was 6px of
   it, and 668 removes that. Fixing the spill itself means dropping the hover spread or
   making the row's geometry relative to its container — a design decision, so it is
   recorded rather than guessed at.

## 22. The hero spans two tiles at every column count, and the 2-column one is a banner

§20 gave the hero two shapes: a 1-column square below 1024, two columns above. The design
owner has called it the other way — the hero should occupy **two tiles at every column
count**, so at 2 columns it runs the full row rather than sitting beside "Study at NID".

This is a deliberate departure from both design sources, recorded as such:

- The **768 board** (`4997:381054`) draws `Card` at `x=24 width=350 height=350` — one
  column, square, beside `Study at NID` at `x=394`.
- The **Figma Make export** (`design/reference/`, since removed — see the last section) only covers the 4-column frame, where
  `Card` is `col-[2/span_2] row-1 self-stretch` — which is what §20 already implemented and
  is unchanged here.

So the hero is back to a plain `SPAN[2]` (`col-span-full tablet:col-span-2`), which is
exactly right at all four counts: the whole row at 1 and 2 columns, two of three or four
above. `GridItem`'s `"1-then-2"` entry is gone with it; only `"full-then-1"` (the position
statement) still needs a named span.

**The height is the interesting part.** At 3 and 4 columns the hero is a row *follower* —
square neighbours in row 1 set the height. At 2 columns nothing shares its row, so nothing
can set it, and §18's trap applies in full: `h-full` against a content-sized row collapses.
It has to state its own height, and "one grid row" is the only height that keeps the
rhythm — the hero should read as the two tiles it replaces.

That height cannot be written as a constant `aspect-ratio`. The hero's width is two columns
**plus one gutter**, so one column is `(width − gutter) / 2` — a ratio that moves with the
gutter. `aspect-[2/1]` would be half a gutter (10px) too tall at every 2-column width, which
is precisely the kind of near-miss §20 spent its time eliminating. `100vw` is no good
either: it counts the scrollbar, so it overshoots wherever one is present.

What works is a container query. The hero's `GridItem` carries `@container`, and the tile
carries `h-grid-row-2` (`src/app/globals.css`):

```css
height: calc((100cqw - var(--nid-grid-column-gap)) / 2);
```

`100cqw` is the GridItem's own content width — scrollbar-safe, exact, and derived entirely
from the grid tokens, so it is not a fixed pixel row height. `@container` is a containment
context rather than a column class, which is why it is passed as a `className` and stays out
of `GridItem`'s `SPAN` table.

**Measured** (production build): hero width × height, against the column —

| viewport | columns | column | hero | one row tall? |
|---|---|---|---|---|
| 1440 | 4 | 330 | 684 × 330 | yes (follower) |
| 1279 | 3 | 394.3 | 812.7 × 394.3 | yes (follower) |
| 1023 | 2 | 477.5 | 975 × 477.5 | **yes (banner)** |
| 768 | 2 | 350 | 720 × 350 | **yes (banner)** |
| 668 | 2 | 300 | 620 × 300 | **yes (banner)** |
| 390 | 1 | 358 | 358 × 358 | yes (square) |

All nine tile rows still equal the column at every 2-column width, and there is no
horizontal overflow at any width.

**The knock-on, which is unavoidable.** The hero now costs 2 cells instead of 1 at two
columns, so the grid holds **25 cells rather than 24** there — an odd number. Every pair
below row 2 shifts by one against what the 768 board draws (`study` now sits with
`academic` rather than with the hero, and so on down), and `footer-4` ends up alone on row
13. That is arithmetic, not a bug: an odd cell count in a 2-column grid has to leave one
slot empty somewhere, and source order is never reordered to hide it (CLAUDE.md § Layout).

## 23. The collaborations block takes the full row below 1024

Six partner marks in a 4-column grid do not fit a 2-column layout's single column: at 768
that is a 350px block holding four marks across at ~78px each, then two more on a second
row. It reads as cramped, which is what it is.

The block now runs the **full row below 1024** and stays one column at 3 and 4 columns. No
new API was needed — that is exactly the reshape `GridItem`'s `"full-then-1"` already
describes for the position statement (§20), so the same named span carries it.

**Widening it alone made it worse, not better.** At 720px with the internal grid still at
4 columns, the six marks became four across at 168px and then two stranded beside a
half-empty row — a bigger hole than the one being fixed. So the internal grid follows the
block: `grid-cols-4 tablet:grid-cols-6 laptop:grid-cols-4`. Six across on the two-column
layout's full row is one clean line; the phone keeps four, because its full row is only
358–635px wide and six marks there would be ~46px each. Base plus two breakpoint-scoped
overrides, so the winner is the media range rather than the emit order of three
`grid-cols-*` utilities from the same family. The heading moved from `col-span-4` to
`col-span-full` so it stops naming a count it no longer always has.

Measured — the block, and its internal column count:

| viewport | columns | collaborations block | internal grid |
|---|---|---|---|
| 1440 | 4 | 330 × 322, one column | 4 across |
| 1024 | 3 | 309 × 184, one column | 4 across |
| 768 | 2 | **720 × 73, full row** | **6 across** |
| 668 | 2 | **620 × 73, full row** | **6 across** |
| 390 | 1 | 358 × 128, full row | 4 across |

### The logos need their own light plate in dark appearance

The partner marks are full-colour artwork with dark ink baked in, so on a dark surface they
all but vanish. The block's own comment already rules out the obvious fix — the export's
frame carries `bg-white`, but painting that for real turns the whole block into a white
slab the moment the surface is dark.

So the plate goes on each **logo cell** instead: `dark:bg-surface-inverse`. That is a
layer-2 semantic token, not a primitive or a hex — `surface/inverse` is the one sanctioned
dark pairing (the same token `Tile`'s `inverse` surface uses), and in dark appearance it
resolves to a theme-tinted near-white: `#FAFFFF` in Peacock, `#FFFDFA` in Tanjore. In light
appearance the cell stays transparent and nothing changes. The `dark` variant it hangs off
already existed at the top of `globals.css`.

The `rounded-lg` and `p-2` are applied in **both** appearances even though only dark paints
the plate. Dark-only padding would resize every logo the instant the appearance toggled,
and that swap is meant to be instant and judder-free (CLAUDE.md § Icons and motion) —
costing light a few px of logo is the cheaper half. Verified: the cell measures 107 × 61 in
both appearances at 768, identical, with `background-color` `rgb(250, 255, 255)` in
Peacock/dark and `rgba(0, 0, 0, 0)` in Peacock/light.

**It also closes §22's loose end.** The full-row hero made the 2-column grid 25 cells — an
odd number, which left `footer-4` alone on row 13. Widening this block to 2 cells brings it
to **26 cells in exactly 13 rows**, with nothing stranded. That is luck rather than design,
but it is worth knowing that the two changes cancel: reverting either one on its own puts
the half-empty row back.

## 24. Tile text is scaled to the column, because the column is fluid and the type isn't

§19 made the shell fluid. The type scale did not follow, and the two came apart: **the
column runs 290 → 635px across the breakpoints (119%), the type steps 27 → 22 (23%), and
the label styles never move at all** — 16px links and 12px meta at every width, by design
("labels never scale"). So at the top of every range a tile outgrew its own text. Measured
as `h3 ÷ column`, indexed against each range's own artboard:

| viewport | cols | column | h3 | before | after |
|---|---|---|---|---|---|
| 1440 | 4 | 330 | 27 | 0% | **0%** |
| 1280 | 4 | 290 | 27 | +14% | +14% |
| 1279 | 3 | 394.3 | 26 → 33.1 | −22% | **0%** |
| 1024 | 3 | 309.3 | 26 | 0% | **0%** |
| 1023 | 2 | 477.5 | 24 → 32.7 | −27% | **0%** |
| 900 | 2 | 416 | 24 → 28.5 | −16% | **0%** |
| 768 | 2 | 350 | 24 | 0% | **0%** |
| 667 | 1 | 635 | 22 → 30.8 | −44% | −21% |
| 500 | 1 | 468 | 22 → 28.8 | −24% | **0%** |
| 390 | 1 | 358 | 22 | 0% | **0%** |

**Viewport-fluid type could not have fixed this.** At every breakpoint the column jumps
*down* as the count goes up (394 → 290 at 1280) while the type jumps *up*. The ratio lands
at +14% on one side and −22% on the other; nothing keyed to the viewport tracks that. Only
the column does.

So `--nid-type-scale` is the ratio of the **rendered column track** to the track that
breakpoint's board was drawn at:

```css
--nid-type-scale: clamp(1, tan(atan2(<rendered track>, var(--nid-grid-track-ref))), 1.4);
```

Four things about that line are deliberate:

- **The track, not one column.** `--nid-grid-track-ref` is the content width minus the
  gutters — 1320 / 928 / 700 / 358, whole integers at all four breakpoints, where a single
  column is 309.3333…. The ratio therefore lands on *exactly* 1 at each artboard rather
  than 1.000001, and 1440 / 1024 / 768 / 390 render bit-identically. All 621 assertions
  pass untouched.
- **`tan(atan2(a, b))`** is the CSS Values 4 idiom for dividing one length by another;
  `calc()` cannot do length ÷ length. Not a hack, but worth recognising on sight.
- **The floor is 1, not 0.9.** The scale only ever *grows* type. A tile narrower than its
  artboard (1280, and 668–700) keeps the designed size rather than shrinking below it —
  which is why +14% at 1280 is still there, deliberately.
- **The cap is 1.4**, which the 1-column range needs: at 667 the column is 1.77× its
  artboard, so that one lands at −21% rather than 0%.

### Three traps, all silent

**Tracking must NOT be multiplied.** The first cut of the `@theme inline` rewrite wrapped
every `--text-*` value it found, letter-spacing included. Every tracking value in this
system is in `em` (CLAUDE.md § Type), so it already scales with the font-size it sits on —
multiplying it again applied the scale twice and tightened display type by up to 36% at the
wide end. Only `--text-*` and `--text-*--line-height` carry the multiplier; tracking holds
at a measured −0.0300em at every scale.


**Custom properties resolve their `var()`s where they are DECLARED.** The first attempt put
the multiplier in themes.css — `--nid-type-heading-3-size: calc(26px * var(--nid-type-scale, 1))`.
It changed nothing at all: that token is declared on `:root`, where the scale is the `1`
fallback, and the tile inherits an already-computed `26px`. The multiplication has to
happen at the point of *use*, so it lives in the generated `.nid-*` classes and in
globals.css's `@theme inline` mapping — which Tailwind inlines into the utility itself, so
the calc lands on the element and picks up the inherited scale.

**Container query units are relative to the writing mode of the element resolving them.**
With the scale left unregistered, its `100cqi` was resolved per-element at substitution
time — and KMC's book spines are `writing-mode: vertical-rl`. There `cqi` flipped to the
block axis, found no block-size container, and fell back to the viewport: the spine labels
computed to **15.09px instead of 12** (880/700 — the viewport *height* standing in for the
grid width). Registering the property with `@property … syntax: "<number>"` fixes it by
computing the value at the declaring element (the tile, horizontal) and inheriting a plain
number. `--nid-grid-column-width` is registered for the same reason.

A third, related one: **an element is never its own container.** `--nid-grid-column-width`
declared on `[data-nid-grid]` found no container ancestor and fell back to the viewport —
374px instead of 350 at 768, which showed up as the hero's row being the one row out of
nine that did not equal the column. It is declared on `[data-nid-grid] > *` instead.

### What it did not fix

- **1280 is still +14%**, by choice: there the column (290) is *smaller* than its artboard
  (330), so the text is relatively large rather than small. Shrinking text below its
  designed size to correct that is the wrong trade. It is also why `kmc` clips (−18px) and
  `news` grows 5px past its square at exactly 1280 — the 330px-wide book shelf does not fit
  a 290px column. Pre-existing, and unrelated to the scale, which is clamped to 1 there.
- **The position statement overflowed row 1 across the whole 3-column range**, not just at
  1024 — §20's unresolved 55-vs-50 question propagating, exactly as it should: the scale
  makes every width behave like its artboard, and that artboard was wrong. **Resolved in
  §25**, which gives laptop its own 50 and leaves desktop at 55.

## 25. The position statement is 55 at desktop and 50 at laptop, because the two squares differ

Raised three times before it was settled — in the first overflow report, again in §20, and
again in §24 once the type scale spread it across a whole range. Each time it looked like
drift from §17's documented 50, and each time "just set it back to 50" was the obvious fix.
It was the wrong diagnosis.

**55 is deliberate.** At 1440 the statement sits in a 330px column and wraps to **6 lines**.
6 × 55 = **330**. It fills its square exactly. That is tuned, not drifted.

**And it is wrong one step down.** The same 330 overflows the 3-column square (309.33 at
1024). The statement is a page-surface tile, so it grows rather than clips, drives row 1,
and the hero — a row follower — is dragged up with it. §24 then made the misfit
proportional across the whole laptop range: at 1279 the scale is 1.2748, so 55 → 70.1px and
6 × 70.1 = 420.7 in a 394.3 column.

So one token was serving two squares that want different numbers. It now has a laptop step
of its own (`globals.css`, `@media (max-width: 1279px)`), and the ramp reads **55 / 50 / 40
/ 32**.

The objection §17 raised against splitting these — that the ramp must stay monotonic in
absolute px, or type *grows* as the viewport shrinks — no longer applies, because §24
already retired that invariant. Under a column-relative scale the rendered size jumps up at
every breakpoint where the column widens: `h3` goes 27 → 33.1 across 1280 → 1279, and the
tile widens with it. The invariant now is type-to-tile ratio, and by that measure the split
is an improvement: the statement steps 55 → 63.7 across that boundary, where a flat 50
would have stepped 50 → 63.7, a *larger* jump.

**Measured after the change** — row 1 against the column:

| viewport | cols | column | scale | statement | lines | row 1 | |
|---|---|---|---|---|---|---|---|
| 1600 | 4 | 330 | 1.000 | 55px | 6 | 330 | exact fill |
| 1440 | 4 | 330 | 1.000 | 55px | 6 | 330 | exact fill |
| 1279 | 3 | 394.3 | 1.275 | 63.7px | 6 | 394.3 | square ✔ |
| 1200 | 3 | 368 | 1.190 | 59.5px | 6 | 368 | square ✔ |
| 1100 | 3 | 334.7 | 1.082 | 54.1px | 6 | 334.7 | square ✔ |
| 1024 | 3 | 309.3 | 1.000 | 50px | 6 | 309.3 | square ✔ |

The laptop range goes from 5 of 6 rows square to **6 of 6**, and desktop is untouched.

**What it did not fix: the whole of 1280–1439** — not "1280–~1300", which is what this note
first claimed on the strength of two measured points. The 4-column column is 290–325 there
against a 330 artboard, and §24's scale floor of 1 meant text never shrank to follow it, so
6 × 55 = 330 overflowed every one of those columns. A flat 50 would not have helped either
(6 × 50 = 300 > 290). **Resolved in §26** by dropping that floor. The `kmc` shelf still
clips in that range for an unrelated and purely geometric reason — its 330px book shelf
does not fit a 290px column at any type size.

## 26. The type scale had a floor of 1, and that stranded 1280–1439

§24 clamped `--nid-type-scale` to `clamp(1, …, 1.4)`. The floor of 1 was chosen on the
instinct that text should never be smaller than its designed size. That was wrong, and a
sweep of 69 viewports from 380 to 1600 showed exactly how wrong: **every content row equals
its column at every width except 1280–1439**, where row 1 stayed 330 while the grid around
it shrank to 290–325.

The cause is the floor, not the statement. A scale that only grows leaves every width whose
column is *narrower* than its artboard carrying artboard-sized text — the same mismatch §24
exists to remove, mirrored. The position statement made it visible because it is exactly 6
lines of 55px = 330 and therefore needs a 330 column, which in the 4-column range exists
only at 1440 and above.

The floor is now **0.85**. Both bounds are deliberately outside what the grid can produce:
the column reaches 1.77× its artboard at the top of the 1-column range and never falls below
0.857× (668, a 300px column drawn at 350). So the scale tracks the column in both
directions and the clamp never actually engages — it is a guard rail, not a shaper.

Nothing at the artboards changes: the ratio is exactly 1 at 1440 / 1024 / 768 / 390, so
`clamp(0.85, 1, 1.4)` is 1 and `verify:tokens` still passes 621.

| | before | after |
|---|---|---|
| widths swept (380–1600) with a non-square content row | **8** | **1** |
| 1280 row 1 (column 290) | 330 | **290** |
| 1440 row 1 (column 330) | 330 | 330 |

**The one width still out is 1280, by 3.5px, and it is not type** — *resolved in §27 by
scaling the thumbnails too*. The News tile's list is
219px at every viewport because it holds three 64px thumbnails — `size-16`, a spacing
utility, which the type scale does not touch. With the overline, the gap and the CTA that
gives the tile a hard floor of ~293.5px, so it clears a 290px column by 3.5 (1.2%), fading
out by about 1292 where the column catches up. Same family as the `kmc` book shelf's fixed
28px spine pitch: a scale for *type* cannot move geometry that is expressed in spacing.
Closing it would mean either shrinking the thumbnails at every width or introducing a
spacing scale alongside the type one — neither justified by 3.5px.

### On "every tile the same height"

Worth stating plainly, because it is easy to read the sweep as saying otherwise. Within any
one viewport, **all nineteen content tiles are the same height** — the column width — and
that is now true at every width swept but 1280. Three things are deliberately *not* that
height, and all three come from the Figma boards rather than from drift:

- **The footer tiles** take their natural height (308 / 176 / 172 / 161 on the 1440 board).
  All four boards draw them that way; they are not square tiles.
- **The position statement below 1024** is a full-width band of natural height (176 on the
  768 board, 180 on 390), not a square.
- **The hero**, which is always two tiles wide, and therefore one row tall rather than one
  tile wide (§22).

## 27. Fixed geometry inside a tile now scales with the tile, like the type does

§24 made type follow the rendered column. Four pieces of *fixed pixel geometry* did not come
with it, and every remaining defect on the page traced back to that one omission:

| tile | dimension | what it caused |
|---|---|---|
| News & Events | three `size-16` thumbnails (64px) | a 293.5px floor, 3.5px over its own column at 1280–1292 |
| Knowledge Management Centre | `w-7` spine pitch (28px × 11 = 308) | shelf cropped up to 18px at 1280–1344 and 8px at 668–680 |
| Faculty Stalwarts | `size-19` portraits (76px) and their −40/−26 overlaps | hovered row spilled into the gutter at 1280, 1024, 700, 668 |

All three now multiply by `--nid-tile-scale`, which is the same value §24 introduced — hence
the rename from `--nid-type-scale`, which had become a misnomer the moment it drove
anything but type.

**The spine pitch is the clearest case that this is a correction rather than a workaround.**
`SpineTile`'s own comment records that 28px is "a 12px text box plus its 8px sides" — the
pitch is *derived from* the type size. That type started scaling in §24; leaving the pitch
flat is what broke the derivation. Scaling it restores the relationship the comment
describes.

**The Faculty hover needed one design change on top.** Scaling alone fixed 1280, 700 and
668, but not 1024, because at 1024 the design does not fit its own artboard: hovered, the
row is 6 × 76 − 5 × 26 = 326px in a 309.33px column. The hover overlap is now **−30px**
rather than the export's −26, which puts the hovered row at 306 and clears every column at
every width. The spread is 50px of travel instead of 70 — still plainly a spread. This is a
deliberate departure from the export, on the design owner's call.

**Measured after the change** (real hover, not simulated):

| viewport | column | News tile | shelf cropped | hovered row | spill |
|---|---|---|---|---|---|
| 1440 | 330 | 330 | 0px | 306 | 0 |
| 1344 | 306 | 306 | 0px | 284 | 0 |
| 1280 | 290 | 290 | 0px | 269 | 0 |
| 1024 | 309.3 | 309.3 | 0px | 306 | 0 |
| 1023 | 477.5 | 477.5 | 0px | 417 | 0 |
| 768 | 350 | 350 | 0px | 306 | 0 |
| 668 | 300 | 300 | 0px | 262 | 0 |
| 390 | 358 | 358 | 0px | 306 | 0 |

And the sweep that has been tracking this since §26, now over **71 viewports from 380 to
1600**: *every content row equals its column at every width, with no horizontal overflow at
any of them.* One 2px vertical nick remains on the KMC shelf at 1024 — that is the spine
labels' designed ellipsis engaging, not a layout fault.

The `sizes` hints on the two scaled images moved with them (64px → 90px, 76px → 105px):
they now name the top of the range each image can reach rather than its artboard value.

## 28. The Campuses arch was a literal 176px, and only the browser's clamp made it an arch

`--radius-arch` was the design's literal **176px**, with a comment defending the choice:
*"Kept at the design's literal value so a wider tile curves by the same amount rather than
by half of whatever it is."* The reasoning was backwards, and the value was never what
reached the screen.

`border-radius` has a rule that decides this: when the radii along one side sum to more than
that side's length, the browser scales **every** radius down by the same factor until they
fit. The arch sets both right-hand corners, so the sum is 176 + 176 = **352px** — larger
than the tile at every artboard (330 / 309.33 / 350). At all three the clamp fires and the
radius lands on exactly half the side: **a true semicircle**. The literal 176 was inert; the
clamp was drawing the shape.

Above 352px the clamp stops engaging, the radius stays at a flat 176, and a straight edge
opens up between the two corners:

| tile | effective radius | as % of tile | straight edge |
|---|---|---|---|
| 330 (1440) | 165 | 50% | 0 |
| 309.3 (1024) | 154.7 | 50% | 0 |
| 350 (768) | 175 | 50% | 0 |
| 416 (900) | 176 | 42.3% | 64px |
| 477.5 (1023) | 176 | 36.9% | 125px |
| 568 (600) | 176 | 31% | 216px |
| **635 (667)** | 176 | **27.7%** | **283px** |

At 667 the tile is 635px tall with 283px of flat edge — it has stopped reading as an arch at
all. Which is the same failure as §27, in a different property: **a fixed pixel value inside
a tile whose size is fluid.**

`--radius-arch` is now **50%**, which is precisely what the three artboards were already
computing, written so it holds at any size. Verified: the computed value reads `50%` at
every width, and the rendered tile at 667 (635 × 635) is a semicircle indistinguishable in
shape from the 1440 one (330 × 330). Nothing changes at 1440, 1024 or 768 — the numbers
there were already 50% — and 390 gains 3px of radius, moving from 49.2% to a true half.

Worth keeping in mind generally: **a percentage radius is scale-free, a px radius is not.**
Where a shape is meant to be a proportion of its box, say so; do not rely on the clamp to
turn a px value into a proportion, because it only does that while the box stays small.

Not scaled with `--nid-tile-scale`, though that would also have worked. The scale keeps a
value at a constant fraction of *its artboard column*, and those fractions differ by
breakpoint (176/330 = 53%, 176/309.33 = 57%, 176/350 = 50%, 176/358 = 49%). A percentage is
the stronger statement: the same shape everywhere, not four shapes each held steady.

## 29. The theme trigger is centred at every width, not only at tablet and up

The header is three frames: the mark, the theme trigger, the Apply/search/menu cluster. The
trigger sits on the header's centre line because the two side frames are `flex-1` and
therefore equal — that is the whole mechanism, and it was only switched on from tablet up
(`tablet:flex-1` on both sides). Below tablet the trigger carried `mr-auto` instead, which
pinned it beside the mark and shoved the right cluster to the far edge.

That was NID-CONTEXT.md §7.3's Mobile variant, which groups mark and trigger into a
"Brand & Utility" cluster. It is now centred at every width on the design owner's call: the
trigger is the same control at every size, and there was no reason for it to sit on a
different line on a phone.

The change is the absence of three utilities rather than the addition of any — `flex-1` on
both side frames unconditionally, and `mr-auto tablet:mr-0` deleted.

**Measured** — the trigger's centre against the header's:

| viewport | header centre | trigger centre | off | side frames |
|---|---|---|---|---|
| 1440 | 720 | 720 | 0 | 655 / 655 |
| 768 | 384 | 384 | 0 | 319 / 319 |
| 600 | 300 | 300 | 0 | 243 / 243 |
| 390 | 195 | 195 | 0 | 138 / 138 |

768 reproduces the Figma measurement in the component's own comment exactly — both side
frames 319, centre 384.

**It stops being exact below 390.** The right cluster has a min-content width of 132px
(Apply pill, two icon buttons, two gaps) and cannot shrink past it, so once the free space
runs out `flex-1` can no longer hold the two sides equal and the trigger drifts left: 9.4px
at 360, 29.4px at 320. No horizontal overflow at either. 390 is the design's mobile artboard
and covers the mainstream phones; 360 (Galaxy S) is the notable width below it. Closing that
would mean absolutely positioning the trigger — which risks it colliding with the clusters
at the very narrow end — or dropping the Apply pill below 390. Neither is worth doing
unsolicited, so it is recorded here.

## 30. The brand strip's clearance was a flat 48px against a rhythm that isn't flat

`BrandStrip` opened and closed the page with `mb-12` / `mt-12` — 48px, the same at every
width. The grid's own vertical rhythm is not the same at every width: `--nid-grid-row-gap`
steps **24 / 24 / 20 / 16**. So the band's clearance drifted away from the page it sits on:

| | row gap | clearance | ratio |
|---|---|---|---|
| 4 col | 24 | 48 | 2.00× |
| 3 col | 24 | 48 | 2.00× |
| 2 col | 20 | 48 | **2.40×** |
| 1 col | 16 | 48 | **3.00×** |

Reported as "the margin below the pattern strip looks a bit more in 1 col and 2 col", which
is exactly what the table says: it is proportionally largest in precisely those two ranges,
and by 20% and 50%.

The fix is not a new number but the number that was already there. At 3 and 4 columns a flat
48 *is* two row-gaps; the value only stopped meaning that where the row gap moved and 48 did
not. So the clearance is now `calc(2 * var(--nid-grid-row-gap))` — **48 / 48 / 40 / 32**,
2.00× at every width, with 3 and 4 columns rendering byte-identically to before.

Applied to the closing strip as well as the opening one. Only the opening gap was reported,
but the two are mirror images of the same band, and leaving the bottom at 48 while the top
became 32 on a phone would have traded one visible imbalance for a worse one.

Worth generalising: **a spacing value that is expressed as a multiple of a token stays
correct when the token moves; the same value written as a literal does not.** `mb-12` was
right when it was written and silently stopped being right at two of the four breakpoints.
The grid gap, page margin and column count all step per breakpoint — anything meant to sit
in that rhythm should be derived from them rather than measured off one artboard.

## 31. The Figma Make export is gone; the pattern generator reads a frozen JSON instead

`design/reference/home-figma-make/` was the Home frame exported from Figma Make — 33k
lines of generated JSX plus 22 photo masters (~30MB on disk) — vendored only because the
Figma MCP was quota-blocked on a Starter seat. That constraint is gone (full seat), so the
export has been removed, along with its `tsconfig` / `eslint` exclusions and the
`.gitignore` block for the masters. `public/home/` already held the same photography,
web-sized, so the site loses nothing. The one untracked asset the masters held that the
build did not use — a sixth faculty portrait — can be re-exported from Figma if it is ever
wanted.

The only code that read the export was `scripts/generate-patterns.py`, which parsed the
three pattern tiles, the alumni pattern and the two scatter fields out of it on every run.
Its parse half was run one last time and the result frozen as
`design/assets/patterns/home-patterns.json` (24KB): each tiled field as one 24×24-cell
unit already merged into rectangles per design hex, each scatter as loose cells at design
size. The script now reads that file and still maps hexes to semantic accent tokens through
`themes.css`, so re-theming is unchanged. Regenerating from the JSON reproduces the previous
`patterns.tsx` byte-for-byte below the header comment.

If a pattern changes in Figma, the path is now: read the tile with the Figma MCP, update the
JSON, `npm run generate:patterns`. Not: edit `patterns.tsx`.

## 31. The overline rule was never the wrong colour — it was held at 45%

The gradient hairline beside every tile overline (ACADEMIC CALENDAR, NEWS & EVENTS, …) now
goes to full strength while its tile is hovered.

**The first attempt got the diagnosis backwards.** Asked to change the gradient's colour on
hover, and unable to open the reference board (Foundations — Colour node `771:43963` returns
*"you don't have edit access to this file"* from both `get_metadata` and `get_screenshot`;
the Figma MCP needs editor rights, not the view access available here), it invented a second
gradient: `accent/strong` in place of the `surface/page` lead-in, on the strength of §3
naming `accent/strong` for *"Button hover fill; gradient stops"* and Appendix B calling the
`surface/page` opening *"unfinished work"*. Both citations are real. The conclusion was still
wrong, and it looked it — muddy grey where the board is saturated teal.

Put side by side with a screenshot of the board, the answer was immediate: **the stops were
already exactly right.** The rule's ramp is

| token | light | on the board |
|---|---|---|
| `surface/page` | `#FAFFFF` | the white lead-in |
| `accent/primary` | `#006C75` | dark teal |
| `accent/secondary` | `#009D91` | teal |
| `accent/tertiary` | `#43B581` | green |
| `accent/quaternary` | `#B9A1FC` | lavender |
| `accent/pentenary` | `#C8913E` | the orange at the right |

Every hue matches. What did not match was `opacity-45` on the rule, which greys the teals and
turns the pentenary stop from orange into pale tan — which is why the rendered line looked
washed out and, at a glance, like the wrong colours.

So tile hover changes no colour at all. It stops muting the colours that are already there:
`opacity-45` at rest, `opacity-100` on `group-hover/tile:`.

Two things fall out of that.

**It transitions properly.** `background-image` cannot be animated, so the two-gradient
version swapped instantly. Opacity animates, so this gets the sanctioned 150ms ease with no
extra machinery — no stacked layers, no `@property`-registered colour stops.

**The group still has to be named.** `Tile` carries `group/tile` and `GradientRule` responds
to `group-hover/tile:`. An unnamed `group` on the tile would be matched by every
`group-hover:` *inside* it — `Cta` sets one for its arrow and label, `ListTile` sets one per
row — so hovering anywhere on a tile would light every CTA and reveal every row arrow at
once. Verified: hovering the News tile leaves the CTA underline at border/subtle and reveals
only the arrow of the row actually under the pointer (`0,1,0` across the three, not `1,1,1`).

The lesson worth keeping: **when a colour looks wrong, check what is multiplying it before
changing what it is.** Opacity, blend modes and a scrim all present as "the wrong hue", and
the token was innocent here.

## 32. About NID is the first page through the content model

`/en/about` (Figma `3754:240099`; 1024 `4296:269561`, 768 `4334:185219`, 390
`4175:246865`) is built from a `PageResponse`, not a bespoke tile list like Home. What
that added, and where the boards and the model disagreed.

### The `getPage` seam and the fixture lint rule

`src/lib/content/getPage.ts` is the one content call: `getPage(path)` returns the
`PageResponse` for a route or `null`. Today it reads `src/lib/content/fixtures/*`; the day
the API exists, only that file changes. To keep that true, `scripts/lint-fixtures.mjs`
fails `npm run lint` on any import of a fixture from outside `src/lib/content/` — the same
mechanism as the no-literal-hex rule, and proven the same way (a probe file importing
`fixtures/about` failed it, then was removed).

Page prose lives in the fixture, not `messages/en.json` — it is CMS content, and this is
the first page where that is true. `en.json` gained only UI strings: `Page.subPages` (the
link stack's `aria-label`), `Page.seeMore` (the phone standfirst toggle) and `Cards.latest`
(the lead news card's overline). `Home.footer` moved to a top-level `Footer` namespace
with the footer.

### Footer promoted to the spine

`HomeFooter` is now `src/components/spine/Footer.tsx`, its content `src/lib/footer-content.ts`
(`FOOTER`, `FooterContent`, `Collaborator`), and it resolves its own translator
(`getTranslations("Footer")`) rather than taking one from Home. It stays four `GridItem`s
that a page renders inside its own `PageGrid` — not in the layout — because column 1 is the
label rail all the way down and a second grid doubles the shell margin (§6). Zero visual
change on Home; the collaborations block keeps `full-then-1` (§23) even though the About
boards draw it one column wide at 1024 and 768.

`img()` left `home-content.ts` for `src/lib/media.ts` (`mediaAsset(file, alt, w, h)`), so the
GitHub Pages prefix (§16) is applied in one place for every fixture.

### Grid additions

`GridItem` gained a `hero` span (`col-span-full laptop:col-span-2 desktop:col-span-3` —
§5.3's "columns 2–4, then 2–3, then full"), a `subgrid` flag and a `place` slot (both under
*A section's links are its utility slot* below), and a `start` prop, the first time a
column is *named* rather than reached by flow:

| `start` | class | why |
|---|---|---|
| `1` | `laptop:col-start-1` | Row 1 holds only the page title (cols 1–2) and the utility slot; without this the link stack flowed into column 3 beside the title — caught by measuring, the stack's x read 732, not 24. |
| `2` | `laptop:col-start-2` | The intro's rail cell is empty. |
| `"2-laptop"` | `laptop:col-start-2 desktop:col-start-auto` | A card that wraps at 3 columns stays in the content field, as the 1024 board draws the third campus at x 357 — flow alone would drop it into the rail. |
| `"2-desktop"` | `desktop:col-start-2` | The same at 4 columns, for a fourth one-column card. |

Each is a base utility plus breakpoint-scoped overrides, never two unscoped utilities of
one family (§20). `Tile.square` gained `"tablet"` and `"desktop"` ranges: the news cards
are squares from 2 columns up and 72px list rows on the phone; the alumni card was the
square from the 1440 board at 4 columns and the design's `Person` component (portrait over
name and bio, natural height) below — **superseded by §38**, which makes it one square at
every width and drops its `"desktop"` range entirely.

### Separators are drawn at 2 columns

`CLAUDE.md` said separators are omitted below 3 columns and the prompt asked for
`hidden laptop:block`. The 768 board draws all four (`4334:185244` at y 981, and so on)
and `NID-CONTEXT.md` §5.3 says "shown · shown · omitted" for 4&3 · 2 · 1. `Separator` is
`hidden tablet:block`; the `CLAUDE.md` line was corrected. It is a 24px row with no rule —
`get_design_context` on `3847:87985` returns an empty frame — so the gap between sections
is 24 + 24 + 24.

### Where the boards and the model disagree, and what was done

- **The intro row is page-level.** Hero, standfirst and the six sub-page links are
  `Page.hero`, `Page.intro` and `derived.subPageLinks`, not a `text` + `links` section: the
  model has those exact slots, and the board's column 1 is empty beside the intro, which a
  `text` section's title would have filled. The "Read full mandate" link beside the intro
  (`4584:812757`) has no page-level field; it rides on `Page.contacts` — the field with that
  placement — as a `LabelValue` whose value is the path, with a `TODO(review)` proposing
  `Page.introLinks`. Only the 1440 board draws it; the 1024, 768 and 390 boards have no link
  there at all. It is content, so it is kept and stacks after the body as the model says.
- **Cards items are `Page`.** The cards union is `Discipline | Programme | Page`, so news
  articles (`headline` → `title`, `date` → `publishedAt`, thumbnail → `hero[0]`), campuses
  and award-winning students all arrive as `Page`, and `CardsSection` chooses the card by
  which page an item is a child of (`cardKind` in `src/lib/content/pages.ts`). Three
  `TODO(review)`s in the fixture name the gaps: NewsArticle, Campus and Person are not in
  the union. The same table builds card hrefs, because the response gives items no path.
- **A section's links are its utility slot.** The model places them in column 4 at 4
  columns, the rail at 3, and after the body below — and the boards agree: beside the lead
  news card at 1440 and 1024, *after* the two square cards at 768 and 390. Flow alone cannot
  do both (the first draft put the link before the squares on the phone), and nothing is ever
  reordered, so the rule CLAUDE.md gives the page's utility slot is applied to the section's:
  the links come last in source order and `GridItem place="utility"` pins them to the title
  row's last column at 4 columns and the rail's second row at 3, with no pin below that. A
  row can only be named inside a grid whose rows are its own, so `CardsSection` is a
  `GridItem subgrid` — a full-row `<section>` on `grid-template-columns: subgrid`. It shares
  the page's column tracks exactly, adds no margin and no gutter, and restates only the row
  gap (a subgrid inherits the gap of the subgridded axis alone). Measured: the link's x and
  row are unchanged at 1440 and 1024, and it now follows the squares at 768 and 390.
- **Pattern tiles are 4-column only.** Neither "Just a tile" appears on the 1024, 768 or
  390 boards: the news one is `hidden desktop:block`, and the student-awards one is
  `PatternTile` with a `cta` slot whose pattern rows are desktop-only, so below 1280 it is
  just its link in the rail — one link in the DOM, not one shown and one hidden.
- **The 768 board packs the footer oddly** — `Primary Footer` beside the student-awards
  link, then the separator, then the other three blocks. That is auto-layout filling an odd
  cell, not a design; the separator stays before all four blocks.
- **The hero crop** follows §5.3 (2.2:1 → 2:1 → 16:9 → 4:3). The 1440 board draws
  1038 × 478, i.e. 2.17:1 — 6px taller than the spec ratio. Measured: 1038 × 471.8 at 1440,
  760 × 380 at 1200, 720 × 405 at 768, 358 × 268.5 at 390. At 1024 the row is 360 tall
  because the six-link stack is, and the 321px hero sits at its top, as the board draws.
- **The page title's polygon** (`4932:576607`, an equilateral 173 × 150 triangle) carries
  the same seven-stop gradient at 20% as `GradientWash`, so it is that component with a
  `shape="polygon"` rather than a new one. Only the 1440 board has it; it is
  `hidden desktop:block`. The 1024 board also draws the page title one column wide; it
  stays `span={2}` per §5.3 — "About NID" fits either way.
- **The phone standfirst** (`4361:190044`) is clipped to seven lines behind a "See more"
  inline CTA and set Body/Large/**Bold** in text/primary, where the 1440 board sets
  Body/Large/Regular in text/secondary. Both are kept as drawn (`Standfirst`, the page's
  one client component). The 390 board's `Title` instances are 28px tall where the H1
  token is 32/36; the token is used.
- **The primary CTA row** is 40px on the board with its 2px rule inside the box, so
  `Cta variant="primary"` is `pt-2 pb-1.5 border-b-2` (8 + 24 + 6 + 2), not `py-2` — at
  42 per row the six-link stack was 372 tall, not 360, and pushed the 1024 hero row down.
- **The news list row on the phone** measures 73px against the board's 72: the 1px rule is
  under the 72px thumbnail rather than inside it.

## 33. The main menu is a drawer, and one of its nine titles is a link

Two corrections to the primary menu (`src/components/header/MainMenu.tsx`), both against
`NID-CONTEXT.md` §7.4.

### It was built from the prose, and the prose left out the shape

§7.4 gives the tree and the interaction — nine sets, collapsed by default, instant, titles
not clickable, nothing underlined — and says the menu is "656px tall". None of that says
where the menu *is*, so it went in as a full-screen overlay under the header. The Figma
frame `1:178` is **400 × 900**: a right-hand drawer over the page. Measured off the frame
and reproduced to the pixel (verified in a browser at 1440):

| | |
|---|---|
| panel | 400 wide, full viewport height, `px-6` → a 352 content column |
| "Frame 44" | 56 tall — close IconButton 32 · gap 8 · Brand Strip 48, both centred on y=32 |
| sub-menus | 40 tall (`py-2` over a Heading/5 line-height of 24), gap 16 |
| expanded | header row + links list at gap 4, each link `py-2` over a Label/Small line-height of 20 |

About NID's five links make the expanded set 40 + 5×36 + 4×4 = **236**, which is exactly
what the Expanded variant reports — the check that the whole geometry is right.

Three details the prose also omits: the disclosure glyph is **plus / minus**, not a caret;
the nested links carry **no arrow** (only the section row does); and there is **no rule**
between sections. The close button is an `icon/primary` instance, not §7.2's default
`icon/quaternary` — which is why `IconButton` grew a `tone` prop rather than taking a
`className`: two colour utilities tie on specificity, and stylesheet order decides (and
`icon-quaternary` is emitted after `icon-primary`, so a `className` override loses).

Below 400 the panel is full-bleed (`w-full max-w-[400px]`). It slides in over a
`bg-surface-inverse/40` scrim, 300ms, gated on `prefers-reduced-motion`; it stays mounted
so it can animate out as well as in, and is `inert` while closed.

**Trap — the drawer is a SIBLING of `<header>`, not a child.** Scrolled, the header carries
`backdrop-blur`, and `backdrop-filter` makes an element a containing block for its
fixed-position descendants. Nested, the panel anchored to the 50/60px header band instead
of the viewport. This was already latent in the full-screen version.

**Trap — `Icon`'s `x` is the X/Twitter brand mark**, owned by the footer's social row
(`SocialPlatform`). Both the header toggle and the drawer's close button reused it, so the
drawer shut with a logo. The dismiss glyph is `close`.

### About NID's title navigates — a deliberate break with "titles are not links"

§7.4 is explicit that a menu title is not clickable, and eight of the nine still aren't.
About NID has a real landing page and the design owner asked for the title to reach it, so
`NavSection` gained an optional `href` and the "about" section sets `/about`.

Where an `href` is present the row **splits**: the title is a `Link`, and the plus/minus
alone works the disclosure — clicking the title navigates, it does not expand. The two
forms are separate branches rather than one row with two behaviours, and splitting has a
second benefit: the glyph becomes a real `IconButton`. In the single-control form it has to
stay a `<span>`, because the row itself is the `<button>` and a `<button>` cannot nest.

Geometry is identical either way (the link measures 24 tall inside the same 40 row, and
Programmes still starts at y=128). Nothing is underlined in either form. Add an `href` per
section as the remaining landing pages are built.

## 34. The home page moved to `/`; it was at `/home` and the wordmark never reached it

The header wordmark has always linked to `/` (§7.3 — the mark is the home link). `/` held
the Stage-0 placeholder — "foundations only", plus a link to the swatch — and the tile grid
sat at `/home`, so clicking the mark landed on the placeholder.

`design/tokens/sitemap.json` settles which of the two is wrong: Home's `path` is `/`.
`/home` on that entry is `liveLegacy` — the CURRENT nid.edu URL, which `$meta` explicitly
flags as disagreeing with the architecture. So the page moved rather than the link:
`[locale]/home/page.tsx` → `[locale]/page.tsx`, and the placeholder is gone. `/en/swatch`
is unaffected and is still the Stage-0 acceptance surface.

`[locale]/home/` is **deleted, not redirected.** Nothing in `src/` linked to it, and the
two mechanisms for keeping it alive both cost more than they are worth here: a
`next.config` redirect does not run in the GitHub Pages static export (see the comment in
`next.config.ts`), and a route that re-renders `HomeGrid` would just duplicate the page.
Real `liveLegacy` redirects are a launch task — the sitemap has a `redirects` rule and no
entries, and no redirect infrastructure exists in the repo yet.

One consumer needed updating: `scripts/screenshot.mjs` shot `/en/home`, now `/en`. If
`npm run screenshot` output looks unchanged, that is correct — same page, new path.

Watch for a stale `.next/types/validator.ts` after deleting a route: `npx tsc --noEmit`
fails on the removed module until a build regenerates it. Build first, then typecheck.

## 35. The favicon was still Vercel's; it is now the NID monogram

`src/app/favicon.ico` was the 25KB Next scaffold icon from `create-next-app`, untouched
since 21 Aug. Replaced with the NID monogram — the **first three paths** of the bilingual
wordmark (`src/components/spine/Wordmark.tsx`: the V triangle, the D bowl, the dot), which
between them measure 37.4513 × 29.5834. No new artwork: the same vectors the header draws.

Three files, all Next metadata-file conventions in `src/app/`, so no `<link>` is
hand-written anywhere:

| file | what it is |
|---|---|
| `icon.svg` | the source of record — what every modern browser actually uses (`sizes="any"`) |
| `favicon.ico` | 16 + 32 + 48 PNG-payload entries, for `/favicon.ico` requests and old clients |
| `apple-icon.png` | 180×180, opaque, for iOS home screens |

The mark is scaled into a **44**-unit content box centred in a 48 square
(44 / 37.4513 = 1.17486, a 2-unit margin). The first attempt used 40 and read too small at
16px — a favicon's real size is 16, so the margin is deliberately tight.

**A favicon cannot read the site's tokens.** It is painted by the browser chrome, not the
page, so no custom property resolves and the colours have to be literal. They are Peacock
(the default theme) `icon/primary`: primary-650 in light, primary-050 in dark, swapped
inside the SVG with `@media (prefers-color-scheme: dark)` on `:root` — which in an SVG
document is the `<svg>` element, and `fill` inherits from there. This is exempt from the
no-literal-hex rule rather than in breach of it: `scripts/lint-tokens.mjs` walks
`.ts/.tsx/.js/.jsx/.css`, not `.svg`.

That media query keys off the **browser's** scheme, not the site's theme switcher, and not
the element the icon sits in — a proof sheet that emulates one scheme for the whole page
shows both halves identical, which is the expected result, not a bug. `apple-icon.png`
does not swap at all, which is why it gets an opaque `surface/page` plate: iOS composites
a touch icon on a ground it does not tell you about.

The two raster files are generated, not drawn: `npm run generate:icons`
(`scripts/make-icons.mjs`) renders `icon.svg` with Playwright and packs the PNGs into an
ICO container by hand (6-byte header, 16 bytes per directory entry). Re-run it after
editing the SVG — nothing checks that the three files agree.

`public/index.html` (the Pages redirect stub, §13) also got the icon, relatively — without
it the stub flashes the browser default on the way to `/en/`.

## 36. Two CTAs dropped into the rail at 3 columns; they belong in column 2

At 1024 (3 columns) "Read full mandate" and "Visit Student Awards Gallery" both landed in
column 1, the rail, on an otherwise empty row — each stranded away from the content it
belongs to. The design owner's call is that both sit in **column 2**, the start of the
content field. Unchanged at 4 columns, at 2 and at 1.

They got there by different routes, so they took different fixes.

**"Read full mandate"** is `page.contacts`, `<GridItem span={1}>` with no start. At 4
columns the standfirst (`span={2} start={2}`) takes 2–3 and auto-placement drops this in
column 4, which is right. At 3 columns the standfirst fills the row, so it wraps — to
column 1. `start="2-laptop"` (`laptop:col-start-2 desktop:col-start-auto`) pins column 2 at
3 columns and leaves the 4-column auto-placement alone.

**"Visit Student Awards Gallery"** is a section's utility slot, `place="utility"`, whose
3-column rule was "the rail, row 2". That rule is right for News and wrong for Student
Awards, and the difference is not something CSS can ask about — it is what else is on that
row:

| section at 3 columns | title row | row 2 |
|---|---|---|
| News & Events | title · lead card (2 cols) | **two square cards in 2–3** — the rail is the only free cell |
| Student Awards | title · card · card | **empty** — column 2 is free |

So `PLACE` gained `utility-field` (column 2) beside `utility` (the rail), and
`CardsSection` picks by `kind`: News keeps the rail, everything else takes column 2. Both
entries are identical at 4 columns (last column, title row) and neither applies below 3.

Measured at all five widths after the change — 1440 and 1280 byte-identical to before
(x=1086 / x=966, column 4), 768 and 390 unchanged, and at 1024 the two moved from x=24 to
x=357 while "All News & Events" stayed at x=24.

## 37. The Student Awards pattern was desktop-only, and §36 removed its reason

`PatternTile`'s `cta` form — a band of the craft field above and below a centred link
(About's "Just a tile" 4912:367990) — drew both bands `hidden … desktop:block`. Below 4
columns the tile was its link and nothing else, which is what the 1024 / 768 / 390 boards
show: there the link sits in the **rail**, and a decorative band across a rail cell is
noise, so the boards drop it.

§36 moved that link out of the rail. At 3 columns it now sits in column 2, in the content
field, where the thing is a tile again — so the bands are drawn at every width. Only the
`aspect-square` proportion stays desktop-only: a square across a 768 half-row or the whole
of a 390 is a hole, not a tile. Below 4 columns the tile is just as tall as its three rows
(1024 195px, 768 215px, 390 219px, against 330 at 1440).

Scope is exactly one tile. `PatternTile` without `cta` — Home's tiles and the News rail
tile — takes a different branch and is untouched; About's student-awards link is the only
`cta` caller in the codebase.

## 38. The alumni card was two tiles pretending to be one

`AlumniCard` branched at 1280. At 4 columns it drew the board's square (4683:397311) — the
craft bed, the bandhani scatter, the portrait in the scatter, name / three-line bio /
hairline. Below that it drew the `Person` component the 1024 / 768 / 390 boards carry
(4296:269589): a 144px luminosity-blended portrait, no bed, no scatter, no rule, and an
unclamped bio. Four differences at once, so the same tile read as two different things
either side of one breakpoint.

The settling argument is not either board: it is that **this tile already exists on Home**
as `PortraitTile`, and `PortraitTile` draws the bed, the scatter and the closing rule at
every width with no `desktop:` gating. Two components with the same structure disagreeing
about which breakpoints the structure applies to is the bug, whatever a board shows. So
`AlumniCard` now mirrors `PortraitTile`: one shape, no branch.

Concretely, gone from it: `square="desktop"` (the `Tile` default, `true`, is every
breakpoint), `max-desktop:gap-4 max-desktop:py-3`, the `hidden … desktop:block` on the bed
and the scatter, `size-36 … desktop:size-auto desktop:w-4/5`, `mix-blend-luminosity …
desktop:mix-blend-normal`, `text-h6 … desktop:text-h5`, `text-micro … desktop:text-label`,
the two `desktop:text-text-tertiary`s, `desktop:line-clamp-3` and the rule's
`hidden … desktop:block`. What survives is the 4-column column of each pair.

Measured after: square at all four widths (1440 330, 1024 309, 768 350, 390 358) with both
pattern SVGs present at each. `Tile.square`'s `"desktop"` range now has no caller; it is
left in the map since the other ranges are used and the cost is one line.

The `sizes` hint changed with the geometry — the portrait is four fifths of half the tile,
so ~132px at 1440, ~124 at 1024, ~140 at 768, ~143 at 390: `(min-width: 668px) 160px,
40vw`, one fixed hint above the phone and a viewport fraction on it.

## 39. News & Events is the first secondary page, and the template for ~100 more

`/en/about/news-events` (Figma `4123:240887`) is the About page's shape with two things
added that only a **secondary** page has: a back-nav in the page's own utility slot, and a
sibling band before the footer. Both come from `derived` on the `PageResponse` — never from
a section — and neither had a renderer before this page.

### The route is `/about/news-events`

The brief called it `/about/news`. `design/tokens/sitemap.json` says `/about/news-events`,
and three places already linked there and 404'd: the header menu (`nav-content.ts`),
About's sub-page rail, and About's "All News & Events" CTA. Building the sitemap's path
resolves all three at once.

### This landing has no responsive boards, and that is not an oversight to work around

`NID-CONTEXT.md` §5.5 names the four page families laid out at every breakpoint — Home,
About landing, News **Archive**, Student Awards. Appendix A's key-board list agrees, and
`sitemap.json` carries a `responsive` array for Archive and Student Awards but only a bare
`board` for this page. `get_metadata` on the canvas (`0:1`) cannot be used to check: the
response exceeds what the transport will parse, the same failure the About pass hit. So
1024 / 768 / 390 here come from §5.3, the About boards' precedent and the brief's stated
defaults, not from drawings. Anything below 1440 on this page is therefore a derivation,
and a board — if one is ever drawn — outranks it.

### The page utility slot, and why it needs no subgrid

`GridItem` gained `place="page-utility"` (`laptop:-col-start-2 laptop:row-start-1`): the
last column of row 1 at 3 and 4 columns, leaving row 1 below that. `-col-start-2` is "the
last column" at either count without a per-breakpoint class, because line −2 is line 4 of
five and line 3 of four.

Unlike the section slot it names a row of the **page** grid, and that row is real: the page
title is the grid's first child. `place="utility"` needs its section to be a subgrid only
because "row 2 of this section" is not a row the page grid knows about. The back-nav pairs
it with `span="full-then-1"`, so below 3 columns it stops being a slot and becomes a
full-width band under the title, which is what the model means by the slot leaving row 1.

### `subgrid` composes with `span`, and subgrids nest

`GridItem`'s `subgrid` used to force `col-span-full`. It now emits `SPAN[span]` alongside
the grid classes, so a subgrid item still declares its width — `CardsSection` passes
`span={4}` explicitly. That change is what lets the feature card work: its cell is
`span="hero" subgrid`, nested inside the section's own subgrid, and the card's photo takes
`laptop:col-span-1 desktop:col-span-2` while its text takes one track.

The point is that no arithmetic is involved. A square photo two tracks wide is
330 + 24 + 330 = 684 at 4 columns, so the card is exactly two grid rows tall; at 3 columns
it is one track wide and one row tall. Measured 1038 × 684 at 1440 and 642.67 × 309.33 at
1024 — both exact. The first draft used a `w-grid-column` utility reading
`--nid-grid-column-width`; the subgrid needs no token at all, and the utility was not
added.

### Cards never enter the rail, so a card below a lead pins column 2

§36 established that column 1 is the rail at 3 columns and up. Cards that start on the
section's **title** row get that for free — the title already holds column 1 — which is all
`startOf` ever had to handle. A card that starts on a **fresh** row beneath a lead does
not: at 3 columns the rail tile is hidden and column 1 is free, so index 0 would drop into
it. `startBelowLead` pins every even index to column 2 at laptop, index 0 included. Both
helpers moved to `sections/parts.tsx` and are shared with `LinksSection`.

The rail tile itself is now `place="rail"` rather than flowed. On About it landed in
column 1 of row 2 by luck, because the section's links were pinned to the last column of
row 1 and pushed it there. The "2026" section has no links, so the tile would have taken
that cell — which the board gives to a card.

### `Cta` reads the arrow's side off its name

Back-nav draws its arrow **before** the label (`4322:517428`), at 24px and with no Icon
Button box, where every other CTA trails a 16px glyph inside one. The side is derived from
`icon === "arrow-left"`, not a new prop: `content-model.ts` derives the icon from
`targetType` and forbids authoring it, so a caller has nothing to set a side from. Nothing
else on the site uses `arrow-left`, so Home and About are untouched.

### The rest

- **`LinksSection` was reshaped.** It rendered one `LinkStack` in columns 2–3; the board
  draws the archive years one to a column across the content field (`4123:240894`). It now
  emits a `GridItem span={1}` per link with `startOf`. Nothing regressed: no `links`
  section existed anywhere before this page.
- **`LinkStack`'s `twoUpAtTablet` became `twoUp: "tablet-only" | "tablet-up"`.** The rail's
  sub-page links are two-up only at 2 columns; the sibling band is two-up from 2 columns
  **up**. That is the opposite range, so it is two named modes rather than a flipped
  boolean.
- **`GradientWash` gained `corner`** — `4932:576889`, the same seven-stop gradient at 20%
  as About's polygon on a different outline. Figma draws it as `wash`'s triangle at 150 and
  rotates the layer 180°; the rotation is baked into the path and the gradient line here
  rather than carried as a transform. `Title` takes a `wash` prop, default `polygon`.
- **No separator between the title row and the first section.** The board's four separators
  sit between sections, before the sibling band and before the footer. About renders one
  before its first section because an intro block precedes it; this page has nothing there.
- **The sibling band's separator belongs to the band.** Both are wrapped in the same
  `siblingBand.length > 0` guard, so an empty band leaves no stray rule. Verified by
  building with `siblingBand: []`: the rendered "More in About NID" drops from 2 to 0 and
  the page's `<hr>` count from 4 to 3.

### Where the board and the model disagree

- The **"Featured" section holds four articles** while `NewsArticle.featured` is capped at
  three site-wide (§8.5). It does not bite yet — the cards union cannot carry a
  `NewsArticle`, so the flag is unreachable — but the backend needs to know before it
  enforces the cap.
- **Lead prominence has no field.** "Featured" leads with a 3-column card and "2026" with a
  2-column one; both are `type: "cards"`, four items, no links. `CardsSection` takes a
  `lead` prop and the page names the featured section by id. It is deletable the day the
  cards union carries `NewsArticle`.
- **The sibling band labels Charter "Charter"**, where About's rail calls the same page
  "NID's 'Mandate'". Both are right: `siblingBand` entries carry `title`, `subPageLinks`
  carry an authored `label`.
- **The "2026" cards are lorem ipsum on the board** with empty tint images. The four
  Featured articles are the year's articles, so both sections list the same four records.
- **The board identifies About's placeholder card.** About's third news card ships as
  "Lorem ipsum" with a `TODO(review)` asking editors for the article. Its photo is
  byte-identical to this board's "Inauguration of the Incubation and Innovation Centre at
  NID Gandhinagar Campus" — that is the missing article. About's fixture is out of scope
  here and was left alone.

## 40. The pattern fields repeated when they should have scaled

Every `PatternField*` was a bare `<svg>` — no `viewBox` — holding a `<pattern>` at
`patternUnits="userSpaceOnUse"` with `width="81"`, painted onto a `100% × 100%` rect. With
no viewBox one user unit is one CSS px, so the unit stayed 81px whatever the tile did: a
wider tile revealed **more** repeats, a narrower one **cropped** them. The generated
header even said so ("the field is fluid rather than a fixed 4x4 of 81px units") as though
it were a feature. It is not what the boards draw — the field is a fixed composition, and
it should get smaller when the tile is squeezed and bigger when it is not.

The fix is a `viewBox` plus `preserveAspectRatio="xMidYMid slice"`. `100%` on the rect then
resolves against the viewBox rather than the CSS box, so the rect is exactly N×N units and
the whole composition maps to whatever size the element is.

**N is not one number.** A unit is 81px at the 330px reference tile, so:

| field | drawn on | units | viewBox |
|---|---|---|---|
| `PatternField1/2/3` | a whole tile | 4×4 | `0 0 324 324` |
| `PatternFieldAlumni` | the LEFT HALF of a tile | 2×2 | `0 0 162 162` |

Generating both at 4 would halve the alumni motif — the bed is `w-1/2`, so a 4×4 there is
twice the density the card shows. `FIELD_UNITS` in `scripts/generate-patterns.py` carries
the exception; everything else takes `FIELD_UNITS_DEFAULT`. The alumni bed now shares its
162 coordinate space with `PatternScatterAlumni`, which sits on the other half of the same
pair and was already emitted at 162.

`slice`, not `meet`, because one consumer is not square: About's student-awards CTA bands
are `aspect-[4/1]`. `meet` would letterbox them to a quarter-height sliver; `slice` covers,
scaling on the long edge and cropping the short one — so the band still reads as 4 units
across, which is what it was before. Verified by CTM rather than by eye (`getScreenCTM().a`
= 1.0185 on a 330px band, i.e. an 82.5px unit, four across): at band size the thumbnail is
genuinely misleading, and counting motifs in it gave the wrong answer twice.

Measured on the row-3 pattern tile: 1440 → 82.5px units, 1280 → 72.5, 1024 → 77.3, 768 →
87.5, 390 → 89.5. Always 4×4, only the scale moves. (The units do not shrink monotonically
with the viewport because the tile does not — a 3-column 1024 tile is wider than a
4-column 1280 one.)

`patterns.tsx` is GENERATED. This change is in `scripts/generate-patterns.py`; editing the
.tsx by hand is reverted by the next `npm run generate:patterns`.
