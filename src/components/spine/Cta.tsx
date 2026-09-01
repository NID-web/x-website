import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/spine/Icon";

export interface CtaProps {
  label: string;
  href: string;
  /** Absolute URL → new tab + plain <a> (no locale prefix). */
  external?: boolean;
  icon?: IconName | "none";
  /** Whether hover recolours the label and arrow. Off where the design moves
   *  only the underline (the roster CTA), which the caller then supplies as a
   *  `hover:border-*` of its own. */
  hoverLabel?: boolean;
  className?: string;
}

export function Cta({
  label,
  href,
  external = false,
  icon = "arrow-up-right",
  hoverLabel = true,
  className,
}: CtaProps) {
  const iconName = icon === "none" ? null : icon;
  // font-heavy overrides Label/Button's own weight: the style is Bold (800),
  // which the export uses, but every CTA on the page is set 700.
  const classes = clsx(
    "group inline-flex items-center gap-1.5 font-primary text-button font-heavy uppercase text-text-secondary no-underline transition-colors duration-150 ease-in-out",
    hoverLabel && "hover:text-text-primary",
    className,
  );
  const inner = (
    <>
      <span>{label}</span>
      {iconName && (
        <Icon
          name={iconName}
          className={clsx(
            "size-4 shrink-0 text-icon-quaternary transition-colors duration-150 ease-in-out",
            hoverLabel && "group-hover:text-icon-secondary",
          )}
        />
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
