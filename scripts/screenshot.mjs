#!/usr/bin/env node
// Screenshots /en/swatch at the four reference breakpoints into
// docs/screenshots/, per docs/STAGE-0-PLAN.md's acceptance checklist.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = 4175;
const BASE = `http://localhost:${PORT}`;
const OUT_DIR = path.join(ROOT, "docs", "screenshots");

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1024, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];

function startServer() {
  return spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: ROOT, stdio: "pipe" });
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

    for (const vp of VIEWPORTS) {
      await page.setViewportSize(vp);
      await page.goto(`${BASE}/en/swatch`, { waitUntil: "networkidle" });
      const file = path.join(OUT_DIR, `swatch-${vp.width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`saved ${path.relative(ROOT, file)}`);
    }

    await browser.close();
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
