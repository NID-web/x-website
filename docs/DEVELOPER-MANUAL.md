# NID website — developer manual

**Who this is for:** anyone new to this repo who has to build a page or a component.
Plain language, recipes first. No prior knowledge of the design file assumed.

**How to use it:** find your task in the *Recipes* section, follow the steps, then run
the checklist at the end. The *Cheat sheets* are lookup tables — don't memorise them.

Related reading, in order of authority:

| File | What it is |
|---|---|
| `CLAUDE.md` | The short rulebook. Terse. This manual is the friendly version of it. |
| `design/NID-CONTEXT.md` | The design spec. 1000+ lines, section-numbered. The final word on how something should *look*. |
| `docs/STAGE-0-NOTES.md` | Why the code deviates from the spec in ~16 places. **Read before calling something a bug.** |
| `README.md` | Setup, theming architecture, verification commands. |

---

## 1. What this project is, in five lines

- The public website for the **National Institute of Design** — ~110 pages, mostly editorial (text, images, links, documents).
- Built with **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4**.
- Every page can be shown in **10 colour themes × light/dark = 20 looks**, switchable live by the visitor.
- A **separate developer owns the CMS and the API.** Right now content lives in typed files under `src/lib/`.
- The site is **static** — pages are built once at build time, not rendered per visitor.

---

## 2. The seven rules that break things silently

These do not throw errors. They just look wrong later, usually in a theme nobody tested.
Everything else in this manual is detail; this is the part to actually remember.

**1. Never write a colour. Name a token.**
`text-text-primary`, `bg-surface-raised`, `border-border-subtle` — yes.
`#1a1a1a` or `bg-primary-650` — no.
*Why:* a hex is one colour. The site needs twenty. The token layer does the swapping for you; a hex opts that element out of it permanently. `npm run lint` fails the build on any hex under `src/`.

**2. Never set your own `font-size`.**
Use a `text-*` utility (`text-h2`, `text-body`, `text-caption`).
*Why:* each `text-*` utility carries size **and** line-height **and** letter-spacing **and** weight, and all four change at each breakpoint. Setting your own size keeps the desktop value on a phone.

**3. A page is ONE grid.**
One `<PageGrid>` per page. Every section is a `<GridItem>` directly inside it. Never nest a second `PageGrid`, never wrap sections in their own flex containers.
*Why:* column 1 is the label rail for the *whole page*. Section titles across the entire page line up in that column. Nesting a grid restarts the columns and destroys the alignment — and doubles the page margin.
*The one exception:* `<GridItem subgrid>` — a section that shares the page's own column tracks so it can name a row inside itself (the section utility slot, §C3). It is still the same tracks, so the rail still aligns.

**4. There are four breakpoints, and they are not Tailwind's.**
`tablet` (768px) · `laptop` (1024px) · `desktop` (1280px). Below tablet = mobile.
There is **no** `sm:` `md:` `lg:` `xl:` — those are deleted. `md:flex` silently does nothing.

**5. Arrows are icons, never characters.**
A link label is `"Campuses"`, never `"Campuses →"`. The arrow goes in its own `<Icon>` slot.
*Why:* screen readers read "right arrow" out loud, and the CMS ends up storing junk in a text field.

**6. Hover changes colour only. Never size, never position.**
`transition-colors duration-150 ease-in-out`. No `scale`, no `translate`.
*Why:* house style, and transforms on a grid of tiles cause layout jitter.

**7. Some files are generated. Editing them by hand is silently undone.**
`src/styles/themes.css`, `src/lib/font-manifest.json`, `src/components/header/motifs/*.tsx`, `src/components/home/patterns.tsx`. See §10.

---

## 3. The map — where everything lives

```
NID-web/
├── src/
│   ├── app/
│   │   ├── globals.css              ← the token→Tailwind mapping. Read it once.
│   │   ├── head-shell.tsx           ← fonts + the anti-flicker theme script
│   │   └── [locale]/                ← EVERY page lives under here
│   │       ├── layout.tsx           ← the real root layout (<html>, header, providers)
│   │       ├── page.tsx             ← "/"  — the Home bento (moved from /home, STAGE-0-NOTES §34)
│   │       ├── about/page.tsx       ← "/about" — a primary page: PrimaryTemplate (R1b)
│   │       ├── study/page.tsx       ← "/study" — the third primary page (STAGE-0-NOTES §73)
│   │       ├── research/page.tsx    ← "/research" — the fourth: one cards section with prose + contacts (§78)
│   │       ├── research/[slug]/page.tsx ← every research centre: one route, one layout rule (§79, R1d)
│   │       ├── consulting/page.tsx  ← "/consulting" — the fifth primary page; films and PDFs as a links section (§80)
│   │       ├── people/page.tsx      ← "/people" — the sixth: no sections, sub-page links three across under the standfirst (§81)
│   │       ├── people/faculty/…     ← the faculty directory: /people/faculty + by/[view], one grouped rail (§82)
│   │       │                          and every member at [slug]: portrait + key info + bio (§83)
│   │       ├── study/admission/     ← a secondary page; the CMS merged by meaning (§74)
│   │       ├── about/news-events/   ← the secondary-page template (R1c)
│   │       ├── about/our-themes/    ← the ten craft palettes, each scoped to its theme
│   │       ├── swatch/page.tsx      ← "/swatch" — the QA surface, not a real page
│   │       └── not-found.tsx
│   │
│   ├── components/
│   │   ├── layout/       PageGrid, GridItem            ← the grid. Use these always.
│   │   ├── spine/        Cta, Icon, IconButton, Title, ← site-wide primitives.
│   │   │                 Separator, Standfirst, Footer,  Reuse before building new.
│   │   │                 Wordmark, BrandStrip
│   │   ├── sections/     SectionRenderer + Text/Links/CardsSection, parts (LinkStack, ContactList)
│   │   ├── cards/        NewsCard, CampusCard, AlumniCard   ← on Tile
│   │   ├── themes/       ThemeCard
│   │   ├── header/       Header, MainMenu, ThemeSwitcher, ThemeMenu, motifs/
│   │   ├── home/         Tile, TileImage, parts, patterns, HomeGrid
│   │   │   └── tiles/    the 11 home-page tile types
│   │   ├── theme/        ThemeProvider + useTheme()
│   │   ├── swatch/       QA-page-only components
│   │   └── dev/          GridOverlay (press "g" in dev)
│   │
│   ├── lib/
│   │   ├── content-model.ts   ← the CMS contract. DO NOT EDIT ALONE.
│   │   ├── content/           ← getPage() + fixtures/. The ONLY place fixtures are imported.
│   │   ├── media.ts           ← mediaAsset(): the one base-path prefix point for images
│   │   ├── home-content.ts    ← home page structure (which tile, what order, hrefs)
│   │   ├── footer-content.ts  ← the site footer's links, contact, logos
│   │   ├── nav-content.ts     ← the menu tree + theme labels
│   │   └── theme-constants.ts ← the 10 theme names
│   │
│   ├── styles/themes.css      ← GENERATED. 65 colours × 10 themes.
│   └── i18n/                  ← routing, the localised <Link>
│
├── messages/en.json           ← UI strings + the Home page's copy. Page prose for
│                                 content-model pages lives in their fixture instead (R4).
├── public/home/, public/about/, public/news/ ← photography, web-sized
├── design/                    ← the design source of truth (+ generator scripts)
├── docs/                      ← this file, the plan, the deviation notes, screenshots
└── scripts/                   ← lint + verification scripts
```

---

## 4. The mental model — four layers

Build downward. If you're reaching past a layer, something is missing in it.

```
   PAGE            src/app/[locale]/<slug>/page.tsx
     ↓             thin. Sets the title, renders one grid.
   GRID            <PageGrid> + <GridItem span={1..4}>
     ↓             owns all horizontal layout. You never write column CSS.
   COMPONENT       Tile, Cta, Icon, IconButton, Overline …
     ↓             owns shape and spacing. Names tokens, never values.
   TOKENS          text-text-primary · text-h2 · p-6 · rounded-pill
                   defined in globals.css, fed by themes.css.
```

**The colour system, in one paragraph.** There are three layers of colour.
*Layer 0* is black and white. *Layer 1* is 65 raw colours per theme — `--nid-primary-450` and friends — and these change when the visitor picks "Tanjore" instead of "Peacock". *Layer 2* is 27 **named jobs** — "the page background", "secondary text", "a faint border" — and these change when the visitor switches light/dark. **Your component only ever names a layer-2 job.** Then it is automatically correct in all 20 combinations, and you never think about it again.

---

## 5. Setup and daily commands

```bash
nvm use          # Node 24.19.0 (see .nvmrc)
npm install
npm run dev      # http://localhost:3000/en
```

