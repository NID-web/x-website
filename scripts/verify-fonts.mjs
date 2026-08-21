#!/usr/bin/env node
// Confirms the three Typekit families actually loaded. If this fails, it is
// almost certainly the kit svx1oks's domain allowlist missing localhost
// (CLAUDE.md §2.10) — not the code. Also measures whether bodoni-pt-variable
// exposes a usable opsz axis (§3 of docs/STAGE-0-PLAN.md, item 2 to report).
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = 4174;
const BASE = `http://localhost:${PORT}`;

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
  const server = startServer();
  let browser;
  const OK = [];
  const FAIL = [];
  const check = (label, cond, detail = "") => (cond ? OK : FAIL).push(label + (detail ? ` — ${detail}` : ""));

  try {
    await waitForServer();
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE}/en/swatch`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    const families = await page.evaluate(() => ({
      futura: document.fonts.check("700 32px futura-pt"),
      tonos: document.fonts.check("400 16px tonos"),
      bodoni: document.fonts.check("600 28px bodoni-pt-variable"),
    }));

    check("futura-pt loaded (700 32px)", families.futura);
    check("tonos loaded (400 16px)", families.tonos);
    check("bodoni-pt-variable loaded (600 28px)", families.bodoni);

    if (FAIL.length) {
      console.log(
        "One or more Typekit families failed to load. This is almost certainly kit svx1oks's " +
          "domain allowlist missing localhost (CLAUDE.md §2.10), not a code defect. " +
          "Add localhost to the kit's allowed domains in the Adobe Fonts dashboard and re-run.",
      );
    }

    // opsz axis probe: render two spans at the same weight/size but opposite
    // optical-size axis values and compare glyph widths. If bodoni-pt-variable
    // has no opsz axis, both spans render identically and widths match.
    const opsz = await page.evaluate(() => {
      const make = (value) => {
        const el = document.createElement("span");
        el.style.position = "absolute";
        el.style.visibility = "hidden";
        el.style.whiteSpace = "nowrap";
        el.style.fontFamily = "bodoni-pt-variable";
        el.style.fontSize = "48px";
        el.style.fontVariationSettings = `'opsz' ${value}`;
        el.textContent = "National Institute of Design";
        document.body.appendChild(el);
        const width = el.getBoundingClientRect().width;
        document.body.removeChild(el);
        return width;
      };
      const small = make(8);
      const large = make(60);
      return { small, large, differs: Math.abs(small - large) > 0.5 };
    });

    console.log(
      `bodoni-pt-variable opsz axis: ${opsz.differs ? "PRESENT" : "not detected"} ` +
        `(opsz=8 width=${opsz.small.toFixed(2)}px, opsz=60 width=${opsz.large.toFixed(2)}px)`,
    );

    await browser.close();
  } finally {
    server.kill();
  }

  console.log(`PASS ${OK.length}`);
  for (const f of FAIL) console.log("  FAIL:", f);
  process.exit(FAIL.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
