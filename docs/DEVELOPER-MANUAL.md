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
│   │       ├── about/page.tsx       ← "/about" — the primary-page template (R1b)
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
| `npm run build` | production build | before every commit |
| `npm run verify:tokens` | 627 assertions in a real browser: all 20 theme states, the grid at the four artboard widths **and** at 1600 / 1200 / 900 / 430 between them | after touching `themes.css`, `globals.css`, `PageGrid`, `GridItem` |
| `npm run verify:parity` | checks `design/tokens/*` still matches its `src/` copy | fast; runs inside `verify:tokens` |
| `npm run verify:fonts` | confirms all four font families actually loaded | after font changes |
| `npm run screenshot` | writes `docs/screenshots/{swatch,home,about}-{1440,1024,768,390}.png` | visual review |
| `npm run generate:tokens` | regenerates `themes.css` + `font-manifest.json` **and copies them into `src/`** | after editing `design/generate.py` |

**Two pages worth knowing:**

- `/en/swatch` — every token, every theme, the grid proof, the type specimen, on one page. Fastest way to check a token change.
- Press **`g`** on any page in dev to toggle a translucent column ruler.

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

The recipe above hand-writes the grid. A page that will one day come from the CMS does **not** — it asks `getPage()` for its data and lets the section components lay it out. `src/app/[locale]/about/page.tsx` is the worked example; copy it.

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

Three rules that come with it:

1. **Only `src/lib/content/` may import a fixture.** `getPage` is the seam; `npm run lint` fails on any other import (`scripts/lint-fixtures.mjs`). When the API arrives, `getPage.ts` is the only file that changes.
2. **Page prose lives in the fixture, not `messages/en.json`** — it is CMS content. `en.json` keeps UI strings only (`Page.subPages`, `Page.seeMore`, `Cards.latest`, `Footer.*`).
3. **`Title`, `Separator` and `Footer` emit their own `GridItem`s** into the page's one grid. Don't wrap them.

If the board needs a field the model doesn't have, use the closest existing field and leave a `TODO(review):` naming the proposed field. Never edit `content-model.ts` to make a page fit — it's the backend contract.

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
  href: "/events/convocation",
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
| `calendar` / `news` | overline + hairline-separated rows + a bottom CTA |
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
| `SectionRenderer` | `@/components/sections/SectionRenderer` | `section` → `TextSection` / `LinksSection` / `CardsSection`; renders nothing for an empty section. `files` / `rail` / `mosaic` are still `null` (Stages 3–5). `CardsSection` takes `lead="wide" \| "feature"` for its first card. |
| `LinkStack`, `ContactList` | `@/components/sections/parts` | a rail of `primary` CTAs from content-model links (`twoUp="tablet-only"` for a rail, `"tablet-up"` for a band); a rail of contacts |
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