| Command | What it does | When |
|---|---|---|
| `npm run dev` | dev server | always |
| `npx tsc --noEmit` | type check | before every commit |
| `npm run lint` | ESLint **+ the no-hex rule + the no-fixture-import rule** | before every commit |
| `npm run build` | production build — wrapped by `scripts/with-cms-cache.mjs`, so a LIVE build fetches each CMS URL once across all its processes (§71) — then the **built-HTML guard** (fails on any page with bytes after its `</html>`, §70) and a **build summary** (mode, documents, rate-limit retries, floors, routes, withheld links) | before every commit |
| `npm run verify:tokens` | FIXTURE build (no CMS — tokens don't need it), then 667 assertions in a real browser: all 20 theme states, the grid at the four artboard widths **and** at 1600 / 1200 / 900 / 430 between them | after touching `themes.css`, `globals.css`, `PageGrid`, `GridItem` |
| `npm run verify:parity` | checks `design/tokens/*` still matches its `src/` copy | fast; runs inside `verify:tokens` |
| `npm run verify:fonts` | confirms all four font families actually loaded | after font changes |
| `npm run screenshot` | a **FIXTURE** build, on purpose — the boards are the fixtures — then `docs/screenshots/<page>-{1440,1024,768,390}.png` | comparing against Figma |
| `npm run screenshot:live` | a LIVE build, then the same set into `docs/screenshots/live/` (the article is the CMS's own) | seeing what the CMS makes of the pages |
| `npm run generate:tokens` | regenerates `themes.css` + `font-manifest.json` **and copies them into `src/`** | after editing `design/generate.py` |

**Two pages worth knowing:**

- `/en/swatch` — every token, every theme, the grid proof, the type specimen, on one page. Fastest way to check a token change.
- Press **`g`** on any page in dev to toggle a translucent column ruler.

### The build's three outcomes, and deploying on Vercel

A build is exactly one of these (`src/lib/api/build-mode.ts`):

| Outcome | When | What the log shows |
|---|---|---|
| **FIXTURE** | `CMS_API_URL` unset | A `=====` banner at the top: `FIXTURE BUILD — CMS_API_URL is not set.` Every page is its fixture, 2 article routes. For screenshots and offline work, **never a deploy**. |
| **LIVE** | `CMS_API_URL` set, every document arrived, every floor met | `[cms] LIVE build — <host>` at the top, and the summary box at the end: `MODE LIVE`, `DOCUMENTS n fetched, 0 failed`, `TIMEOUTS n retried, 0 failed`, `SLOWEST` (five URLs), `FLOORS n checked, 0 short`, `/about/news-events/[slug]: 12 routes` |
| **FAIL** | anything else | The build stops on the first `[cms] BUILD REFUSED`, `[cms] FETCH FAILED` or `[cms] FLOOR NOT MET` (§12 decodes each) |

`CMS_API_URL` set means LIVE, so a CMS that times out or answers short **fails the build**. A single timeout, dropped connection or 502/503/504 is retried first (3 attempts, about 2s then 4s apart); only a URL that fails all three ends the build (STAGE-0-NOTES §84). It no longer ships with fixtures quietly standing in. `next dev` still warns and falls back, so a flaky CMS never stops local work. The floors (the least the site accepts: 10 feed articles, 4 home sections, 7 menu sections…) live in `src/lib/content/cms-floors.ts`. Lowering one is a decision, not a fix.

**Vercel needs**, in Project Settings → Environment Variables:

| Variable | Production | Preview |
|---|---|---|
| `CMS_API_URL` | the CMS origin, no trailing slash, no `/api` | same, if previews should show CMS content; unset for a FIXTURE preview |
| `CMS_REQUIRED` | `true` (belt and braces — `VERCEL_ENV=production` already implies it) | leave unset |

The Build Command must be `npm run build` (the Vercel default when `package.json` has a `build` script), not `next build`, or neither the per-build CMS cache (§71) nor the built-HTML guard (§70) runs, and the summary box does not print. A production build without `CMS_API_URL` is refused before a page is built: `[cms] BUILD REFUSED — CMS_API_URL is not set, and this build requires the CMS (VERCEL_ENV=production)`.

**Before launch:** turn `SHOW_IMAGE_PLACEHOLDERS` off (`src/lib/content/placeholders.ts`), or replace every placeholder with a real photo. Until then the Study at NID pages draw a flat box in each image slot the CMS has not filled (STAGE-0-NOTES §77).

**Reading `npm run build` output:** your route must show `○` or `●` (static). If it shows `ƒ` (dynamic), something in your page called `cookies()` or `headers()` and you've made the whole site render per-request. Find it and remove it.

---
# RECIPES

---

## R1 — Add a new page

**Example:** `/en/about/history`

### Step 1 — make the folder and file

Folders become URL segments. `src/app/[locale]/about/history/page.tsx` → `/en/about/history`.

```bash
mkdir -p "src/app/[locale]/about/history"
```

### Step 2 — write the page

```tsx
// src/app/[locale]/about/history/page.tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageGrid } from "@/components/layout/PageGrid";
import { GridItem } from "@/components/layout/GridItem";

export const metadata: Metadata = {
  title: "History — National Institute of Design",
};

export default async function HistoryPage() {
  const t = await getTranslations("History");   // matches "History" in messages/en.json

  return (
    <main className="min-h-screen bg-surface-page pb-12 text-text-primary">
      <PageGrid>
        {/* H1 spans columns 1–2 (design rule for every page title) */}
        <GridItem span={2}>
          <h1 className="font-primary text-h1 text-text-primary">{t("title")}</h1>
        </GridItem>

        {/* Column 1 = the label rail: section titles live here, all page long */}
        <GridItem span={1}>
          <h2 className="font-primary text-h4 text-text-secondary">{t("origins.title")}</h2>
        </GridItem>

        {/* Body copy sits in columns 2–3 and is capped at 684px for readability */}
        <GridItem span={2}>
          <p className="max-w-measure font-body text-body text-text-secondary">
            {t("origins.body")}
          </p>
        </GridItem>
      </PageGrid>
    </main>
  );
}
```

### Step 3 — add the copy

Open `messages/en.json` and add the namespace:

```json
"History": {
  "title": "History",
  "origins": {
    "title": "Origins",
    "body": "The India Report of 1958 …"
  }
}
```

### Step 4 — link to it

Add it to `src/lib/nav-content.ts` under the right `MENU_SECTIONS` entry (see **R7**).

### Step 5 — verify

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Check the build output line for `/[locale]/about/history` says `●`, not `ƒ`.

### Things that go wrong here

| Symptom | Cause |
|---|---|
| Page renders but text says `History.title` | The namespace isn't in `messages/en.json`, or the name is misspelled. |
| Route shows `ƒ` in the build | You used `cookies()`, `headers()`, or a dynamic API. Remove it. |
| Everything is squashed into column 1 | You wrapped content in a `<div className="flex">` instead of `<GridItem>`. |
| The margins look twice as wide | You nested a second `<PageGrid>`. There is only ever one. |

> **Async or not?** Make the page `async` only if you `await` something (`getTranslations`, a future fetch). `src/app/[locale]/home/page.tsx` is a plain sync function because it awaits nothing.

### R1b — A content-model page (the way most of the ~110 pages go)

The recipe above hand-writes the grid. A page that will one day come from the CMS does **not** — it asks `getPage()` for its data and lets the section components lay it out. A **primary** page (sitemap.json `"template": "primary"`: About, Programmes, Study at NID, Research & Publications, Consulting & Entrepreneurship, People) is a fixture, a `getPage` entry and a five-line route that renders `PrimaryTemplate` (`src/components/sections/PrimaryTemplate.tsx`, STAGE-0-NOTES §69) — copy `src/app/[locale]/study/page.tsx`. If its children are designed but unbuilt, add the path to `KEEP_UNBUILT` in `getPage.ts` so the rail and the sections' own links keep them as unlinked rows (§69, §73), and name the page in `UNLISTED_PAGES` (`nav-content.ts`) when the menu does not link it, so the back link can. Per-page presentation is a `PrimaryTemplate` prop, as on the secondary template: `clamp` (a line count per section id), `thumbMeta={false}` (Thumb tiles with the title alone), `contactsIn` (the page's contacts in a named section's column 4 instead of under the standfirst) — `src/app/[locale]/research/page.tsx` uses all three (§78) — and `subPages="below-intro"` (the sub-page links three across in columns 2–4 under the standfirst, column 1 empty beside the hero; People, §81). The template's body is the pattern below.

```tsx
const response = await getPage("/about");     // fixture now, API later
if (!response) notFound();
const { page, derived } = response;

<PageGrid>
  <Title variant="page">{page.title}</Title>
  {/* sub-page links in the rail, hero, Standfirst … */}
  {page.sections.map((section) => (
    <Fragment key={section.id}>
      <Separator />
      <SectionRenderer section={section} />
    </Fragment>
  ))}
  <Separator />
  <Footer />
</PageGrid>
```

A **grouped list of people** (the faculty directory, §82) is a `rail` section with `groupBy`, its groups built once in the data layer (`getFaculty.ts`) and delivered in `PageResponse.groupedItems`; `RailSection` draws each group's cell in column 1 beside its people three across, and never sorts or buckets. A view of a list is a PATH, never `?by=` (a query string makes the page dynamic). A page's own control — the directory's view switcher — goes in `SecondaryTemplate`'s `utility` prop, stacked under the back link. A person's page shows their square portrait above the key info (`portrait` prop) when no landscape hero exists — never the portrait stretched into the hero slot. A route whose built list comes from the CMS registers it the way the article feed and the faculty index do: one memoised index, awaited by every data function whose page gates links to it (`getPage`, `getDiscipline`, `getFaculty`), so no gate runs first (§59, §83).

A **secondary** page (a child: the campus pages, the programme pages, Admission Process) renders `SecondaryTemplate` (`src/components/sections/SecondaryTemplate.tsx`, STAGE-0-NOTES §70) from a thin route; per-page presentation — clamps, placeholders, the back link's fallback — is `SecondaryLayout` props, never a branch inside the template. A clamp is a line count per section id (`clamp: { "section-…": 7 }`), named because a board draws "See more", never applied by text length; `ClampedProse` gates it on `scripting:`, so without JavaScript the text shows whole and there is no button (§74). A sibling band whose pages are all unbuilt can keep them as unlinked rows: `KEEP_UNBUILT_BAND` in `getPage.ts`, per page (§74).

A **collection item** (an article, a discipline) is built from its record, not from a per-page fixture: `getArticle.ts`, `getDiscipline.ts`. Its route is one `[param]` folder with `dynamicParams = false`, and the same list feeds `generateStaticParams` and `registerBuiltParams`, so a link only reaches a page that was built (§59, §72).

**Proving a change left other pages alone (test R).** Build the old and new trees (`NEXT_IMAGE_UNOPTIMIZED` unset, or every image `src` differs) and compare each page's HTML: the DOM must be byte-identical, and the RSC payload's rows equal as a set, ignoring their order and row ids — two builds of the same tree reorder them (§69). If the change adds a UI string, the client messages row may differ ONLY by the added keys and must be byte-identical once they are removed (§70). Normalise the build id and the chunk hashes first, and split the payload into rows by its own framing: a text row (`T<hex length>,`) has no newline after it. **LIVE builds only** (§73): the `<body>` must be byte-identical, and the `<head>` must hold the same set of tags once `crossorigin=""` is removed from script tags — only their order may differ, because live builds already vary there. FIXTURE keeps the strict rule.

Three rules that come with it:

1. **Only `src/lib/content/` may import a fixture.** `getPage` is the seam; `npm run lint` fails on any other import (`scripts/lint-fixtures.mjs`). When the API arrives, `getPage.ts` is the only file that changes.
2. **Page prose lives in the fixture, not `messages/en.json`** — it is CMS content. `en.json` keeps UI strings only (`Page.subPages`, `Page.seeMore`, `Cards.latest`, `Footer.*`).
3. **`Title`, `Separator` and `Footer` emit their own `GridItem`s** into the page's one grid. Don't wrap them.

Map CMS sections to board slots by what they say, not by their titles: a text rule claims a CMS section by title for whichever fixture section it means (`textTitle`), the standfirst takes the first section no rule claims, and `linkBlocks: true` takes a section's portal links with its text (§74). A CMS-filled section is the CMS's whole — never mix fixture paragraphs into it. One page section may merge several CMS sections when the board draws them as one block: a `structuredKey` rule for its cards plus `bodyTitle` for its prose and `keepTitle` for the board's title (Research at NID, §78). `rejectMedia` refuses a CMS image by id (the next upload shows); `photoFallback` gives a CMS card whose photo is refused or 404s the fixture card's photo at the same route — only where the fixture's photos are copies of each record's own CMS photo (§77, §78). `introTitle` takes the standfirst from the section with that exact title rather than the first unclaimed one — use it whenever two sections tie on orderIndex, or the standfirst flips with the API's order (§81). `contactsTo: "sections"` sends each CMS contact to the section its label names (the label is the section's title, or the title plus " (…)"), and logs every contact no section claims (§80).

If the board needs a field the model doesn't have, use the closest existing field and leave a `TODO(review):` naming the proposed field. Never edit `content-model.ts` to make a page fit — it's the backend contract.

**A page that is a list of documents** (Academic Notifications today; Tenders, RTI, Careers next) is a `links` section rendered with `SecondaryLayout.documentLists`: one full-width row per document across columns 2–3, the section's `contacts` in column 4. Feed it from the CMS with a text rule plus `linkBlocks: true`: the section's LINK blocks become the items, in CMS order with CMS labels — a block with a `url` an external link, a block with no url but a `media` file a document link. Every CMS-linked file is HEAD-checked once per build and dropped if it 404s (`withServedFiles`, `getPage.ts`); fixture links are never checked. STAGE-0-NOTES §76.

### R1c — A secondary page (anything with a parent)

Same as R1b plus two things from `derived`, both already built. `src/app/[locale]/about/news-events/page.tsx` is the worked example.

```tsx
<PageGrid>
  <Title variant="page" wash="corner">{page.title}</Title>
  {derived.backNav && (
    <GridItem span="full-then-1" place="page-utility">
      <Cta variant="primary" icon="arrow-left" label={derived.backNav.label} href={derived.backNav.href} />
    </GridItem>
  )}
  {/* sections as R1b … */}
  <SiblingBand siblings={derived.siblingBand} parentTitle={…} />   {/* renders nothing when empty */}
  <Separator />
  <Footer />
</PageGrid>
```

The back-nav label is the **destination** ("About NID"), never "Back"; `arrow-left` puts itself on the left. `SiblingBand` brings its own title and separator and returns `null` when the array is empty — don't wrap it in a condition of your own.

There is no separator between the title row and the first section unless an intro block sits between them (About has one; News doesn't).

### R1d — Add a research centre

The centres are one route, `src/app/[locale]/research/[slug]/page.tsx`, on `SecondaryTemplate`, with one layout rule taken from the data: every text section gets the §77 photo box and clamps at eight lines (STAGE-0-NOTES §79). A new centre is **data only**:

1. `src/lib/content/research-centres.ts` — its slug in `BUILT_RESEARCH_CENTRES`, and in `RESEARCH_CHILDREN` too if sitemap.json gained it (that list is the landing's rail and every centre's band).
2. `src/lib/content/fixtures/research-centres.ts` — one entry in `CENTRES`: title, standfirst, hero file, contacts, sections. tsc fails until the list and the entries match. Copy the CMS's text; each section names the paragraphs of the CMS's "About" it is (`cms: [from, to]`) and `of` is that section's paragraph count.
3. Only if its CMS slug is not its route slug: one line in `PATH_BY_CMS_SLUG` (`pages.ts`). Add a floor for its document in `cms-floors.ts`.

No route file, template, component or `getPage` change. Registration with the route gate, `generateStaticParams`, the band, the merge config and the landing's tile photo all follow from the list. A centre withheld from the list (Nation Building today) stays an unlinked row everywhere and its URL is a 404.

### R1e — A Regulatory page

The Regulatory pages (`/regulatory/nid-act`, `/regulatory/annual-reports`, `/regulatory/rti`) are lists of PDFs on `SecondaryTemplate` with no board (STAGE-0-NOTES §86, §87, §89). RTI adds two opt-ins any page can use: `namedContacts: "keyInfo"` (officers named in the rail) and a fixture-held, gated index of the site's own pages (§89). Each is:

1. **Route file** `src/app/[locale]/regulatory/<page>/page.tsx`, a copy of `nid-act/page.tsx`: `backFallback="/about"`, `heroPlaceholder={false}`, `documentLists` naming its documents section, `siblingParent={REGULATORY_TITLE}`. Add the path to `BUILT_ROUTES` (`links.ts`) or `npm run lint` fails.
2. **Fixture** `src/lib/content/fixtures/regulatory-<page>.ts`: the CMS's words as sent, a `links` section of the PDFs as `targetType: "external"` links (↗, new tab, no file glyph: the one rule for every Regulatory list), `siblingBand: regulatoryBand(PATH)`. Its hero, if any, is a copy of the CMS's hero[0] in `public/regulatory/<page>/`. Register it in `FIXTURES` (`getPage.ts`).
3. **`PAGE_CONFIG`** (`getPage.ts`): the CMS slug, the standfirst's source, and `{ textTitle: "<the CMS section>", linkBlocks: true }` for the documents section. Map the slug in `PATH_BY_CMS_SLUG` (`pages.ts`) if it is not there.
4. **Floors** (`cms-floors.ts`): its section count in `documentSections`, and its LINK-block count, less a margin of one, in `documentLinkBlocks`.

The band (`REGULATORY_CHILDREN`, `regulatory.ts`) already lists all three, and an unbuilt one is an unlinked row until its route lands, so nothing else changes. A menu row is a separate decision (§86): the LIVE menu is the CMS's, and needs a CMS nav item for the slug.

### R1f — A Consulting child

The Consulting & Entrepreneurship children (`/consulting/ids` today; Continuing Education next) are secondary pages read from their own CMS documents (STAGE-0-NOTES §92). Each is:

1. **Route file** `src/app/[locale]/consulting/<page>/page.tsx`, a copy of `ids/page.tsx`: `backFallback="/consulting"`, `heroPlaceholder={false}`, the body's `clamp` at 8 lines (the landing's count). No `siblingParent`: the band is named by the fixture's `backNav`, "More in Consulting & Entrepreneurship". Add the path to `BUILT_ROUTES`.
2. **Fixture** `src/lib/content/fixtures/consulting-<page>.ts`: the CMS's words as sent, `parent: PAGE_ID.consulting`, `backNav` Consulting & Entrepreneurship, `siblingBand: consultingBand(PATH)`. CMS files (PDFs) are LIVE only; films and other external URLs may be copied. A hero the landing already has a copy of reuses that file.
3. **`PAGE_CONFIG`** (`getPage.ts`): the CMS slug (check `PATH_BY_CMS_SLUG`, and that only one document claims the page — IDS had a duplicate, §92), `intro: "heroText"` where it is a summary, `linkBlocks` on the sections that carry LINK blocks.
4. **Floors** (`cms-floors.ts`): `documentSections`, and `documentLinkBlocks` where the page lists files.

The band (`consultingBand`, from the landing's rail) and `KEEP_UNBUILT_BAND` already cover all five children: a new one links in every sibling's band, the landing's rail and Ahmedabad's Services & Centres with no other change.

### R1g — A People child

The People children (`/people/governing-council` today; Senate, Staff and Alumni next) are secondary pages read from their own CMS documents (STAGE-0-NOTES §95). Faculty is not one of them: it is built by `getFaculty`, not `getPage`. Each is:

1. **Route file** `src/app/[locale]/people/<page>/page.tsx`, a copy of `governing-council/page.tsx`: `backFallback="/people"`, `heroPlaceholder={false}`, and no `clamp` on a list of people (the list is the page). The band is named by the fixture's `backNav`, "More in People". Add the path to `BUILT_ROUTES`.
2. **Fixture** `src/lib/content/fixtures/people-<page>.ts`: the CMS's words as sent, `parent: PAGE_ID.people`, `backNav` People, `siblingBand: peopleBand(PATH)`. A body whose TEXT blocks carry `<strong>`/`<em>` is built with the adapter's own rules, `joinBlocks(blocks.map((html) => richParagraphs(html).text)).body`, so FIXTURE and LIVE cannot drift. A hero that is byte for byte the landing's reuses `/people/hero-entrance.jpg`.
3. **`PAGE_CONFIG`** (`getPage.ts`): the CMS slug (map it in `PATH_BY_CMS_SLUG`), `intro: "heroText"` where it is a summary, `textTitle` for each text section.
4. **Floors** (`cms-floors.ts`): `documentSections`; an item floor once a section lists person records.

Members as text are a stopgap: when the CMS sends person records, the page takes Senate's person-card mapping (R1h). A name in prose is never matched to a faculty page. `peopleBand` and `KEEP_UNBUILT_BAND` already cover all eight children: a new one links in every sibling's band and the `/people` rail with no other change. The People menu row links in FIXTURE only: the LIVE menu is the CMS's, and its People section has no children yet.

### R1h — A STRUCTURED person section as cards

A CMS section of `type: "STRUCTURED"` with `structuredContentType.key: "person"` (the Senate's "Senate Members with NID profiles", STAGE-0-NOTES §96) becomes a `rail` of person cards with no per-person fetch: each item already carries its name (`title`), designation (`heroText`) and portrait (`thumbnail`).

1. **Fixture**: a `rail` section (`groupBy: "none"`) whose people are copies of the CMS items in CMS order: `id` (the item's), `slug`, `name`, `designation`, and a portrait copy at `public/people/faculty/<slug>.jpg`, 288px square. Reuse a copy the site already has. Never re-sort or group the items.
2. **`PAGE_CONFIG`**: `{ structuredKey: "person" }` on that section id (`nth` if the document has two). The CMS section's title becomes the heading unless the rule says `keepTitle`. A rejected photo leaves the person without one, in place.
3. **Route**: `railThreeUp` for three across with the designation overline (the faculty pages' rail, §72). Without it the rail is two-up and shows names only. Portraits stay two across on phones (NID-CONTEXT §5.3).
4. **Floors**: `documentItems["<slug>"]` at the live count less one. A changed membership should not fail a deploy, but the list vanishing should.

A card links to `/people/faculty/<slug>` only when that member page builds (the faculty index, §83); anyone else's card is unlinked. A section whose CMS items are empty keeps the fixture's people (the per-unit fallback), and below the floor the LIVE build fails.

---

## R2 — Add a new component

**Before you build:** check `src/components/spine/` and `src/components/home/parts.tsx`. `Cta`, `Icon`, `IconButton`, `Overline`, `GradientRule`, `Tile` already exist and are probably 80% of what you need.

### The template

```tsx
// src/components/<area>/MyThing.tsx
import clsx from "clsx";
import type { ReactNode } from "react";

// One short comment saying WHAT this is and which design spec section it
// implements — e.g. "(design/NID-CONTEXT.md §7.5, node 617:28704)".
// Future you will want the node id.
export function MyThing({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      <h3 className="font-primary text-h4 text-text-primary">{title}</h3>
      {children}
    </div>
  );
}
```

### The six rules for any component

1. **Take a `className` prop and merge it with `clsx`, last.** Callers position your component; your component doesn't decide where it sits.
2. **Colours are layer-2 tokens only** (see cheat sheet §C1).
3. **Type is a `text-*` utility + a `font-*` family** (cheat sheet §C2).
4. **Never set `grid-column` yourself.** If it needs to span columns, the *caller* wraps it in a `<GridItem span={n}>`.
5. **Default to a Server Component.** Only add `"use client"` if you use `useState`, `useEffect`, `onClick`, or a browser API.
6. **Take an `as` prop if the right HTML tag depends on context** (`<section>` vs `<article>` vs `<figure>`). See `Tile.tsx`.

### Server vs client, decided in one question

> *Does it need to react to a click, keep state, or read the browser?*

- **No** → Server Component (no directive). Cheaper, ships no JS. Most components.
- **Yes** → put `"use client"` on line 1. Examples: `Header`, `ThemeSwitcher`, `MainMenu`, `GridOverlay`.

**Gotcha:** a `"use client"` file's *every* export becomes a client reference. So plain data (arrays, constants) that a Server Component needs must live in a separate non-client file — that is exactly why `src/lib/theme-constants.ts` exists separately from `ThemeProvider.tsx`.

### Where to put it

| Folder | For |
|---|---|
| `components/spine/` | used across the whole site (buttons, icons, the wordmark) |
| `components/layout/` | grid and page structure. Rarely touched. |
| `components/header/` | header, menu, theme switcher |
| `components/sections/` | the six section renderers and their shared parts (`LinkStack`, `ContactList`) |
| `components/cards/` | one card per content type (`NewsCard`, `CampusCard`, `AlumniCard`…), all on `Tile` |
| `components/home/` | home page only — except `Tile`, `TileImage` and `parts`, which everything uses |
| `components/<newpage>/` | a new area — make a folder |
| `components/swatch/` | QA page only. Don't import these elsewhere. |

---

## R3 — Add a tile to the home page

The home page is a **bento grid** of ~20 square tiles. It is deliberately *not* the editorial section model — it's a bespoke layout. Three files are involved:

```
src/lib/home-content.ts               ← WHAT and IN WHAT ORDER (structure, hrefs, dates)
messages/en.json  → "Home" namespace  ← the words
src/components/home/tiles/*.tsx       ← how one kind of tile looks
```

### Case A — a new tile of an existing kind (2 minutes)

Add an entry to `HOME_TILES` in `src/lib/home-content.ts`, in the position you want it:

```ts
{
  id: "convocation",             // stable, unique — React key and future CMS id
  kind: "mediaCard",
  media: img("convocation.jpg", "Students at the 2026 convocation.", 700, 700),
  overlineKey: "convocation.overline",
  titleKey: "convocation.title",
  date: "Dec 12 2026",
  labelPlacement: "below",
  href: "/about/news-events/convocation",
},
```

Then add the words to `messages/en.json` under `"Home"`:

```json
"convocation": { "overline": "Event", "title": "Convocation 2026" }
```

Done. `HomeGrid` picks it up automatically. Source order in the array **is** the visual order.

### Case B — a new *kind* of tile (4 steps)

**1. Add the shape** to the `HomeTile` union in `src/lib/home-content.ts`:

```ts
| (Base & { kind: "timeline"; headingKey: CopyKey; entries: { year: string; labelKey: CopyKey }[] })
```

**2. Build the component** in `src/components/home/tiles/TimelineTile.tsx`:

```tsx
import { Tile } from "@/components/home/Tile";
import type { HomeTile, Translate } from "@/lib/home-content";

type TimelineTileData = Extract<HomeTile, { kind: "timeline" }>;

export function TimelineTile({ tile, t }: { tile: TimelineTileData; t: Translate }) {
  return (
    <Tile as="section" surface="page" padding={false}>
      <h4 className="font-primary text-h5 text-text-primary">{t(tile.headingKey)}</h4>
      <ul className="mt-3 flex flex-col gap-2">
        {tile.entries.map((e) => (
          <li key={e.year} className="font-body text-caption text-text-secondary">
            {e.year} — {t(e.labelKey)}
          </li>
        ))}
      </ul>
    </Tile>
  );
}
```

**3. Wire it into the switch** in `src/components/home/HomeGrid.tsx`:

```tsx
case "timeline":
  return <TimelineTile tile={tile} t={t} />;
```

**4. Add the data** to `HOME_TILES` and the copy to `messages/en.json`.

### The `Tile` primitive — every prop

`Tile` owns the *shell* (surface, radius, padding, the square box, the pinned footer). Your tile component owns the *content*.

| Prop | Values | Default | Meaning |
|---|---|---|---|
| `as` | any tag | `"article"` | `section` for content blocks, `figure` for image/quote, `article` for cards |
| `surface` | `page` `raised` `inverse` `accent` | `raised` | `page` = flush on the page, no card. `raised` = a visible card. `inverse` = the one sanctioned dark card. `accent` = decorative bed only. |
| `square` | `true` `false` `"tablet"` `"laptop"` `"desktop"` `"max-laptop"` `"max-tablet"` | `true` | 1:1 box. `true` = at every breakpoint, phones included. A named range = only there: `"desktop"` = ≥1280 (the alumni card, which is a square at 4 columns and natural height below), `"max-laptop"` = only below 1024. |
| `stretch` | `true` `false` `"laptop"` | `false` | fill the row height set by square neighbours instead of setting it (the 2-wide hero, at ≥1024). Never `square` and `stretch` in the same range. |
| `padding` | boolean | `true` | `p-6` = 24px inset. Pass `false` to sit flush on the grid column. |
| `interactive` | boolean | `false` | adds the sanctioned colour-only hover |
| `footer` | ReactNode | — | bottom-pinned slot (a CTA), pushed down with `mt-auto` |

**Why `surface="page"` for most tiles:** in the design, most home tiles are flush text on the page background, not cards. `page` also skips `overflow-hidden`, which matters — a tall statement tile gets clipped otherwise (this actually happened; see the progress notes).

### Home tile kinds that already exist

| kind | Looks like |
|---|---|
| `statement` | big headline; every full stop rendered in the accent colour |
| `hero` | the 2-column photo |
| `linkList` | heading + list of links with meta lines ("Study at NID") |
| `calendar` / `news` | overline + hairline-separated rows + a bottom CTA. The calendar's rows are `ACADEMIC_CALENDAR` (`src/lib/content/academic-calendar.ts`), the same list /study shows — edit it there, not in `messages/en.json` (§73) |
| `feature` | gradient disc with centred serif text |
| `portrait` | overline + circular photo + name + bio |
| `pattern` | decorative craft field. Shown at every breakpoint, like the boards. |
| `mediaCard` | photo card — overlay label, label-below, or inverse (no photo) |
| `quote` | italic serif pull-quote + avatar + attribution |
| `roster` | overlapping circular avatars + heading + CTA |
| `spine` | vertical "book spine" labels + heading |

---
## R4 — Add or change text (copy)

**Rule: every sentence a human reads lives in `messages/en.json` — unless it is page content on a content-model page, which lives in that page's fixture (R1b).** The Home page, the header, the footer and every UI label are `en.json`. "The establishment of NID was a result of…" on the About page is the fixture, because the CMS will own it.

Code refers to it by a dotted key:

```tsx
const t = await getTranslations("Home");   // server component
<p>{t("study.heading")}</p>                // → messages/en.json → Home.study.heading
```

```tsx
"use client";
import { useTranslations } from "next-intl";
const t = useTranslations("Home");          // client component
```

*Why:* adding Hindi later becomes one file (`messages/hi.json`) instead of a hunt through 300 components.

### What is copy, and what is data

| Lives in `messages/en.json` | Lives in the `*-content.ts` file |
|---|---|
| Headings, body prose, link labels, button labels, captions | Proper nouns (people, campuses), email addresses, phone numbers, URLs, pre-formatted date strings, image filenames, tile order |

*Why the split:* "Sujata Keshavan" and `info@nid.edu` don't get translated. `"Read the Act"` does.

### The `Translate` pattern on the home page

The home page threads one translator down instead of every tile calling `getTranslations` itself:

```tsx
const raw = await getTranslations("Home");
const t: Translate = (key) => raw(key);       // in HomeGrid
<StatementTile tile={tile} t={t} />           // passed to each tile
```

So home content files store `textKey: "statement"`, never the sentence itself. Follow this on any new page with many small components.

---

## R5 — Add an image

### On the home page

1. Put the file in `public/home/` (or `public/about/` etc.). Web-sized — the About photos are 33–392 KB each.
2. Reference it through `mediaAsset()` from `src/lib/media.ts` — **never** write a path in a component. It is the one place the base-path prefix is applied, for Home tiles and content-model fixtures alike:

```ts
mediaAsset("/home/convocation.jpg", "Students at the 2026 convocation.", 700, 700)
//          path under public/ (leading slash)  alt (required)              w    h
```

(`home-content.ts` keeps a local `img(file, alt, w, h)` wrapper that adds the `/home/` prefix — same thing.)

3. Render it with `TileImage`:

```tsx
<TileImage
  media={tile.media}
  className="relative size-28 shrink-0 rounded-full"  // YOU set position + shape
  sizes="112px"
/>
```

### `TileImage` rules

- It uses `next/image` in `fill` mode, so **your `className` must set the position**: `relative` for a normal box, `absolute inset-0` for a full-bleed overlay. It is deliberately not in the base class so `absolute` never loses a class-order race to `relative`.
- Pass a real `sizes` hint so the browser downloads the right resolution.
- `priority` only for above-the-fold images (the hero). One or two per page, maximum.
- `backer={false}` for transparent logos — otherwise the loading tint reads as a coloured box.
- **`alt` is mandatory.** The content model refuses an image without it.

### Why paths go through `mediaAsset()`

Two reasons. First, when the CMS starts serving media, changing that one helper is the entire migration. Second, it prefixes `NEXT_PUBLIC_BASE_PATH` — without it, every photo 404s on the GitHub Pages build, because Next prefixes `_next/*` and `<Link>` hrefs but passes a raw `public/` src through untouched.

---

## R6 — Add a link or a CTA

**Decision table:**

| Destination | Use | Example |
|---|---|---|
| Another page on this site | `<Link>` from `@/i18n/navigation` | `<Link href="/about/history">` |
| An external site | plain `<a>` + `target="_blank" rel="noopener noreferrer"` | `<a href="https://…">` |
| Email / phone | plain `<a href="mailto:…">` / `tel:` | no arrow icon |
| A styled call-to-action | `<Cta>` | handles all of the above |
| An unstyled link that may be either (a menu row, a tile heading) | `<SiteLink>` from `@/components/spine/SiteLink` | `<SiteLink href={…} external={…}>` |

`SiteLink` is the one internal-or-external branch; `Cta`, the main menu and the KMC tile all render through it. Don't hand-write a second `<a target="_blank">` beside it.

**Always import `Link` from `@/i18n/navigation`, never from `next/link`.** The localised one adds the `/en` prefix automatically; `next/link` doesn't, and your link 404s the day a second locale exists.

### `Cta`

```tsx
import { Cta } from "@/components/spine/Cta";

<Cta label="All news" href="/news" />
<Cta label="Apply on the portal" href="https://admissions.nid.edu" external />
<Cta label="Read the Act" href="/about/act" icon="none" />
```

| Prop | Default | Notes |
|---|---|---|
| `label` | — | **Never contains an arrow character.** |
| `href` | — | internal path, or absolute URL with `external` |
| `external` | `false` | switches to a plain `<a>`, new tab, no locale prefix. **Internal paths must never be passed as external** — they lose the `/en` prefix and open a new tab. |
| `icon` | `"arrow-up-right"` | any `IconName`, or `"none"` |
| `variant` | `"uppercase"` | `"primary"` = the Heading/5 row with a rule in a 40px box — the six sub-page links in the rail, the section CTAs, the back-nav. `"uppercase"` = the small button-style label the Home tiles use. |
| *(icon side)* | derived | `arrow-left` renders **before** the label at 24px; every other icon after it. There is no `iconPosition` prop on purpose — the content model says the icon is derived, never authored. |
| `hoverLabel` | `true` | `false` where the design moves only the underline on hover (the roster CTA); the caller then supplies its own `hover:border-*`. |

For links that come from the content model, don't build these props by hand — `ctaProps(link)` in `src/lib/content/links.ts` derives `href`, `external` and `icon` from `Link.targetType`, and `LinkStack` in `components/sections/parts.tsx` renders a whole rail of them.

### The icon rules (from the design spec, non-negotiable)

| Kind of link | Icon | Side |
|---|---|---|
| Back-navigation | `arrow-left` | left |
| To a page, document, or external site | `arrow-up-right` | right |
| Email or telephone | none | — |

A back link **names its destination** — `"About NID"`, not `"Back"`. The arrow already says "back".

> ⚠️ **Not built yet:** `Cta` always renders the icon *after* the label. Passing `icon="arrow-left"` gives you a left-pointing arrow on the right-hand side, which is not what the spec asks for. Back-navigation needs an `iconPosition` prop (or its own component) before the secondary-page template lands. Don't work around it with a hand-rolled link.

### `IconButton` — for icon-only buttons

```tsx
<IconButton icon="search" label="Search" size="small" />
```

`label` is required (it becomes `aria-label` — the button has no visible text). Sizes: `medium` 32px, `small` 24px.

### Available icons

`arrow-up-right` · `arrow-left` · `caret-down` · `search` · `menu` · `sun` · `moon` · `x` · `plus` · `facebook` · `instagram` · `youtube`

**Adding one:** add the name to the `IconName` union in `src/components/spine/Icon.tsx` and the paths to the `ICONS` map. Use `currentColor`, never a hard-coded fill — an icon with its own fill ignores its parent's colour and breaks in nine of the ten themes. Size comes from `className` only.

---

## R7 — Add an entry to the main menu

Edit `MENU_SECTIONS` in `src/lib/nav-content.ts`:

```ts
{
  id: "about",
  title: "About NID",                       // NOT a link — it's a disclosure button
  links: [
    { label: "History", href: "/about/history" },
    // add here
  ],
},
```

**Section titles are buttons, not links** (design spec §7.4). Only the nested page links navigate. Nothing in the menu is underlined, in any state, and hover is a colour change only.

Menu labels are page titles = data, so they live here, not in `messages/en.json`.

A row on another site is `{ label, href: "https://…", external: true }`: it opens in a new tab and the back link never names it. The KMC rows and Alpavirama are the ones today. In a LIVE build the menu is the CMS's, whole: these static sections show only in FIXTURE builds, and the build summary's `MENU` line names the sections the CMS menu lacks (a CMS `NavItem` has no URL field, so it cannot carry an external row at all).

- **KMC is external, a separate project; don't build /kmc.** Every KMC link opens its nid.edu page (`src/lib/kmc.ts`), and `/kmc/*` redirects there (`next.config.ts`, STAGE-0-NOTES §85).
- **There is no `/events` route.** News & Events (`/about/news-events`) is the page for news and events, and every event article lives at `/about/news-events/[slug]` beside the news, in the event layout (decided by the record's type, not its URL). `/events` is not redirected; don't add an `/events` page or link (STAGE-0-NOTES §85).

*Later:* when the CMS exists, this whole file is replaced by a recursive `Page.parent` query. There is no menu table — the page tree **is** the menu.

---

## R8 — Add a theme

1. Add the name to `THEMES` in `src/lib/theme-constants.ts`.
2. Add its 65-primitive block to `src/styles/themes.css` — or, better, put the Figma extract into `design/_raw_primitives.txt` and run `npm run generate:tokens`.
3. Add a motif PNG to `design/assets/motifs/<Name>.png` and run `npm run generate:motifs`.
4. Add a label to `THEME_LABELS` in `src/lib/nav-content.ts`.
5. `npm run verify:tokens`.

**Scoped themes — two modes.** Putting theme attributes on *any* element re-themes everything inside it, independently of the page. There are two ways to do it and they mean different things:

| You set | You get | Used by |
|---|---|---|
| `data-theme` **and** `data-appearance` | a fully pinned state — that theme, that appearance, regardless of the page | `/swatch` (all 20 states at once), the theme dropdown's motif rows |
| `data-theme` **alone** | that theme, in *the visitor's* light/dark choice | Our Themes' ten cards |

The second mode did not work until Sep 2026 — the semantic layer is keyed by appearance and custom properties resolve where they are *declared*, so a descendant inherited semantics already baked against the ancestor's theme. `design/generate.py` now also emits `[data-appearance="X"] [data-theme]:not([data-appearance])`. **The `:not()` is load-bearing**: without it the descendant selector out-specifies a plain `[data-appearance]` and would override elements that pin both. Six assertions in `verify:tokens` cover all four combinations (STAGE-0-NOTES; the scoping section).

---

## R9 — Add a language

1. Add the code to `locales` in `src/i18n/routing.ts`.
2. Create `messages/<code>.json` with the same key structure as `en.json`.
3. For Hindi: also add a Devanagari fallback to the font stacks — neither Futura PT nor Tonos covers the script.

That's it. The `[locale]` segment, the middleware, and every `<Link>` already handle the rest.

---
# CHEAT SHEETS

---

## C1 — Colour

**These 27 are the only colours a component may name.** Each is a *job*, not a colour. The right one is chosen by asking "what is this element for?", never "what colour do I want?".

### Surfaces — `bg-*`

| Utility | Use for |
|---|---|
| `bg-surface-page` | the page background |
| `bg-surface-raised` | a card sitting on the page |
| `bg-surface-hover` | the hover state of a raised card |
| `bg-surface-inverse` | the one sanctioned dark card (light text on it) |

### Text — `text-*`

| Utility | Use for |
|---|---|
| `text-text-primary` | body text, headings — the default |
| `text-text-secondary` | supporting text, link labels at rest |
| `text-text-tertiary` | meta lines, overlines, dates |
| `text-text-quaternary` | ⚠️ **deliberately below WCAG AA.** Decorative only. Not a bug. |
| `text-text-on-accent` | text on an inverse or accent surface |

### Icons — `text-icon-*`

`text-icon-primary` · `text-icon-secondary` · `text-icon-tertiary` · `text-icon-quaternary` · `text-icon-on-accent`
(same ladder as text; `icon-quaternary` is likewise deliberately low-contrast)

### Borders — `border-*`

| Utility | Use for |
|---|---|
| `border-border-faint` | list-row hairlines |
| `border-border-subtle` | card outlines, CTA underline at rest |
| `border-border-default` | CTA underline on hover |
| `border-border-strong` | focus rings |
| `border-border-primary` | emphasis rules |

### Accents

| Utility | Contrast | Use for |
|---|---|---|
| `accent-primary` | ✅ clears 3:1 | **the only accent allowed to carry meaning** — hover colour, focus ring, the statement full stops |
| `accent-strong` | | the filled-button accent |
| `accent-subtle` | | pale tints, image loading backers |
| `accent-muted` | | mid tints |
| `accent-secondary` `accent-tertiary` `accent-quaternary` `accent-pentenary` | ❌ decorative only | gradients, patterns, the brand strip. **Never** an icon or graphic that means something. |

### The three colour mistakes

| ❌ Wrong | ✅ Right | Why |
|---|---|---|
| `text-[#1a1a1a]` | `text-text-primary` | breaks all 20 states at once; `npm run lint` fails |
| `bg-primary-650` | `bg-surface-inverse` | that's a layer-1 primitive — it hard-codes one theme and inverts wrongly in dark mode |
| `text-accent-tertiary` on a meaningful icon | `text-accent-primary` | tertiary doesn't clear 3:1 |

> Layer-1 primitives (`bg-primary-450`, `bg-tertiary-300`…) exist **only** for foundations/documentation pages like `/swatch`. If you want one in a real component, the semantic token you actually need is missing — add it, don't reach past the layer.

---

## C2 — Typography

Always pair **a family** with **a size utility**.

### Families

| Utility | Font | Use for |
|---|---|---|
| `font-primary` | Futura PT | headings, labels, navigation, UI — the workhorse |
| `font-primary-display` | Futura PT Bold | display headings |
| `font-secondary` | Bodoni PT | serif display, pull-quotes |
| `font-body` | Tonos | running body copy, captions |

### Sizes — all 22

| Utility | Typical use |
|---|---|
| `text-display-serif` | big serif statement (Bodoni) |
| `text-display-serif-card` | serif inside a card |
| `text-display-quote` | pull-quote |
| `text-h1` … `text-h6` | headings. `h1` = page title; `h5`/`h6` = card and link labels |
| `text-overline` | small uppercase label above a block |
| `text-meta` | metadata line |
| `text-label` | list-row labels |
| `text-button` | CTA labels (uppercase) |
| `text-micro` | smallest meta line |
| `text-body-lg` / `text-body-lg-bold` | standfirst / intro paragraph |
| `text-body` / `text-body-bold` / `text-body-italic` | running copy |
| `text-caption` / `text-caption-bold` / `text-caption-italic` | captions, bios |

**Each of these carries size + line-height + letter-spacing + weight, and all four change per breakpoint.** That is why you never add your own `font-size` — you'd keep the desktop value on a phone.

Letter-spacing values are in `em`, never `%`. Percentages are invalid CSS here and get silently dropped.

---

## C3 — Grid, spacing and shape

### The four breakpoints

| Name | Width | Columns | Margin | Gutter |
|---|---|---|---|---|
| (mobile) | < 768 | **1** | 16px | 16px |
| `tablet:` | ≥ 768 | **2** | 24px | 20px |
| `laptop:` | ≥ 1024 | **3** | 24px | 24px |
| `desktop:` | ≥ 1280 | **4** | 24px | 24px |

There is no `sm:` `md:` `lg:` `xl:` — they are deleted from the theme.

### `GridItem span` — what each becomes

| `span` | desktop (4col) | laptop (3col) | tablet (2col) | mobile (1col) |
|---|---|---|---|---|
| `1` | 1 col | 1 col | 1 col | full |
| `2` | 2 cols | 2 cols | full | full |
| `3` | 3 cols | full | full | full |
| `4` | full | full | full | full |

**Columns drop right-to-left. Nothing is ever reordered.** If something ever has to disappear on small screens, that is a *drop* (`hidden laptop:block`), never a reorder — and only for decorative content. Nothing on the home page does this any more.

**Two named spans exist** for shapes the boards reshape instead of clamping: `span="full-then-1"` (full row below 1024, one column above — the Home position statement, and every section title) and `span="hero"` (full below 1024, two columns at 1024, three at 1280 — the About hero). Both are a base utility plus breakpoint-scoped overrides, so the winner is decided by media range, never by class order. Add new shapes to the `SPAN` table in `GridItem.tsx`; don't compose them with `className`.

**`start` names a column when flow would pick the wrong one.** Only at 3 columns and up — at 1 and 2 there is no rail, so auto-placement is always right.

| `start` | Effect |
|---|---|
| `1` | column 1 at ≥1024. Put it on the first thing after the page title so it opens row 2 instead of floating up beside the title. |
| `2` | column 2 at ≥1024. The intro paragraph, whose rail cell is empty. |
| `"2-laptop"` | column 2 at 1024 only. A card that wraps at 3 columns stays in the field instead of dropping into the rail. |
| `"2-desktop"` | column 2 at ≥1280 only. |
| `"2-hero"` | column 2 at ≥1024, for `span="hero"`. Plain `2` does not hold there at ≥1280: the span's `desktop:col-span-3` is the `grid-column` shorthand and resets the start to auto (§81). |

If you find yourself wanting a `start` at 1 or 2 columns, the section is in the wrong source order.

**Pinned slots — `place`.** A thing that sits in a named cell at 3–4 columns but flows naturally below is source-ordered for the small screens and *pinned* for the large ones, never reordered.

| `place` | Pins to | Used by |
|---|---|---|
| `"page-utility"` | last column of **page** row 1 at 3 and 4 columns; full width straight after the title below | the back-nav |
| `"utility"` | last column of a **section's** row 1 at 4 columns, column 1 of its row 2 at 3 | "All News & Events", "Visit Student Awards Gallery" |
| `"rail"` | column 1 of a section's row 2 at 4 columns | the pattern tiles beside a card row |

Section-level pins need `subgrid` on the section (a full-row item whose columns are the page's own tracks — the only way to name a row, because the page grid's rows are implicit). `CardsSection` is the worked example. `subgrid` composes with `span`, so a *card* can be a subgrid too — that is how the feature news card gets a photo exactly two tracks wide and a text column exactly one, with no width utility and no height set. This is the one sanctioned way a section may wrap its children; a section that hand-rolls its own `grid` breaks the label rail.

**Cards never enter the rail at 3 columns.** Column 1 holds titles and pattern tiles only. A card that wraps at 3 columns gets `start="2-laptop"`; `startOf` / `startBelowLead` in `sections/parts.tsx` compute it for a row of cards.

**Section separators** (`<Separator />`) are a 24px empty row with no hairline — the space between sections is that row plus the grid gap either side. Shown at 2 columns and up, dropped on phones (the 768 board draws them; the 390 board doesn't).

> Never hand-write `grid-column: span min(2, var(--nid-grid-columns))`. `span` requires an integer literal; the `min()` is dropped by every browser and every span silently becomes 1. `GridItem` exists to solve exactly this.

### Spacing

`--spacing` is pinned to **4px**, so Tailwind's scale is exact:

| Class | Pixels |
|---|---|
| `p-1` / `gap-1` | 4 |
| `p-2` | 8 |
| `p-3` | 12 |
| `p-4` | 16 |
| `p-6` | **24** ← the standard tile inset |
| `p-8` | 32 |
| `p-12` | 48 |

Grid-bound aliases (already applied by `PageGrid`, rarely needed by hand): `px-margin` · `gap-x-gutter` · `gap-y-rowgutter`.

### Widths

| Class | Value |
|---|---|
| `max-w-shell` | **1440px — the only cap.** Below it the shell is fluid: full viewport width minus the page margin. Above it, content centres with space either side. |
| `max-w-content` | the content width |
| `max-w-measure` | **684px** — cap for intro/standfirst paragraphs |

### Radius — only three tokens exist

| Class | Value | Use |
|---|---|---|
| `rounded-none` | 0 | default |
| `rounded-pill` | 24px | buttons, cards, the theme dropdown |
| `rounded-hero` | 64px | one corner of one hero image per page |
| `rounded-full` | — | Tailwind's own, for circles (avatars). **There is no circle token.** |

### Motion

The only sanctioned transition:

```
transition-colors duration-150 ease-in-out
```

- No transforms on hover.
- The theme swap is **instant** — no cross-fade. 65 custom properties change at once and a fade judders.
- Menu expand/collapse is instant — no height animation.
- Gate animated patterns behind `prefers-reduced-motion`.

### Two Tailwind v4 gotchas

- Gradients are **`bg-linear-to-r`**, not `bg-gradient-to-r` (v3 syntax; silently does nothing).
- `design/tokens/tailwind.config.ts` is **superseded** — it's v3 format. The live mapping is the `@theme` block in `src/app/globals.css`.

---

## C4 — Components you already have

| Component | Import from | What it does |
|---|---|---|
| `PageGrid` | `@/components/layout/PageGrid` | the page shell + the one grid |
| `GridItem` | `@/components/layout/GridItem` | one grid cell, `span={1..4}` |
| `Cta` | `@/components/spine/Cta` | text link with arrow in its own slot |
| `Icon` | `@/components/spine/Icon` | inline SVG, `currentColor`, `aria-hidden` |
| `IconButton` | `@/components/spine/IconButton` | circular icon-only button |
| `Wordmark` | `@/components/spine/Wordmark` | the NID mark (`full` / `compact`) |
| `BrandStrip` | `@/components/spine/BrandStrip` | the full-bleed craft band |
| `Header` | `@/components/header/Header` | already in the layout — don't add it per page |
| `Title` | `@/components/spine/Title` | `variant="page"` = the H1 across columns 1–2 with a gradient wash behind it (desktop only; `wash="polygon"` default, `"corner"` on News). `variant="section"` = the label-rail H2. Emits its own `GridItem`. |
| `SiblingBand` | `@/components/sections/SiblingBand` | "More in {parent}" + the sibling links two-up in cols 2–3, from `derived.siblingBand`. Returns `null` when empty, separator included. |
| `BackNav` | `@/components/spine/BackNav` | The page utility slot's back link. Takes **no props** — it reads a per-tab trail and names the page the visitor came *from*. Client component: the slot is empty in the HTML and fills on hydration, and renders nothing on a direct load. ⚠️ This replaced `derived.backNav` (the parent in the tree); see the open question in `OUR-THEMES-PROGRESS.md`. |
| `ThemeCard` | `@/components/themes/ThemeCard` | One theme's row on Our Themes. Sets `data-theme` only (see R8's two modes). Internal layout is flex — **not** a subgrid, because the card's padding puts its parts 24px left of the page columns. |
| `Separator` | `@/components/spine/Separator` | the 24px empty row between sections. Emits its own `GridItem`. |
| `Standfirst` | `@/components/spine/Standfirst` | the intro paragraph; clamps to 7 lines behind "See more" on phones. Client component. |
| `Footer` | `@/components/spine/Footer` | the site footer — four `GridItem`s. Render it inside the page's grid after a `Separator`, never in the layout. |
| `SecondaryTemplate` | `@/components/sections/SecondaryTemplate` | a child page's whole body from a path: title + back link, key-info rail and filled rail buttons, hero, standfirst, sections, sibling band. `SecondaryLayout` props carry the per-page presentation. |
| `StudentWorkSection` | `@/components/sections/StudentWorkSection` | a discipline's works: prose, the first work as a feature (panel in column 1, image in 2–4), the rest as Thumbs three across (§72). |
| `NoticesSection` | `@/components/sections/NoticesSection` | a cards section whose items are all `NoticeEntry` (`editorial.ts`): title in column 1, unlinked `LinkedRow`s (title over a display date) in columns 2–3, links in the utility slot (§73). |
| `GroupedCards` | `@/components/sections/GroupedCards` | a cards section that arrives grouped (`groupedItems`): group title in column 2, Thumbs two across in 3–4. |
| `PrimaryTemplate` | `@/components/sections/PrimaryTemplate` | a primary landing page's whole body from a `PageResponse` — title, sub-page rail, hero, standfirst, separated sections, footer. `thumbs="three-up"` sets Thumb cards across columns 2–4 (Programmes). A section photo gets no craft tile beside it, and a text section's links go by the utility rule (`GridItem place="flow-utility"`), never into a free cell beside a photo (§73). |
| `SectionRenderer` | `@/components/sections/SectionRenderer` | `section` → `TextSection` / `LinksSection` / `CardsSection`; renders nothing for an empty section. `files` / `rail` / `mosaic` are still `null` (Stages 3–5). `CardsSection` takes `lead="wide" \| "feature"` for its first card. |
| `LinkStack`, `ContactList` | `@/components/sections/parts` | a rail of `primary` CTAs from content-model links (`twoUp="tablet-only"` for a rail, `"tablet-up"` for a band); a rail of contacts |
| `LinksSection` | `@/components/sections/LinksSection` | a `links` section: `flow` (one link per column), `two-up` (two across in columns 2–3) or `documents` (one full-width row each in columns 2–3, §76). The two column-2–3 layouts draw the section's contacts in column 4. |
| `NewsCard` `CampusCard` `AlumniCard` | `@/components/cards/*` | the three card types on `Tile`. `NewsCard` has `square`, `wide` and `feature` (3 columns, nested subgrid). `AlumniCard` is a square at 4 columns and the Person shape below. |
| `Tile` | `@/components/home/Tile` | the base card primitive |
| `TileImage` | `@/components/home/TileImage` | `next/image` wrapper |
| `PatternTile` | `@/components/home/tiles/PatternTile` | a square of one pattern field; with `cta`, a row of it above and below a centred CTA |
| `Overline` | `@/components/home/parts` | uppercase label + gradient hairline |
| `GradientRule` | `@/components/home/parts` | the fading hairline |
| `GradientWash` | `@/components/home/parts` | diagonal gradient triangle; `shape="polygon"` is the outline behind the page title |
| `getPage()` | `@/lib/content/getPage` | the content seam — `Promise<PageResponse \| null>` |
| `mediaAsset()` | `@/lib/media` | the one place an image path becomes a `MediaAsset` |
| `useTheme()` | `@/components/theme/ThemeProvider` | `{ theme, appearance, setTheme, setAppearance }` — client only |

---

## C5 — The content model (for CMS-backed pages, later)

`src/lib/content-model.ts` is **the contract with the backend developer. Never edit it unilaterally.**

The one idea: **a page is not a layout.** A page is a few fixed fields plus an ordered list of *sections*, and each section declares a type that decides how it renders.

**Six section types, and there will not be a seventh:**

| Type | Renders |
|---|---|
| `text` | title + body + optional image |
| `links` | a grid of links |
| `cards` | thumbnail cards (disciplines, programmes, pages) |
| `files` | a list of documents |
| `rail` | a grouped directory (people) — `groupBy` required |
| `mosaic` | month-grouped news — `groupBy` required |

> Before adding a seventh, check whether it's a `text` section with a different field filled in. That's almost always the answer.

**Two rules the front end must enforce:**

1. **Refuse to render a section with no content.** If `body`, `image`, `links[]` and `items[]` are all empty, render nothing. An empty scaffold reads as neglect, not brevity.
2. **When `groupBy` is set, the data arrives already grouped.** Never sort a flat list into buckets on the client — the group label is a rendered element with its own place in the grid.

**One page = one request.** The server returns the page, its sections in order, and every section's items already resolved and grouped. If the front end needs a second call to find out what a section contains, the model has leaked into the client.

---
# THE REST

---

## 10. Generated files — never hand-edit

An edit to any of these is reverted, silently, by the next regeneration run.

| File | Regenerate with | Real source |
|---|---|---|
| `src/styles/themes.css` | `npm run generate:tokens` | `design/generate.py` + `design/_raw_*.txt` |
| `src/lib/font-manifest.json` | `npm run generate:tokens` | `design/generate.py` (`BODY_FACE`) |
| `src/components/header/motifs/*.tsx` | `npm run generate:motifs` | `design/assets/motifs/*.png` |
| `src/components/home/patterns.tsx` | `npm run generate:patterns` | `design/assets/patterns/home-patterns.json` — the pattern units as rectangles per design hex. To change a pattern, read the tile from Figma, update the JSON, regenerate. |

**Use `npm run generate:tokens`, not `python3 design/generate.py`.** The npm script regenerates *and* copies the outputs into `src/`. Running the Python directly leaves the app's copy stale, and nothing but `npm run verify:parity` will ever tell you.

Also treat as read-only:

- `src/lib/content-model.ts` — the backend contract.

The Figma Make export that used to live at `design/reference/` is gone (STAGE-0-NOTES §31). The Figma MCP is the way to read the design now.

---

## 11. Before you commit — the checklist

```bash
npx tsc --noEmit          # strict, with noUncheckedIndexedAccess
npm run lint              # ESLint + the no-literal-hex rule
npm run build             # your route must be ○/● (static), never ƒ
```

Plus, depending on what you touched:

| If you touched… | Also run |
|---|---|
| `themes.css`, `globals.css`, `PageGrid`, `GridItem` | `npm run verify:tokens` |
| `design/generate.py` or anything in `design/tokens/` | `npm run generate:tokens` then `npm run verify:parity` |
| fonts | `npm run verify:fonts` |
| anything visual | `npm run screenshot`, or check at 1440 / 1024 / 768 / 390 by hand |

**Also check by eye:**

- [ ] Toggle to **dark** in the header. Still readable?
- [ ] Try two or three other themes. Nothing hard-coded?
- [ ] Resize to phone width. Does it reflow, with no horizontal scroll?
- [ ] Tab through it. Is the focus ring visible?
- [ ] Every image has real `alt` text.

---

## 12. Error messages, decoded

| What you see | What it means |
|---|---|
| `Literal hex colours found outside src/styles/themes.css` | You wrote a `#hex` in a component. Use a layer-2 token (§C1). |
| Route shows `ƒ` in the build output | Something called `cookies()` / `headers()` / a dynamic API. The whole app just opted out of static rendering. |
| `useTheme must be used inside ThemeProvider` | A client component using `useTheme()` is rendering outside the provider tree. |
| Your `md:` / `lg:` class does nothing | Those breakpoints don't exist here. Use `tablet:` `laptop:` `desktop:`. |
| Your gradient doesn't appear | Tailwind v4 uses `bg-linear-to-r`, not `bg-gradient-to-r`. |
| Text renders as the key (`Home.study.heading`) | Key missing from `messages/en.json`, or the namespace passed to `getTranslations` is wrong. |
| Everything spans one column | A grid child isn't a `GridItem` — or you hand-wrote `span min(...)`, which collapses every span to 1. |
| Margins look doubled | Two `PageGrid`s nested. |
| An `<svg>` won't stretch to its box | SVG is a replaced element — absolute insets alone don't size it. Wrap it in a sized `<div>`. |
| An icon stays one colour across themes | It hard-codes a `fill`. Change it to `currentColor`. |
| A theme-scoped element looks half-right | You set `data-theme` but not `data-appearance`. Both are needed. |
| Fonts don't load locally | Almost always the Typekit kit's domain allowlist, not the code. Don't substitute a Google font. |
| Locally, every CMS image is missing (article heroes gone, archive/award thumbnails blank or broken), and the dev server logs `upstream image … hostname resolved to private IP ["64:ff9b::…"]` | Your network uses DNS64/NAT64: the CMS host resolves to a `64:ff9b::` address, which Next 16's image optimizer refuses as private, so `/_next/image` answers 400 and `HideOnImageError` removes the hero. Not a code or CMS fault — on Vercel the host resolves normally. Add `NEXT_IMAGE_UNOPTIMIZED=1` to `.env.local` (it sets `images.unoptimized` in `next.config.ts`, so the browser loads images straight from the CMS). Never set it on Vercel, and don't reach for `dangerouslyAllowLocalIP`. Unset it (`NEXT_IMAGE_UNOPTIMIZED= npm run build`) when you compare built HTML against a baseline: it changes every image's `src`. |
| The site deployed with most news links dead, only two news articles, or pages showing placeholder copy | A FIXTURE build, or (before 24 Sep 2026) a LIVE build that lost the CMS and fell back silently. Look for the `FIXTURE BUILD` banner or the summary box's `MODE` line in the Vercel build log. Set `CMS_API_URL` for that environment and redeploy. |
| `[cms] BUILD REFUSED — CMS_API_URL is not set, and this build requires the CMS (…)` | A production build (or `CMS_REQUIRED=true`) with no CMS configured. Add `CMS_API_URL` to that environment's variables. Nothing is wrong with the code. |
| `[cms] FETCH FAILED — /public/content/<slug>: HTTP 404` (or `no response in 10s, 3 attempts`) | `CMS_API_URL` is set, so the build is LIVE, and one document didn't arrive. The message names the floors that count that document. A timeout has already been retried twice (§84), so three in a row means the CMS is down or stuck, not slow: check it, then redeploy. A 404 means the document was removed or renamed in the CMS. To build without the CMS on purpose, unset `CMS_API_URL`. |
| The deploy is older than `main`: pages you merged (the faculty directory, member pages…) 404 in production | First find out whether it is. `vercel ls x-website` lists every deployment; `049cda7`-era deploys took about 3 minutes, so a page probed while its deploy builds 404s for those minutes. A deploy marked **Error** left production on the one before it: open its build log and decode the error with this table (on 24 Sep 2026 it was a `tsc` error). Every push to `main` deploys to production with no promotion step, so a Ready deploy of the latest commit *is* production. Also check the probe: `/people/faculty/by/discipline` is not a route (Discipline is `/people/faculty`, §82), and a member slug 404s unless it is on the CMS `faculty` list (§83). |
| `[cms] FLOOR NOT MET — <what>: expected at least N, got M (from <document>)` | The CMS answered, but with less than the site is built to show: an empty or unpublished list, a deleted section. Fix the content in the CMS. If the drop is intended, lower that number in `src/lib/content/cms-floors.ts` and say why in the commit. |
| `screenshot needs a FIXTURE build and .next/ holds a LIVE one` | You ran `node scripts/screenshot.mjs` after a normal build. Use `npm run screenshot`, which builds the right mode. |
| Every CMS image is broken locally; the server logs `upstream image … hostname resolved to private IP ["64:ff9b::…"]` | Your network is IPv6-only (NAT64 / CLAT46 — phone hotspots, some ISPs). See *CMS images refused on an IPv6-only network* below. |

### CMS images refused on an IPv6-only network

```
⨯ upstream image https://nidapi.smartdiner.co/media/… hostname resolved to private IP ["64:ff9b::a890:7870"] If this is expected and you understand SSRF risk, use images.dangerouslyAllowLocalIP = true to continue.
```

**What is happening.** The CMS host publishes only an IPv4 (A) record; on a NAT64/CLAT46 network
the OS synthesises an IPv6 address for it in the `64:ff9b::/96` prefix, Node's DNS lookup
returns that synthesised address, and Next's image optimiser refuses it as a private IP. The CMS
is never contacted — the browser gets a **400** (`"url" parameter is not allowed`) from
`/_next/image` in tens of milliseconds, for every CMS image, while images from `public/` load.

**What it is not.** Not a missing `remotePatterns` entry — the 400 looks exactly like one, which is
the trap; the server log is what tells them apart. Not a rate limit, and not a CMS fault: the same
URLs load in a browser, and on Vercel, whose resolvers return the real IPv4 address.

**What to do.** Run on a network with IPv4 (office Wi-Fi, most home broadband). Check with
`ifconfig en0` — a `nat64 prefix 64:ff9b::` line means you are on one of these networks.

- **Not the fix: `images.dangerouslyAllowLocalIP`.** `next.config.ts` turns it on only while a CMS
  media host is loopback. Setting it for this would trade an SSRF guard for one Wi-Fi network,
  permanently, in the committed config.
- **Tried, does not help: `NODE_OPTIONS=--dns-result-order=ipv4first`.** It reorders the lookup
  (the A record comes first) but the optimiser still refuses — it checks every resolved address,
  and the synthesised one is still among them. Measured 21 Sep 2026, Next 16.3.2.

---

## 13. Where the project is now

Foundations (tokens, theming, grid, type) are **done and proven**. The home page is built (now at `/`), with the menu drawer and the real footer. **About NID is built** — the first page through the content model, and the template for every primary page (R1b). **News & Events is built** — the first secondary page, with the back-nav and sibling band every page with a parent inherits (R1c). **Our Themes is built** — and paid for the fix that makes `data-theme` alone re-theme (R8). See `ABOUT-PAGE-PROGRESS.md`, `NEWS-EVENTS-PROGRESS.md` and `OUR-THEMES-PROGRESS.md` for open decisions.

**Build order:** Stage 0 foundations ✅ → **Stage 1: the spine** (CTA ✅, Icon Button ✅, Header ✅, Title ✅, Footer ✅, `type=text` ✅, `type=links` ✅) → Stage 2 cards (`type=cards` ✅ for news / campus / alumni; `Thumb` for disciplines and programmes still to do) → Stage 3 people (`type=rail`) → Stage 4 documents (`type=files`) → Stage 5 news (`type=mosaic`).

*Why news last:* it's the only collection with continuous editorial churn, so it's the one most likely to change under you.

**Not yet built:** `type=files`, `type=rail`, `type=mosaic` (the renderer returns `null` for them), `Thumb`, back-navigation (`Cta` still has no `iconPosition`), the secondary-page template (back-nav + utility slot), search, and any CMS call. The content-model gaps found on About are listed in `ABOUT-PAGE-PROGRESS.md` and need the backend developer.

---

## 14. Glossary

| Term | Meaning |
|---|---|
| **Token** | A named design value (`--nid-text-primary`) instead of a raw one (`#1a1a1a`). |
| **Primitive / layer 1** | One of the 65 raw colours per theme. Not for components. |
| **Semantic token / layer 2** | One of the 27 named *jobs* ("secondary text"). The only colours a component may use. |
| **Theme** | One of ten craft palettes: peacock (default), lotus, indigo, henna, yoga, tanjore, khadi, terracotta, ikkat, tiger. |
| **Appearance** | Light or dark. Independent of theme — 10 × 2 = 20 states. |
| **Server Component** | Renders at build time, ships no JavaScript. The default here. |
| **Client Component** | Has `"use client"` on line 1. Needed for state, effects, and click handlers. |
| **SSG / static** | Pages built once at build time. Shows as `○`/`●` in the build output. |
| **Bento** | The home page's grid of square tiles of mixed content. |
| **Motif** | The 32×32 craft artwork representing each theme in the switcher. |
| **Brand strip** | The full-bleed decorative craft band above and below the page. |
| **Spine** | `src/components/spine/` — the primitives used site-wide. |
| **Swatch page** | `/en/swatch`. Internal QA surface showing every token in every state. Never indexed. |
| **Utility slot** | The last cell of row 1 on a page — back-nav or a filter control. Leaves the row below 3 columns. |
| **Label rail** | Column 1, where every section title on the page sits. The reason a page is one grid. |
| **Standfirst** | The opening paragraph of a page. Capped at 684px (`max-w-measure`). |

---

*Last updated: 7 September 2026 (Our Themes build). When something here goes stale, fix it here — this file is meant to be the first thing a new developer reads.*
