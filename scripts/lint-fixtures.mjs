#!/usr/bin/env node
// Fails on any import of a content fixture from outside src/lib/content/.
// getPage() is the one seam between the front end and its content; a component
// that reaches past it into a fixture keeps working right up until the API
// replaces the fixture, and then breaks silently (docs/STAGE-0-NOTES.md §32).
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const ALLOWED = path.join(SRC, "lib", "content") + path.sep;

const FIXTURE_IMPORT = /from\s+["'](?:@\/lib\/content\/fixtures|[./]+\/fixtures)(?:\/|["'])/;
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
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (FIXTURE_IMPORT.test(line)) {
        violations.push(`${path.relative(ROOT, file)}:${i + 1}: ${line.trim()}`);
      }
    });
}

if (violations.length) {
  console.error("Content fixtures imported outside src/lib/content/ (go through getPage):");
  for (const v of violations) console.error("  " + v);
  process.exit(1);
}

console.log("lint-fixtures: no fixture imports outside src/lib/content/");
