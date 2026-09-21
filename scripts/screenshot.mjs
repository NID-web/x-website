#!/usr/bin/env node
// Screenshots /en/swatch, /en (the home grid) and /en/about at the four reference
// breakpoints into docs/screenshots/, per docs/STAGE-0-PLAN.md's acceptance
// checklist. Home is here because its whole layout is a per-breakpoint reshape
// (STAGE-0-NOTES.md §20); About because it is the template every editorial
// page takes — the four boards are the only way to review either.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, openSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = 4175;
const BASE = `http://localhost:${PORT}`;
const OUT_DIR = path.join(ROOT, "docs", "screenshots");
const SERVER_LOG = path.join(ROOT, ".next", "screenshot-server.log");

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1024, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];

// name → path. The name is the screenshot's filename prefix.
const PAGES = [
  { name: "swatch", path: "/en/swatch" },
  { name: "home", path: "/en" },
  { name: "about", path: "/en/about" },
  { name: "campuses", path: "/en/about/campuses" },
  { name: "charter", path: "/en/about/charter" },
  { name: "history", path: "/en/about/history" },
  { name: "news-events", path: "/en/about/news-events" },
  { name: "our-themes", path: "/en/about/our-themes" },
];

// The server's stdout and stderr go to a FILE, never to an unread pipe. A pipe
// nobody drains blocks the child once it fills (~24 KB measured on macOS): the
// server freezes mid-run and every later page.goto times out. It did exactly
// that — one run's image-optimiser warnings came to ~52 KB — and any verbose
// warning added later would do the same, on any network. Read the log after a
// run for what the server said.
function startServer() {
  const log = openSync(SERVER_LOG, "w");
  return spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: ROOT,
    stdio: ["ignore", log, log],
  });
}

async function waitForServer(timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/en/swatch`);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("Server did not become ready in time");
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const server = startServer();
  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch({ args: ["--hide-scrollbars"] });
    const page = await browser.newPage();

    for (const target of PAGES) {
      for (const vp of VIEWPORTS) {
        await page.setViewportSize(vp);
        // Not networkidle: the Typekit stylesheet never lets the network go
        // quiet, so that wait only ever times out (STAGE-0-NOTES.md §15). Wait
        // on the real precondition instead — stylesheet applied, grid rendered,
        // web fonts resolved — which is both deterministic and stricter.
        await page.goto(`${BASE}${target.path}`, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(
          () =>
            getComputedStyle(document.documentElement)
              .getPropertyValue("--nid-grid-columns")
              .trim() !== "" && document.querySelector("[data-nid-shell]") !== null,
        );
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(300);
        const file = path.join(OUT_DIR, `${target.name}-${vp.width}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`saved ${path.relative(ROOT, file)}`);
      }
    }

    await browser.close();
    console.log(`server log: ${path.relative(ROOT, SERVER_LOG)}`);
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
