import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SecondaryTemplate } from "@/components/sections/SecondaryTemplate";
import { facultyMemberPath } from "@/lib/content/faculty-views";
import { facultyIndex, getFacultyMember } from "@/lib/content/getFaculty";

type Params = { params: Promise<{ slug: string }> };

// Exactly the faculty list's people — the slugs facultyIndex registers with
// the route gate (STAGE-0-NOTES §83). Anyone else is a 404 at the edge. A
// static `by` segment beside this keeps the directory's views (§82).
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await facultyIndex()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const response = await getFacultyMember((await params).slug);
  if (!response) return {};
  const { page } = response;
  return { title: page.seoTitle ?? page.title, ...(page.seoDescription ? { description: page.seoDescription } : {}) };
}

/** A faculty member on the secondary template: their portrait and key info in
 *  column 1 (no landscape hero exists, §83), the CMS's bio clamped at eight
 *  lines, no band. */
export default async function FacultyMemberPage({ params }: Params) {
  const { slug } = await params;
  const response = await getFacultyMember(slug);
  if (!response) notFound();
  return (
    <SecondaryTemplate
      path={facultyMemberPath(slug)}
      response={response}
      backFallback="/people/faculty"
      heroPlaceholder={false}
      portrait={response.portrait}
      clamp={{ "section-member-bio": 8 }}
    />
  );
}
