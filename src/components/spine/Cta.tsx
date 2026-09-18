import clsx from "clsx";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/spine/Icon";

/**
 * Call to Action link component supporting 'uppercase' and 'primary' variants.
 */
export type CtaVariant = "uppercase" | "primary";

export interface CtaProps {
  label: string;
  href: string;
  /** Absolute URL -> new tab + plain <a> (no locale prefix). */
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
  // 8 / 24 / 6 + the 2px rule = the board's 40px row: the rule is INSIDE the
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
  // Which SIDE a glyph takes is read off its NAME, never off a prop: the content
  // model derives the icon from targetType and forbids authoring it, so a caller
  // has nothing to set a side from (STAGE-0-NOTES §40).
  //   arrow-left  back-navigation (4322:517428) — leads, and there is NO
  //               trailing arrow.
  //   document    a document link — leads AND keeps the trailing arrow, because
  //               that is what the board draws for "NID Act & Statutes"
  //               (4140:246796): file glyph, label, arrow-up-right.
  const backNav = iconName === "arrow-left";
  const leadName: IconName | null = backNav
    ? iconName
    : iconName === "document"
      ? "document"
      : null;
  const trailName: IconName | null = backNav ? null : leadName ? "arrow-up-right" : iconName;

  const glyph = (name: IconName, size: string) => (
    <Icon
      name={name}
      className={clsx(
        "shrink-0 text-icon-quaternary transition-colors duration-150 ease-in-out",
        size,
        hoverLabel && "group-hover:text-icon-secondary",
      )}
    />
  );

  const classes = clsx(
    "group inline-flex items-center font-primary text-text-secondary no-underline transition-colors duration-150 ease-in-out",
    VARIANT[variant],
    hoverLabel && "hover:text-text-primary",
    hoverLabel && primary && "hover:border-border-default",
    className,
  );
  // The trailing arrow is a 16px glyph inside the Icon Button's 24px box; a
  // leading glyph is drawn at 24 with no box.
  const lead = leadName && glyph(leadName, "size-6");
  const arrow = trailName && glyph(trailName, "size-4");
  const inner = (
    <>
      {lead}
      <span className={clsx(primary && "flex-1")}>{label}</span>
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
