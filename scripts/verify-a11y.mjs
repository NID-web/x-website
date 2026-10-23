#!/usr/bin/env node
// Accessibility checks that fail silently otherwise (STAGE-0-NOTES §107), on a
// FIXTURE build (`npm run verify:a11y` builds one first):
//
//   1. Every prerendered page has exactly one <h1> (CLAUDE.md § Content), and
//      its headings never step down more than one level (h1 → h3 skips one),
//      in document order.
//   2. Every page with the site footer exposes exactly one contentinfo
//      landmark, read from Chromium's accessibility tree: a <footer> nested in
//      <main> is not one, and nothing in the HTML says so.
//   3. A "See more" clamp never hides a line without its button. ClampedProse
//      used to measure only when its box resized, so copy that rewrapped
//      inside the box — the web font arriving after the first measure, a
//      reader's text spacing applied to a settled page — hid whole lines with
//      no way to reach them. Checked with fonts at their own speed and held
//      back, at 100% and the panel's 150%, and with WCAG 1.4.12 spacing
//      applied once the page has settled (it fails on the build before §107).
//   4. The Accessibility panel by keyboard alone: open, every control and
//      Reset reachable, the text-size steps stop at their limits without
//      losing focus, Reset clears everything and survives a reload, Escape
//      returns focus to the trigger.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const APP = path.join(ROOT, ".next", "server", "app");
const PORT = 4172;
const BASE = `http://localhost:${PORT}`;
const FONT_DELAY_MS = 2500;
const SPACING =
  "*{line-height:1.5!important;letter-spacing:0.12em!important;word-spacing:0.16em!important}p{margin-bottom:2em!important}";

const OK = [];
const FAIL = [];
const check = (label, cond, detail = "") => (cond ? OK : FAIL).push(label + (detail ? ` — ${detail}` : ""));

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? htmlFiles(full) : name.endsWith(".html") ? [full] : [];
  });
}
const routeOf = (file) => "/" + path.relative(APP, file).replace(/\.html$/, "");
const markup = (file) => readFileSync(file, "utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");

