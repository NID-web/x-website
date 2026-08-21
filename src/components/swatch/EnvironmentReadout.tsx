"use client";

import { useEffect, useState } from "react";

type Env = {
  columns: string;
  pageMargin: string;
  columnGap: string;
  contentWidth: string;
  shellWidth: string;
  viewportWidth: number;
  breakpoint: "desktop" | "laptop" | "tablet" | "mobile";
};

function readEnv(): Env {
  const style = getComputedStyle(document.documentElement);
  const width = window.innerWidth;
  const breakpoint =
    width >= 1280
      ? "desktop"
      : width >= 1024
        ? "laptop"
        : width >= 768
          ? "tablet"
          : "mobile";

  // --nid-grid-shell-width is a calc() expression. getComputedStyle on a
  // *custom property* returns it unevaluated (custom properties are raw
  // token streams, not resolved values) — only when the browser lays out an
  // element using that var() does calc() actually get reduced to a number.
  // So measure a real [data-nid-shell] element's rendered width instead of
  // parsing the variable's text.
  const shellEl = document.querySelector<HTMLElement>("[data-nid-shell]");
  const shellWidth = shellEl
    ? `${Math.round(shellEl.getBoundingClientRect().width)}px`
    : "—";

  return {
    columns: style.getPropertyValue("--nid-grid-columns").trim(),
    pageMargin: style.getPropertyValue("--nid-grid-page-margin").trim(),
    columnGap: style.getPropertyValue("--nid-grid-column-gap").trim(),
    contentWidth: style.getPropertyValue("--nid-grid-content-width").trim(),
    shellWidth,
    viewportWidth: width,
    breakpoint,
  };
}

export function EnvironmentReadout() {
  const [env, setEnv] = useState<Env | null>(null);

  useEffect(() => {
    const update = () => setEnv(readEnv());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const rows: [string, string][] = env
    ? [
        ["--nid-grid-columns", env.columns],
        ["--nid-grid-page-margin", env.pageMargin],
        ["--nid-grid-column-gap", env.columnGap],
        ["--nid-grid-content-width", env.contentWidth],
        ["--nid-grid-shell-width", env.shellWidth],
        ["viewport width", `${env.viewportWidth}px`],
        ["active breakpoint", env.breakpoint],
      ]
    : [];

  return (
    <dl
      className="grid grid-cols-1 gap-x-6 gap-y-1 tablet:grid-cols-2"
      data-nid-environment
    >
      {rows.map(([k, v]) => (
        <div
          key={k}
          className="flex justify-between gap-4 border-b border-border-faint py-1"
        >
          <dt className="font-body text-caption text-text-tertiary">{k}</dt>
          <dd
            className="font-body text-caption-bold text-text-primary"
            data-nid-env-value={k}
          >
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
