import type { Metadata } from "next";
import { HomeGrid } from "@/components/home/HomeGrid";

export const metadata: Metadata = {
  title: "National Institute of Design",
};

// Static by default (CLAUDE.md § Rendering). SSG comes from the [locale]
// layout's generateStaticParams — no per-page params, no cookies()/headers().
export default function HomePage() {
  return <HomeGrid />;
}
