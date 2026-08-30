import type { ComponentType } from "react";
import type { Theme } from "@/lib/theme-constants";
import { HennaMotif } from "@/components/header/motifs/henna";
import { IkkatMotif } from "@/components/header/motifs/ikkat";
import { IndigoMotif } from "@/components/header/motifs/indigo";
import { KhadiMotif } from "@/components/header/motifs/khadi";
import { LotusMotif } from "@/components/header/motifs/lotus";
import { PeacockMotif } from "@/components/header/motifs/peacock";
import { TanjoreMotif } from "@/components/header/motifs/tanjore";
import { TerracottaMotif } from "@/components/header/motifs/terracotta";
import { TigerMotif } from "@/components/header/motifs/tiger";
import { YogaMotif } from "@/components/header/motifs/yoga";

export interface MotifProps {
  className?: string;
}

// The ten craft motifs, keyed by theme — the Figma `Motif/<Theme>` symbols
// (`3225:49127` Peacock … `3225:53279` Yoga, design/NID-CONTEXT.md §13).
//
// These files are GENERATED. The source of record is the PNG export in
// design/assets/motifs/; `npm run generate:motifs` vectorises each one into a
// sibling <theme>.tsx. Edit the PNG and regenerate — a hand edit to a .tsx here
// is reverted silently by the next run (same contract as themes.css).
//
// The conversion is lossless: the exports are pixel art with alpha strictly 0 or
// 255, so the emitted rectangles reproduce them exactly, and — being vector —
// stay sharp above 32px, which the 1× PNGs would not.
//
// Colour is the reason for generating rather than shipping the PNGs. Every
// colour in every motif is a step of its OWN theme's ramp, and those steps are
// the light-appearance accent semantics, so each path is emitted as
// `var(--nid-accent-*)`. That makes a motif follow both axes — theme AND
// light/dark — where a baked PNG would stay light-coloured in all ten dark
// themes. It also means the scoped `data-theme` + `data-appearance` wrapper in
// ThemeMenu re-colours a row's motif for free (§3.5).
//
// One documented exception: Tiger's stripes are `--nid-quaternary-650`, a
// primitive rather than a layer-2 token. No semantic token resolves to that
// step, and it must NOT invert with appearance — Tiger's deepest steps are
// deliberately near-black so the motif reads black-on-ochre (§3.3). See
// docs/STAGE-0-NOTES.md §14.
export const MOTIFS: Record<Theme, ComponentType<MotifProps>> = {
  henna: HennaMotif,
  ikkat: IkkatMotif,
  indigo: IndigoMotif,
  khadi: KhadiMotif,
  lotus: LotusMotif,
  peacock: PeacockMotif,
  tanjore: TanjoreMotif,
  terracotta: TerracottaMotif,
  tiger: TigerMotif,
  yoga: YogaMotif,
};
