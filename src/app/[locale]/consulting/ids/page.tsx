// Integrated Design Services — the first Consulting & Entrepreneurship child, on
// the secondary template (STAGE-0-NOTES §92).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/consulting/ids";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function IntegratedDesignServicesPage() {
  // About clamps at eight lines, the /consulting landing's count (§80); the
  // band is "More in Consulting & Entrepreneurship" from the back-nav label.
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/consulting"
      heroPlaceholder={false}
      clamp={{ "section-ids-about": 8 }}
    />
  );
}
