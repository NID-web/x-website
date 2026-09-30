import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArticleTemplate } from "@/components/sections/ArticleTemplate";
import { permanentRedirect } from "@/i18n/navigation";
import { EVENTS_ROUTE, articleRedirect, articleSlugs, getArticle } from "@/lib/content/getArticle";
import { PAGE_ID, pathOf } from "@/lib/content/pages";
import { HOME_NAV } from "@/lib/nav-content";

type Params = { params: Promise<{ slug: string }> };

const pathFor = (slug: string) => `${pathOf(PAGE_ID.events)}/${slug}`;

// Exactly the events getArticle builds; anything else is a 404 at the edge.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await articleSlugs(EVENTS_ROUTE)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const response = await getArticle(pathFor((await params).slug));
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
 * An event — the article template in the Events section (STAGE-0-NOTES §68).
 * The "09 Events / Drawing Dialogues" board is the sample of every event page.
 */
export default async function EventPage({ params }: Params) {
  const path = pathFor((await params).slug);
  // An event's CMS-slug path where sitemap.json names a short one, or a
  // same-story duplicate: 308 to the one page.
  const canonical = await articleRedirect(path);
  if (canonical) permanentRedirect({ href: canonical, locale: await getLocale() });
  const response = await getArticle(path);
  if (!response) notFound();
  const { title, subtitle } = splitTitle(response.page.title);
  // The back link names where the visitor came from, else Home (§68).
  return (
    <ArticleTemplate
      response={response}
      title={title}
      subtitle={subtitle}
      standfirst="without-sections"
      trailBack={HOME_NAV.href}
    />
  );
}
