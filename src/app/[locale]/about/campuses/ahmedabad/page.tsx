// Ahmedabad campus page — the secondary template with the campus pages' layout.
import { CAMPUS_LAYOUT } from "@/components/campus/layout";
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";

const PATH = "/about/campuses/ahmedabad";

export const generateMetadata = () => secondaryMetadata(PATH);

export default function AhmedabadCampusPage() {
  return <SecondaryTemplate path={PATH} {...CAMPUS_LAYOUT[PATH]} />;
}
