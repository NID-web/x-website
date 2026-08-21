"use client";

import { useEffect, useRef, useState } from "react";
import { GridItem } from "@/components/layout/GridItem";

type Check = { label: string; actual: number; expected: number; ok: boolean };

// Expected origins are derived from the current viewport, not hardcoded to
// 1440 — the shell centers itself once the viewport exceeds max-w-shell, so
// column 1's left edge is only exactly 24px when the viewport IS 1440px.
// At exactly 1440px this reduces to the reference values from
// NID-CONTEXT.md §5.1: 24, 378, 732, 1086.
//
// shellLeft AND the actual content width both come from measuring the real
// [data-nid-shell] element, not from CSS tokens:
//   - --nid-grid-shell-width is a calc() expression, and getComputedStyle on
//     a *custom property* returns it unevaluated (custom properties are raw
//     token streams — calc() only gets reduced to a number when a real
//     layout property uses the var()).
//   - --nid-grid-content-width (1392 at desktop) is only the width at the
//     reference viewport (1440) where the shell has hit its max-width and
//     centers. Below that — say a 1280px window, still "desktop" by column
//     count — the shell instead fills the viewport and the content box is
//     fluidly narrower than 1392, even though the token never changes. Using
//     the token there under-measures the real column width.
function computeChecks(rects: (number | null)[], shellEl: HTMLElement | null): Check[] {
  const style = getComputedStyle(document.documentElement);
  const num = (name: string) => parseFloat(style.getPropertyValue(name));
  const margin = num("--nid-grid-page-margin");
  const gap = num("--nid-grid-column-gap");
  const columns = num("--nid-grid-columns");
  const shellRect = shellEl?.getBoundingClientRect();
  const contentWidth = (shellRect?.width ?? NaN) - margin * 2;
  const colWidth = (contentWidth - gap * (columns - 1)) / columns;
  const shellLeft = shellRect?.left ?? NaN;

  return rects.map((actual, i) => {
    // Below 4 physical columns, four span-1 items wrap onto a second row —
    // items 3 and 4 land back at column indices 0 and 1, not 2 and 3. Test
    // the wrapped index, not the raw item index, or this reads as a false
    // failure at tablet/mobile instead of the expected reflow.
    const colIndex = i % columns;
    const expected = shellLeft + margin + colIndex * (colWidth + gap);
    return {
      label: `col ${i + 1}`,
      actual: actual ?? NaN,
      expected: Math.round(expected * 10) / 10,
      ok: actual !== null && Math.abs(actual - expected) <= 0.5,
    };
  });
}

const PROOF_BOX =
  "flex h-16 items-center justify-center rounded bg-accent-subtle font-body text-caption-bold text-text-primary";

// Renders as flat GridItem siblings — a page is one grid (CLAUDE.md), so
// these must be direct children of the page's single PageGrid, not wrapped
// in a nested PageGrid/grid of their own.
export function GridProofCells() {
  const refs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];
  const [checks, setChecks] = useState<Check[] | null>(null);

  useEffect(() => {
    function measure() {
      const rects = refs.map((r) => r.current?.getBoundingClientRect().left ?? null);
      const shellEl = refs[0]?.current?.closest<HTMLElement>("[data-nid-shell]") ?? null;
      setChecks(computeChecks(rects, shellEl));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <GridItem key={i} span={1}>
          <div ref={refs[i]} data-nid-col={i + 1} className={PROOF_BOX}>
            {i + 1}
          </div>
        </GridItem>
      ))}
      <GridItem span={2}>
        <div className={PROOF_BOX}>span 2</div>
      </GridItem>
      <GridItem span={3}>
        <div className={PROOF_BOX}>span 3</div>
      </GridItem>
      <GridItem span={4}>
        <div className={PROOF_BOX}>span 4</div>
      </GridItem>
      <GridItem span={4}>
        {checks && (
          <ul className="flex flex-wrap gap-4 font-body text-caption text-text-secondary">
            {checks.map((c) => (
              <li key={c.label}>
                {c.ok ? "✅" : "❌"} {c.label}: {Math.round(c.actual)}px (expected{" "}
                {c.expected}px)
              </li>
            ))}
          </ul>
        )}
      </GridItem>
    </>
  );
}
