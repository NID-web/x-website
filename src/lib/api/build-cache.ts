// One fetch per CMS URL across every process of one LIVE build (STAGE-0-NOTES
// §71). cmsFetch's memo is per process, and a build renders pages in several:
// measured 109 requests for 87 distinct URLs, every duplicate one per process.
//
// scripts/with-cms-cache.mjs wraps `next build`: it makes a NEW, randomly named
// directory outside .next/ (Vercel keeps .next/cache between deploys; this must
// never outlive its build), passes it in NID_CMS_BUILD_CACHE, and deletes it
// when the build ends — success, failure or Ctrl+C. Without the variable
// (`next dev`, FIXTURE, a bare `next build`) this is a pass-through: no cache.
//
// Per URL: a process reads the stored response if there is one; otherwise it
// takes the URL's lock (an exclusive create) and fetches, or waits for the
// holder's result. Only a success or a real 404/410 is stored, and written to a
// temporary name then renamed, so a reader never sees half a file. A failure is
// not stored: the lock is released empty and a waiter fetches for itself. A
// lock whose process is dead, or that is older than 360s (next.config.ts's
// staticPageGenerationTimeout), is taken over — a slow holder overtaken costs
// one duplicate fetch of the same body, written atomically.
//
// Node built-ins only: next.config.ts imports this, and cannot resolve the
// `@/` aliases or React that client.ts uses.
import { createHash, randomBytes } from "node:crypto";
import {
  appendFileSync,
  closeSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import path from "node:path";

export const BUILD_CACHE_ENV = "NID_CMS_BUILD_CACHE";
/** Written by the wrapper into the directory: the wrapper's pid. A directory
 *  whose wrapper is gone is a previous build's, and is never read. */
export const OWNER_FILE = "owner.json";
/** Fetch and cache events, one JSON object per line; the wrapper hands them to
 *  the build report when the build ends. */
export const LEDGER_FILE = "ledger.jsonl";

const LOCK_STALE_MS = 360_000;
const POLL_MS = 100;

export interface StoredResponse {
  status: number;
  body: string;
}

const stored = (status: number) => (status >= 200 && status < 300) || status === 404 || status === 410;

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    // EPERM: it exists, it is just not ours to signal.
    return (err as NodeJS.ErrnoException).code === "EPERM";
  }
}

let checkedRoot: string | null | undefined;

/** This build's cache directory, or null — no variable, or a directory whose
 *  wrapper is no longer running (a leftover from an earlier build). */
function cacheRoot(): string | null {
  if (checkedRoot !== undefined) return checkedRoot;
  const dir = process.env[BUILD_CACHE_ENV]?.trim();
  checkedRoot = null;
  if (!dir) return null;
  try {
    const { pid } = JSON.parse(readFileSync(path.join(dir, OWNER_FILE), "utf8")) as { pid: number };
    if (alive(pid)) checkedRoot = dir;
    else console.warn(`[cms] build cache ${dir} belongs to a build that is not running; not used`);
  } catch {
    console.warn(`[cms] build cache ${dir} has no owner; not used`);
  }
  return checkedRoot;
}

function readStored(file: string): StoredResponse | null {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as StoredResponse;
  } catch {
    return null; // not there yet (a rename is all or nothing)
  }
}

function tryLock(lock: string): boolean {
  try {
    const fd = openSync(lock, "wx");
    writeSync(fd, JSON.stringify({ pid: process.pid, at: Date.now() }));
    closeSync(fd);
    return true;
  } catch {
    return false;
  }
}

function lockIsStale(lock: string): boolean {
  try {
    const { pid, at } = JSON.parse(readFileSync(lock, "utf8")) as { pid: number; at: number };
    return !alive(pid) || Date.now() - at > LOCK_STALE_MS;
  } catch {
    // Mid-write by its creator, or already gone: not stale, look again.
    return false;
  }
}

function ledger(root: string, event: Record<string, unknown>) {
  try {
    appendFileSync(path.join(root, LEDGER_FILE), JSON.stringify(event) + "\n");
  } catch {
    // The count is evidence, not a gate.
  }
}

/** `fetchOnce` at most once per build for `key` (method and URL), across every
 *  process; everyone else gets the stored status and body. Outside a wrapped
 *  build it is just `fetchOnce`. */
export async function onceAcrossBuild<R extends StoredResponse>(
  key: string,
  fetchOnce: () => Promise<R>,
): Promise<R | (StoredResponse & { fromCache: true })> {
  const root = cacheRoot();
  if (!root) return fetchOnce();
  const id = createHash("sha256").update(key).digest("hex");
  const file = path.join(root, `${id}.json`);
  const lock = path.join(root, `${id}.lock`);
  for (;;) {
    const hit = readStored(file);
    if (hit) {
      ledger(root, { t: "cached", key, pid: process.pid });
      return { ...hit, fromCache: true };
    }
    if (tryLock(lock)) {
      try {
        // The holder before us may have finished between the read and the lock.
        const late = readStored(file);
        if (late) {
          ledger(root, { t: "cached", key, pid: process.pid });
          return { ...late, fromCache: true };
        }
        const res = await fetchOnce();
        ledger(root, { t: "fetch", key, status: res.status, pid: process.pid });
        if (stored(res.status)) {
          const tmp = `${file}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
          writeFileSync(tmp, JSON.stringify({ status: res.status, body: res.body }));
          renameSync(tmp, file);
        }
        return res;
      } finally {
        try {
          unlinkSync(lock);
        } catch {
          // taken over as stale; nothing of ours to remove
        }
      }
    }
    if (lockIsStale(lock)) {
      try {
        unlinkSync(lock);
      } catch {
        // another waiter took it over first
      }
      continue;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}
