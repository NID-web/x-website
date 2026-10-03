import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrimaryTemplate } from "@/components/sections/PrimaryTemplate";
import { getPage } from "@/lib/content/getPage";

const PATH = "/consulting";

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
 * Consulting & Entrepreneurship — the fifth primary landing page (STAGE-0-NOTES
 * §80). Integrated Design Services is a text section: prose behind "See more"
 * at eight lines (as /research), its contacts and FAQ in column 4. IDS
 * Resources is a links section: the films and PDFs the board drew as tiles.
 */
export default async function ConsultingPage() {
  const response = await getPage(PATH);
  if (!response) notFound();
  return <PrimaryTemplate response={response} clamp={{ "section-consulting-ids": 8 }} />;
}
