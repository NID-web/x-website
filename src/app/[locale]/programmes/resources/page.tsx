// Resources — a Programmes child on the secondary template: nid.edu's intro,
// then the labs in nid.edu's five groups (STAGE-0-NOTES §104).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";
import { LAB_GROUPS, RESOURCES_PATH } from "@/lib/content/resources";

export const generateMetadata = () => secondaryMetadata(RESOURCES_PATH);

export default function ResourcesPage() {
  // Each group's labs two across in columns 2–3; no photograph, so no hero.
  return (
    <SecondaryTemplate
      path={RESOURCES_PATH}
      backFallback="/programmes"
      heroPlaceholder={false}
      twoUpLinks={new Set(LAB_GROUPS.map((group) => `section-resources-${group.id}`))}
    />
  );
}
