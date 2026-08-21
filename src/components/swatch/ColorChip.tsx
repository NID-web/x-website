"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { SemanticToken } from "./tokens";

export function rgbToHex(rgb: string): string | null {
  const m = rgb.match(/rgba?\(([^)]+)\)/);
  const captured = m?.[1];
  if (!captured) return null;
  const parts = captured.split(",").map((s) => parseFloat(s.trim()));
  const [r, g, b, a] = parts;
  if (a !== undefined && a === 0) return null; // transparent = unresolved
  if (r === undefined || g === undefined || b === undefined) return null;
  return (
    "#" +
    [r, g, b]
      .map((c) => Math.round(c).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

// Reads colour by probe, never by getPropertyValue: an unresolved custom
// property still returns a string from getPropertyValue, but a chip that
// sets `background-color: var(--nid-x)` computes to transparent when --nid-x
// is undefined — which is exactly the UNRESOLVED signal this page needs.
export function ColorChip({ token }: { token: SemanticToken }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hex, setHex] = useState<string | null | "pending">("pending");

  useEffect(() => {
    if (!ref.current) return;
    const resolved = rgbToHex(getComputedStyle(ref.current).backgroundColor);
    setHex(resolved);
  }, []);

  const unresolved = hex === null;

  return (
    <div className="flex items-center gap-3" data-nid-token={token.name}>
      <div
        ref={ref}
        className={clsx(
          token.className,
          "h-10 w-10 shrink-0 rounded border border-border-subtle",
        )}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="font-body text-caption-bold text-text-primary">{token.name}</p>
        <p
          className={clsx(
            "font-body text-micro",
            unresolved ? "text-accent-secondary" : "text-text-tertiary",
          )}
          data-nid-chip-value={hex === "pending" ? "" : (hex ?? "UNRESOLVED")}
        >
          {hex === "pending" ? "…" : (hex ?? "UNRESOLVED")}
        </p>
        {token.note && (
          <p className="font-body text-micro text-text-quaternary">⚠ {token.note}</p>
        )}
      </div>
    </div>
  );
}
