// Staff — a People child, on the secondary template (STAGE-0-NOTES §99).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/people/staff";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function StaffPage() {
  // Senate's cards (§96): three across with the designation overline, the
  // faculty pages' rail (§72). No staff member has a member page, so none
  // links. The band is "More in People" from the back-nav label.
  return <SecondaryTemplate path={PATH} backFallback="/people" heroPlaceholder={false} railThreeUp />;
}
