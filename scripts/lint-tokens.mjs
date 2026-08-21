#!/usr/bin/env node
// Fails on any literal hex colour under src/, outside src/styles/themes.css.
// A hex in a component breaks all twenty theme×appearance states at once —
// this is the cheapest possible guard against that (CLAUDE.md § Colour).
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const EXEMPT = path.join(SRC, "styles", "themes.css");

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, out);
    } else if (EXTENSIONS.has(path.extname(entry))) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];
for (const file of walk(SRC)) {
  if (file === EXEMPT) continue;
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    const matches = line.match(HEX_RE);
    if (matches) {
      violations.push(`${path.relative(ROOT, file)}:${i + 1}: ${matches.join(", ")}`);
    }
  });
}

if (violations.length) {
  console.error("Literal hex colours found outside src/styles/themes.css:");
  for (const v of violations) console.error("  " + v);
  process.exit(1);
}

console.log("lint-tokens: no literal hex colours outside src/styles/themes.css");
