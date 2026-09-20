#!/usr/bin/env node
// Fails on any import of a content fixture — or of HOME_TILES — from outside
// src/lib/content/.
// getPage() is the one seam between the front end and its content; a component
// that reaches past it into a fixture keeps working right up until the API
// replaces the fixture, and then breaks silently (docs/STAGE-0-NOTES.md §33).
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const ALLOWED = path.join(SRC, "lib", "content") + path.sep;

const FIXTURE_IMPORT = /from\s+["'](?:@\/lib\/content\/fixtures|[./]+\/fixtures)(?:\/|["'])/;
// HOME_TILES is Home's fixture: getHome() merges the CMS over it, so a
// component reading it directly would silently render the static page with the
// CMS configured. Its types (HomeTile, Translate, CopyKey) stay free to import.
const HOME_TILES_IMPORT = /import\s*\{[^}]*(?<!type\s)\bHOME_TILES\b[^}]*\}\s*from\s+["'](?:@\/lib\/home-content|[./]+\/home-content)["']/;
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTENSIONS.has(path.extname(entry))) out.push(full);
  }
  return out;
}

const violations = [];
for (const file of walk(SRC)) {
  if (file.startsWith(ALLOWED)) continue;
  const source = readFileSync(file, "utf8");
  source.split("\n").forEach((line, i) => {
    if (FIXTURE_IMPORT.test(line)) {
      violations.push(`${path.relative(ROOT, file)}:${i + 1}: ${line.trim()}`);
    }
  });
  // Matched on the whole file: an import list can wrap across lines.
  const home = HOME_TILES_IMPORT.exec(source);
  if (home) {
    const line = source.slice(0, home.index).split("\n").length;
    violations.push(`${path.relative(ROOT, file)}:${line}: ${home[0].replace(/\s+/g, " ")}`);
  }
}

if (violations.length) {
  console.error("Content fixtures imported outside src/lib/content/ (go through getPage / getHome):");
  for (const v of violations) console.error("  " + v);
  process.exit(1);
}

console.log("lint-fixtures: no fixture or HOME_TILES imports outside src/lib/content/");
