import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FacultyDirectory, facultyMetadata } from "@/components/sections/FacultyDirectory";
import { FACULTY_VIEW_PARAMS, type FacultyView } from "@/lib/content/faculty-views";

type Params = { params: Promise<{ view: string }> };

// The directory's other views as paths, not sitemap.json's `?by=` — a query
// string can only select a view at request time (STAGE-0-NOTES §82). Exactly
// these three; anything else is a 404 at the edge. A static `by` segment
// leaves /people/faculty/[slug] free for the member template.
export const dynamicParams = false;

export function generateStaticParams() {
  return FACULTY_VIEW_PARAMS.map((view) => ({ view }));
}

const viewOf = (view: string) => (FACULTY_VIEW_PARAMS.includes(view) ? (view as FacultyView) : null);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const view = viewOf((await params).view);
  return view ? facultyMetadata(view) : {};
}

export default async function FacultyViewPage({ params }: Params) {
  const view = viewOf((await params).view);
  if (!view) notFound();
  return <FacultyDirectory view={view} />;
}
