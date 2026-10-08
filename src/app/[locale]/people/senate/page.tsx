// NID Senate — a People child, on the secondary template (STAGE-0-NOTES §96).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/people/senate";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function SenatePage() {
  // Members clamps at twelve lines: the profile cards follow straight after.
  // The cards are three across with the designation overline, the faculty
  // pages' rail (§72). The band is "More in People" from the back-nav label.
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/people"
      heroPlaceholder={false}
      clamp={{ "section-senate-members": 12 }}
      railThreeUp
    />
  );
}
