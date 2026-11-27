// Pride of NID — a People child, on the secondary template (STAGE-0-NOTES §108).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/people/pride-of-nid";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function PrideOfNidPage() {
  // No hero (the document has none) and no clamp: four short profiles are the
  // page. The band is "More in People" from the back-nav label.
  return <SecondaryTemplate path={PATH} backFallback="/people" heroPlaceholder={false} />;
}
