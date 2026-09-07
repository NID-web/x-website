import { linkIcon, linkNewTab, type Link } from "@/lib/content-model";
import { pathOf } from "@/lib/content/pages";
import type { CtaProps } from "@/components/spine/Cta";

// A content-model Link as Cta props: the href from whichever target field is
// set, the icon and new-tab flag derived, never authored (NID-CONTEXT.md §7.1).
export function ctaProps(link: Link): Pick<CtaProps, "label" | "href" | "external" | "icon"> | null {
  const href =
    link.targetType === "page" && link.page
      ? pathOf(link.page)
      : link.targetType === "external"
        ? link.url
        : link.targetType === "email"
          ? `mailto:${link.address}`
          : link.targetType === "phone"
            ? `tel:${link.address}`
            : undefined;
  if (!href) return null;
  return {
    label: link.label,
    href,
    external: linkNewTab(link),
    icon: linkIcon(link) ?? "none",
  };
}
