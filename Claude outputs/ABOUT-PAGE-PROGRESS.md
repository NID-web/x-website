# About NID (`/en/about`) — build record & open decisions

Built 7 Sep 2026 by Claude Code (Fable 5.1, high effort) from `PROMPT-about-nid.md`,
against Figma `QoVWmyMWLysnbyHZk1NLqn`, board `3754:240099` (1440) and its three
sibling boards. Left **uncommitted** for review. `/en/about` builds as ● (SSG);
`tsc`, `lint` (incl. the new fixture rule) and `verify:tokens` (621) pass.
Screenshots: `docs/screenshots/about-{1440,1024,768,390}.png`.

Repo state at the time: `a7ad9a4` (the Figma Make export removal) is the last commit;
everything About-related is in the working tree on top of it.

## What it is

The first page routed through the content model. `getPage("/about")` reads a typed
fixture; the page composes `Title`, the sub-page `LinkStack` in the rail, the hero,
`Standfirst`, then `SectionRenderer` per section, then `Footer` — all direct children
of one `PageGrid`. This is the shape every primary page takes from here.

## New surface area (what the next page can reuse)

| Thing | Where | Notes |
|---|---|---|
| `getPage(path)` | `src/lib/content/getPage.ts` | Fixtures now, API later. **Nothing outside `src/lib/content/` may import a fixture** — `scripts/lint-fixtures.mjs` runs inside `npm run lint`. |
| About fixture | `src/lib/content/fixtures/about.ts` | Page prose lives here (it is CMS content). `messages/en.json` holds UI strings only (`Page.subPages`, `Page.seeMore`, `Cards.latest`, `Footer.*`). |
| `pages.ts`, `links.ts`, `format.ts` | `src/lib/content/` | Well-known page ids + `pathOf()`, `Link → Cta` props (`ctaProps`), card date formatting. |
| `mediaAsset()` | `src/lib/media.ts` | The one base-path prefix point. Replaces `img()` in `home-content.ts`. |
| `Footer` | `src/components/spine/Footer.tsx` | Promoted from `HomeFooter`. Four `GridItem`s rendered **inside each page's grid** (one-grid rule), after a `Separator`. Content in `src/lib/footer-content.ts`. Home verified unchanged. |
| `Title` | `src/components/spine/Title.tsx` | `variant="page"` (H1, `span={2}`, gradient polygon behind it at desktop only) · `variant="section"` (label-rail H2, `span="full-then-1"`). Emits its own `GridItem`. |
| `Separator` | `src/components/spine/Separator.tsx` | A 24px empty full-width row, **no hairline**. `hidden tablet:block` — shown at 2 columns and up, dropped on phones. |
| `Standfirst` | `src/components/spine/Standfirst.tsx` | Client component. Phone-only 7-line clamp with a "See more" inline CTA, as the 390 board draws it. |
| `NewsCard`, `CampusCard`, `AlumniCard` | `src/components/cards/` | On `Tile`. `AlumniCard` is the 1440 square at 4 columns and the design's *Person* shape (natural height) below. |
| `SectionRenderer` + `TextSection`, `LinksSection`, `CardsSection`, `parts.tsx` (`LinkStack`, `ContactList`) | `src/components/sections/` | Refuses to render an empty section. `files` / `rail` / `mosaic` return `null` until Stages 3–5. |
| `GridItem span="hero"` | `GridItem.tsx` | `col-span-full laptop:col-span-2 desktop:col-span-3`. |
| `GridItem start` | `GridItem.tsx` | `1` · `2` · `"2-laptop"` · `"2-desktop"` — names a column where flow would put a thing in the wrong one (row-2 break after the title; the intro's empty rail cell; a card that wraps at 3 columns staying in the field). No effect at 1–2 columns. |
| `Cta variant="primary"` | `Cta.tsx` | The Heading/5 row with a rule, 40px box — the six-link stack and rail links. Default stays `"uppercase"`. |
| `Icon "plus"` | `Icon.tsx` | For "See more". |
| `Tile square` ranges | `Tile.tsx` | Now `true` · `"tablet"` · `"laptop"` · `"desktop"` · `"max-laptop"` · `"max-tablet"`. |
| `GradientWash shape="polygon"` | `parts.tsx` | The "Polygon 1" behind the page title is the same seven-stop gradient, different outline. |
| `PatternTile cta` | `PatternTile.tsx` | Pattern row above and below a centred CTA. Decoupled from `HomeTile` typing. |
| `public/about/` | 9 photos, 2.0 MB total, 33–392 KB each | Web-sized. |

## Defects found in review (7 Sep, Cowork session)

1. **Sub-page links open in a new tab and lack the locale prefix.** `about/page.tsx`
   maps `derived.subPageLinks` (`{label, href}`, internal, already resolved) into a
   content-model `Link` with `targetType: "external"`. `ctaProps` then derives
   `external: true` → `Cta` renders a plain `<a target="_blank">` to `/about/charter`
   with no `/en`. `LinkStack` should accept plain internal `{label, href}` links and
   render them through the localised `Link`. Same check for `ContactList`'s
   "Read full mandate".
2. **`CLAUDE.md` line 50 contradicts `Separator.tsx`.** The doc still says separators
   are omitted below 3 columns; the component shows them at 2 (`hidden tablet:block`),
   and Claude Code's summary claimed the doc was corrected — it was not. Confirm
   against the 768 board (`get_metadata` — does it contain `Separator` instances?),
   then fix whichever is wrong.
3. **Stale assertion count.** `README.md`, `CLAUDE.md` and three places in
   `STAGE-0-NOTES.md` say `verify:tokens` has 609 assertions; it reports 621
   (predates this work — §§ 870/993 of the notes already say 621).
4. **`Claude outputs/` is sitting untracked in the repo root** (it holds the prompt
   file). Add it to `.gitignore` or move it out before committing.

## Design decisions still open (need the boards / the designer)

- **"All News & Events" position at 1–2 columns.** Boards put it after the two square
  cards; the build puts it before them (no-reorder rule). Recommended: treat a
  section's row-1 CTA as the section's *utility slot* — the same mechanism
  `CLAUDE.md` already sanctions for the page utility slot ("leaves row 1 below 3
  columns"): source-last, pinned to the title row's last column at ≥ 3 columns via
  `GridItem` placement, natural flow below. That matches all four boards.
- **Phone standfirst style.** 390 board draws Body/Large/**Bold** in `text/primary`;
  1440 draws Regular in `text/secondary`. Built as drawn. Ask the designer whether the
  phone board is intentional.
- **390 board titles are 28px** where the H1 token is 32/36. Token used. Tell the
  designer.
- **Hero crop** follows §5.3 ratios (2.2:1 → 2:1 → 16:9 → 4:3); the 1440 board is 6px
  taller than 2.2:1. Accept.
- Patternimate-2/-3 assumed equal to `PatternField1/2` — compared by eye against the
  board render only.
- Phone news row is 73px vs the board's 72 (1px rule under the thumbnail). Accept.
- Focus ring on `Cta` is the browser default outline. Fine for now; the spine pass
  should give it `border-border-strong`.

## Content-model gaps → backend developer

All are `TODO(review)` in `fixtures/about.ts` / `pages.ts`; none were worked around by
editing `content-model.ts`.

1. `Page` has no slot for an intro-row link ("Read full mandate" currently rides on
   `Page.contacts` as a path-valued `LabelValue`). Proposal: `Page.introLinks: Link[]`.
2. The `cards` union lacks `NewsArticle`, `Campus`, `Person`; items are typed as `Page`
   stubs. Proposal: extend the union so the card kind comes from the record.
3. Index stubs carry empty `sections` although the model says "at least one". Question:
   does a `PageResponse` carry stubs or whole pages for card items?
4. Items have no resolved `href`; the front end builds them from a static parent-path
   table (`pages.ts`). Proposal: every `Page` in a response carries a derived `path`.
5. The board's third news card is "Lorem ipsum" — editors supply the article.

## Commit plan

Two commits on top of `a7ad9a4`, after the fix pass: (1) the spine/grid extensions
(`GridItem`, `Cta`, `Icon`, `Tile`, `parts`, `PatternTile`, `Footer` promotion,
`media.ts`, `footer-content.ts`, Home import updates) — (2) the About page, the
content seam, the lint rule, the fixture, the photos, the docs. Discard the
re-rendered `swatch-*.png` unless they are wanted.
