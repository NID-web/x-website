#!/usr/bin/env node
// Fails the build if any prerendered page is not a whole document: something
// other than whitespace after its LAST </html>, or no </html> at all.
//
// STAGE-0-NOTES §70: a page that Next restarted mid-render (it took longer than
// staticPageGenerationTimeout while the CMS rate-limited it) was written twice,
// and the shorter write left the longer one's tail after </html>. The build
// exited 0 and would have shipped it — a browser shows the stray bytes as text.
// Only the LAST </html> is checked: the global not-found legitimately carries
// two. Runs after every `next build` in package.json, Vercel's included.
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SERVER = path.join(ROOT, ".next", "server");

function htmlFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) htmlFiles(full, out);
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

const files = htmlFiles(SERVER);
const bad = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const end = text.lastIndexOf("</html>");
  const rel = path.relative(ROOT, file);
  if (end < 0) bad.push(`${rel}: no </html>`);
  else if (text.slice(end + "</html>".length).trim()) {
    const tail = text.slice(end + "</html>".length).trim();
    bad.push(`${rel}: ${tail.length} bytes after </html> ("${tail.slice(0, 60)}…")`);
  }
}

if (bad.length) {
  console.error(`verify-built-html: ${bad.length} of ${files.length} pages are not whole documents:`);
  for (const line of bad) console.error(`  ✗ ${line}`);
  process.exit(1);
}
console.log(`verify-built-html: ${files.length} pages, each ends at its </html>`);
