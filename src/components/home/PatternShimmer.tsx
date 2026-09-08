"use client";

import { useEffect } from "react";

// Lets a craft sub-pattern finish its shimmer after the pointer has left.
//
// CSS alone cannot: `:hover` drives the animation, and the frame a pointer
// leaves on is the frame the unit is stuck with, because the declaration goes
// away with the selector. So a pointer entering a unit LATCHES a class on it,
// and the class is what the animation actually hangs off; the run then ends on
// its own terms (globals.css, --nid-pattern-cycles) rather than on the pointer.
//
// One delegated listener on the document, mounted once in the locale layout —
// not one per tile. There are 48 units on Home alone, the pattern tiles are
// decorative and never re-render, and `pointerover` bubbles, so a listener per
// unit would buy nothing. It also keeps patterns.tsx OUT of the client bundle:
// the fields are ~1100 lines of generated SVG and making PatternTile a client
// component would ship all of it as JavaScript.
//
// The class is removed when the FIRST frame's animation ends, which is what
// makes a second hover replay it. The first frame is the one whose end IS the
// visible end: it reverts to the base rule, which paints it, while every
// staggered straggler is in an off window. Waiting for the LAST frame instead
// holds the latch ~1s past the point where anything is still moving, and a
// hover in that window does nothing. Dropping the class cancels those
// stragglers, which is free — they are invisible and already at their base.
//
// Renders nothing, and adds nothing without JavaScript: the `:hover` rule still
// stands on its own, so the shimmer degrades to "runs while hovered".

const RUNNING = "nid-pattern-unit--running";
const UNIT = ".nid-pattern-unit";
const FRAME = ".nid-pattern-frame";
const NAME = "nid-pattern-shimmer";

export function PatternShimmer() {
  useEffect(() => {
    const start = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      target.closest(UNIT)?.classList.add(RUNNING);
    };

    const finish = (event: AnimationEvent) => {
      if (event.animationName !== NAME) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const unit = target.closest(UNIT);
      if (!unit) return;
      if (target === unit.querySelector(FRAME)) unit.classList.remove(RUNNING);
    };

    document.addEventListener("pointerover", start);
    document.addEventListener("animationend", finish);
    return () => {
      document.removeEventListener("pointerover", start);
      document.removeEventListener("animationend", finish);
    };
  }, []);

  return null;
}
