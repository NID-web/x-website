import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { SecondaryTemplate } from "@/components/sections/SecondaryTemplate";
import { disciplineSlugs, getDiscipline } from "@/lib/content/getDiscipline";

type Params = { params: Promise<{ discipline: string }> };

const LEVEL = "bdes";

// Exactly the disciplines getDiscipline builds — the same list the route gate
// links (STAGE-0-NOTES §72); anything else is a 404 at the edge.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await disciplineSlugs(LEVEL)).map((discipline) => ({ discipline }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const response = await getDiscipline(LEVEL, (await params).discipline);
  if (!response) return {};
  const { page } = response;
  return { title: page.seoTitle ?? page.title, description: page.seoDescription ?? page.intro?.slice(0, 160) };
}

/** A discipline page on the secondary template (the Animation Film Design board). */
export default async function DisciplinePage({ params }: Params) {
  const { discipline } = await params;
  const response = await getDiscipline(LEVEL, discipline);
  if (!response) notFound();
  const t = await getTranslations("Discipline");
  return (
    <SecondaryTemplate
      path={`/programmes/${LEVEL}/${discipline}`}
      response={response}
      // The back link follows the visitor, else goes to the programme page.
      backFallback="/programmes/bdes"
      heroPlaceholder={false}
      introTitle={t("overview")}
      railThreeUp
      split="section-discipline-resources"
    />
  );
}
