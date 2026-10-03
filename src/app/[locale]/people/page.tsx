import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrimaryTemplate } from "@/components/sections/PrimaryTemplate";
import { getPage } from "@/lib/content/getPage";

const PATH = "/people";

export async function generateMetadata(): Promise<Metadata> {
  const response = await getPage(PATH);
  if (!response) return {};
  const { page } = response;
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.intro?.slice(0, 160),
  };
}

/**
 * People — the sixth primary landing page (STAGE-0-NOTES §81). No sections:
 * the sub-page links sit three across under the standfirst, column 1 empty
 * beside the hero.
 */
export default async function PeoplePage() {
  const response = await getPage(PATH);
  if (!response) notFound();
  return <PrimaryTemplate response={response} subPages="below-intro" />;
}
