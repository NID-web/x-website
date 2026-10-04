import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

type SiteLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  /** Absolute URL -> new tab + plain <a> (no locale prefix). */
  external?: boolean;
  /** Internal links only; an external <a> has nothing to prefetch. */
  prefetch?: boolean;
};

/**
 * The one internal-or-external branch: a page of this site is a locale-aware
 * next-intl Link, anything else a plain <a> that opens in a new tab.
 *
 * Props are spread, never re-passed by name: a prop handed to the client Link
 * as `undefined` is still serialized into the RSC payload (STAGE-0-NOTES §70),
 * so `prefetch={prefetch}` would change every page that does not set it.
 */
export function SiteLink({ href, external = false, prefetch, ...rest }: SiteLinkProps) {
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...rest} />;
  }
  return <Link href={href} {...(prefetch === undefined ? {} : { prefetch })} {...rest} />;
}
