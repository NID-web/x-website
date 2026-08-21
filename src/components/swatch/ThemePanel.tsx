"use client";

import { useEffect, useRef, useState } from "react";
import { ColorChip, rgbToHex } from "./ColorChip";
import { SEMANTIC_TOKENS } from "./tokens";
import type { Theme, Appearance } from "@/lib/theme-constants";

const QUIRKS: Partial<Record<Theme, string>> = {
  yoga: "Deliberate quirk — Yoga's five ramps are identical greyscale, so every accent below is the same colour. Not a bug.",
  tiger:
    "Deliberate quirk — Tiger's primary ramp runs to a near-black deep step on purpose.",
};

function SurfaceProbe() {
  const ref = useRef<HTMLDivElement>(null);
  const [hex, setHex] = useState<string | null | "pending">("pending");

  useEffect(() => {
    if (!ref.current) return;
    setHex(rgbToHex(getComputedStyle(ref.current).backgroundColor));
  }, []);

  return (
    <span className="font-body text-micro text-text-tertiary">
      surface/page:{" "}
      <span ref={ref} className="bg-surface-page">
        {hex === "pending" ? "…" : (hex ?? "UNRESOLVED")}
      </span>
    </span>
  );
}

export function ThemePanel({ theme, appearance }: { theme: Theme; appearance: Appearance }) {
  return (
    <section
      data-theme={theme}
      data-appearance={appearance}
      className="flex flex-col gap-4 rounded border border-border-subtle bg-surface-page p-6"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border-faint pb-3">
        <h3 className="font-primary text-h6 text-text-primary capitalize">
          {theme} · {appearance}
        </h3>
        <SurfaceProbe />
      </header>

      {QUIRKS[theme] && (
        <p className="font-body text-micro text-text-quaternary">{QUIRKS[theme]}</p>
      )}

      <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
        {SEMANTIC_TOKENS.map((token) => (
          <ColorChip key={token.name} token={token} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-6 border-t border-border-faint pt-4">
        <div className="flex flex-col gap-1">
          <span className="font-body text-micro text-text-tertiary">
            border/subtle → border/default (hover)
          </span>
          <div className="h-2 w-32 rounded-full border-2 border-border-subtle transition-colors duration-150 ease-in-out hover:border-border-default" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-body text-micro text-text-tertiary">
            accent/quaternary (hover fill)
          </span>
          <div className="h-8 w-8 rounded-full bg-surface-raised transition-colors duration-150 ease-in-out hover:bg-accent-quaternary" />
        </div>
      </div>
    </section>
  );
}
