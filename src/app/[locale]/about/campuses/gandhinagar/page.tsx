// Gandhinagar campus page — the shared campus template (src/components/campus/CampusPage.tsx).
import { CampusPage, campusMetadata } from "@/components/campus/CampusPage";

const PATH = "/about/campuses/gandhinagar";

export const generateMetadata = () => campusMetadata(PATH);

export default function GandhinagarCampusPage() {
  return <CampusPage path={PATH} />;
}
