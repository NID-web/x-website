import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrimaryTemplate } from "@/components/sections/PrimaryTemplate";
import { getPage } from "@/lib/content/getPage";

const PATH = "/programmes";

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
 * Programmes — the second primary landing page, About's template (STAGE-0-NOTES
 * §69). Its cards section lays Thumbs three across in columns 2–4, where the
 * campus boards set them two-up.
 */
export default async function ProgrammesPage() {
  const response = await getPage(PATH);
  if (!response) notFound();
  return <PrimaryTemplate response={response} thumbs="three-up" />;
}
