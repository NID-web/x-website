#!/usr/bin/env node
// Regenerates the two RASTER favicons from src/app/icon.svg, which is the
// source of record (docs/STAGE-0-NOTES.md §35). Edit the SVG, then run
// `npm run generate:icons` — nothing else checks that the three files agree.
//
//   src/app/favicon.ico    16 + 32 + 48, PNG payloads, for /favicon.ico
//   src/app/apple-icon.png 180x180 opaque, for iOS home screens
//
// Rendered with Playwright rather than a raster library so the ICO is exactly
// what a browser draws from the SVG. The ICO container is written by hand: a
// 6-byte header, then 16 bytes per directory entry, then the PNGs.
//
// Colours are literal on purpose — a favicon is painted by the browser chrome,
// where none of the site's custom properties resolve. These are Peacock (the
// default theme) light: surface/page = primary-050, icon/primary = primary-650.
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const APP = path.join(ROOT, "src", "app");
const PAGE = "#FAFFFF";

const svg = readFileSync(path.join(APP, "icon.svg"), "utf8");
const browser = await chromium.launch();

async function render(size, { bg, pad = 0 } = {}) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<style>html,body{margin:0;padding:0;background:${bg ?? "transparent"}}` +
      `div{position:absolute;inset:${pad}px}svg{width:100%;height:100%;display:block}</style>` +
      `<div>${svg}</div>`,
  );
  const buf = await page.screenshot({ omitBackground: !bg, type: "png" });
  await page.close();
  return buf;
}

// iOS composites a touch icon on a ground it does not tell you about, so this
// one is opaque and keeps a little breathing room. It does NOT follow
// prefers-color-scheme — only icon.svg does.
writeFileSync(path.join(APP, "apple-icon.png"), await render(180, { bg: PAGE, pad: 18 }));

const SIZES = [16, 32, 48];
const pngs = [];
for (const size of SIZES) pngs.push(await render(size));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(SIZES.length, 4);

const dir = Buffer.alloc(16 * SIZES.length);
let offset = header.length + dir.length;
SIZES.forEach((size, i) => {
  const o = i * 16;
  dir.writeUInt8(size, o); // width  (0 would mean 256)
  dir.writeUInt8(size, o + 1); // height
  dir.writeUInt8(0, o + 2); // palette entries
  dir.writeUInt8(0, o + 3); // reserved
  dir.writeUInt16LE(1, o + 4); // colour planes
  dir.writeUInt16LE(32, o + 6); // bits per pixel
  dir.writeUInt32LE(pngs[i].length, o + 8);
  dir.writeUInt32LE(offset, o + 12);
  offset += pngs[i].length;
});
writeFileSync(path.join(APP, "favicon.ico"), Buffer.concat([header, dir, ...pngs]));

await browser.close();
console.log(`make-icons: favicon.ico (${SIZES.join(", ")}) + apple-icon.png from icon.svg`);
