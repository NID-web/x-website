// Sitemap — a footer page on the secondary template, its list generated from
// the site's own navigation (STAGE-0-NOTES §106).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";
import { SITEMAP_PATH, sitemapSectionIds } from "@/lib/content/getSitemap";

export const generateMetadata = () => secondaryMetadata(SITEMAP_PATH);

export default function SitemapPage() {
  // Careers' shape (§101): the back link follows the visitor, else goes Home;
  // no band. Every section two-up.
  return (
    <SecondaryTemplate
      path={SITEMAP_PATH}
      backFallback="/"
      heroPlaceholder={false}
      twoUpLinks={new Set(sitemapSectionIds())}
    />
  );
}
