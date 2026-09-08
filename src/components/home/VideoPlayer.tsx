"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Icon } from "@/components/spine/Icon";
import type { HomeVideo } from "@/lib/home-content";

// A poster that becomes a video in place. Nothing of YouTube's — not the API
// script, not the iframe, not a cookie — is fetched until the first click, so
// the tile costs one image at rest.
//
// The poster is never removed. It sits over the iframe for as long as YouTube
// takes to boot, and the iframe is hidden back behind it on every pause —
// so the tile is never briefly empty, and a paused tile looks exactly like a
// tile that has not been played yet.
//
// Hiding the iframe is also the only way to be rid of YouTube's pause overlay.
// `controls=0`, `modestbranding=1` and `rel=0` do not touch it: on PAUSED it
// draws a title bar (avatar, title, channel), a share button and a "Watch on
// YouTube" pill, and the title bar is a LINK OFF THE SITE. A translucent scrim
// would only tint it; `visibility: hidden` removes it from the picture and from
// hit-testing both, and the poster underneath is a better opaque layer than any
// colour we could pick. Playback position survives — the element stays mounted,
// so resuming is still playVideo(), not a reload.
//
// The same overlay also appears mid-PLAY on hover, plus a "More videos" panel —
// `controls=0` suppresses the scrubber, not the hover chrome. So the playing
// iframe is `pointer-events-none` and a transparent button of our own sits over
// it: YouTube never sees the pointer, and the click that used to reach its
// player calls pauseVideo() instead. That trade only holds while the API is
// live, hence `apiReady` — without it there is nothing to call, so the iframe
// stays interactive and YouTube's own click-to-pause (and its chrome) come
// back. Degraded, not broken.
//
// And it shows a third time, on boot: from the click until the first frames
// render, the player sits on black under the same furniture. That is why
// `booting` is a phase of its own. It cannot be waited out on a clock — the
// overlay clears when playback actually starts, which was ~2s on the design
// owner's machine and ~6s on a cold one here. So the poster is held until
// getCurrentTime() proves the video is genuinely running, plus SETTLE_MS for
// the overlay's fade. The cost is the first second or so of the film, unseen
// behind the poster; the alternative is showing YouTube's branding every time.

const API_SRC = "https://www.youtube.com/iframe_api";

// YT.PlayerState: ENDED 0, PLAYING 1, PAUSED 2.
const ENDED = 0;
const PLAYING = 1;
const PAUSED = 2;

type Phase = "rest" | "booting" | "playing" | "paused";

// The boot overlay is timed off PLAYBACK, not off the wall clock, so the video's
// own clock is the network-independent way to wait it out — getCurrentTime()
// advances only while YouTube is serving frames, and it and the overlay start
// together. Sampled against a bare embed of the same params: overlay still up at
// 3.5s of video time, gone by 4.0s. 4.5 clears it with margin.
//
// Two things this is NOT:
//  - not a wall-clock delay. The first attempt revealed 900ms after playback
//    passed 0.3s and landed on full chrome; the same overlay ran ~2s on the
//    design owner's machine and ~6s on a cold load here.
//  - not seek-then-reveal. seekTo(0) re-buffers from zero and restarts the
//    overlay, so winding back to save the opening just pays for it twice.
// So the first REVEAL_AFTER_S of the film plays behind the poster and is not
// seen. It costs little here — this film opens on black under music for more
// than four seconds — but it is a real trade, and the reason a self-hosted file
// would be better than an embed.
const REVEAL_AFTER_S = 4.5;
const SETTLE_MS = 400;
const POLL_MS = 200;

// Last resort. Every other path out of `booting` runs through the player, so a
// handshake that never completes would leave the poster up over a video that is
// playing underneath it, with no way back. Long enough not to race a slow start,
// short enough that nobody waits on a dead tile.
const BOOT_TIMEOUT_MS = 15000;

interface YtPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  /** Captions. `cc_load_policy=0` is a request, not a guarantee — a viewer with
   *  captions forced on in their YouTube settings gets them anyway. Unloading
   *  the module is the one that always wins. The name changed between player
   *  versions, so both are unloaded. */
  unloadModule: (name: string) => void;
  destroy: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLIFrameElement,
        opts: {
          events: {
            onReady: (e: { target: YtPlayer }) => void;
            onStateChange: (e: { data: number }) => void;
          };
        },
      ) => YtPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// One script per document, however many players ask for it. Resolves false on a
// load failure rather than rejecting — a blocked CDN costs the pause/resume
// wiring, not the video.
let apiPromise: Promise<boolean> | null = null;

