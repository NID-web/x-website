import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrimaryTemplate } from "@/components/sections/PrimaryTemplate";
import { getPage } from "@/lib/content/getPage";

const PATH = "/research";

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
 * Research & Publications — the fourth primary landing page (STAGE-0-NOTES
 * §78). Research at NID is one cards section: prose behind "See more", the
 * page's contacts in column 4, the centres as title-only Thumb tiles two-up.
 * The board cuts the prose at "…in partnership with…": eight lines of text at
 * 684, four per paragraph (§55's count — lines, not height).
 */
export default async function ResearchPage() {
  const response = await getPage(PATH);
  if (!response) notFound();
  return (
    <PrimaryTemplate
      response={response}
      thumbMeta={false}
      clamp={{ "section-research-at-nid": 8 }}
      contactsIn="section-research-at-nid"
    />
  );
}
