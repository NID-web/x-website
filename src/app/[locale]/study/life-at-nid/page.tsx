// Life at NID — a Study at NID child on the secondary template, Admission
// Process's pattern (STAGE-0-NOTES §76).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";
import { HERO_STAND_IN, imagedSections } from "@/lib/content/placeholders";

const PATH = "/study/life-at-nid";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function LifeAtNidPage() {
  // Hostel and Extra Curricular clip at seven lines as the board draws them
  // (224px, §74's arithmetic); where the text fits, there is no button. The
  // board draws a photograph in every section: placeholders until they land
  // (§77).
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/study"
      heroPlaceholder={HERO_STAND_IN}
      imaged={imagedSections(
        "section-life-hostel",
        "section-life-dining",
        "section-life-guest-house",
        "section-life-health-care",
        "section-life-counselling",
        "section-life-extra-curricular",
      )}
      clamp={{ "section-life-hostel": 7, "section-life-extra-curricular": 7 }}
    />
  );
}
