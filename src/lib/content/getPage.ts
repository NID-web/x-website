// The one content seam. A page render is one call — the Page, its sections in
// order, items resolved and already grouped (NID-CONTEXT.md §8.4). It reads
// fixtures today; when the API exists only this file changes. Nothing outside
// src/lib/content/ may import a fixture (scripts/lint-fixtures.mjs).
import type { PageResponse } from "@/lib/content-model";
import { ABOUT } from "@/lib/content/fixtures/about";

const FIXTURES: Record<string, PageResponse> = {
  "/about": ABOUT,
};

export async function getPage(path: string): Promise<PageResponse | null> {
  return FIXTURES[path] ?? null;
}
