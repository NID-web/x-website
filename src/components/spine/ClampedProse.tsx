"use client";

// Clamped body copy behind a "See more" disclosure — the one implementation of
// that control on the site. Extracted from `Standfirst`, which had it for the
// phone standfirst only (STAGE-0-NOTES §33), so the Charter body (4361:189634)
// and the standfirst share it instead of forking.
import clsx from "clsx";
import { useId, useState } from "react";
import { Icon } from "@/components/spine/Icon";

// Complete class strings, because Tailwind scans source text and never sees a
// name that was assembled at runtime. `body` clamps, `button` hides the control
// outside the range the clamp applies to.
//   phone-7    the standfirst: clamped on phones only (4361:190044)
//   always-9   a section body: clamped at every width. Nine lines of
//              Body/Large/Regular at 30px is the board's 270px "Focus body".
const CLAMP = {
  "phone-7": { body: "max-tablet:line-clamp-[7]", button: "tablet:hidden" },
  "always-9": { body: "line-clamp-[9]", button: "" },
} as const;

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
  clamp: keyof typeof CLAMP;
  seeMore: string;
  /** Only read when `reCollapse` is true. */
  seeLess?: string;
  /** False = one-way expand, the button unmounts once open. The standfirst's
   *  shipped behaviour, kept so /en/about is unchanged. */
  reCollapse?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { body, button } = CLAMP[clamp];
  const showButton = reCollapse || !open;

  return (
    <>
      <div
        id={id}
        // Paragraph spacing is a margin, not a flex `gap`: `line-clamp` sets
        // `display: -webkit-box`, which drops the flex layout and with it any
        // gap, so a gap-spaced stack loses its rhythm the moment it clamps.
        className={clsx("[&>p+p]:mt-4", className, !open && body)}
      >
        {text.split(/\n{2,}/).map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      {showButton && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((was) => !was)}
          className={clsx(
            "mt-4 inline-flex items-center gap-2 py-2 font-primary text-body font-medium text-text-secondary transition-colors duration-150 ease-in-out hover:text-text-primary",
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
