#!/usr/bin/env node
// design/generate.py writes into design/tokens/; the app reads its own
// copies under src/. Nothing enforces that those copies actually got
// re-made after the last regeneration — skip the copy step and every other
// check still passes green, because both copies independently resolve
// fine, just to different values. This is the one thing a browser-based
// check can never catch (it only ever looks at the src/ copy), so it's a
// dedicated, fast, no-browser check: byte-compare each generated file
// against its src/ copy and hard-fail on any drift.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const PAIRS = [
  ["design/tokens/themes.css", "src/styles/themes.css"],
  ["design/tokens/font-manifest.json", "src/lib/font-manifest.json"],
];

export function checkParity() {
  const failures = [];
  for (const [source, copy] of PAIRS) {
    const sourceContent = readFileSync(path.join(ROOT, source), "utf8");
    const copyContent = readFileSync(path.join(ROOT, copy), "utf8");
    if (sourceContent !== copyContent) {
      failures.push(
        `${source} and ${copy} have diverged — re-run \`npm run generate:tokens\` ` +
          `(or copy ${source} to ${copy} by hand) before committing`,
      );
    }
  }
  return failures;
}

const isMain = path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
if (isMain) {
  const failures = checkParity();
  if (failures.length) {
    console.log(`FAIL ${failures.length}`);
    for (const f of failures) console.log("  FAIL:", f);
    process.exit(1);
  }
  console.log(`PASS ${PAIRS.length} (design/tokens/* matches its src/ copy)`);
  process.exit(0);
}
