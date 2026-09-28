"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Removes its children when an image inside them fails to load, so a slot that
 * renders nothing without an asset (an article hero, a section image with no
 * placeholder — STAGE-0-NOTES §59) also renders nothing when the asset 404s.
 * The server cannot know: a record can carry alt text and a file that is gone.
 *
 * `display: contents`, so the wrapper adds no box and the children stay items
 * of the page grid. Removed rather than hidden, so the grid closes up exactly
 * as it does when the server omits the slot.
 *
 * An image can fail before hydration, when no listener exists yet, so the
 * effect also checks what already finished: `complete` with no natural width
 * is a broken image. `error` does not bubble; the capture phase still passes
 * through this element on its way down to the image.
 */
export function HideOnImageError({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const broken = (img: HTMLImageElement) => img.complete && img.naturalWidth === 0 && Boolean(img.currentSrc || img.src);
    if ([...root.querySelectorAll("img")].some(broken)) {
      setFailed(true);
      return;
    }
    const onError = (event: Event) => {
      if (event.target instanceof HTMLImageElement) setFailed(true);
    };
    root.addEventListener("error", onError, true);
    return () => root.removeEventListener("error", onError, true);
  }, []);

  if (failed) return null;
  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}