function loadApi(): Promise<boolean> {
  apiPromise ??= new Promise<boolean>((resolve) => {
    if (window.YT?.Player) {
      resolve(true);
      return;
    }
    // The API calls this global when it is ready; chain rather than overwrite,
    // since it is a documented single slot and something else may own it.
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(true);
    };
    const script = document.createElement("script");
    script.src = API_SRC;
    script.async = true;
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
  return apiPromise;
}

function embedSrc({ id, start }: HomeVideo) {
  const params = new URLSearchParams({
    autoplay: "1",
    // autoplay is only honoured muted, and an unmuted autoplay would be
    // hostile anyway. The two always travel together.
    mute: "1",
    controls: "0",
    // No captions, no annotations, no related-video shelf.
    cc_load_policy: "0",
    iv_load_policy: "3",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1",
  });
  if (start) params.set("start", String(start));
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

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
  // `rest` has no iframe at all. `booting` has one, mounted and hidden behind
  // the poster, while YouTube starts up under its own branding. `playing` and
  // `paused` are what they say. Only `rest -> booting` is irreversible.
  const [phase, setPhase] = useState<Phase>("rest");
  const [apiReady, setApiReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const started = phase !== "rest";

  useEffect(() => {
    if (!started) return;
    let cancelled = false;

    void loadApi().then((ok) => {
      if (cancelled) return;
      if (!ok || !iframeRef.current || !window.YT) {
        // Nothing to poll and nothing to call. Reveal the video as it is and
        // let YouTube own its own chrome — a broken tile would be worse.
        setPhase("playing");
        return;
      }
      // Attaching to an existing iframe, not building one — that is what keeps
      // the embed on youtube-nocookie.com, which the API's own constructor
      // would not do.
      playerRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          // `apiReady` is set HERE, not after the constructor. `new YT.Player`
          // returns before the iframe handshake finishes, and until it does the
          // object carries none of its methods — polling getCurrentTime() off
          // the constructor's return value threw "not a function" on every tick
          // until the player caught up. It never surfaced in a build because an
          // exception inside setInterval kills neither the interval nor the
          // page; it only showed in dev, where the overlay reports it.
          //
          // Taking the player from the event rather than the ref for the same
          // reason: the event's target is ready by definition.
          onReady: ({ target }) => {
            target.unloadModule("captions");
            target.unloadModule("cc");
            setApiReady(true);
          },
          onStateChange: ({ data }) => {
            if (data === PAUSED || data === ENDED) setPhase("paused");
            // A PLAYING while booting is not enough to reveal on — the boot
            // overlay outlives it. The watcher below decides that one.
            else if (data === PLAYING) setPhase((p) => (p === "booting" ? p : "playing"));
          },
        },
      });
    });

    return () => {
      cancelled = true;
      setApiReady(false);
      if (typeof playerRef.current?.destroy === "function") playerRef.current.destroy();
      playerRef.current = null;
    };
  }, [started]);

  // The bail-out, deliberately not gated on `apiReady` — the case it exists for
  // is the one where `apiReady` never arrives.
  useEffect(() => {
    if (phase !== "booting") return;
    const bail = setTimeout(() => setPhase("playing"), BOOT_TIMEOUT_MS);
    return () => clearTimeout(bail);
  }, [phase]);

  // Reveal on evidence, not on a timer: the clock that matters is the video's
  // own, and it only advances once frames are really rendering.
  useEffect(() => {
    if (phase !== "booting" || !apiReady) return;
    let settle: ReturnType<typeof setTimeout>;
    const poll = setInterval(() => {
      const player = playerRef.current;
      if (typeof player?.getCurrentTime !== "function") return;
      if (player.getCurrentTime() <= REVEAL_AFTER_S) return;
      clearInterval(poll);
      settle = setTimeout(() => setPhase("playing"), SETTLE_MS);
    }, POLL_MS);
    return () => {
      clearInterval(poll);
      clearTimeout(settle);
    };
  }, [phase, apiReady]);

  const onPlay = useCallback(() => {
    if (phase === "rest") {
      setPhase("booting");
      return;
    }
    // Resuming needs no hold — the boot overlay is a first-start thing. Unhide
    // before playVideo(), not after: a browser is entitled to refuse playback
    // in a `visibility: hidden` frame.
    setPhase("playing");
    playerRef.current?.playVideo();
  }, [phase]);

  const onPause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  return (
    <div className="relative h-full w-full">
      {children}

      {started && (
        <div
          className={clsx(
            "absolute inset-0 overflow-hidden",
            phase !== "playing" && "invisible",
          )}
        >
          {/* Cover, not contain: a 16:9 frame grown until it fills the box on
              both axes and centred, so the crop falls off the long edge — top
              and bottom in the 684x330 banner, left and right in the square. */}
          <iframe
            ref={iframeRef}
            src={embedSrc(video)}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className={clsx(
              "absolute top-1/2 left-1/2 aspect-video min-h-full min-w-full",
              "-translate-x-1/2 -translate-y-1/2 border-0",
              apiReady && "pointer-events-none",
            )}
          />
        </div>
      )}

      {phase === "playing" && apiReady && (
        // Invisible by design: the video is the affordance, and this only
        // restores the click-to-pause that pointer-events-none took away.
        <button
          type="button"
          onClick={onPause}
          aria-label={pauseLabel}
          className="absolute inset-0 size-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-strong"
        />
      )}

      {(phase === "rest" || phase === "paused") && (
        <button
          type="button"
          onClick={onPlay}
          aria-label={playLabel}
          className={clsx(
            "absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2",
            "items-center justify-center rounded-full bg-surface-inverse/60 text-text-on-accent",
            "transition-colors duration-150 ease-in-out hover:bg-surface-inverse/80",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong",
          )}
        >
          <Icon name="play" className="size-7" />
        </button>
      )}
    </div>
  );
}
