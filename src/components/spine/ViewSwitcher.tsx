"use client";

// The faculty directory's view switcher (the board's Call-to-actions button and
// its Faculty Menu, STAGE-0-NOTES §82): the current view's name over a caret,
// opening the list of views. A native <details>, so it works with JavaScript
// off — the summary toggles, every view is a plain link — as "See more" does
// (§74). JavaScript only adds what <details> lacks: Escape closes it and
// returns focus to the summary, and a click outside closes it. No animation.
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";

export interface SwitcherView {
  label: string;
  href: string;
  current: boolean;
}

export function ViewSwitcher({ label, views }: { label: string; views: SwitcherView[] }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const current = views.find((v) => v.current);

  useEffect(() => {
    const details = ref.current;
    if (!details) return;
    const close = (focus: boolean) => {
      if (!details.open) return;
      details.open = false;
      if (focus) details.querySelector("summary")?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    const onPointer = (e: PointerEvent) => {
      if (!details.contains(e.target as Node)) close(false);
    };
    details.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      details.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <details ref={ref} className="relative">
      {/* The Call-to-actions row (Cta's primary box: Heading/5, the rule
          below), naming the current view. The visually hidden prefix makes
          the button read "View faculty by: Discipline". */}
      <summary
        className={clsx(
          "flex w-full cursor-pointer list-none items-center gap-2 border-b-2 border-border-subtle pt-2 pb-1.5",
          "font-primary text-h5 text-text-secondary transition-colors duration-150 ease-in-out",
          "hover:border-border-default hover:text-text-primary [&::-webkit-details-marker]:hidden",
        )}
      >
        <span className="flex-1">
          <span className="sr-only">{label}: </span>
          {current?.label}
        </span>
        {/* The board's CaretDown, open or closed: no transform (CLAUDE.md). */}
        <Icon name="caret-down" className="size-6 shrink-0 text-icon-quaternary" />
      </summary>
      {/* Over the content, not in flow: opening it moves nothing on the page. */}
      <ul className="absolute inset-x-0 top-full z-10 mt-2 flex flex-col border border-border-subtle bg-surface-raised">
        {views.map((view) => (
          <li key={view.href}>
            <Link
              href={view.href}
              aria-current={view.current ? "page" : undefined}
              className={clsx(
                "block px-4 py-3 font-primary text-h6 no-underline transition-colors duration-150 ease-in-out",
                view.current ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
              )}
            >
              {view.label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
