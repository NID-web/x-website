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

/**
 * The ten craft motifs keyed by theme, vectorised from design/assets/motifs.
 * Regenerate individual motif files with `npm run generate:motifs`.
 */
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
