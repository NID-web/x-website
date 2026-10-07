#!/usr/bin/env node
// Fails the build if any prerendered page is not exactly one whole document:
// more </html> than the file may carry, something other than whitespace after
// its last one, or no </html> at all.
//
// STAGE-0-NOTES §70: a page that Next restarted mid-render (it took longer than
// staticPageGenerationTimeout while the CMS rate-limited it) was written twice,
// and the shorter write left the longer one's tail after </html>. The build
// exited 0 and would have shipped it — a browser shows the stray bytes as text.
//
// §90: the tail a restart leaves is the end of the longer write, so it ENDS in
// </html> itself. This guard first checked only after the LAST </html> and
// passed seven such pages in one rate-limited build. It now counts: every page
// carries one </html>, and only the files named in TWO_DOCUMENTS may carry two.
// Runs after every `next build` in package.json, Vercel's included; a broken
// file exits non-zero, so Vercel keeps the previous deploy.
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SERVER = path.join(ROOT, ".next", "server");

// The global not-found and its Pages Router twin close </body></html>, then
// Next appends their flight scripts and closes </body></html> again (measured,
// Next 16.3.2). Named, not matched by pattern: no other file gets a pass.
const TWO_DOCUMENTS = new Set(["app/_not-found.html", "pages/404.html"]);

const CLOSE = "</html>";

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
  const rel = path.relative(ROOT, file);
  const allowed = TWO_DOCUMENTS.has(path.relative(SERVER, file).split(path.sep).join("/")) ? 2 : 1;
  const count = text.split(CLOSE).length - 1;
  if (count === 0) {
    bad.push(`${rel}: no ${CLOSE}`);
    continue;
  }
  if (count > allowed) {
    const after = text.slice(text.indexOf(CLOSE) + CLOSE.length);
    bad.push(`${rel}: ${count} ${CLOSE} (at most ${allowed}); ${after.length} bytes after the first ("${after.trim().slice(0, 60)}…")`);
    continue;
  }
  const tail = text.slice(text.lastIndexOf(CLOSE) + CLOSE.length).trim();
  if (tail) bad.push(`${rel}: ${tail.length} bytes after ${CLOSE} ("${tail.slice(0, 60)}…")`);
}

if (bad.length) {
  console.error(`verify-built-html: ${bad.length} of ${files.length} pages are not whole documents:`);
  for (const line of bad) console.error(`  ✗ ${line}`);
  process.exit(1);
}
console.log(`verify-built-html: ${files.length} pages, each one whole document`);
