import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArticleTemplate } from "@/components/sections/ArticleTemplate";
import { permanentRedirect } from "@/i18n/navigation";
import { PAGE_ID, pathOf } from "@/lib/content/pages";
import { articleRedirect, articlePath, articleSlugs, getArticle, isEventArticle } from "@/lib/content/getArticle";

type Params = { params: Promise<{ slug: string }> };

// Exactly the slugs getArticle builds, and nothing else: an unknown slug is a
// 404 at the edge, never a render — the route gate links only these (links.ts).
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await articleSlugs()).map((slug) => ({ slug }));
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

/** "Drawing Dialogues: Calibration and …" as the board sets it — the name, then
 *  the rest as the italic subtitle. Split at the FIRST ": " only; a title
 *  without one is the whole h1. Events only: news keeps its full headline. */
function splitTitle(title: string): { title: string; subtitle?: string } {
  const at = title.indexOf(": ");
  return at > 0 ? { title: title.slice(0, at), subtitle: title.slice(at + 2) } : { title };
}

/**
 * News & Events article — History's secondary template with the CMS owning the
 * sections (STAGE-0-NOTES §59). One template for every article: the two boards
 * differ only in which optional slots are filled.
 *
 * Events and workshops live here too (there is no /events route, §85) and keep
 * the event layout (§68): the "09 Events / Drawing Dialogues" board is the
 * sample of every event page — a split title, the standfirst beside the
 * sections, and the session-trail back link instead of the fixed parent.
 */
export default async function ArticlePage({ params }: Params) {
  const path = articlePath((await params).slug);
  // A URL that is another page's: a fixture slug the CMS serves under its own,
  // an event's CMS slug where sitemap.json names a short path, or a same-story
  // duplicate (§63, §68). 308 there.
  const canonical = await articleRedirect(path);
  if (canonical) permanentRedirect({ href: canonical, locale: await getLocale() });
  const response = await getArticle(path);
  if (!response) notFound();
  if (!(await isEventArticle(path))) return <ArticleTemplate response={response} />;
  const { title, subtitle } = splitTitle(response.page.title);
  // The back link names where the visitor came from (§68), else News & Events,
  // this page's parent (§85).
  return (
    <ArticleTemplate
      response={response}
      title={title}
      subtitle={subtitle}
      standfirst="without-sections"
      trailBack={pathOf(PAGE_ID.newsEvents)}
    />
  );
}
