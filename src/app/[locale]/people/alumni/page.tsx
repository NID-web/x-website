// Alumni — a People child, on the secondary template (STAGE-0-NOTES §100).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/people/alumni";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function AlumniPage() {
  // The registration form is the letter's filled button (B.Des's Apply, §70),
  // placed by the template's free flow. The letter is short: no clamp. The
  // band is "More in People" from the back-nav label.
  return (
    <SecondaryTemplate path={PATH} backFallback="/people" heroPlaceholder={false} filledLinks="section-alumni-letter" />
  );
}
