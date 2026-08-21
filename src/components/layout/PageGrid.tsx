import clsx from "clsx";
import type { ElementType, ReactNode } from "react";

// The whole page is one grid. Do not nest per-section flex containers —
// column 1 is the label rail for the entire page and nesting destroys that
// alignment. data-nid-shell / data-nid-grid are hooks for the Playwright
// verification script, not styling.
export function PageGrid({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag data-nid-shell className="mx-auto w-full max-w-shell px-margin">
      <div
        data-nid-grid
        className={clsx("grid grid-cols-page gap-x-gutter gap-y-rowgutter", className)}
      >
        {children}
      </div>
    </Tag>
  );
}
