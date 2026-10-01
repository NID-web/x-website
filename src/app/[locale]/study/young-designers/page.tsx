// Young Designers — a Study at NID child on the secondary template, Admission
// Process's pattern (STAGE-0-NOTES §76).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/study/young-designers";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function YoungDesignersPage() {
  // Disciplines and Convocation Messages clip at six lines: the board's 196px is
  // 6 × 30 plus one 16px paragraph gap (§74's arithmetic). Where the text fits,
  // there is no button.
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/study"
      heroPlaceholder={false}
      clamp={{ "section-yd-disciplines": 6, "section-yd-convocation": 6 }}
    />
  );
}
