"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Icon } from "@/components/spine/Icon";
import type { HomeVideo } from "@/lib/home-content";

// A self-hosted clip that plays in place of the tile's still. It replaced a
// YouTube embed, and the reason is worth keeping: an embed cannot be told to
// stop drawing its own furniture. `controls=0` suppressed the scrubber but not
// the title bar, the share button, the "More videos" shelf or the logo, which
// appeared on hover, on pause AND for the first four seconds of playback — and
// the title bar was a link off the site. A <video> has none of that, and no
// third-party request, so no consent surface either.
//
// The still stays underneath rather than riding on `poster`: it is the same
// TileImage every other tile uses, so it keeps next/image's responsive sizes
// and stays the LCP candidate. The clip fades in over it once it is genuinely
// playing, which also covers the decode.
//
// It does NOT use the `autoPlay` attribute. Autoplay is a motion decision, and
// a viewer who asked for less motion has to be able to opt out of it — the
// attribute fires before any of that can be checked, so playback is started
// from an effect that reads the media query first (CLAUDE.md § Icons and
// motion). Muted throughout: unmuted autoplay is refused by every browser and
// would be hostile even where it isn't.
//
// The toggle is a real control, not a transparent hit area. WCAG 2.2.2 wants a
// mechanism to pause anything that moves for more than five seconds, and "click
// the video and hope" is not one when the viewer never asked it to start.
//
// It hides until the tile is hovered — but only where hovering is a thing. The
// axis is POINTER CAPABILITY, not viewport width: a touch laptop is wide and
// still never fires hover, so a `laptop:` rule would strand the control on it.
// Hence base `opacity-100` with `[@media(hover:hover)]` opting into hiding,
// rather than the reverse. Tailwind already wraps `hover:` in that same query,
// so on a touch device neither half applies and the base wins.
//
// Two things stay visible regardless: a focused control (keyboard users get no
// hover), and a PAUSED one — a stopped video with no affordance on it reads as
// broken, and only the moving case is what 2.2.2 is about.

export function VideoPlayer({
  video,
  playLabel,
  pauseLabel,
  children,
}: {
  video: HomeVideo;
  playLabel: string;
  pauseLabel: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // A rejected play() is not a failure worth surfacing — a data-saver mode or
    // a background tab can refuse it, and the still plus the control is a
    // perfectly good resting state.
    void el.play().catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
  }, []);

  return (
    <div className="relative h-full w-full">
      {children}

      <video
        ref={ref}
        src={video.src}
        title={video.title}
        muted
        loop
        playsInline
        preload="metadata"
        onPlaying={() => {
          setShown(true);
          setPlaying(true);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className={clsx(
          "absolute inset-0 size-full object-cover",
          "transition-opacity duration-300 ease-out motion-reduce:transition-none",
          shown ? "opacity-100" : "opacity-0",
        )}
      />

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? pauseLabel : playLabel}
        className={clsx(
          "absolute right-4 bottom-4 flex size-10 items-center justify-center rounded-full",
          "bg-surface-inverse/60 text-text-on-accent opacity-100",
          "transition-[opacity,background-color] duration-150 ease-in-out motion-reduce:transition-none",
          "hover:bg-surface-inverse/80",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong",
          // `group/tile` is NAMED on Tile, and the slash form is required — a
          // bare `group-hover:` would match any ancestor group.
          playing &&
            "[@media(hover:hover)]:opacity-0 group-hover/tile:opacity-100 focus-visible:opacity-100",
        )}
      >
        <Icon name={playing ? "pause" : "play"} className="size-5" />
      </button>
    </div>
  );
}
