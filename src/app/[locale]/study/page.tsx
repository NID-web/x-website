import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrimaryTemplate } from "@/components/sections/PrimaryTemplate";
import { getPage } from "@/lib/content/getPage";

const PATH = "/study";

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
 * Study at NID — the third primary landing page (STAGE-0-NOTES §73). Its
 * Academic Notifications are a cards section of notices (NoticesSection).
 */
export default async function StudyPage() {
  const response = await getPage(PATH);
  if (!response) notFound();
  return <PrimaryTemplate response={response} />;
}
