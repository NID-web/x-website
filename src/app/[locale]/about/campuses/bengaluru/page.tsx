// Bengaluru campus page — the secondary template with the campus pages' layout.
import { CAMPUS_LAYOUT } from "@/components/campus/layout";
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/about/campuses/bengaluru";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function BengaluruCampusPage() {
  return <SecondaryTemplate path={PATH} {...CAMPUS_LAYOUT[PATH]} />;
}
