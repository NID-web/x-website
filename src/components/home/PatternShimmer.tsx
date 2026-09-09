"use client";

import { useEffect } from "react";

/**
 * Global document event listener that manages hover shimmer animation cycles for craft pattern units.
 */

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
