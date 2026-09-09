"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Icon } from "@/components/spine/Icon";
import type { HomeVideo } from "@/lib/home-content";

/**
 * Self-hosted looped video player for the hero tile.
 * Respects prefers-reduced-motion and provides an accessible toggle control.
 */
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
          playing &&
            "[@media(hover:hover)]:opacity-0 group-hover/tile:opacity-100 focus-visible:opacity-100",
        )}
      >
        <Icon name={playing ? "pause" : "play"} className="size-5" />
      </button>
    </div>
  );
}
