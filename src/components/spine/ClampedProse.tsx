"use client";

// Clamped body copy behind a "See more" disclosure — the one implementation of
// that control on the site. Extracted from `Standfirst`, which had it for the
// phone standfirst only (STAGE-0-NOTES §33), so the Charter body (4361:189634)
// and the standfirst share it instead of forking.
import clsx from "clsx";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/spine/Icon";
import { Prose } from "@/components/spine/Prose";

// Complete class strings, because Tailwind scans source text and never sees a
// name that was assembled at runtime. `body` clamps, `button` hides the control
// outside the range the clamp applies to. Every clamp is `scripting:`-gated: the
// server HTML is clamped from the first paint where JavaScript runs, and full,
// with no button, where it does not — a clip behind a button that cannot open
// it hides the text from that reader for good (STAGE-0-NOTES §74).
//   phone-7    the standfirst: clamped on phones only (4361:190044)
//   always-9   a section body: clamped at every width. Nine lines of
//              Body/Large/Regular at 30px is the board's 270px "Focus body".
const CLAMP = {
  "phone-7": { body: "scripting:max-tablet:line-clamp-[7]", button: "scripting:tablet:hidden" },
  "always-9": { body: "scripting:line-clamp-[9]", button: "" },
} as const;

// A section body clamped at every width, by TEXT line count. Count the lines of
// copy the board shows, not its height ÷ line-height: the boards separate
// paragraphs with a blank 30px line, this component with a 16px margin, and
// `line-clamp` counts neither — History's 300px "Focus body" is nine lines of
// text, not ten (STAGE-0-NOTES §55). Same constraint as above: one complete
// class string per count, never `line-clamp-[${n}]`.
const LINES = {
  4: "scripting:line-clamp-[4]",
  6: "scripting:line-clamp-[6]",
  7: "scripting:line-clamp-[7]",
  8: "scripting:line-clamp-[8]",
  9: "scripting:line-clamp-[9]",
  10: "scripting:line-clamp-[10]",
} as const;

export type ClampLines = keyof typeof LINES;
/** A named preset or a line count — everything `clamp` accepts. */
export type Clamp = keyof typeof CLAMP | ClampLines;

export function ClampedProse({
  text,
  clamp,
  seeMore,
  seeLess,
  reCollapse = true,
  className,
}: {
  /** Paragraphs separated by blank lines, as `Section.body` authors them. */
  text: string;
  /** A named preset, or a line count clamped at every width. */
  clamp: Clamp;
  seeMore: string;
  /** Only read when `reCollapse` is true. */
  seeLess?: string;
  /** False = one-way expand, the button unmounts once open. The standfirst's
   *  shipped behaviour, kept so /en/about is unchanged. */
  reCollapse?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  // Whether the clamp is hiding anything. A fixed line count fits short copy at
  // some widths — History's Origins is nine lines at 1440 and fewer at 768 —
  // and a "See more" that reveals nothing is a dead control. True until
  // measured, so the server HTML is the clamped-with-button state it always was.
  const [clips, setClips] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const { body, button } =
    typeof clamp === "number" ? { body: LINES[clamp], button: "" } : CLAMP[clamp];
  useEffect(() => {
    const el = ref.current;
    if (!el || open) return;
    // Clipped means more than half a line hidden: scrollHeight runs a few px
    // over clientHeight even when nothing is cut (measured 4px), and a real
    // clip hides at least one whole line. The observer fires once on observe
    // and again on every width change, which moves the line breaks.
    const observer = new ResizeObserver(() => {
      const line = parseFloat(getComputedStyle(el).lineHeight) || 24;
      setClips(el.scrollHeight - el.clientHeight > line / 2);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);
  const showButton = (reCollapse || !open) && (open || clips);

  return (
    <>
      <div
        ref={ref}
        id={id}
        // Paragraph spacing is a margin, not a flex `gap`: `line-clamp` sets
        // `display: -webkit-box`, which drops the flex layout and with it any
        // gap, so a gap-spaced stack loses its rhythm the moment it clamps.
        className={clsx("[&>p+p]:mt-4", className, !open && body)}
      >
        <Prose text={text} />
      </div>
      {showButton && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((was) => !was)}
          className={clsx(
            "mt-4 hidden items-center gap-2 py-2 scripting:inline-flex font-primary text-body font-medium text-text-secondary transition-colors duration-150 ease-in-out hover:text-text-primary",
            button,
          )}
        >
          <Icon name={open ? "minus" : "plus"} className="size-4 shrink-0 text-icon-quaternary" />
          {open ? seeLess : seeMore}
        </button>
      )}
    </>
  );
}
