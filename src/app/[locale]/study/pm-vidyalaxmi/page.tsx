// PM Vidyalaxmi Scheme — a Study at NID child on the secondary template, Admission
// Process's pattern with one section (STAGE-0-NOTES §75).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/study/pm-vidyalaxmi";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function PmVidyalaxmiPage() {
  // The back link follows the visitor, else goes to Study at NID; no hero, no
  // box. "About the Scheme" clips at seven lines as the board draws it (§74);
  // where the text fits, there is no button.
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/study"
      heroPlaceholder={false}
      clamp={{ "section-pmv-about": 7 }}
    />
  );
}
