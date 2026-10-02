// PM Vidyalaxmi Scheme — a Study at NID child on the secondary template, Admission
// Process's pattern with one section (STAGE-0-NOTES §75).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";
import { HERO_STAND_IN } from "@/lib/content/placeholders";

const PATH = "/study/pm-vidyalaxmi";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function PmVidyalaxmiPage() {
  // The back link follows the visitor, else goes to Study at NID; the hero is
  // a placeholder until a photograph lands (§77). "About the Scheme" clips at seven lines as the board draws it (§74);
  // where the text fits, there is no button.
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/study"
      heroPlaceholder={HERO_STAND_IN}
      clamp={{ "section-pmv-about": 7 }}
    />
  );
}
