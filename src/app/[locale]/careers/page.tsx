// Careers — a footer page on the secondary template (STAGE-0-NOTES §101).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/careers";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function CareersPage() {
  // No parent page: the back link follows the visitor, else goes Home. No band:
  // sitemap.json's Miscellaneous has no landing. Openings, when the CMS sends
  // them, are a list of documents (§76).
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/"
      heroPlaceholder={false}
      documentLists={new Set(["section-careers-openings"])}
    />
  );
}
