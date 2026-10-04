import clsx from "clsx";
import { Icon, type IconName } from "@/components/spine/Icon";
import { SiteLink } from "@/components/spine/SiteLink";

/**
 * Call to Action link component supporting 'uppercase' and 'primary' variants.
 */
export type CtaVariant = "uppercase" | "primary" | "filled";

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
  // The library's "Subtle" call to action, for time-critical actions (Apply,
  // Register): a filled pill, 8/16 padding, the full width of its column.
  // TODO(review): designer — the component fills it with accent/secondary,
  // which is decorative-only here and gives white text 3.32:1 at worst
  // (Terracotta light), under AA for Heading/5 at its 18px phone size.
  // accent/primary gives 4.83:1 at worst across all twenty states.
  filled: "w-full gap-2 rounded-pill bg-accent-primary px-4 py-2 text-h5 text-text-on-accent",
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
  const filled = variant === "filled";
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
        "shrink-0",
        filled ? "text-icon-on-accent" : "text-icon-quaternary",
        "transition-colors duration-150 ease-in-out",
        size,
        hoverLabel && !filled && "group-hover:text-icon-secondary",
      )}
    />
  );

  const classes = clsx(
    "group inline-flex items-center font-primary",
    !filled && "text-text-secondary",
    "no-underline transition-colors duration-150 ease-in-out",
    VARIANT[variant],
    hoverLabel && !filled && "hover:text-text-primary",
    hoverLabel && primary && "hover:border-border-default",
    // Colour only, as every hover: the fill deepens to the accent's hover step.
    filled && "hover:bg-accent-strong",
    className,
  );
  // The trailing arrow is a 16px glyph inside the Icon Button's 24px box; a
  // leading glyph is drawn at 24 with no box.
  const lead = leadName && glyph(leadName, "size-6");
  const arrow = trailName && glyph(trailName, "size-4");
  const inner = (
    <>
      {lead}
      <span className={clsx((primary || filled) && "flex-1")}>{label}</span>
      {primary || filled ? (
        arrow && <span className="flex size-6 shrink-0 items-center justify-center">{arrow}</span>
      ) : (
        arrow
      )}
    </>
  );

  return (
    <SiteLink href={href} external={external} className={classes}>
      {inner}
    </SiteLink>
  );
}
