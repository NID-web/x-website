// Continuing Education Programme — a Consulting & Entrepreneurship child on the
// secondary template, IDS's pattern (STAGE-0-NOTES §92, §93).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/consulting/continuing-education";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function ContinuingEducationPage() {
  // About clamps at eight lines, the Consulting count (§80, §92): the cut falls
  // inside its first paragraph, so both lists open whole behind "See more".
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/consulting"
      heroPlaceholder={false}
      clamp={{ "section-cep-about": 8 }}
    />
  );
}
