// Admission Process — Study at NID's first child, on the secondary template
// (STAGE-0-NOTES §74).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/study/admission";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function AdmissionProcessPage() {
  // The back link follows the visitor, else goes to Study at NID; no hero, no
  // box. Ph.D's body clips behind "See more" because the board draws it: seven
  // lines of text is the board's 224px at 1440 (§55's count).
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/study"
      heroPlaceholder={false}
      clamp={{ "section-admission-phd": 7 }}
    />
  );
}
