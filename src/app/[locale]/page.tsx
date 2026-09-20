import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { HomeGrid } from "@/components/home/HomeGrid";
import { getHome } from "@/lib/content/getHome";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getHome(await getLocale());
  return seo;
}

export default function HomePage() {
  return <HomeGrid />;
}
