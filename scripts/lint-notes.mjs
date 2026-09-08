#!/usr/bin/env node
// Fails if docs/STAGE-0-NOTES.md's section numbers are not unique and
// increasing. Two duplicates have shipped — a second §31 and a second §40 —
// and both were invisible in review because a heading reads fine on its own;
// only the file as a whole is wrong. Every section is cited by number from
// source comments, so a duplicate silently points readers at the wrong one.
//
// Gaps are allowed: deleting a section should not force a renumber of
// everything after it, and the numbers are identifiers rather than a count.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const NOTES = path.join(ROOT, "docs", "STAGE-0-NOTES.md");

const headings = [];
readFileSync(NOTES, "utf8")
  .split("\n")
  .forEach((line, i) => {
    const m = /^## (\d+)\./.exec(line);
    if (m) headings.push({ n: Number(m[1]), line: i + 1, text: line.slice(3, 70) });
  });

const problems = [];
const seen = new Map();
for (const h of headings) {
  const first = seen.get(h.n);
  if (first !== undefined) {
    problems.push(`duplicate §${h.n} at line ${h.line} (already used at line ${first})`);
  } else {
    seen.set(h.n, h.line);
  }
}
for (let i = 1; i < headings.length; i++) {
  const prev = headings[i - 1];
  const cur = headings[i];
  if (cur.n < prev.n) {
    problems.push(`§${cur.n} at line ${cur.line} comes after §${prev.n} at line ${prev.line}`);
  }
}

if (problems.length) {
  console.error("docs/STAGE-0-NOTES.md section numbers must be unique and increasing:");
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}

const last = headings[headings.length - 1];
console.log(
  `lint-notes: ${headings.length} sections, unique and increasing (§${headings[0]?.n} … §${last?.n})`,
);
