import type { Metadata } from "next";
import { HomeGrid } from "@/components/home/HomeGrid";

export const metadata: Metadata = {
  title: "National Institute of Design",
};

// The home page lives at `/`, which is what design/tokens/sitemap.json gives as
// Home's path — `/home` there is `liveLegacy`, the CURRENT nid.edu URL, not the
// architecture. It used to be the other way round: `/` held a Stage-0
// placeholder and the tile grid sat at `/home`, so the header wordmark (which
// has always linked to `/`) landed on the placeholder. Moved rather than
// re-pointing the wordmark, so the site's root URL is the home page.
//
// Static by default (CLAUDE.md § Rendering). SSG comes from the [locale]
// layout's generateStaticParams — no per-page params, no cookies()/headers().
export default function HomePage() {
  return <HomeGrid />;
}
