"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Icon, type IconName } from "@/components/spine/Icon";
import { IconButton } from "@/components/spine/IconButton";
import { A11Y_TOGGLES, TEXT_SIZES, type A11yToggle, type TextSize } from "@/lib/theme-constants";

/**
 * The Accessibility panel's contents: a title row and eight controls in two
 * columns (Figma "Accessibility Panel", NID-CONTEXT §12). Six are toggles —
 * `aria-pressed`, and an On tile reads as pressed in — and the two text-size
 * controls are steps, plain buttons that never stay On. Every setting is
 * written to <html> and persisted beside the theme; globals.css draws them.
 */

const YEAR = 31536000;

function persist(key: string, value: string | null) {
  if (value === null) {
    localStorage.removeItem(key);
    document.cookie = `${key}=;path=/;max-age=0;samesite=lax`;
  } else {
    localStorage.setItem(key, value);
    document.cookie = `${key}=${encodeURIComponent(value)};path=/;max-age=${YEAR};samesite=lax`;
  }
}

function Control({
  label,
  icon,
  glyph,
  pressed,
  disabled = false,
  onClick,
}: {
  label: string;
  icon?: IconName;
  /** A typographic mark in place of an icon — Phosphor has no A+ / A−. */
  glyph?: string;
  /** Omitted for an action, which must not announce itself as a toggle. */
  pressed?: boolean;
  /** A step at its limit. aria-disabled, never `disabled`: a focused button
   *  that disables itself drops focus to <body>. It stays clickable, so the
   *  click can say why nothing happened. */
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-disabled={disabled || undefined}
      onClick={onClick}
      data-a11y-control=""
      className={clsx(
        // py-4, not the board's 20/16: the board centres 64px of content in a
        // fixed 96px tile, so its padding never fully applies. A min-height
        // rather than a height, so a label still fits at 150% text.
        "flex min-h-24 flex-col items-center justify-center gap-3 rounded-lg px-2 py-4 text-center",
        "transition-colors duration-150 ease-in-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong",
        // A ring, not a border: the On state's 2px outline would otherwise
        // grow the tile by a pixel a side and nudge its neighbours.
        pressed
          ? "bg-surface-hover ring-2 ring-inset ring-accent-primary"
          : clsx("ring-1 ring-inset ring-border-subtle", !disabled && "hover:bg-surface-raised"),
      )}
    >
      {icon ? (
        <Icon name={icon} className="size-8 text-icon-primary" />
      ) : (
        <span
          aria-hidden="true"
          className={clsx(
            "flex size-8 items-center justify-center font-primary text-h5",
            disabled ? "text-icon-tertiary" : "text-icon-primary",
          )}
        >
          {glyph}
        </span>
      )}
      <span
        className={clsx(
          "font-primary text-label",
          disabled ? "text-text-tertiary" : pressed ? "text-text-primary" : "text-text-secondary",
        )}
      >
        {label}
      </span>
    </button>
  );
}

