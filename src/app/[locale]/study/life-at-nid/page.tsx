// Life at NID — a Study at NID child on the secondary template, Admission
// Process's pattern (STAGE-0-NOTES §76).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/study/life-at-nid";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function LifeAtNidPage() {
  // Hostel and Extra Curricular clip at seven lines as the board draws them
  // (224px, §74's arithmetic); where the text fits, there is no button.
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/study"
      heroPlaceholder={false}
      clamp={{ "section-life-hostel": 7, "section-life-extra-curricular": 7 }}
    />
  );
}
