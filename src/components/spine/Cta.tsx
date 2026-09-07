import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/spine/Icon";

// Call to actions (design/NID-CONTEXT.md §7.1, node 1:1071). Two of the eight
// types are built: `uppercase` (Label/Button, the Home tiles) and `primary`
// (Heading/5 over a 2px rule, hugging its content — every stacked or rail
// link on the editorial pages).
export type CtaVariant = "uppercase" | "primary";

export interface CtaProps {
  label: string;
  href: string;
  /** Absolute URL → new tab + plain <a> (no locale prefix). */
  external?: boolean;
  icon?: IconName | "none";
  variant?: CtaVariant;
  /** Whether hover recolours the label and arrow. Off where the design moves
   *  only the underline (the roster CTA), which the caller then supplies as a
   *  `hover:border-*` of its own. */
  hoverLabel?: boolean;
  className?: string;
}

const VARIANT: Record<CtaVariant, string> = {
  // font-heavy overrides Label/Button's own weight: the style is Bold (800),
  // which the export uses, but every CTA on the page is set 700.
  uppercase: "gap-1.5 text-button font-heavy uppercase",
  // 8 / 24 / 6 + the 2px rule = the board's 40px row: the rule is inside the
  // box, not under it, so the 64px stack pitch holds.
  primary: "w-full gap-2 border-b-2 border-border-subtle pt-2 pb-1.5 text-h5",
};

export function Cta({
  label,
  href,
  external = false,
  icon = "arrow-up-right",
  variant = "uppercase",
  hoverLabel = true,
  className,
}: CtaProps) {
  const iconName = icon === "none" ? null : icon;
  const primary = variant === "primary";
  const classes = clsx(
    "group inline-flex items-center font-primary text-text-secondary no-underline transition-colors duration-150 ease-in-out",
    VARIANT[variant],
    hoverLabel && "hover:text-text-primary",
    hoverLabel && primary && "hover:border-border-default",
    className,
  );
  const arrow = iconName && (
    <Icon
      name={iconName}
      className={clsx(
        "size-4 shrink-0 text-icon-quaternary transition-colors duration-150 ease-in-out",
        hoverLabel && "group-hover:text-icon-secondary",
      )}
    />
  );
  const inner = (
    <>
      <span className={clsx(primary && "flex-1")}>{label}</span>
      {/* The primary row hosts its arrow in the Icon Button's 24px box. */}
      {primary ? (
        arrow && <span className="flex size-6 shrink-0 items-center justify-center">{arrow}</span>
      ) : (
        arrow
      )}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}
