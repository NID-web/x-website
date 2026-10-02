import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";
import { getPage } from "@/lib/content/getPage";
import { HERO_STAND_IN, imagedSections } from "@/lib/content/placeholders";
import { BUILT_RESEARCH_CENTRES, researchPath } from "@/lib/content/research-centres";

type Params = { params: Promise<{ slug: string }> };

// Exactly the centres research-centres.ts builds — the list links.ts registers
// with the route gate (STAGE-0-NOTES §79). A withheld centre (Nation Building)
// or any other slug is a 404 at the edge.
export const dynamicParams = false;

export function generateStaticParams() {
  return BUILT_RESEARCH_CENTRES.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return secondaryMetadata(researchPath((await params).slug));
}

/**
 * A research centre on the secondary template: one route for all of them, one
 * layout rule from the data, never a branch on which centre this is. Every
 * board draws a photo box under every section, and clamps its long bodies:
 * every text section is imaged (§77's placeholder until a CMS image lands) and
 * clamps at eight lines, the /research landing's count, so "See more" shows
 * only where a body overflows them (§79).
 */
export default async function ResearchCentrePage({ params }: Params) {
  const path = researchPath((await params).slug);
  const response = await getPage(path);
  if (!response) notFound();
  const text = response.page.sections.filter((s) => s.type === "text").map((s) => s.id);
  return (
    <SecondaryTemplate
      path={path}
      response={response}
      backFallback="/research"
      heroPlaceholder={HERO_STAND_IN}
      imaged={imagedSections(...text)}
      clamp={Object.fromEntries(text.map((id) => [id, 8]))}
    />
  );
}
