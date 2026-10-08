// Governing Council — the first People child, on the secondary template
// (STAGE-0-NOTES §95).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/people/governing-council";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function GoverningCouncilPage() {
  // Members is not clamped: the list of members is the page (§95). The band is
  // "More in People" from the back-nav label.
  return <SecondaryTemplate path={PATH} backFallback="/people" heroPlaceholder={false} />;
}
