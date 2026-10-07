// NID Act, Rules, Ordinances & Statutes — the first Regulatory page, on the
// secondary template: a text section and a list of documents (STAGE-0-NOTES §86).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";
import { REGULATORY_TITLE } from "@/lib/content/regulatory";

const PATH = "/regulatory/nid-act";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function NidActPage() {
  // No /regulatory page: the back link falls back to About NID, where nid.edu
  // files these pages, and the band is "More in Regulatory". No board, so no
  // boxes: a real CMS hero renders, otherwise the page closes up.
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/about"
      heroPlaceholder={false}
      documentLists={new Set(["section-nid-act-documents"])}
      siblingParent={REGULATORY_TITLE}
    />
  );
}
