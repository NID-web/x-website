import type { Metadata } from "next";
import { FacultyDirectory, facultyMetadata } from "@/components/sections/FacultyDirectory";

/** The faculty directory's default view, by Discipline (STAGE-0-NOTES §82). */
export function generateMetadata(): Promise<Metadata> {
  return facultyMetadata("discipline");
}

export default function FacultyPage() {
  return <FacultyDirectory view="discipline" />;
}
