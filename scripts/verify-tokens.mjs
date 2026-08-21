#!/usr/bin/env node
// Verifies the token layer end-to-end in a real browser: 540 semantic
// assertions, the scoped-theme hard assertion, grid arithmetic at the four
// breakpoints, and the letter-spacing/font-weight regression guards from
// docs/STAGE-0-PLAN.md §8. Run against a production build (`next build &&
// next start`), not the dev server, so it matches what actually ships.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

const tokens = JSON.parse(
  readFileSync(path.join(ROOT, "design/tokens/tokens.json"), "utf8"),
);

const OK = [];
const FAIL = [];
function check(label, cond, detail = "") {
  (cond ? OK : FAIL).push(label + (detail ? ` — ${detail}` : ""));
}

function startServer() {
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: ROOT,
    stdio: "pipe",
  });
  return server;
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

const themeCap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

const BREAKPOINTS = [
  {
    width: 1440,
    height: 900,
    columns: 4,
    margin: 24,
    gap: 24,
    contentWidth: 1392,
    shellWidth: 1440,
    h1: 60,
  },
  {
    width: 1024,
    height: 900,
    columns: 3,
    margin: 24,
    gap: 24,
    contentWidth: 976,
    shellWidth: 1024,
    h1: 52,
  },
  {
    width: 768,
    height: 1024,
    columns: 2,
    margin: 24,
    gap: 20,
    contentWidth: 720,
    shellWidth: 768,
    h1: 40,
  },
  {
    width: 390,
    height: 844,
    columns: 1,
    margin: 16,
    gap: 16,
    contentWidth: 358,
    shellWidth: 390,
    h1: 32,
  },
];

