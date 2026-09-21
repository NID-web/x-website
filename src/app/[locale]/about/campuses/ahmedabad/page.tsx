// Ahmedabad campus page — the shared campus template (src/components/campus/CampusPage.tsx).
import { CampusPage, campusMetadata } from "@/components/campus/CampusPage";

const PATH = "/about/campuses/ahmedabad";

export const generateMetadata = () => campusMetadata(PATH);

export default function AhmedabadCampusPage() {
  return <CampusPage path={PATH} />;
}
