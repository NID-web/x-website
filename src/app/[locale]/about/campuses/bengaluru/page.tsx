// Bengaluru campus page — the shared campus template (src/components/campus/CampusPage.tsx).
import { CampusPage, campusMetadata } from "@/components/campus/CampusPage";

const PATH = "/about/campuses/bengaluru";

export const generateMetadata = () => campusMetadata(PATH);

export default function BengaluruCampusPage() {
  return <CampusPage path={PATH} />;
}
