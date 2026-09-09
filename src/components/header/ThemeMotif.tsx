import clsx from "clsx";
import type { Theme } from "@/lib/theme-constants";
import { MOTIFS } from "@/components/header/motifs";

/**
 * Theme craft motif icon, binding to theme accent tokens.
 */
const SIZE = {
  header: "size-8",
  card: "size-16 desktop:size-20",
} as const;

export function ThemeMotif({
  theme,
  size = "header",
  className,
}: {
  theme: Theme;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const Motif = MOTIFS[theme];
  return (
    <span
      aria-hidden="true"
      className={clsx("inline-flex shrink-0 items-center justify-center", SIZE[size], className)}
    >
      <Motif className={SIZE[size]} />
    </span>
  );
}