export function AccessibilityPanel({ titleId, onClose }: { titleId: string; onClose: () => void }) {
  const t = useTranslations("Accessibility");
  const { contrast, setContrast } = useTheme();
  const [toggles, setToggles] = useState<ReadonlySet<A11yToggle>>(() => new Set());
  const [size, setSize] = useState<TextSize>("100");
  const [announcement, setAnnouncement] = useState("");

  // Adopt what THEME_SCRIPT already applied before first paint — after mount,
  // for the same reason as ThemeProvider's adopt. The text size too: the step
  // limits and Reset are drawn from it.
  useEffect(() => {
    const root = document.documentElement;
    const on = (root.getAttribute("data-a11y") ?? "").split(" ");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToggles(new Set(A11Y_TOGGLES.filter((key) => on.includes(key))));
    const stored = root.getAttribute("data-text-size");
    setSize((TEXT_SIZES as readonly string[]).includes(stored ?? "") ? (stored as TextSize) : "100");
  }, []);

  // Through an empty frame, so the same words twice in a row (a second press
  // at the largest size) are announced twice, not swallowed as no change.
  const say = (message: string) => {
    setAnnouncement("");
    requestAnimationFrame(() => setAnnouncement(message));
  };

  const largest = size === TEXT_SIZES[TEXT_SIZES.length - 1];
  const smallest = size === TEXT_SIZES[0];
  const anythingSet = contrast || toggles.size > 0 || size !== "100";

  // Both read the current setting from <html>, not from state: <html> is what
  // the page draws from, and a second press before a re-render would
  // otherwise start from the state the first press already replaced.
  const flip = (key: A11yToggle) => {
    const root = document.documentElement;
    const next = new Set((root.getAttribute("data-a11y") ?? "").split(" "));
    if (next.has(key)) next.delete(key);
    else next.add(key);
    // In list order, so the stored string is stable whatever the click order.
    const value = A11Y_TOGGLES.filter((k) => next.has(k)).join(" ");
    if (value) root.setAttribute("data-a11y", value);
    else root.removeAttribute("data-a11y");
    persist("nid-a11y", value || null);
    setToggles(new Set(A11Y_TOGGLES.filter((k) => next.has(k))));
  };

  const step = (direction: 1 | -1) => {
    const root = document.documentElement;
    const current = (root.getAttribute("data-text-size") ?? "100") as TextSize;
    const next = TEXT_SIZES[TEXT_SIZES.indexOf(current) + direction];
    // At a limit the tile is aria-disabled and only says so.
    if (!next) {
      say(t(direction > 0 ? "textLargest" : "textSmallest"));
      return;
    }
    if (next === "100") root.removeAttribute("data-text-size");
    else root.setAttribute("data-text-size", next);
    persist("nid-text-size", next === "100" ? null : next);
    setSize(next);
    // The steps have no visible state, so the new size is said out loud.
    say(t("textSize", { size: next }));
  };

  // Every setting back to the page as designed: the toggles, the text size,
  // and contrast through ThemeProvider, which restores the visitor's own theme.
  // Focus stays here — aria-disabled, never `disabled`, as on the steps.
  const reset = () => {
    if (!anythingSet) return;
    const root = document.documentElement;
    root.removeAttribute("data-a11y");
    root.removeAttribute("data-text-size");
    persist("nid-a11y", null);
    persist("nid-text-size", null);
    if (contrast) setContrast(false);
    setToggles(new Set());
    setSize("100");
    say(t("resetDone"));
  };

  return (
    <div className="flex flex-col gap-3 px-4 pt-3 pb-4">
      <div className="flex items-center gap-2">
        <Icon name="person-arms-spread" className="size-6 shrink-0 text-icon-primary" />
        <h2 id={titleId} className="flex-1 font-primary text-h5 text-text-primary">
          {t("title")}
        </h2>
        {/* Always rendered, so the title row never reflows when it enables. */}
        <button
          type="button"
          aria-disabled={!anythingSet || undefined}
          onClick={reset}
          className={clsx(
            "rounded-lg px-2 py-1 font-primary text-label transition-colors duration-150 ease-in-out",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong",
            anythingSet ? "text-text-secondary hover:text-text-primary" : "text-text-tertiary",
          )}
        >
          {t("reset")}
        </button>
        <IconButton icon="close" label={t("close")} onClick={onClose} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Control
          label={t("contrast")}
          icon="circle-half-tilt"
          pressed={contrast}
          onClick={() => setContrast(!contrast)}
        />
        <Control
          label={t("invert")}
          icon="circle-half"
          pressed={toggles.has("invert")}
          onClick={() => flip("invert")}
        />
        <Control
          label={t("saturation")}
          icon="drop-half"
          pressed={toggles.has("saturation")}
          onClick={() => flip("saturation")}
        />
        <Control label={t("textLarger")} glyph="A+" disabled={largest} onClick={() => step(1)} />
        <Control label={t("textSmaller")} glyph="A−" disabled={smallest} onClick={() => step(-1)} />
        <Control
          label={t("links")}
          icon="link-simple"
          pressed={toggles.has("links")}
          onClick={() => flip("links")}
        />
        <Control
          label={t("images")}
          icon="image-broken"
          pressed={toggles.has("images")}
          onClick={() => flip("images")}
        />
        {/* TODO(review): design sign-off on "Large cursor" — the board labels
            this control "Default cursor", which is not what it turns on (§107). */}
        <Control
          label={t("cursor")}
          icon="cursor-click"
          pressed={toggles.has("cursor")}
          onClick={() => flip("cursor")}
        />
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
