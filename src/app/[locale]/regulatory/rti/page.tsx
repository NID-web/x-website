// Right to Information — the last Regulatory page: the officers named in the
// rail, About, an index of this site's pages, the documents (STAGE-0-NOTES §89).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";
import { REGULATORY_TITLE } from "@/lib/content/regulatory";

const PATH = "/regulatory/rti";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function RightToInformationPage() {
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/about"
      heroPlaceholder={false}
      twoUpLinks={new Set(["section-rti-on-this-website"])}
      documentLists={new Set(["section-rti-key-documents"])}
      siblingParent={REGULATORY_TITLE}
    />
  );
}
