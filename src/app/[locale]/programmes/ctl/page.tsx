// Centre for Teaching and Learning — a Programmes child on the secondary
// template, the first page with no CMS document (STAGE-0-NOTES §103).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/programmes/ctl";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function CentreForTeachingAndLearningPage() {
  // The back link follows the visitor, else goes to Programmes; no photograph,
  // so no hero. About clamps at eight lines, the /research landing's count.
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/programmes"
      heroPlaceholder={false}
      clamp={{ "section-ctl-about": 8 }}
    />
  );
}
