import clsx from "clsx";
import type { Theme } from "@/lib/theme-constants";
import { MOTIFS } from "@/components/header/motifs";

// The 32×32 theme motif (§3.5) — the real `Motif/<Theme>` craft artwork.
//
// `theme` picks the motif; MOTIFS covers all ten, so there is no fallback. The
// paths bind to accent tokens rather than fixed colours, which is what lets a
// scoped wrapper render one row's motif in ITS theme while the page stays in the
// active one. That scoping needs BOTH data-theme AND data-appearance on the
// wrapper (the semantic layer is keyed by appearance — see ThemePanel), not
// data-theme alone. ThemeMenu supplies both.
//
// Decorative and aria-hidden, so the decorative accent ramp is allowed here
// (CLAUDE.md § Colour).
export function ThemeMotif({ theme, className }: { theme: Theme; className?: string }) {
  const Motif = MOTIFS[theme];
  return (
    <span
      aria-hidden="true"
      className={clsx("inline-flex size-8 shrink-0 items-center justify-center", className)}
    >
      <Motif className="size-8" />
    </span>
  );
}
