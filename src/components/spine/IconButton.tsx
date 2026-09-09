import type { Ref } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "@/components/spine/Icon";

/**
 * Circular icon-only button with hover and active states.
 */
export interface IconButtonProps {
  icon: IconName;
  label: string;
  size?: "medium" | "small";
  tone?: "quaternary" | "primary";
  onClick?: () => void;
  expanded?: boolean;
  controls?: string;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}

export function IconButton({
  icon,
  label,
  size = "medium",
  tone = "quaternary",
  onClick,
  expanded,
  controls,
  className,
  ref,
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      aria-controls={controls}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full p-1",
        tone === "primary" ? "text-icon-primary" : "text-icon-quaternary",
        "transition-colors duration-150 ease-in-out hover:bg-accent-quaternary",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong",
        size === "medium" ? "size-8" : "size-6",
        className,
      )}
    >
      <Icon name={icon} className={size === "medium" ? "size-6" : "size-4"} />
    </button>
  );
}
