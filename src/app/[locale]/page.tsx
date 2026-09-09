import type { Metadata } from "next";
import { HomeGrid } from "@/components/home/HomeGrid";

export const metadata: Metadata = {
  title: "National Institute of Design",
};

export default function HomePage() {
  return <HomeGrid />;
}
