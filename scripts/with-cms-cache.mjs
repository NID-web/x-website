#!/usr/bin/env node
// Runs a command (`next build`) with a fresh per-build CMS cache, so a LIVE
// build fetches each CMS URL once across all its processes (STAGE-0-NOTES §71,
// src/lib/api/build-cache.ts).
//
//   node scripts/with-cms-cache.mjs next build
//
// LIVE (CMS_API_URL set): a new, randomly named directory in the OS temp dir —
// never under .next/, which Vercel keeps between deploys — named in
// NID_CMS_BUILD_CACHE and owned by this process. It is deleted when the command
// ends: success, failure, or Ctrl+C / SIGTERM (forwarded to the command first).
// Before that, its ledger (what was fetched, what was served from the cache) is
// appended to .next/cms-build-report.jsonl for the build summary.
// FIXTURE: no directory, and any inherited NID_CMS_BUILD_CACHE is removed — the
// build fetches nothing, as before.
import { spawn } from "node:child_process";
import { appendFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const ENV = "NID_CMS_BUILD_CACHE";
const PREFIX = "nid-cms-build-";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = path.join(ROOT, ".next", "cms-build-report.jsonl");

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("usage: node scripts/with-cms-cache.mjs <command> [args…]");
  process.exit(2);
}

// A directory left by a build that was killed outright (SIGKILL skips every
// handler). build-cache.ts never reads one — its owner is not running — and
// after a day it is removed here. Younger ones may belong to a concurrent build.
for (const name of readdirSync(os.tmpdir())) {
  if (!name.startsWith(PREFIX)) continue;
  const dir = path.join(os.tmpdir(), name);
  try {
    if (Date.now() - statSync(dir).mtimeMs > 24 * 3600_000) rmSync(dir, { recursive: true, force: true });
  } catch {
    // not ours to judge
  }
}

// LIVE or FIXTURE as `next build` will see it: CMS_API_URL usually comes from
// .env.local locally (a real variable on Vercel), and an explicit
// `CMS_API_URL=` still means FIXTURE. @next/env is the loader Next itself uses;
// the command still gets the environment it would have had without the wrapper.
const env = { ...process.env };
delete env[ENV];
nextEnv.loadEnvConfig(ROOT, false, { info: () => {}, error: console.error });
let dir = null;
if (process.env.CMS_API_URL?.trim()) {
  dir = mkdtempSync(path.join(os.tmpdir(), PREFIX));
  writeFileSync(path.join(dir, "owner.json"), JSON.stringify({ pid: process.pid }));
  env[ENV] = dir;
}

let cleaned = false;
function cleanup() {
  if (cleaned || !dir) return;
  cleaned = true;
  try {
    const ledger = path.join(dir, "ledger.jsonl");
    if (existsSync(ledger) && existsSync(path.dirname(REPORT))) appendFileSync(REPORT, readFileSync(ledger));
  } catch {
    // the summary loses its cache line; the build's outcome is unchanged
  }
  rmSync(dir, { recursive: true, force: true });
}

const child = spawn(command, args, { stdio: "inherit", env });
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  // Handled, not default: the wrapper must outlive the command to clean up.
  process.on(signal, () => child.kill(signal));
}
process.on("exit", cleanup);
child.on("error", (err) => {
  console.error(`with-cms-cache: could not run ${command}: ${err.message}`);
  cleanup();
  process.exit(1);
});
child.on("exit", (code, signal) => {
  cleanup();
  process.exit(code ?? (signal === "SIGINT" ? 130 : 1));
});
