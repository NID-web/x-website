import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArticleTemplate } from "@/components/sections/ArticleTemplate";
import { permanentRedirect } from "@/i18n/navigation";
import { NEWS_ROUTE, articleRedirect, articlePath, articleSlugs, getArticle } from "@/lib/content/getArticle";

type Params = { params: Promise<{ slug: string }> };

// Exactly the slugs getArticle builds, and nothing else: an unknown slug is a
// 404 at the edge, never a render — the route gate links only these (links.ts).
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await articleSlugs(NEWS_ROUTE)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const response = await getArticle(articlePath((await params).slug));
  if (!response) return {};
  const { page } = response;
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.intro?.slice(0, 160),
  };
}

/**
 * News & Events article — History's secondary template with the CMS owning the
 * sections (STAGE-0-NOTES §59). One template for every article: the two boards
 * differ only in which optional slots are filled.
 */
export default async function ArticlePage({ params }: Params) {
  const path = articlePath((await params).slug);
  // A URL that is another page's: a fixture slug the CMS serves under its own,
  // or an event from before events moved to /events (§68). 308 there.
  const canonical = await articleRedirect(path);
  if (canonical) permanentRedirect({ href: canonical, locale: await getLocale() });
  const response = await getArticle(path);
  if (!response) notFound();
  return <ArticleTemplate response={response} />;
}
