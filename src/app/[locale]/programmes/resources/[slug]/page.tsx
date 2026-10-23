import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SecondaryTemplate, secondaryMetadata } from "@/components/sections/SecondaryTemplate";
import { getPage } from "@/lib/content/getPage";
import { labIndex } from "@/lib/content/getResources";
import { RESOURCES_PATH, labGroupOf, labPath } from "@/lib/content/resources";

type Params = { params: Promise<{ slug: string }> };

// Exactly the labs the CMS list holds, less the withheld seeds — the slugs
// labIndex registers with the route gate (STAGE-0-NOTES §104). Anything else
// is a 404 at the edge.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await labIndex()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return secondaryMetadata(labPath((await params).slug));
}

/** A lab on the secondary template: one route for all of them, one layout rule
 *  from the data, never a branch on which lab this is (§79's pattern). About
 *  clamps at eight lines; the band is the lab's group, named after it. */
export default async function LabPage({ params }: Params) {
  const { slug } = await params;
  const path = labPath(slug);
  const response = await getPage(path);
  if (!response) notFound();
  return (
    <SecondaryTemplate
      path={path}
      response={response}
      backFallback={RESOURCES_PATH}
      heroPlaceholder={false}
      clamp={{ "section-lab-about": 8 }}
      siblingParent={labGroupOf(slug).title}
      backTitles
    />
  );
}