async function main() {
  const server = startServer();
  let browser;
  try {
    await waitForServer();

    browser = await chromium.launch({ args: ["--hide-scrollbars"] });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/en/swatch`, { waitUntil: "networkidle" });

    // ---- 540 semantic assertions, read from the already-rendered panels ----
    // This IS the scoped-theme test, not a separate concern bolted on: each
    // panel's chips are probed inside its own <section data-theme
    // data-appearance>, scoped independently of <html>'s own theme (which
    // stays "peacock" throughout). If @theme inline were ever dropped and
    // every colour froze to <html>'s theme, every non-Peacock panel would
    // report Peacock's hexes here and fail against tokens.json.
    const panelData = await page.evaluate(() => {
      const panels = Array.from(
        document.querySelectorAll("section[data-theme][data-appearance]"),
      );
      return panels.map((section) => {
        const theme = section.getAttribute("data-theme");
        const appearance = section.getAttribute("data-appearance");
        const chips = Array.from(section.querySelectorAll("[data-nid-token]"));
        const values = {};
        for (const chip of chips) {
          const name = chip.getAttribute("data-nid-token");
          const valueEl = chip.querySelector("[data-nid-chip-value]");
          values[name] = valueEl ? valueEl.getAttribute("data-nid-chip-value") : null;
        }
        return { theme, appearance, values };
      });
    });

    check("20 panels rendered", panelData.length === 20, String(panelData.length));

    let semanticAssertions = 0;
    let unresolvedCount = 0;
    for (const panel of panelData) {
      const themeKey = themeCap(panel.theme);
      const expected = tokens.semantic.byThemeAndAppearance[themeKey]?.[panel.appearance];
      if (!expected) {
        check(`byThemeAndAppearance has ${themeKey}/${panel.appearance}`, false);
        continue;
      }
      for (const [tokenName, expectedHex] of Object.entries(expected)) {
        semanticAssertions++;
        const actual = (panel.values[tokenName] ?? "").toUpperCase();
        if (!actual || actual === "UNRESOLVED") unresolvedCount++;
        check(
          `${panel.theme}/${panel.appearance} ${tokenName}`,
          actual === expectedHex.toUpperCase(),
          `got ${actual || "(empty)"} expected ${expectedHex}`,
        );
      }
    }
    check(
      "540 semantic assertions ran",
      semanticAssertions === 540,
      String(semanticAssertions),
    );
    check(
      "zero UNRESOLVED chips across all 20 panels",
      unresolvedCount === 0,
      String(unresolvedCount),
    );

    // ---- explicit scoped-theme hard assertion ----
    const htmlTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    check("html defaults to peacock", htmlTheme === "peacock", htmlTheme ?? "null");

    const peacockLight = panelData.find(
      (p) => p.theme === "peacock" && p.appearance === "light",
    );
    const tanjoreLight = panelData.find(
      (p) => p.theme === "tanjore" && p.appearance === "light",
    );
    if (peacockLight && tanjoreLight) {
      check(
        "scoped data-theme=tanjore panel differs from <html>'s own peacock theme",
        tanjoreLight.values["surface/page"] !== peacockLight.values["surface/page"],
        `tanjore=${tanjoreLight.values["surface/page"]} peacock=${peacockLight.values["surface/page"]}`,
      );
      const expectedTanjoreLight = tokens.semantic.byThemeAndAppearance.Tanjore.light;
      check(
        "scoped tanjore panel matches Tanjore/light from tokens.json exactly",
        (tanjoreLight.values["surface/page"] ?? "").toUpperCase() ===
          expectedTanjoreLight["surface/page"].toUpperCase(),
      );
    } else {
      check("found peacock/light and tanjore/light panels to compare", false);
    }

    // ---- grid + type assertions across the four breakpoints ----
    for (const bp of BREAKPOINTS) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto(`${BASE}/en/swatch`, { waitUntil: "networkidle" });

      const measured = await page.evaluate(() => {
        const style = getComputedStyle(document.documentElement);
        const num = (n) => parseFloat(style.getPropertyValue(n));
        const shell = document.querySelector("[data-nid-shell]");
        const h1 = document.querySelector(".text-h1");
        const body = document.querySelector(".text-body");
        const label = document.querySelector(".text-label");
        const cols = [1, 2, 3, 4].map((i) => {
          const el = document.querySelector(`[data-nid-col="${i}"]`);
          return el ? el.getBoundingClientRect().left : null;
        });
        return {
          columns: num("--nid-grid-columns"),
          margin: num("--nid-grid-page-margin"),
          gap: num("--nid-grid-column-gap"),
          contentWidth: num("--nid-grid-content-width"),
          shellWidth: shell ? shell.getBoundingClientRect().width : null,
          h1Size: h1 ? parseFloat(getComputedStyle(h1).fontSize) : null,
          h1LetterSpacing: h1 ? getComputedStyle(h1).letterSpacing : null,
          h1FontWeight: h1 ? getComputedStyle(h1).fontWeight : null,
          bodySize: body ? parseFloat(getComputedStyle(body).fontSize) : null,
          labelSize: label ? parseFloat(getComputedStyle(label).fontSize) : null,
          cols,
        };
      });

      const bpName = `${bp.width}px`;
      check(
        `${bpName} columns = ${bp.columns}`,
        measured.columns === bp.columns,
        String(measured.columns),
      );
      check(
        `${bpName} page margin = ${bp.margin}`,
        measured.margin === bp.margin,
        String(measured.margin),
      );
      check(
        `${bpName} column gap = ${bp.gap}`,
        measured.gap === bp.gap,
        String(measured.gap),
      );
      check(
        `${bpName} content width = ${bp.contentWidth}`,
        measured.contentWidth === bp.contentWidth,
        String(measured.contentWidth),
      );
      check(
        `${bpName} shell measured width ≈ ${bp.shellWidth}`,
        measured.shellWidth !== null &&
          Math.abs(measured.shellWidth - bp.shellWidth) <= 0.5,
        String(measured.shellWidth),
      );
      check(
        `${bpName} h1 size = ${bp.h1}`,
        measured.h1Size === bp.h1,
        String(measured.h1Size),
      );
      check(
        `${bpName} body size = 16px`,
        measured.bodySize === 16,
        String(measured.bodySize),
      );
      check(
        `${bpName} label size = 14px (labels never scale)`,
        measured.labelSize === 14,
        String(measured.labelSize),
      );

      if (bp.width === 1440) {
        const expectedOrigins = [24, 378, 732, 1086];
        measured.cols.forEach((left, i) => {
          check(
            `1440px col ${i + 1} origin = ${expectedOrigins[i]}`,
            left !== null && Math.abs(left - expectedOrigins[i]) <= 0.5,
            String(left),
          );
        });
        check(
          "1440px h1 letter-spacing is a px length, not normal",
          measured.h1LetterSpacing !== "normal" && measured.h1LetterSpacing?.endsWith("px"),
          measured.h1LetterSpacing ?? "null",
        );
        check(
          "1440px h1 font-weight computes to 700",
          measured.h1FontWeight === "700",
          measured.h1FontWeight ?? "null",
        );
      }
    }

    // ---- no-flash: the inline THEME_SCRIPT must set both attributes before
    // any other script runs, even on a throttled CPU, on every <html> tree
    // in the app (the locale layout, the in-locale not-found, and the
    // global not-found — all three share HeadShell). Seed localStorage via
    // addInitScript so it's in place before THEME_SCRIPT's own first read,
    // throttle the CPU via CDP, then check the attributes immediately on
    // navigation commit — before the rest of the page has had a chance to
    // paint a wrong frame and self-correct.
    const NO_FLASH_TARGETS = [
      { label: "/en/swatch (locale layout)", url: `${BASE}/en/swatch` },
      {
        label: "/en/some-garbage-url (in-locale not-found)",
        url: `${BASE}/en/some-garbage-url`,
      },
    ];

    for (const target of NO_FLASH_TARGETS) {
      const context = await browser.newContext();
      await context.addInitScript(() => {
        localStorage.setItem("nid-theme", "tanjore");
        localStorage.setItem("nid-appearance", "dark");
      });
      const flashPage = await context.newPage();
      const client = await context.newCDPSession(flashPage);
      await client.send("Emulation.setCPUThrottlingRate", { rate: 6 });
      // domcontentloaded fires once the initial document (including the
      // inline THEME_SCRIPT, a synchronous <head> script) has finished
      // parsing and running, but before React hydrates — the right point to
      // catch a flash of the wrong default before anything has had a chance
      // to correct it. ("commit" fires before any HTML has parsed at all —
      // the attributes would always read null there, not "wrong default".)
      await flashPage.goto(target.url, { waitUntil: "domcontentloaded" });
      const attrs = await flashPage.evaluate(() => ({
        theme: document.documentElement.getAttribute("data-theme"),
        appearance: document.documentElement.getAttribute("data-appearance"),
      }));
      check(
        `no-flash ${target.label}: data-theme is tanjore on first parse`,
        attrs.theme === "tanjore",
        attrs.theme ?? "null",
      );
      check(
        `no-flash ${target.label}: data-appearance is dark on first parse`,
        attrs.appearance === "dark",
        attrs.appearance ?? "null",
      );
      await context.close();
    }

    // The global app/not-found.tsx (reached only when [locale]/layout.tsx
    // itself throws notFound() — an invalid/absent locale segment on a
    // request the proxy didn't rewrite) is a documented exception, not a
    // bug: Next can't stream that response's real <html> as the initial
    // document, because the layout that defines <html> is the very thing
    // failing. It sends a generic bootstrap shell instead and reconciles the
    // real tree client-side — and React never executes a <script> tag
    // reached by client-side reconciliation (confirmed via console: "Scripts
    // inside React components are never executed when rendering on the
    // client"). THEME_SCRIPT genuinely cannot run on this path; there's no
    // CPU-throttling trick that fixes it. What we can verify instead: the
    // page still resolves to a valid (default) theme rather than rendering
    // unstyled, and still shows the right content — see docs/STAGE-0-NOTES.md.
    {
      const context = await browser.newContext();
      await context.addInitScript(() => {
        localStorage.setItem("nid-theme", "tanjore");
        localStorage.setItem("nid-appearance", "dark");
      });
      const flashPage = await context.newPage();
      await flashPage.goto(`${BASE}/some-file.xyz`, { waitUntil: "load" });
      await flashPage.waitForTimeout(500);
      const state = await flashPage.evaluate(() => ({
        theme: document.documentElement.getAttribute("data-theme"),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        bodyText: document.body.innerText,
      }));
      check(
        "/some-file.xyz (global not-found): known limitation — THEME_SCRIPT does not run (see comment above), defaults to peacock/light via themes.css's :root fallback rather than the stored preference",
        state.theme === null,
        `data-theme=${state.theme ?? "null"}`,
      );
      check(
        "/some-file.xyz (global not-found): still resolves a real background colour, not transparent/unstyled",
        state.bodyBg !== "rgba(0, 0, 0, 0)" && state.bodyBg !== "",
        state.bodyBg,
      );
      check(
        "/some-file.xyz (global not-found): still renders its own content",
        state.bodyText.includes("National Institute of Design"),
        state.bodyText,
      );
      await context.close();
    }

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
