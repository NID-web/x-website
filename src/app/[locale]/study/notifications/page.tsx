// Academic Notifications — a Study at NID child on the secondary template: one
// list of documents (STAGE-0-NOTES §76).
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/study/notifications";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function AcademicNotificationsPage() {
  return (
    <SecondaryTemplate
      path={PATH}
      backFallback="/study"
      heroPlaceholder={false}
      documentLists={new Set(["section-notifications-downloads"])}
    />
  );
}