async function waitForServer(timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if ((await fetch(`${BASE}/en`)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("Server did not become ready in time");
}

// Lines a clamp hides with no button that opens it: a line counts as hidden
// when its middle is below the clamped box.
function unreachableLines() {
  return [...document.querySelectorAll("div[id]")]
    .filter((box) => getComputedStyle(box).webkitLineClamp !== "none")
    .map((box) => {
      const bottom = box.getBoundingClientRect().bottom;
      const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
      let hidden = 0;
      while (walker.nextNode()) {
        const range = document.createRange();
        range.selectNodeContents(walker.currentNode);
        for (const r of range.getClientRects()) if ((r.top + r.bottom) / 2 > bottom) hidden++;
      }
      const button = document.querySelector(`button[aria-controls="${CSS.escape(box.id)}"]`);
      const visible = button && getComputedStyle(button).display !== "none";
      return { hidden, visible, text: (box.textContent || "").trim().slice(0, 40) };
    })
    .filter((c) => c.hidden > 0 && !c.visible);
}

// A page that cannot load is a failure, never a crash that hides every other
// result. `load` waits on the remote font kit; it has stalled once in a while.
async function open(page, url, waitUntil = "load") {
  for (let attempt = 1; ; attempt++) {
    try {
      await page.goto(url, { waitUntil, timeout: 45_000 });
      return true;
    } catch (err) {
      if (attempt === 2) {
        FAIL.push(`${url.replace(BASE, "")} did not load — ${String(err).split("\n")[0]}`);
        return false;
      }
    }
  }
}

async function main() {
  const files = htmlFiles(APP).filter((f) => !f.includes(`${path.sep}_global-error`));

  // 1. One <h1> per page, from the built HTML.
  const h1 = files.map((f) => [routeOf(f), (markup(f).match(/<h1\b/g) || []).length]);
  const offH1 = h1.filter(([, n]) => n !== 1);
  check(`every built page has one <h1> (${h1.length} pages)`, offH1.length === 0, offH1.map(([r, n]) => `${r}: ${n}`).join(", "));
  const skips = files.flatMap((f) => {
    const levels = [...markup(f).matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
    const found = levels.flatMap((l, i) => (i && l - levels[i - 1] > 1 ? [`h${levels[i - 1]}→h${l}`] : []));
    return found.length ? [`${routeOf(f)}: ${[...new Set(found)].join(" ")}`] : [];
  });
  check(`no heading skips a level going down (${files.length} pages)`, skips.length === 0, skips.join("; "));

  // Pages with the site footer, found by its first navigation's name — not by
  // a <footer> tag, whose absence is exactly what would go unnoticed.
  const footerNav = JSON.parse(readFileSync(path.join(ROOT, "messages", "en.json"), "utf8")).Footer.primaryNav;
  const footerPages = files.filter((f) => markup(f).includes(`aria-label="${footerNav}"`)).map(routeOf);
  const clampPages = files.filter((f) => /line-clamp-\[/.test(markup(f))).map(routeOf);

  const server = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: ROOT, stdio: "pipe" });
  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch();

    // 2. One contentinfo, from the accessibility tree.
    {
      const page = await browser.newPage();
      const cdp = await page.context().newCDPSession(page);
      const off = [];
      for (const route of footerPages) {
        if (!(await open(page, BASE + route, "domcontentloaded"))) continue;
        const { nodes } = await cdp.send("Accessibility.getFullAXTree");
        const n = nodes.filter((x) => !x.ignored && x.role?.value === "contentinfo").length;
        if (n !== 1) off.push(`${route}: ${n}`);
      }
      check(`every footer page exposes one contentinfo (${footerPages.length} pages)`, off.length === 0, off.join(", "));
      await page.close();
    }

    // 3. Clamps, with the font files held back past the first measure.
    for (const run of [
      { label: "768, 150%", width: 768, size: "150" },
      { label: "fonts held back, 390, 100%", width: 390, delayFonts: true },
      { label: "fonts held back, 768, 150%", width: 768, delayFonts: true, size: "150" },
      { label: "text spacing after load, 390", width: 390, spacing: true },
    ]) {
      const off = [];
      for (const route of clampPages) {
        const ctx = await browser.newContext({ viewport: { width: run.width, height: 900 } });
        if (run.size) await ctx.addInitScript((s) => localStorage.setItem("nid-text-size", s), run.size);
        if (run.delayFonts) {
          await ctx.route(/typekit\.net\/.+\.(woff2?|otf|ttf)|typekit\.net\/af\//, async (r) => {
            await new Promise((done) => setTimeout(done, FONT_DELAY_MS));
            await r.continue().catch(() => {});
          });
        }
        const page = await ctx.newPage();
        if (!(await open(page, BASE + route))) {
          await ctx.close();
          continue;
        }
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(400);
        // After the page has measured itself, as a reader's bookmarklet or
        // extension would apply it.
        if (run.spacing) {
          await page.addStyleTag({ content: SPACING });
          await page.waitForTimeout(400);
        }
        for (const c of await page.evaluate(unreachableLines)) off.push(`${route}: ${c.hidden} lines of "${c.text}…"`);
        await ctx.close();
      }
      check(`no clamp hides a line without "See more" — ${run.label} (${clampPages.length} pages)`, off.length === 0, off.join("; "));
    }

    // 4. The panel, by keyboard.
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/en/about`, { waitUntil: "load" });
      const active = () =>
        page.evaluate(() => {
          const a = document.activeElement;
          return {
            // A step's accessible name is its label: the A+ / A− glyph is aria-hidden.
            name: (a?.getAttribute("aria-label") || [...(a?.childNodes ?? [])].filter((n) => !(n instanceof Element && n.getAttribute("aria-hidden") === "true")).map((n) => n.textContent).join("") || "").trim(),
            disabled: a?.getAttribute("aria-disabled"),
            haspopup: a?.getAttribute("aria-haspopup"),
            inPanel: !!a?.closest("[popover]"),
          };
        });
      // The popover's toggle event, which moves focus in, is dispatched as a
      // task after the key press: wait for it rather than read focus early.
      const focusInPanel = () =>
        page.waitForFunction(() => !!document.activeElement?.closest("[popover]"), null, { timeout: 2000 }).catch(() => {});
      const status = () => page.evaluate(() => document.querySelector("[popover] [role=status]")?.textContent ?? "");
      const said = async (text) => {
        await page.waitForFunction((t) => document.querySelector("[popover] [role=status]")?.textContent === t, text, { timeout: 2000 }).catch(() => {});
        return (await status()) === text;
      };
      const html = () =>
        page.evaluate(() => ({
          a11y: document.documentElement.getAttribute("data-a11y"),
          size: document.documentElement.getAttribute("data-text-size"),
          contrast: document.documentElement.getAttribute("data-contrast"),
          theme: document.documentElement.getAttribute("data-theme"),
          stored: ["nid-a11y", "nid-text-size", "nid-contrast"].map((k) => localStorage.getItem(k)),
          cookies: document.cookie,
        }));

      let reached = false;
      for (let i = 0; i < 40 && !reached; i++) {
        await page.keyboard.press("Tab");
        reached = (await active()).haspopup === "dialog";
      }
      check("panel trigger reachable by Tab", reached);
      await page.keyboard.press("Enter");
      await focusInPanel();
      const first = await active();
      check("Enter opens the panel with focus on its first control", first.inPanel && first.name === "Dark contrast", first.name);

      const order = [first.name];
      for (let i = 0; i < 7; i++) {
        await page.keyboard.press("Tab");
        order.push((await active()).name);
      }
      check(
        "Tab walks the eight controls in order",
        order.join("|") === "Dark contrast|Invert|Saturation|Text size increase|Text size decrease|Highlight links|Hide images|Large cursor",
        order.join(" | "),
      );
      // Back past the first control: the title row's Close, then Reset.
      for (let i = 0; i < 8; i++) await page.keyboard.press("Shift+Tab");
      const close = await active();
      await page.keyboard.press("Shift+Tab");
      const reset = await active();
      check("Shift+Tab reaches Close, then Reset", close.name === "Close accessibility settings" && reset.name === "Reset", `${close.name} / ${reset.name}`);
      check("Reset is aria-disabled with nothing set", reset.disabled === "true");

      // The larger step: 100 → 125 → 150, then the limit.
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
      check("focus on Text size increase", (await active()).name === "Text size increase");
      await page.keyboard.press("Enter");
      await page.keyboard.press("Enter");
      let at = await active();
      check("at 150% the increase step is aria-disabled and keeps focus", at.name === "Text size increase" && at.disabled === "true" && (await html()).size === "150");
      await page.keyboard.press("Enter");
      check('a press at 150% says "Largest text size"', await said("Largest text size"));
      check("…and changes nothing", (await html()).size === "150" && (await active()).name === "Text size increase");
      await page.keyboard.press("Tab");
      for (let i = 0; i < 3; i++) await page.keyboard.press("Enter");
      at = await active();
      check("at 87.5% the decrease step is aria-disabled and keeps focus", at.name === "Text size decrease" && at.disabled === "true" && (await html()).size === "87.5");
      await page.keyboard.press("Enter");
      check('a press at 87.5% says "Smallest text size"', await said("Smallest text size"));

      // Something of every kind on, then Reset.
      for (let i = 0; i < 4; i++) await page.keyboard.press("Shift+Tab");
      check("focus on Dark contrast", (await active()).name === "Dark contrast");
      await page.keyboard.press("Enter");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      const on = await html();
      check("contrast, Invert and 87.5% are applied", on.contrast === "on" && on.a11y === "invert" && on.size === "87.5" && on.theme === "yoga");
      await page.reload({ waitUntil: "load" });
      const kept = await html();
      check("…and survive a reload", kept.contrast === "on" && kept.a11y === "invert" && kept.size === "87.5");

      reached = false;
      for (let i = 0; i < 40 && !reached; i++) {
        await page.keyboard.press("Tab");
        reached = (await active()).haspopup === "dialog";
      }
      await page.keyboard.press("Enter");
      await focusInPanel();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Shift+Tab");
      const resetOn = await active();
      check("Reset is enabled once anything is set", resetOn.name === "Reset" && resetOn.disabled === null, String(resetOn.disabled));
      await page.keyboard.press("Enter");
      const cleared = await html();
      check(
        "Reset clears the attributes, storage and cookies, and restores the theme",
        !cleared.a11y && !cleared.size && !cleared.contrast && cleared.theme === "peacock" &&
          cleared.stored.every((v) => v === null) && !/nid-(a11y|text-size|contrast)=/.test(cleared.cookies),
        JSON.stringify(cleared),
      );
      check('Reset says "Accessibility settings reset"', await said("Accessibility settings reset"));
      const after = await active();
      check("focus stays on Reset, now aria-disabled", after.name === "Reset" && after.disabled === "true");
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => document.activeElement?.getAttribute("aria-haspopup") === "dialog", null, { timeout: 2000 }).catch(() => {});
      const back = await active();
      check("Escape closes the panel and returns focus to the trigger", back.haspopup === "dialog" && !back.inPanel);
      await page.reload({ waitUntil: "load" });
      const fresh = await html();
      check("…and the reset survives a reload", !fresh.a11y && !fresh.size && !fresh.contrast);
      await ctx.close();
    }
  } finally {
    await browser?.close();
    server.kill();
  }

  for (const line of OK) console.log(`  ok    ${line}`);
  for (const line of FAIL) console.log(`  FAIL  ${line}`);
  console.log(`\nverify-a11y: ${OK.length} passed, ${FAIL.length} failed`);
  process.exit(FAIL.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
