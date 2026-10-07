// Annual Reports — a Regulatory page with no text section: one list of
// documents (STAGE-0-NOTES §87), NID Act's route shape (§86).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";
import { REGULATORY_TITLE } from "@/lib/content/regulatory";

const PATH = "/regulatory/annual-reports";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function AnnualReportsPage() {
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/about"
      heroPlaceholder={false}
      documentLists={new Set(["section-annual-reports-reports"])}
      siblingParent={REGULATORY_TITLE}
    />
  );
}
