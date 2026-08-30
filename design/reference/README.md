# design/reference

Vendored design sources. Nothing here is built, linted or type-checked — the
directory is excluded in both `tsconfig.json` (`exclude`) and
`eslint.config.mjs` (`globalIgnores`). eslint does not read tsconfig's exclude,
so both entries are required.

## `home-figma-make/`

The Home frame exported from Figma Make, kept because Figma MCP is quota-blocked
(a Starter plan allows 20 calls/month). It is the design source of record for
`/home`, and `scripts/generate-patterns.py` reads it on every
`npm run generate:patterns`, so it cannot be deleted.

| Path | Committed | Why |
|---|---|---|
| `src/imports/01NidHomeLanding/index.tsx` | yes | The design itself, 33k lines. Read by the pattern generator. 2.2MB raw but **60K gzipped** in git. |
| `src/imports/01NidHomeLanding/svg-d2c3qbtc8f.ts` | yes | Path data the bilingual wordmark was lifted from. |
| `.figma/attachments/image-0.png` | yes | 396K. The only render of the intended design — the reference every visual check is made against. |
| `src/imports/01NidHomeLanding/*.png` | **no — gitignored** | 22 photo masters, ~29MB. See below. |

### Why the photos are not committed

They are already-compressed PNGs: 29MB raw, 26.7MB gzipped, so git cannot shrink
them, and anything committed stays in history permanently even after deletion.

They are also not needed. `public/home/` already holds the same photography,
web-sized at ~1.8MB — confirmed by comparing them image by image against these
masters; they are the same shots. The site demos entirely from `public/home/`.

The masters remain on disk as the highest-quality copies. If they are ever lost,
re-export the frame from Figma. The one asset they hold that `public/home/` does
not is a sixth faculty portrait (the export's "History" tile shows six, the build
uses five).

### Removed on purpose

Figma Make's own `plans/*.md`, `CLAUDE.md`/`AGENTS.md`, the Vite scaffold and a
byte-identical duplicate of the design code were all deleted. The plan file was
an agent-written plan for the *throwaway Vite app*: it wanted self-hosted
`@font-face` faces named `'Futura PT:Heavy'`, edits to `src/App.tsx` /
`src/index.css` (both gone), and `overflow-x-auto` around a fixed 1440 layout —
none of which apply here. It also asserted that Tonos "is a stray and is
ignored", which is **wrong**: Tonos is the body typeface (NID-CONTEXT §6.4,
confirmed by the design owner). Left in a folder called `reference`, it would
have read as guidance.

The `CLAUDE.md` mattered more: Claude Code auto-loads nested `CLAUDE.md` files,
so it was silently injecting "a Vite dev server is already running on $PORT" and
"use `@tailwindcss/vite`" into this repo's context.

### Swapping to the backend later

All home imagery resolves through one helper — `img()` in
`src/lib/home-content.ts` — which builds `/home/<file>`. When the CMS serves
media, change that helper (or replace its call sites with server-provided
`MediaAsset`s) and delete `public/home/`. No tile component references an image
path directly.
