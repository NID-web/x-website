import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/spine/Icon";

// Text CTA with the arrow in its OWN slot — the label string never carries an
// arrow character (CLAUDE.md § Content). Not underlined; hover is a colour
// change only, 150ms (CLAUDE.md § Icons and motion). accent/primary is the only
// accent that clears 3:1, so it is the hover target.
export interface CtaProps {
  label: string;
  href: string;
  /** Absolute URL → new tab + plain <a> (no locale prefix). */
  external?: boolean;
  icon?: IconName | "none";
  className?: string;
}

export function Cta({
  label,
  href,
  external = false,
  icon = "arrow-up-right",
  className,
}: CtaProps) {
  const iconName = icon === "none" ? null : icon;
  const classes = clsx(
    "group inline-flex items-center gap-1.5 font-primary text-button uppercase text-text-primary no-underline transition-colors duration-150 ease-in-out hover:text-accent-primary",
    className,
  );
  const inner = (
    <>
      <span>{label}</span>
      {iconName && <Icon name={iconName} className="size-4 shrink-0" />}
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
