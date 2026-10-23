// Tenders — a footer page on the secondary template (STAGE-0-NOTES §102).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/tenders";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function TendersPage() {
  // Careers' shape (§101): the back link follows the visitor, else goes Home;
  // no band. Notices, when the CMS sends them, are a list of documents (§76).
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/"
      heroPlaceholder={false}
      documentLists={new Set(["section-tenders-current"])}
    />
  );
}
