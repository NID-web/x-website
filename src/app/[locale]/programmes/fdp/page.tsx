// Faculty Development Programme — a programme page on the secondary template (STAGE-0-NOTES §70).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/programmes/fdp";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function FacultyDevelopmentPage() {
  // The back link follows the visitor, else goes to Programmes; no hero, no box.
  return <SecondaryTemplate path={PATH} backFallback="/programmes" heroPlaceholder={false} />;
}
