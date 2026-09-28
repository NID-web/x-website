import clsx from "clsx";
import type { ReactNode } from "react";
import { Icon } from "@/components/spine/Icon";
import { Link } from "@/i18n/navigation";

/** The caller's classes split into base utilities and breakpoint overrides, so
 *  the row emits base → shell → overrides: the repo's "a base utility plus
 *  breakpoint-scoped overrides" shape (GridItem's SPAN), with the shell between. */
function split(className: string | undefined) {
  const tokens = (className ?? "").split(/\s+/).filter(Boolean);
  const responsive = (t: string) => /^(tablet|laptop|desktop):/.test(t);
  return [tokens.filter((t) => !responsive(t)).join(" "), tokens.filter(responsive).join(" ")] as const;
}

/**
 * The shell every list row shares (the archive's, the award gallery's): one
 * `<li>`, the whole row one link, a 1px rule, 150ms colour-only hover.
 *
 *   pt-2 pb-1.75 + the 1px rule = the board's padding with the rule INSIDE the
 *   row's height, as Cta's primary row does it, so a 96px row is 96 and the
 *   120 pitch holds (STAGE-0-NOTES §66).
 *
 * The row's own layout — flex or named grid areas, per breakpoint — is the
 * caller's `className`; the shell knows nothing about dates or awards. With no
 * `href` the row is a plain element with no arrow and no hover: an arrow that
 * goes nowhere misleads, and the route gate forbids a dead link.
 */
export function LinkedRow({
  href,
  className,
  arrowClassName,
  children,
}: {
  href?: string;
  className?: string;
  /** Where the arrow slot sits in the caller's layout. */
  arrowClassName?: string;
  children: ReactNode;
}) {
  const [base, responsive] = split(className);
  if (!href) {
    return (
      <li>
        <div className={clsx(base, "border-b border-border-subtle pt-2 pb-1.75", responsive)}>{children}</div>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={href}
        className={clsx(
          "group",
          base,
          "border-b border-border-subtle pt-2 pb-1.75 no-underline",
          "transition-colors duration-150 ease-in-out hover:border-border-default",
          responsive,
        )}
      >
        {children}
        <span className={clsx("flex size-6 shrink-0 items-center justify-center", arrowClassName)}>
          <Icon
            name="arrow-up-right"
            className="size-4 text-icon-quaternary transition-colors duration-150 ease-in-out group-hover:text-icon-secondary"
          />
        </span>
      </Link>
    </li>
  );
}

/**
 * A row's headline: turns `accent/primary` while its linked row is hovered.
 * Placed anywhere inside the row — the archive's sits in a `display: contents`
 * wrapper. In a row with no link there is no `group`, so the hover is inert.
 */
export function RowHeadline({ className, children }: { className?: string; children: ReactNode }) {
  const [base, responsive] = split(className);
  return (
    <span
      className={clsx(
        base,
        "transition-colors duration-150 ease-in-out",
        responsive,
        // Restated at desktop, or a caller's desktop:text-* would outrank the
        // hover colour there (the archive recolours its title at 4 columns).
        "group-hover:text-accent-primary desktop:group-hover:text-accent-primary",
      )}
    >
      {children}
    </span>
  );
}
